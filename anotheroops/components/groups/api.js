
const express = require('express');
let GroupsRouter = express.Router();

const multer = require('multer');
const upload = multer();

const Utility = require('./../utility/service');
const AppConstants = require('./../settings/constants');
const GroupsService = require('./service');
const RequestService = require('./../request/service');
const ResponseService = require('./../response/service');

const groupPhotoUpload = upload.fields([{
    name: 'photo',
    maxCount: 1
}]);

GroupsRouter.use((req, res, next) => {
    // loggin Group specik calls
    next();
});

const LEGACY_GROUPS_API = '/api/groups';

GroupsRouter.get('/', RequestService.authorizeRequest(AppConstants.AccessLevel.OPTIONAL), (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;
    if (req.query.q || req.query.is_primary) {
        return GroupsService.searchGroups(req.query.q, req.query.is_primary, rq).then(groups => {
            let response = ResponseService.generateSuccessResponse(groups, req.metadata);
            let data = (req.baseUrl == LEGACY_GROUPS_API) ? response.data.data : response.data;
            return res.status(response.http_status).send(data);
        }).catch(err => {
            let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
            return res.status(response.http_status).send(response.data);
        });
    }
    GroupsService.getGroups(rq).then(groups => {
        let response = ResponseService.generateSuccessResponse(groups, req.metadata);
        let data = (req.baseUrl == LEGACY_GROUPS_API) ? response.data.data : response.data;
        return res.status(response.http_status).send(data);
    }).catch(err => {
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

GroupsRouter.get('/:id', RequestService.authorizeRequest(AppConstants.AccessLevel.OPTIONAL), (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata,
    rq.requester = req.user;

    if (req.params.id === 'count') {
        return GroupsService.getGroupsCount(rq).then(count => {
            let response = ResponseService.generateSuccessResponse(count, req.metadata);
            let data = (req.baseUrl == LEGACY_GROUPS_API) ? response.data.data : response.data;
            return res.status(response.http_status).send(data);
        }).catch (err => {
            let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
            return res.status(response.http_status).send(response.data);
        })
    }

    GroupsService.getGroupById(req.params.id, rq).then(group => {
        let response = ResponseService.generateSuccessResponse(group, req.metadata);
        let data = (req.baseUrl == LEGACY_GROUPS_API) ? response.data.data : response.data;
        return res.status(response.http_status).send(data);
    }).catch(err => {
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    })
});

GroupsRouter.post('/', [RequestService.authorizeRequest(AppConstants.AccessLevel.ADMIN), groupPhotoUpload], (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;

    let photo = (req.files && req.files.photo) ? req.files.photo[0] : null;
    let title = {
        en: req.body.title_en,
        ru: req.body.title_ru,
        am: req.body.title_am
    }
    GroupsService.createGroup(title, req.body.icon_name, photo, req.body.is_primary, rq).then((group) => {
        let response = ResponseService.generateSuccessResponse(group, req.metadata);
        let data = (req.baseUrl == LEGACY_GROUPS_API) ? response.data.data : response.data;
        return res.status(response.http_status).send(data);
    }).catch((err) => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

GroupsRouter.put('/:id', [RequestService.authorizeRequest(AppConstants.AccessLevel.ADMIN), groupPhotoUpload], (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;

    GroupsService.updateGroupById(req.params.id, {
        title: {
            en: req.body.title_en,
            ru: req.body.title_ru,
            am: req.body.title_am
        },
        icon_name: req.body.icon_name,
        photo: (req.files && req.files.photo) ? req.files.photo[0] : null,
        is_primary: req.body.is_primary,
        requester: rq.requester,
        metadata: rq.metadata
    }).then((group) => {
        let response = ResponseService.generateSuccessResponse(group, req.metadata);
        let data = (req.baseUrl == LEGACY_GROUPS_API) ? response.data.data : response.data;
        return res.status(response.http_status).send(data);
    }).catch((err) => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

GroupsRouter.delete('/:id', RequestService.authorizeRequest(AppConstants.AccessLevel.ADMIN), (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;

    GroupsService.removeGroupById(req.params.id, rq).then(resp => {
        let response = ResponseService.generateSuccessResponse(resp, req.metadata);
        let data = (req.baseUrl == LEGACY_GROUPS_API) ? response.data.data : response.data;
        return res.status(response.http_status).send(data);
    }).catch(err => {
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

GroupsRouter.get('/:id/clarifiers', RequestService.authorizeRequest(AppConstants.AccessLevel.OPTIONAL), (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;

    GroupsService.getGroupQueryClarifiers(req.params.id, rq).then(clarifiers => {
        let response = ResponseService.generateSuccessResponse(clarifiers, req.metadata);
        let data = (req.baseUrl == LEGACY_GROUPS_API) ? response.data.data : response.data;
        return res.status(response.http_status).send(data);
    }).catch(err => {
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

GroupsRouter.post('/:id/clarifiers', RequestService.authorizeRequest(AppConstants.AccessLevel.ADMIN), (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;

    GroupsService.addGroupQueryClarifier(req.params.id, req.body.cid, rq).then(group => {
        let response = ResponseService.generateSuccessResponse(group, req.metadata);
        let data = (req.baseUrl == LEGACY_GROUPS_API) ? response.data.data : response.data;
        return res.status(response.http_status).send(data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

GroupsRouter.delete('/:id/clarifiers/:cid', RequestService.authorizeRequest(AppConstants.AccessLevel.ADMIN), (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;

    GroupsService.removeGroupQueryClarifier(req.params.id, req.params.cid, rq).then(group => {
        let response = ResponseService.generateSuccessResponse(group, req.metadata);
        let data = (req.baseUrl == LEGACY_GROUPS_API) ? response.data.data : response.data;
        return res.status(response.http_status).send(data);
    }).catch(err => {
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

module.exports = GroupsRouter;
