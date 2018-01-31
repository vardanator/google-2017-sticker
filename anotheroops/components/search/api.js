const express = require('express');
let SearchRouter = express.Router();

const Utility = require('./../utility/service');
const AppConstants = require('./../settings/constants');
const SearchService = require('./service');
const RequestService = require('./../request/service');
const ResponseService = require('./../response/service');

SearchRouter.use((req, res, next) => {
    // Search specik calls
    next();
});

SearchRouter.get('/', RequestService.authorizeRequest(AppConstants.AccessLevel.OPTIONAL), (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;

    SearchService.search(req.query.q, rq).then(data => {
        let response = ResponseService.generateSuccessResponse(data, req.metadata);
        return res.status(response.http_status).send(response.data);
    }).catch(err => {
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

module.exports = SearchRouter;
