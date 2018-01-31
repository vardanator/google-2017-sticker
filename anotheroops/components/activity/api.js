const express = require('express');
let ActivityRouter = express.Router();

const Utility = require('./../utility/service');
const AppConstants = require('./../settings/constants');
const ActivityService = require('./service');
const RequestService = require('./../request/service');
const ResponseService = require('./../response/service');
const CardsService = require('./../cards/service');

const Injections = {
    UsersService: require('./../users/service'),
    ReviewsService: require('./../reviews/service'),
    UnitsService: require('./../units/service')
}

ActivityRouter.use((req, res, next) => {
    // tags specik calls
    next();
});

const ADMIN_ACCESS = AppConstants.AccessLevel.ADMIN;
const OPTIONAL_ACCESS = AppConstants.AccessLevel.OPTIONAL;
const USER_ACCESS = AppConstants.AccessLevel.USER;

ActivityRouter.get('/', RequestService.authorizeRequest(USER_ACCESS), (req, res) => {
    let rq = req.resolved_query;
    rq.requester = req.user;
    rq.metadata = req.metadata;
    rq.injections = Injections;

    ActivityService.getActivityForUser(rq.requester.id, rq).then(activities => {
        let response = ResponseService.generateSuccessResponse(activities, rq.metadata);
        return res.status(response.http_status).send(response.data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

// remove after tests
ActivityRouter.post('/', RequestService.authorizeRequest(USER_ACCESS), (req, res) => {
    let rq = req.resolved_query;
    rq.requester = req.user;
    rq.metadata = req.metadata;

    ActivityService.postActivity(req.body.action, req.body.target_id, rq).then(activities => {
        let response = ResponseService.generateSuccessResponse(activities, rq.metadata);
        return res.status(response.http_status).send(response.data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

module.exports = ActivityRouter;
