const express = require('express');
const UnitsRouter = express.Router();

const multer = require('multer');
const upload = multer();

const Utility = require('./../utility/service');
const AppConstants = require('./../settings/constants');
const UnitsService = require('./service');
const RequestService = require('./../request/service');
const ResponseService = require('./../response/service');

const Injections = {
    UsersService: require('./../users/service'),
    ActivityService: require('./../activity/service')
}

const unitPhotoUpload = upload.fields([{
    name: 'photo',
    maxCount: 1
}, {
    name: 'cover',
    maxCount: 1
}]);

const morePhotosUpload = upload.fields([{
    name: 'photos',
    maxCount: 10
}]);

const productPhotosUpload = upload.fields([{
    name: 'photos',
    maxCount: 5
}]);

const userPhotoUpload = upload.fields([{
    name: 'photo',
    maxCount: 1
}]);

const OPTIONAL_ACCESS = AppConstants.AccessLevel.OPTIONAL;
const ADMIN_ACCESS = AppConstants.AccessLevel.ADMIN;
const USER_ACCESS = AppConstants.AccessLevel.USER;

const LEGACY_API = '/api/businesses';

UnitsRouter.use((req, res, next) => {
    // logging
    next();
});

UnitsRouter.get('/', RequestService.authorizeRequest(OPTIONAL_ACCESS), (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;
    rq.injections = Injections;

    if (req.query.q) {
        return UnitsService.searchUnits(req.query.q, rq).then(units => {
            let response = ResponseService.generateSuccessResponse(units, rq.metadata);
            let data = (req.baseUrl == LEGACY_API) ? response.data.data : response.data;
            return res.status(response.http_status).send(data);
        }).catch(err => {
            Utility.debug(err);
            let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
            return res.status(response.http_status).send(response.data);
        });
    }
    UnitsService.getUnits(rq).then(units => {
        let response = ResponseService.generateSuccessResponse(units, rq.metadata);
        let data = (req.baseUrl == LEGACY_API) ? response.data.data : response.data;
        return res.status(response.http_status).send(data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

UnitsRouter.get('/:id', RequestService.authorizeRequest(OPTIONAL_ACCESS), (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;
    rq.injections = Injections;

    if (req.params.id === 'count') {
        return UnitsService.getUnitsCount(rq).then(count => {
            let response = ResponseService.generateSuccessResponse(count, req.metadata);
            let data = (req.baseUrl == LEGACY_API) ? response.data.data : response.data;
            return res.status(response.http_status).send(data);
        }).catch (err => {
            let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
            return res.status(response.http_status).send(response.data);
        })
    }

    UnitsService.getUnitById(req.params.id, rq).then(units => {
        let response = ResponseService.generateSuccessResponse(units, rq.metadata);
        let data = (req.baseUrl == LEGACY_API) ? response.data.data : response.data;
        return res.status(response.http_status).send(data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

UnitsRouter.post('/', [RequestService.authorizeRequest(ADMIN_ACCESS), unitPhotoUpload], (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;
    rq.injections = Injections;

    let unit_data = {
        photo: (req.files && req.files.photo) ? req.files.photo[0] : null,
        cover: (req.files && req.files.cover) ? req.files.cover[0] : null,
        user: rq.requester.id,
        categories: (req.body.categories || '').split(','),
        contact_phones: (req.body.contact_phones || '').split(','),
        tags: (req.body.tags || '').split(','),
        keywords: (req.body.keywords || '').split(',')
    };
    Utility.copyProperties(req.body, unit_data, AppConstants.units.updatable_field_names);
    unit_data.address_lon = req.body.address_lon;
    unit_data.address_lat = req.body.address_lat;

    UnitsService.createUnit(unit_data, rq).then(units => {
        let response = ResponseService.generateSuccessResponse(units, rq.metadata);
        let data = (req.baseUrl == LEGACY_API) ? response.data.data : response.data;
        return res.status(response.http_status).send(data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

UnitsRouter.put('/:id', [RequestService.authorizeRequest(ADMIN_ACCESS), unitPhotoUpload], (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;
    rq.injections = Injections;

    let unit_data = {
        photo: (req.files && req.files.photo) ? req.files.photo[0] : null,
        cover: (req.files && req.files.cover) ? req.files.cover[0] : null,
        updated_by: rq.requester,
        categories: (req.body.categories || '').split(','),
        contact_phones: (req.body.contact_phones || '').split(','),
        tags: (req.body.tags || '').split(','),
        keywords: (req.body.keywords || '').split(',')
    };
    Utility.copyProperties(req.body, unit_data, AppConstants.units.updatable_field_names);
    unit_data.address_lon = req.body.address_lon;
    unit_data.address_lat = req.body.address_lat;

    UnitsService.updateUnit(req.params.id, unit_data, rq).then(units => {
        let response = ResponseService.generateSuccessResponse(units, rq.metadata);
        let data = (req.baseUrl == LEGACY_API) ? response.data.data : response.data;
        return res.status(response.http_status).send(data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

UnitsRouter.delete('/:id', RequestService.authorizeRequest(ADMIN_ACCESS), (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;
    rq.injections = Injections;

    UnitsService.removeUnitById(req.params.id, rq).then(resp => {
        let response = ResponseService.generateSuccessResponse(resp, rq.metadata);
        let data = (req.baseUrl == LEGACY_API) ? response.data.data : response.data;
        return res.status(response.http_status).send(data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

UnitsRouter.post('/:id/photos', [RequestService.authorizeRequest(ADMIN_ACCESS), morePhotosUpload], (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;
    rq.injections = Injections;

    let photos = (req.files && req.files.photos) ? req.files.photos : null;

    UnitsService.uploadUnitPhotos(req.params.id, photos, rq).then(resp => {
        let response = ResponseService.generateSuccessResponse(resp, rq.metadata);
        let data = (req.baseUrl == LEGACY_API) ? response.data.data : response.data;
        return res.status(response.http_status).send(data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

UnitsRouter.delete('/:id/photos/:photo_id', RequestService.authorizeRequest(ADMIN_ACCESS), (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;
    rq.injections = Injections;

    UnitsService.removeUnitPhoto(req.params.id, req.params.photo_id, rq).then(resp => {
        let response = ResponseService.generateSuccessResponse(resp, rq.metadata);
        let data = (req.baseUrl == LEGACY_API) ? response.data.data : response.data;
        return res.status(response.http_status).send(data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

UnitsRouter.get('/:id/features', RequestService.authorizeRequest(OPTIONAL_ACCESS), (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;
    rq.injections = Injections;

    UnitsService.getFeatures(req.params.id, rq).then(resp => {
        let response = ResponseService.generateSuccessResponse(resp, rq.metadata);
        let data = (req.baseUrl == LEGACY_API) ? response.data.data : response.data;
        return res.status(response.http_status).send(data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

UnitsRouter.post('/:id/features', RequestService.authorizeRequest(ADMIN_ACCESS), (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;
    rq.injections = Injections;

    UnitsService.addFeature(req.params.id, req.body.feature, rq).then(resp => {
        let response = ResponseService.generateSuccessResponse(resp, rq.metadata);
        let data = (req.baseUrl == LEGACY_API) ? response.data.data : response.data;
        return res.status(response.http_status).send(data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

UnitsRouter.delete('/:id/features/:feature_id', RequestService.authorizeRequest(ADMIN_ACCESS), (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;
    rq.injections = Injections;

    UnitsService.removeFeature(req.params.id, req.params.feature_id, rq).then(resp => {
        let response = ResponseService.generateSuccessResponse(resp, rq.metadata);
        let data = (req.baseUrl == LEGACY_API) ? response.data.data : response.data;
        return res.status(response.http_status).send(data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

UnitsRouter.get('/:id/tags', RequestService.authorizeRequest(OPTIONAL_ACCESS), (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;
    rq.injections = Injections;

    UnitsService.getTags(req.params.id, rq).then(resp => {
        let response = ResponseService.generateSuccessResponse(resp, rq.metadata);
        let data = (req.baseUrl == LEGACY_API) ? response.data.data : response.data;
        return res.status(response.http_status).send(data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

UnitsRouter.post('/:id/tags', RequestService.authorizeRequest(ADMIN_ACCESS), (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;
    rq.injections = Injections;

    let tags = (req.body.tags || '').split(',');

    UnitsService.addTags(req.params.id, tags, rq).then(resp => {
        let response = ResponseService.generateSuccessResponse(resp, rq.metadata);
        let data = (req.baseUrl == LEGACY_API) ? response.data.data : response.data;
        return res.status(response.http_status).send(data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

UnitsRouter.delete('/:id/tags/:tag_id', RequestService.authorizeRequest(ADMIN_ACCESS), (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;
    rq.injections = Injections;

    UnitsService.removeTag(req.params.id, req.params.tag_id, rq).then(resp => {
        let response = ResponseService.generateSuccessResponse(resp, rq.metadata);
        let data = (req.baseUrl == LEGACY_API) ? response.data.data : response.data;
        return res.status(response.http_status).send(data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

UnitsRouter.get('/:id/keywords', RequestService.authorizeRequest(OPTIONAL_ACCESS), (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;
    rq.injections = Injections;

    UnitsService.getKeywords(req.params.id, rq).then(resp => {
        let response = ResponseService.generateSuccessResponse(resp, rq.metadata);
        let data = (req.baseUrl == LEGACY_API) ? response.data.data : response.data;
        return res.status(response.http_status).send(data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

UnitsRouter.post('/:id/keywords', RequestService.authorizeRequest(ADMIN_ACCESS), (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;
    rq.injections = Injections;

    let keywords = (req.body.keywords || '').split(',');

    UnitsService.addKeywords(req.params.id, keywords, rq).then(resp => {
        let response = ResponseService.generateSuccessResponse(resp, rq.metadata);
        let data = (req.baseUrl == LEGACY_API) ? response.data.data : response.data;
        return res.status(response.http_status).send(data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

UnitsRouter.delete('/:id/keywords/:k_id', RequestService.authorizeRequest(ADMIN_ACCESS), (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;
    rq.injections = Injections;

    UnitsService.removeKeyword(req.params.id, req.params.k_id, rq).then(resp => {
        let response = ResponseService.generateSuccessResponse(resp, rq.metadata);
        let data = (req.baseUrl == LEGACY_API) ? response.data.data : response.data;
        return res.status(response.http_status).send(data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

UnitsRouter.get('/:id/products', RequestService.authorizeRequest(OPTIONAL_ACCESS), (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;
    rq.injections = Injections;

    UnitsService.getProducts(req.params.id, rq).then(resp => {
        let response = ResponseService.generateSuccessResponse(resp, rq.metadata);
        let data = (req.baseUrl == LEGACY_API) ? response.data.data : response.data;
        return res.status(response.http_status).send(data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

UnitsRouter.post('/:id/products', [RequestService.authorizeRequest(ADMIN_ACCESS), productPhotosUpload], (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;
    rq.injections = Injections;

    UnitsService.addProduct(req.params.id, req.body.product_id, rq).then(resp => {
        let response = ResponseService.generateSuccessResponse(resp, rq.metadata);
        let data = (req.baseUrl == LEGACY_API) ? response.data.data : response.data;
        return res.status(response.http_status).send(data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

UnitsRouter.delete('/:id/products/:pid', RequestService.authorizeRequest(ADMIN_ACCESS), (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;
    rq.injections = Injections;

    UnitsService.removeProduct(req.params.id, req.params.pid, rq).then(resp => {
        let response = ResponseService.generateSuccessResponse(resp, rq.metadata);
        let data = (req.baseUrl == LEGACY_API) ? response.data.data : response.data;
        return res.status(response.http_status).send(data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

UnitsRouter.get('/:id/branches', RequestService.authorizeRequest(OPTIONAL_ACCESS), (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;
    rq.injections = Injections;

    UnitsService.getBranches(req.params.id, rq).then(resp => {
        let response = ResponseService.generateSuccessResponse(resp, rq.metadata);
        let data = (req.baseUrl == LEGACY_API) ? response.data.data : response.data;
        return res.status(response.http_status).send(data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

UnitsRouter.get('/:id/user-photos', RequestService.authorizeRequest(OPTIONAL_ACCESS), (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;
    rq.injections = Injections;

    UnitsService.getUserPhotos(req.params.id, rq).then(resp => {
        let response = ResponseService.generateSuccessResponse(resp, rq.metadata);
        let data = (req.baseUrl == LEGACY_API) ? response.data.data : response.data;
        return res.status(response.http_status).send(data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

UnitsRouter.post('/:id/user-photos', [RequestService.authorizeRequest(USER_ACCESS), userPhotoUpload], (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;
    rq.injections = Injections;

    let photo = (req.files && req.files.photo) ? req.files.photo : null;

    UnitsService.addUserPhoto(req.params.id, photo, rq).then(resp => {
        let response = ResponseService.generateSuccessResponse(resp, rq.metadata);
        let data = (req.baseUrl == LEGACY_API) ? response.data.data : response.data;
        return res.status(response.http_status).send(data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

UnitsRouter.delete('/:id/user-photos/:photo_id', RequestService.authorizeRequest(ADMIN_ACCESS), (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;
    rq.injections = Injections;

    UnitsService.removeUserPhoto(req.params.id, req.params.photo_id, rq).then(resp => {
        let response = ResponseService.generateSuccessResponse(resp, rq.metadata);
        let data = (req.baseUrl == LEGACY_API) ? response.data.data : response.data;
        return res.status(response.http_status).send(data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

UnitsRouter.get('/:id/reviews', RequestService.authorizeRequest(OPTIONAL_ACCESS), (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;
    rq.injections = Injections;

    UnitsService.getReviews(req.params.id, rq).then(resp => {
        let response = ResponseService.generateSuccessResponse(resp, rq.metadata);
        let data = (req.baseUrl == LEGACY_API) ? response.data.data : response.data;
        return res.status(response.http_status).send(data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

UnitsRouter.post('/:id/reviews', RequestService.authorizeRequest(USER_ACCESS), (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;
    rq.injections = Injections;

    let review_data = {
        text: req.body.text,
        rating: req.body.rating
    };

    UnitsService.addReview(req.params.id, review_data, rq).then(resp => {
        let response = ResponseService.generateSuccessResponse(resp, rq.metadata);
        let data = (req.baseUrl == LEGACY_API) ? response.data.data : response.data;
        return res.status(response.http_status).send(data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

// there is another removeReview call from Reviews Service, which is USER_ACCESS
UnitsRouter.delete('/:id/reviews/:rid', RequestService.authorizeRequest(ADMIN_ACCESS), (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;
    rq.injections = Injections;

    UnitsService.removeReview(req.params.id, req.params.rid, rq).then(resp => {
        let response = ResponseService.generateSuccessResponse(resp, rq.metadata);
        let data = (req.baseUrl == LEGACY_API) ? response.data.data : response.data;
        return res.status(response.http_status).send(data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

UnitsRouter.get('/:id/stats', RequestService.authorizeRequest(ADMIN_ACCESS), (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;
    rq.injections = Injections;

    UnitsService.getStats(req.params.id, rq).then(resp => {
        let response = ResponseService.generateSuccessResponse(resp, rq.metadata);
        let data = (req.baseUrl == LEGACY_API) ? response.data.data : response.data;
        return res.status(response.http_status).send(data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

module.exports = UnitsRouter;
