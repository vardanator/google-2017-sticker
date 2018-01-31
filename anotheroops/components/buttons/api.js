
const express = require('express');
let ButtonsRouter = express.Router();

const ButtonsService = require('./service');

const Utility = require('./../utility/service');
const AppConstants = require('./../settings/constants');
const RequestService = require('./../request/service');
const ResponseService = require('./../response/service');

ButtonsRouter.use((req, res, next) => {
    // logging
    next();
});

ButtonsRouter.get('/', RequestService.authorizeRequest(AppConstants.AccessLevel.ADMIN), (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;
    ButtonsService.getButtons(req.query.component, req.query.q, rq).then(buttons => {
        let response = ResponseService.generateSuccessResponse(buttons, req.metadata);
        return res.status(response.http_status).send(response.data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

ButtonsRouter.get('/:id', RequestService.authorizeRequest(AppConstants.AccessLevel.ADMIN), (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;
    ButtonsService.getButtonById(req.query.id, rq).then(button => {
        let response = ResponseService.generateSuccessResponse(button, req.metadata);
        return res.status(response.http_status).send(response.data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

ButtonsRouter.post('/', RequestService.authorizeRequest(AppConstants.AccessLevel.ADMIN), (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;

    rq.button_data = {};
    Utility.copyProperties(req.body, rq.button_data, AppConstants.buttons.updatable_field_names);
    try {
        rq.button_data.action_request_params = JSON.parse(req.body.action_request_params || []);
    } catch(ex) { rq.action_request_params = []; }

    ButtonsService.createButton(req.body.name, rq).then(button => {
        let response = ResponseService.generateSuccessResponse(button, req.metadata);
        return res.status(response.http_status).send(response.data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

ButtonsRouter.put('/:id', RequestService.authorizeRequest(AppConstants.AccessLevel.ADMIN), (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;

    rq.button_data = {};
    Utility.copyProperties(req.body, rq.button_data, AppConstants.buttons.updatable_field_names);
    try {
        rq.button_data.action_request_params = JSON.parse(rbdy.action_request_params || []);
    } catch(ex) { rq.action_request_params = []; }

    ButtonsService.updateButtonById(req.params.id, rq).then(button => {
        let response = ResponseService.generateSuccessResponse(button, req.metadata);
        return res.status(response.http_status).send(response.data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

ButtonsRouter.delete('/:id', RequestService.authorizeRequest(AppConstants.AccessLevel.ADMIN), (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;
    ButtonsService.removeButtonById(req.params.id, rq).then(resp => {
        let response = ResponseService.generateSuccessResponse(resp, req.metadata);
        return res.status(response.http_status).send(response.data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

module.exports = ButtonsRouter;
