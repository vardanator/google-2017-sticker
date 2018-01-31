
const express = require('express');
let CategoriesRouter = express.Router();

const multer = require('multer');
const upload = multer();

const Utility = require('./../utility/service');
const AppConstants = require('./../settings/constants');
const CategoriesService = require('./service');
const RequestService = require('./../request/service');
const ResponseService = require('./../response/service');

const categoryPhotoUpload = upload.fields([{
    name: 'photo',
    maxCount: 1
}]);

CategoriesRouter.use((req, res, next) => {
    // logging
    next();
});

const LEGACY_API = '/api/categories';

CategoriesRouter.get('/', RequestService.authorizeRequest(AppConstants.AccessLevel.OPTIONAL), (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;
    if (req.query.q || req.query.groups) {
        return CategoriesService.searchCategories(req.query.q, req.query.groups, rq).then(categories => {
            let response = ResponseService.generateSuccessResponse(categories, rq.metadata);
            let data = (req.baseUrl == LEGACY_API) ? response.data.data : response.data;
            return res.status(response.http_status).send(data);
        }).catch(err => {
            Utility.debug(err);
            let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
            return res.status(response.http_status).send(response.data);
        });
    }
    CategoriesService.getCategories(rq).then(categories => {
        let response = ResponseService.generateSuccessResponse(categories, rq.metadata);
        let data = (req.baseUrl == LEGACY_API) ? response.data.data : response.data;
        return res.status(response.http_status).send(data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

CategoriesRouter.get('/:id', RequestService.authorizeRequest(AppConstants.AccessLevel.OPTIONAL), (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;

    if (req.params.id === 'count') {
        return CategoriesService.getCategoriesCount(rq).then(count => {
            let response = ResponseService.generateSuccessResponse(count, req.metadata);
            let data = (req.baseUrl == LEGACY_API) ? response.data.data : response.data;
            return res.status(response.http_status).send(data);
        }).catch (err => {
            let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
            return res.status(response.http_status).send(response.data);
        })
    }

    CategoriesService.getCategoryById(req.params.id, rq).then(category => {
        let response = ResponseService.generateSuccessResponse(category, rq.metadata);
        let data = (req.baseUrl == LEGACY_API) ? response.data.data : response.data;
        return res.status(response.http_status).send(data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

CategoriesRouter.post('/', [RequestService.authorizeRequest(AppConstants.AccessLevel.ADMIN), categoryPhotoUpload], (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;

    let category_data = {
        photo: (req.files && req.files.photo) ? req.files.photo[0] : null
    };
    Utility.copyProperties(req.body, category_data, AppConstants.categories.updatable_field_names);

    CategoriesService.createCategory(category_data, rq).then(category => {
        let response = ResponseService.generateSuccessResponse(category, rq.metadata);
        let data = (req.baseUrl == LEGACY_API) ? response.data.data : response.data;
        return res.status(response.http_status).send(data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

CategoriesRouter.put('/:id', [RequestService.authorizeRequest(AppConstants.AccessLevel.ADMIN), categoryPhotoUpload], (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;

    let category_data = {
        photo: (req.files && req.files.photo) ? req.files.photo[0] : null
    };
    Utility.copyProperties(req.body, category_data, AppConstants.categories.updatable_field_names);

    CategoriesService.updateCategoryById(req.params.id, category_data, rq).then(category => {
        let response = ResponseService.generateSuccessResponse(category, rq.metadata);
        let data = (req.baseUrl == LEGACY_API) ? response.data.data : response.data;
        return res.status(response.http_status).send(data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

CategoriesRouter.delete('/:id', RequestService.authorizeRequest(AppConstants.AccessLevel.ADMIN), (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;

    CategoriesService.removeCategoryById(req.params.id, rq).then(resp => {
        let response = ResponseService.generateSuccessResponse(resp, rq.metadata);
        let data = (req.baseUrl == LEGACY_API) ? response.data.data : response.data;
        return res.status(response.http_status).send(data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

module.exports = CategoriesRouter;
