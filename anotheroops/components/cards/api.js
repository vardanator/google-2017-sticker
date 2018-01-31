const express = require('express');
let CardsRouter = express.Router();

const Utility = require('./../utility/service');
const AppConstants = require('./../settings/constants');
const CardsService = require('./service');
const RequestService = require('./../request/service');
const ResponseService = require('./../response/service');

const Injections = {
    UsersService: require('./../users/service'),
    ReviewsService: require('./../reviews/service'),
    UnitsService: require('./../units/service'),
    ActivityService: require('./../activity/service'),
    GroupsService: require('./../groups/service'),
    CategoriesService: require('./../categories/service'),
    TagsService: require('./../tags/service'),
    CollectionsService: require('./../collections/service')
}

CardsRouter.use((req, res, next) => {
    // tags specik calls
    next();
});

const ADMIN_ACCESS = AppConstants.AccessLevel.ADMIN;
const OPTIONAL_ACCESS = AppConstants.AccessLevel.OPTIONAL;
const USER_ACCESS = AppConstants.AccessLevel.USER;

CardsRouter.get('/activity', RequestService.authorizeRequest(OPTIONAL_ACCESS), (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;
    rq.injections = Injections;

    CardsService.getActivityCards(rq).then(cards => {
        let response = ResponseService.generateSuccessResponse(cards, rq.metadata);
        return res.status(response.http_status).send(response.data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

CardsRouter.get('/nearby', RequestService.authorizeRequest(OPTIONAL_ACCESS), (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;
    rq.injections = Injections;

    rq.is_open = req.query.is_open;
    rq.categories = req.query.categories;
    rq.price = req.query.price;

    CardsService.getNearbyCards(req.query.lat, req.query.lon, req.query.group, rq).then(cards => {
        let response = ResponseService.generateSuccessResponse(cards, rq.metadata);
        return res.status(response.http_status).send(response.data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

CardsRouter.get('/home', RequestService.authorizeRequest(OPTIONAL_ACCESS), (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;
    rq.injections = Injections;

    rq.is_open = req.query.is_open;
    rq.categories = req.query.categories;
    rq.price = req.query.price;

    let clarifier = null;
    if (req.query.clarifier_id) {
        clarifier = {
            id: req.query.clarifier_id,
            type: req.query.clarifier_type,
            tracking_id: req.query.tracking_id
        };
    }

    CardsService.getHomeCards(req.query.group, clarifier, rq).then(cards => {
        let response = ResponseService.generateSuccessResponse(cards, rq.metadata);
        return res.status(response.http_status).send(response.data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

CardsRouter.get('/home/clarifiers', RequestService.authorizeRequest(OPTIONAL_ACCESS), (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;
    rq.injections = Injections;

    CardsService.getHomeClarifiers(req.query.group, req.query.tracking_id, rq).then(clarifiers => {
        let response = ResponseService.generateSuccessResponse(clarifiers, rq.metadata);
        return res.status(response.http_status).send(response.data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

CardsRouter.get('/groups/others', RequestService.authorizeRequest(OPTIONAL_ACCESS), (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;
    rq.injections = Injections;

    CardsService.getOtherGroupCards(rq).then(clarifiers => {
        let response = ResponseService.generateSuccessResponse(clarifiers, rq.metadata);
        return res.status(response.http_status).send(response.data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    })
});

CardsRouter.get('/events', RequestService.authorizeRequest(OPTIONAL_ACCESS), (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;
    rq.injections = Injections;

    CardsService.getEventCards(rq).then(cards => {
        let response = ResponseService.generateSuccessResponse(cards, rq.metadata);
        return res.status(response.http_status).send(response.data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

CardsRouter.get('/profile', RequestService.authorizeRequest(OPTIONAL_ACCESS), (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;
    rq.injections = Injections;

    if (req.query.user == 'undefined' || req.query.user == 'null') req.query.user = null;
    if (rq.requester && rq.requester.id && !req.query.user) {
        req.query.user = rq.requester.id;
    }
    CardsService.getProfileCards(req.query.user, rq).then(cards => {
        let response = ResponseService.generateSuccessResponse(cards, rq.metadata);
        return res.status(response.http_status).send(response.data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

CardsRouter.get('/search', RequestService.authorizeRequest(OPTIONAL_ACCESS), (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;
    rq.injections = Injections;

    CardsService.getSearchCards(rq).then(cards => {
        let response = ResponseService.generateSuccessResponse(cards, rq.metadata);
        return res.status(response.http_status).send(response.data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

CardsRouter.get('/units', RequestService.authorizeRequest(OPTIONAL_ACCESS), (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;
    rq.injections = Injections;

    let units = (req.query.units || '').split(',');
    CardsService.getUnitsListCards(req.query.q, req.query.suggestion, units, rq).then(cards => {
        let response = ResponseService.generateSuccessResponse(cards, rq.metadata);
        return res.status(response.http_status).send(response.data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

CardsRouter.get('/units/:id', RequestService.authorizeRequest(OPTIONAL_ACCESS), (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;
    rq.injections = Injections;

    CardsService.getUnitCards(req.params.id, rq).then(cards => {
        let response = ResponseService.generateSuccessResponse(cards, rq.metadata);
        return res.status(response.http_status).send(response.data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

CardsRouter.get('/filters', RequestService.authorizeRequest(OPTIONAL_ACCESS), (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;
    rq.injections = Injections;

    CardsService.getFiltersDialog(req.query.group, rq).then(dialog => {
        let response = ResponseService.generateSuccessResponse(dialog, rq.metadata);
        return res.status(response.http_status).send(response.data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

module.exports = CardsRouter;
