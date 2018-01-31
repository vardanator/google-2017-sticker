const express = require('express');
let CollectionsRouter = express.Router();

const Utility = require('./../utility/service');
const AppConstants = require('./../settings/constants');
const CollectionsService = require('./service');
const RequestService = require('./../request/service');
const ResponseService = require('./../response/service');

const Injections = {
    UnitsService: require('./../users/service'),
    GroupsService: require('./../groups/service'),
    CategoriesService: require('./../categories/service'),
    TagsService: require('./../tags/service')
};

CollectionsRouter.use((req, res, next) => {
    // Collections specik calls
    next();
});

const ADMIN_ACCESS = AppConstants.AccessLevel.ADMIN;
const OPTIONAL_ACCESS = AppConstants.AccessLevel.OPTIONAL;
const USER_ACCESS = AppConstants.AccessLevel.USER;

CollectionsRouter.get('/', RequestService.authorizeRequest(OPTIONAL_ACCESS), (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;
    rq.injections = Injections;

    CollectionsService.getCollections(rq).then(collections => {
        let response = ResponseService.generateSuccessResponse(collections, rq.metadata);
        return res.status(response.http_status).send(response.data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

CollectionsRouter.post('/', RequestService.authorizeRequest(ADMIN_ACCESS), (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;
    rq.injections = Injections;

    let name = req.body.name;
    let units = (req.body.units || '').split(',');

    CollectionsService.addCollection(name, units, rq).then(collections => {
        let response = ResponseService.generateSuccessResponse(collections, rq.metadata);
        return res.status(response.http_status).send(response.data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

CollectionsRouter.delete('/:id', RequestService.authorizeRequest(ADMIN_ACCESS), (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;
    rq.injections = Injections;

    CollectionsService.removeCollection(req.params.id, rq).then(collections => {
        let response = ResponseService.generateSuccessResponse(collections, rq.metadata);
        return res.status(response.http_status).send(response.data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

module.exports = CollectionsRouter;
