const express = require('express');
let ProductsRouter = express.Router();


const multer = require('multer');
const upload = multer();

const Utility = require('./../utility/service');
const AppConstants = require('./../settings/constants');
const ProductsService = require('./service');
const RequestService = require('./../request/service');
const ResponseService = require('./../response/service');

const productUploads = upload.fields([{
    name: 'photos',
    maxCount: 5
}]);

ProductsRouter.use((req, res, next) => {
    // product specific calls
    next();
});

const ADMIN_ACCESS = AppConstants.AccessLevel.ADMIN;
const OPTIONAL_ACCESS = AppConstants.AccessLevel.OPTIONAL;
const USER_ACCESS = AppConstants.AccessLevel.USER;

ProductsRouter.get('/', RequestService.authorizeRequest(OPTIONAL_ACCESS), (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;

    ProductsService.getProducts(rq).then(products => {
        let response = ResponseService.generateSuccessResponse(products, req.metadata);
        return res.status(response.http_status).send(response.data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

ProductsRouter.get('/:id', RequestService.authorizeRequest(OPTIONAL_ACCESS), (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;

    if (req.params.id === 'count') {
        return ProductsService.getProductsCount(rq).then(count => {
            let response = ResponseService.generateSuccessResponse(count, req.metadata);
            return res.status(response.http_status).send(response.data);
        }).catch(err => {
            Utility.debug(err);
            let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
            return res.status(response.http_status).send(response.data);
        });
    }

    ProductsService.getProductById(req.params.id, rq).then(products => {
        let response = ResponseService.generateSuccessResponse(products, req.metadata);
        return res.status(response.http_status).send(response.data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

ProductsRouter.post('/', [RequestService.authorizeRequest(ADMIN_ACCESS), productUploads], (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;

    let data = {
        photos: (req.files && req.files.photos) ? req.files.photos : [],
        keywords: (req.body.keywords || '').split(',')
    };
    Utility.copyProperties(req.body, data, AppConstants.products.updatable_field_names);
    ProductsService.createProduct(data, rq).then(products => {
        let response = ResponseService.generateSuccessResponse(products, req.metadata);
        return res.status(response.http_status).send(response.data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

ProductsRouter.put('/:id', RequestService.authorizeRequest(ADMIN_ACCESS), (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;

    Utility.copyProperties(req.body, data, AppConstants.products.updatable_field_names);

    ProductsService.updateProduct(req.params.id, data, rq).then(products => {
        let response = ResponseService.generateSuccessResponse(products, req.metadata);
        return res.status(response.http_status).send(response.data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

ProductsRouter.delete('/:id', RequestService.authorizeRequest(ADMIN_ACCESS), (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;

    ProductsService.removeProductById(req.params.id, rq).then(products => {
        let response = ResponseService.generateSuccessResponse(products, req.metadata);
        return res.status(response.http_status).send(response.data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

ProductsRouter.post('/:id/photos', [RequestService.authorizeRequest(ADMIN_ACCESS), productUploads], (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;

    let photo = (req.fiels && req.files.photos) ? req.files.photos[0] : null;

    ProductsService.addProductPhoto(req.params.id, photo, rq).then(products => {
        let response = ResponseService.generateSuccessResponse(products, req.metadata);
        return res.status(response.http_status).send(response.data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

ProductsRouter.delete('/:id/photos/:photo_id', RequestService.authorizeRequest(ADMIN_ACCESS), (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;

    ProductsService.removeProductPhoto(req.params.id, req.params.photo_id, rq).then(product => {
        let response = ResponseService.generateSuccessResponse(product, req.metadata);
        return res.status(response.http_status).send(response.data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

module.exports = ProductsRouter;
