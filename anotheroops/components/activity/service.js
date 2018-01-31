const EventEmitter = require('events');
const Utility = require('./../utility/service');
const ResponseErrors = require('./../response/errors');
const AppConstants = require('./../settings/constants');
const SystemEvents = require('./../system-events/service');

const ActivityDAO = require('./private/dao');
const ActivityValidator = require('./private/validator');
const ActivityResponse = require('./private/response');
const ActivitySettings = require('./../settings/service').activity;

class ActivityService {

    postActivity(action, target_id, options) {
        return new Promise((resolve, reject) => {
            console.log('postActivity called');
            options = options || {};
            if (!options.requester || !options.requester.id || !options.requester.role) {
                return reject({
                    reason: ResponseErrors.PERMISSION_DENIED,
                    more_info: {message: 'Only user is able to post an activity.'}
                });
            }

            let validation = ActivityValidator.validateAll([
                {key: 'action', value: action, options: {required: true, sanitize: true}},
                {key: 'info', value: options.info, options: {required: false, sanitize: true}}
            ]);
            if (!validation.is_valid) {
                return reject({
                    reason: ResponseErrors.VALIDATION_ERROR,
                    more_info: validation
                });
            }
            let src_activity_obj = {
                action: validation.action.sanitized_value,
                info: validation.info.sanitized_value,
                user: options.requester.id,
                target_id: target_id
            };

            ActivityDAO.insert(src_activity_obj).then(activity => {
                return resolve(ActivityResponse.generateResponse(activity, options.requester));
            }).catch(err => {
                SystemEvents.emit('error', err);
                if (err.reason) {
                    return reject(err);
                }
                reject({
                    reason: ResponseErrors.INTERNAL_ERROR
                });
            });
        });
    }

    getActivityForUser(user_id, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            /*
            if (!options.requester || !options.requester.id || !options.requester.role) {
                return reject({
                    reason: ResponseErrors.PERMISSION_DENIED,
                    more_info: {message: 'Activity is available for registered users.'}
                });
            }
            if ((!user_id || options.requester.id != user_id) && options.requester.role != AppConstants.UserRoles.ADMIN) {
                return reject({
                    reason: ResponseErrors.PERMISSION_DENIED,
                    more_info: {message: 'Access denied.'}
                });
            }
            */

            //let query = {_id: {$in: options.requester.following}};
            let query = {};
            options.populate = 'user';
            ActivityDAO.fetchMany(query, options).then(activities => {
                return Promise.all((activities || []).map(a => this._getProperTargetId(a, options)));
            }).then(activities => {
                resolve(ActivityResponse.generateResponse(activities, options.requester));
            }).catch(err => {
                console.log(err);
                SystemEvents.emit('error', err);
                if (err.reason) return reject(err);
                return reject({
                    reason: ResponseErrors.INTERNAL_ERROR
                });
            });
        });
    }

    _getProperTargetId(activity, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            if (!options.injections) {
                return reject({
                    reason: ResponseErrors.CONTRACT_VIOLATION,
                    more_info: {message: 'No injections.'}
                });
            }

            let actions = ActivitySettings.actions;
            if ([actions.UNIT_UPDATE, actions.SUBSCRIBE].includes(activity.action)) {
                if (!options.injections.UnitsService) {
                    return reject({
                        reason: ResponseErrors.CONTRACT_VIOLATION,
                        more_info: {message: 'No UnitsService injected.'}
                    });
                }
                return options.injections.UnitsService.getUnitById(activity.target_id, options).then(unit => {
                    if (!unit) {
                        return reject({
                            reason: ResponseErrors.RESOURCE_NOT_FOUND,
                            more_info: {message: 'Unit not found.'}
                        });
                    }

                    activity.item = this._generateActivityItem(unit.name.en, unit.photos);
                    return resolve(activity);
                });
            }

            if ([actions.REVIEW, actions.REVIEW_UPVOTE, actions.REVIEW_DOWNVOTE].includes(activity.action)) {
                if (!options.injections.ReviewsService) {
                    return reject({
                        reason: ResponseErrors.CONTRACT_VIOLATION,
                        more_info: {message: 'No ReviewsService injected.'}
                    });
                }
                return options.injections.ReviewsService.getReviewById(activity.target_id, options).then(review => {
                    if (!review) {
                        return reject({
                            reason: ResponseErrors.RESOURCE_NOT_FOUND,
                            more_info: {message: 'Review not found.'}
                        });
                    }

                    // later find the business photo
                    activity.item = this._generateActivityItem(review.text);

                    return resolve(activity);
                });
            }

            if ([actions.FOLLOW, actions.POST, actions.USER_UPDATE].includes(activity.action)) {
                if (!options.injections.UsersService) {
                    return reject({
                        reason: ResponseErrors.CONTRACT_VIOLATION,
                        more_info: {message: 'No UsersService injected.'}
                    });
                }
                return options.injections.UsersService.getUserById(activity.target_id, options).then(user => {
                    if (!user) {
                        return reject({
                            reason: ResponseErrors.RESOURCE_NOT_FOUND,
                            more_info: {message: 'User not found.'}
                        });
                    }

                    activity.item = this._generateActivityItem(user.username, user.avatar);
                    return resolve(activity);
                });
            }

        });
    }

    _generateActivityItem(text, photos) {
        if (!photos) photos = [];
        return {
            info: text,
            photos: Array.isArray(photos) ? photos : [photos]
        };
    }

}

module.exports = new ActivityService();
