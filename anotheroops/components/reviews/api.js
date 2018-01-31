
const express = require('express');
let ReviewsRouter = express.Router();

const Utility = require('./../utility/service');
const AppConstants = require('./../settings/constants');
const ReviewService = require('./service');
const RequestService = require('./../request/service');
const ResponseService = require('./../response/service');


ReviewsRouter.use((req, res, next) => {
    // logging Reviews specific calls
    next();
});

const ADMIN_ACCESS = AppConstants.AccessLevel.ADMIN;
const OPTIONAL_ACCESS = AppConstants.AccessLevel.OPTIONAL;
const USER_ACCESS = AppConstants.AccessLevel.USER;

const LEGACY_API = '/api/reviews';

ReviewsRouter.get('/', RequestService.authorizeRequest(OPTIONAL_ACCESS), (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;

    if (req.query.q) {
        return ReviewService.searchReviews(q, rq).then(reviews => {
            let response = ResponseService.generateSuccessResponse(reviews, req.metadata);
            let data = (req.baseUrl == LEGACY_API) ? response.data.data : response.data;
            return res.status(response.http_status).send(data);
        }).catch(err => {
            Utility.debug(err);
            let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
            return res.status(response.http_status).send(response.data);
        });
    }
    if (req.query.user) {
        return ReviewService.getReviewsByUser(req.query.user, rq).then(reviews => {
            let response = ResponseService.generateSuccessResponse(review, req.metadata);
            let data = (req.baseUrl == LEGACY_API) ? response.data.data : response.data;
            return res.status(response.http_status).send(data);
        }).catch(err => {
            Utility.debug(err);
            let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
            return res.status(response.http_status).send(response.data);
        });
    }

    ReviewService.getReviews(rq).then(reviews => {
        let response = ResponseService.generateSuccessResponse(reviews, req.metadata);
        let data = (req.baseUrl == LEGACY_API) ? response.data.data : response.data;
        return res.status(response.http_status).send(data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

ReviewsRouter.get('/:id', RequestService.authorizeRequest(OPTIONAL_ACCESS), (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;

    if (req.params.id === 'count') {
        return ReviewService.getReviewsCount(rq).then(count => {
            let response = ResponseService.generateSuccessResponse(count, req.metadata);
            let data = (req.baseUrl == LEGACY_API) ? response.data.data : response.data;
            return res.status(response.http_status).send(data);
        }).catch(err => {
            let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
            return res.status(response.http_status).send(response.data);
        });
    }

    ReviewService.getReviewById(req.params.id, rq).then(reviews => {
        let response = ResponseService.generateSuccessResponse(reviews, req.metadata);
        let data = (req.baseUrl == LEGACY_API) ? response.data.data : response.data;
        return res.status(response.http_status).send(data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

ReviewsRouter.post('/', RequestService.authorizeRequest(USER_ACCESS), (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;

    ReviewService.createReview(req.body.rating, req.body.text, rq).then(reviews => {
        let response = ResponseService.generateSuccessResponse(reviews, req.metadata);
        let data = (req.baseUrl == LEGACY_API) ? response.data.data : response.data;
        return res.status(response.http_status).send(data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

ReviewsRouter.put('/:id', RequestService.authorizeRequest(USER_ACCESS), (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;

    ReviewService.editReview(req.params.id, req.body.text, rq).then(reviews => {
        let response = ResponseService.generateSuccessResponse(reviews, req.metadata);
        let data = (req.baseUrl == LEGACY_API) ? response.data.data : response.data;
        return res.status(response.http_status).send(data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

ReviewsRouter.delete('/:id', RequestService.authorizeRequest(USER_ACCESS), (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;

    ReviewService.removeReview(req.params.id, rq).then(reviews => {
        let response = ResponseService.generateSuccessResponse(reviews, req.metadata);
        let data = (req.baseUrl == LEGACY_API) ? response.data.data : response.data;
        return res.status(response.http_status).send(data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

ReviewsRouter.post('/:id/upvotes', RequestService.authorizeRequest(USER_ACCESS), (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;

    ReviewService.upvoteReview(req.params.id, rq).then(reviews => {
        let response = ResponseService.generateSuccessResponse(reviews, req.metadata);
        let data = (req.baseUrl == LEGACY_API) ? response.data.data : response.data;
        return res.status(response.http_status).send(data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

ReviewsRouter.delete('/:id/upvotes', RequestService.authorizeRequest(USER_ACCESS), (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;

    ReviewService.cancelUpvote(req.params.id, rq).then(reviews => {
        let response = ResponseService.generateSuccessResponse(reviews, req.metadata);
        let data = (req.baseUrl == LEGACY_API) ? response.data.data : response.data;
        return res.status(response.http_status).send(data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

ReviewsRouter.post('/:id/downvotes', RequestService.authorizeRequest(USER_ACCESS), (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;

    ReviewService.downvoteReview(req.params.id, rq).then(reviews => {
        let response = ResponseService.generateSuccessResponse(reviews, req.metadata);
        let data = (req.baseUrl == LEGACY_API) ? response.data.data : response.data;
        return res.status(response.http_status).send(data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

ReviewsRouter.delete('/:id/downvotes', RequestService.authorizeRequest(USER_ACCESS), (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;

    ReviewService.cancelDownvote(req.params.id, rq).then(reviews => {
        let response = ResponseService.generateSuccessResponse(reviews, req.metadata);
        let data = (req.baseUrl == LEGACY_API) ? response.data.data : response.data;
        return res.status(response.http_status).send(data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

ReviewsRouter.post('/:id/reports', RequestService.authorizeRequest(USER_ACCESS), (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;

    ReviewService.reportReview(req.params.id, rq).then(reviews => {
        let response = ResponseService.generateSuccessResponse(reviews, req.metadata);
        let data = (req.baseUrl == LEGACY_API) ? response.data.data : response.data;
        return res.status(response.http_status).send(data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

module.exports = ReviewsRouter;
