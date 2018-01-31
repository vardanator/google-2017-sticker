const express = require('express');
let TagsRouter = express.Router();

const Utility = require('./../utility/service');
const AppConstants = require('./../settings/constants');
const TagsService = require('./service');
const RequestService = require('./../request/service');
const ResponseService = require('./../response/service');

TagsRouter.use((req, res, next) => {
    // tags specik calls
    next();
});

const ADMIN_ACCESS = AppConstants.AccessLevel.ADMIN;
const OPTIONAL_ACCESS = AppConstants.AccessLevel.OPTIONAL;
const USER_ACCESS = AppConstants.AccessLevel.USER;

TagsRouter.get('/', RequestService.authorizeRequest(OPTIONAL_ACCESS), (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;

    if (req.query.q || req.query.tags_only || req.query.features_only) {
        return TagsService.searchTags(q, req.query.tags_only, req.query.features_only, rq).then(tags => {
            let response = ResponseService.generateSuccessResponse(tags, req.metadata);
            return res.status(response.http_status).send(response.data);
        }).catch(err => {
            Utility.debug(err);
            let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
            return res.status(response.http_status).send(response.data);
        });
    }

    TagsService.getTags(rq).then(tags => {
        let response = ResponseService.generateSuccessResponse(tags, req.metadata);
        return res.status(response.http_status).send(response.data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

TagsRouter.get('/:id', RequestService.authorizeRequest(OPTIONAL_ACCESS), (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;

    if (req.params.id === 'count') {
        return TagsService.getTagsCount(rq).then(count => {
            let response = ResponseService.generateSuccessResponse(count, req.metadata);
            return res.status(response.http_status).send(response.data);
        }).catch(err => {
            let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
            return res.status(response.http_status).send(response.data);
        });
    }

    TagsService.getTagById(req.params.id, rq).then(tags => {
        let response = ResponseService.generateSuccessResponse(tags, req.metadata);
        return res.status(response.http_status).send(response.data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

TagsRouter.post('/', RequestService.authorizeRequest(ADMIN_ACCESS), (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;

    let tag_data = {};
    Utility.copyProperties(req.body, tag_data, AppConstants.tags.updatable_field_names);

    TagsService.addTag(tag_data, rq).then(tags => {
        let response = ResponseService.generateSuccessResponse(tags, req.metadata);
        return res.status(response.http_status).send(response.data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

TagsRouter.put('/:id', RequestService.authorizeRequest(ADMIN_ACCESS), (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;

    let tag_data = {};
    Utility.copyProperties(req.body, tag_data, AppConstants.tags.updatable_field_names);

    TagsService.updateTag(req.params.id, tag_data, rq).then(tags => {
        let response = ResponseService.generateSuccessResponse(tags, req.metadata);
        return res.status(response.http_status).send(response.data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

TagsRouter.delete('/:id', RequestService.authorizeRequest(ADMIN_ACCESS), (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;

    TagsService.removeTag(req.params.id, rq).then(tags => {
        let response = ResponseService.generateSuccessResponse(tags, req.metadata);
        return res.status(response.http_status).send(response.data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

module.exports = TagsRouter;
