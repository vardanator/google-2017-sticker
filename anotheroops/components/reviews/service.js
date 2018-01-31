const Utility = require('./../utility/service');
const ResponseErrors = require('./../response/errors');
const AppConstants = require('./../settings/constants');
const SystemEvents = require('./../system-events/service');
const UsersService = require('./../users/service');

const ReviewsDAO = require('./private/dao');
const ReviewsValidator = require('./private/validator');
const ReviewsResponse = require('./private/response');

class ReviewService {

    createReview(rating, text, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            if (!options.requester || !options.requester.id || !options.requester.role) {
                return reject({
                    reason: ResponseErrors.PERMISSION_DENIED,
                    more_info: { message: 'Only registered users allowed to submit a review.' }
                });
            }

            let review_validation = ReviewsValidator.validateAll([
                {key: 'text', value: text, options: {required: false, sanitize: true}},
                {key: 'rating', value: rating, options: {required: true, sanitize: true}},
                {key: 'is_fb_review', value: options.is_fb_review, options: {required: false, sanitize: true}}
            ]);
            if (!review_validation.is_valid) {
                return reject({
                    reason: ResponseErrors.VALIDATION_ERROR,
                    more_info: review_validation
                });
            }

            let src_review_obj = Utility.checkAndSetSanitizedValues(
                review_validation, ['text', 'rating', 'is_fb_review']
            );
            src_review_obj.unit = options.unit;

            UsersService.getUserById(options.requester.id, options).then(user => {
                if (!user || !user.id) {
                    return reject({
                        reason: ResponseErrors.RESOURCE_NOT_FOUND,
                        more_info: {message: 'No such user.'}
                    });
                }
                src_review_obj.user = user.id;
                return ReviewsDAO.insert(src_review_obj);
            }).then(review => {
                SystemEvents.emit(SystemEvents.EventTypes.REVIEW_ADDED, review._id);
                UsersService.addUserReview(review.user, review._id, options);
                return resolve(ReviewsResponse.generateResponse(review, options.requester));
                //resolve(review);
            }).catch(err => {
                SystemEvents.emit('error', err);
                return reject({
                    reason: ResponseErrors.REVIEW_CREATION_FAILED,
                    more_info: {message: 'Failed to submit review.'}
                });
            });
        });
    }

    removeReview(id, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            if (!options.requester || !options.requester.id || !options.requester.role) {
                return reject({
                    reason: ResponseErrors.PERMISSION_DENIED,
                    more_info: {message: 'Operation not permitted.'}
                });
            }
            let req_query = {
                _id: id
            };
            if (options.requester.role != AppConstants.UserRoles.ADMIN) {
                req_query.user = options.requester.id;
            }

            ReviewsDAO.removeByQuery(req_query).then(review => {
                SystemEvents.emit(SystemEvents.Types.REVIEW_DELETED, id);
                UsersService.removeUserReview(review.user, id, options);
                return resolve(ReviewsResponse.generateResponse(review));
            }).catch(err => {
                SystemEvents.emit('error');
                return reject({
                    reason: ResponseErrors.REVIEW_UPDATE_FAILED,
                    more_info: {message: 'Failed to remove.'}
                });
            });
        });
    }

    editReview(id, text, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            if (!options.requester || !options.requester.id || !options.requester.role) {
                return reject({
                    reason: ResponseErrors.PERMISSION_DENIED,
                    more_info: { message: 'Only registered users allowed to submit a review.' }
                });
            }

            let validation = ReviewsValidator.validateAll([
                {key: 'text', value: text, options: {required: true, sanitize: true}}
            ]);
            if (!validation.is_valid) {
                return reject({
                    reason: ResponseErrors.VALIDATION_ERROR,
                    more_info: validation
                });
            }

            ReviewsDAO.fetchOne({_id: id}, options).then(review => {
                if (!review) {
                    return reject({
                        reason: ResponseErrors.RESOURCE_NOT_FOUND,
                        more_info: {message: 'Review not found.'}
                    });
                }

                if (review.user.toString() != options.requester.id || options.requester.role != AppConstants.UserRoles.ADMIN) {
                    return reject({
                        reason: ResponseErrors.PERMISSION_DENIED,
                        more_info: {message: 'Only admin or review author can edit the review.'}
                    });
                }
                let upd_query = {
                    text: validation.text.sanitized_value
                };
                // TODO: change to updateByQuery if needed
                return ReviewsDAO.updateById(id, upd_query);
            }).then(review => {
                SystemEvents.emit(SystemEvents.EventTypes.REVIEW_EDITED, id);
                resolve(ReviewsResponse.generateResponse(review, options.requester));
            }).catch(err => {
                SystemEvents.emit('error', err);
                return reject({
                    reason: ResponseErrors.REVIEW_UPDATE_FAILED
                });
            });
        });
    }

    upvoteReview(id, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            if (!options.requester || !options.requester.id || !options.requester.role) {
                return reject({
                    reason: ResponseErrors.PERMISSION_DENIED,
                    more_info: { message: 'Only registered users allowed to submit a review.' }
                });
            }

            let upd_query = {
                $addToSet: {up_votes: options.requester.id}
            };

            ReviewsDAO.updateByQuery({_id: id}, upd_query).then(review => {
                SystemEvents.emit(SystemEvents.EventTypes.REVIEW_UPVOTED, id);
                resolve(ReviewsResponse.generateResponse(review, options.requester));
            }).catch(err => {
                SystemEvents.emit('error', err);
                reject({
                    reason: ResponseErrors.REVIEW_UPDATE_FAILED,
                    more_info: {message: 'Failed to upvote.'}
                });
            });
        });
    }

    downvoteReview(id, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            if (!options.requester || !options.requester.id || !options.requester.role) {
                return reject({
                    reason: ResponseErrors.PERMISSION_DENIED,
                    more_info: { message: 'Only registered users allowed to submit a review.' }
                });
            }

            let upd_query = {
                $addToSet: {down_votes: options.requester.id}
            };

            ReviewsDAO.updateByQuery({_id: id}, upd_query).then(review => {
                SystemEvents.emit(SystemEvents.EventTypes.REVIEW_DOWNVOTED, id);
                resolve(ReviewsResponse.generateResponse(review, options.requester));
            }).catch(err => {
                SystemEvents.emit('error', err);
                reject({
                    reason: ResponseErrors.REVIEW_UPDATE_FAILED,
                    more_info: {message: 'Failed to downvote.'}
                });
            });
        });
    }

    cancelUpvote(id, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            if (!options.requester || !options.requester.id || !options.requester.role) {
                return reject({
                    reason: ResponseErrors.PERMISSION_DENIED,
                    more_info: { message: 'Only registered users allowed to submit a review.' }
                });
            }

            let upd_query = {
                $pull: {up_votes: options.requester.id}
            };

            ReviewsDAO.updateByQuery({_id: id}, upd_query).then(review => {
                resolve(ReviewsResponse.generateResponse(review, options.requester));
            }).catch(err => {
                SystemEvents.emit('error', err);
                reject({
                    reason: ResponseErrors.REVIEW_UPDATE_FAILED,
                    more_info: {message: 'Failed to cancel upvote.'}
                });
            });
        });
    }

    cancelDownvote(id, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            if (!options.requester || !options.requester.id || !options.requester.role) {
                return reject({
                    reason: ResponseErrors.PERMISSION_DENIED,
                    more_info: { message: 'Only registered users allowed to submit a review.' }
                });
            }

            let upd_query = {
                $pull: {down_votes: options.requester.id}
            };

            ReviewsDAO.updateByQuery({_id: id}, upd_query).then(review => {
                resolve(ReviewsResponse.generateResponse(review, options.requester));
            }).catch(err => {
                SystemEvents.emit('error', err);
                reject({
                    reason: ResponseErrors.REVIEW_UPDATE_FAILED,
                    more_info: {message: 'Failed to cancel downvote.'}
                });
            });
        });
    }

    getReviewById(id, options) {
        return new Promise((resolve, reject) => {
            options = options || {};

            ReviewsDAO.fetchOne({_id: id}, options).then(review => {
                resolve(ReviewsResponse.generateResponse(review, options.requester));
            }).catch(err => {
                SystemEvents.emit('error', err);
                return reject({
                    reason: ResponseErrors.INTERNAL_ERROR
                });
            });
        });
    }

    getReviews(options) {
        return new Promise((resolve, reject) => {
            options = options || {};

            ReviewsDAO.fetchMany(options.filters, options).then(reviews => {
                resolve(ReviewsResponse.generateResponse(reviews, options.requester));
            }).catch(err => {
                SystemEvents.emit('error', err);
                reject({
                    reason: ResponseErrors.INTERNAL_ERROR
                });
            });
        });
    }

    getReviewsByUser(user, options) {
        return new Promise((resolve, reject) => {
            options = options || {};

            ReviewsDAO.fetchMany({user: user}, options).then(reviews => {
                resolve(ReviewsResponse.generateResponse(reviews, options.requester));
            }).catch(err => {
                SystemEvents.emit('error', err);
                return reject({
                    reason: ResponseErrors.INTERNAL_ERROR
                });
            });
        });
    }

    reportReview(id, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            if (!options.requester || !options.requester.id || !options.requester.role) {
                return reject({
                    reason: ResponseErrors.PERMISSION_DENIED,
                    more_info: { message: 'Only registered users allowed to submit a review.' }
                });
            }

            let upd_query = {
                $addToSet: {reports: options.requester.id}
            };
            ReviewsDAO.updateByQuery({_id: id}, upd_query).then(review => {
                SystemEvents.emit(SystemEvents.EventTypes.REVIEW_REPORTED, id);
                return resolve(ReviewsResponse.generateResponse(reviews, options.requester));
            }).catch(err => {
                SystemEvents.emit('error', err);
                return reject({
                    reason: ResponseErrors.REVIEW_UPDATE_FAILED,
                    more_info: {message: 'Failed to report the review.'}
                });
            });
        });
    }

    searchReviews(q, options) {
        return new Promise((resolve, reject) => {
            options = options || {};

            q = ReviewsValidator.sanitizeQueryString(q);
            let query = {
                query: new RegExp('^' + q, 'i')
            };

            ReviewsDAO.fetchMany(q, options).then(reviews => {
                resolve(ReviewsResponse.generateResponse(reviews, options.requester));
            }).catch(err => {
                SystemEvents.emit('error', err);
                return reject({
                    reason: ResponseErrors.INTERNAL_ERROR
                });
            });
        });
    }

    getReviewsCount(options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            ReviewsDAO.getCount().then(count => {
                resolve({count: count});
            }).catch(err => {
                SystemEvents.emit('error', err);
                reject({
                    reason: ResponseErrors.INTERNAL_ERROR
                });
            });
        });
    }

}

module.exports = new ReviewService();
