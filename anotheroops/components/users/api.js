const express = require('express');
const UsersRouter = express.Router();

const multer = require('multer');
//const upload = multer({storage: storage});
const upload = multer();
const autoReap = require('multer-autoreap');

const Utility = require('./../utility/service');
const AppConstants = require('./../settings/constants');
const RequestService = require('./../request/service');
const ResponseService = require('./../response/service');
const ResponseErrors = require('./../response/errors');
const SystemEvents = require('./../system-events/service');

const UsersService = require('./service');

const Injections = {
    ActivityService: require('./../activity/service')
}

const avatarCoverUpload = upload.fields([{
    name: 'avatar',
    maxCount: 1
}, {
    name: 'cover',
    maxCount: 1
}]);

UsersRouter.use((req, res, next) => {
    // logging users specik calls
    next();
});

const LEGACY_API = '/api/users';

UsersRouter.get('/', RequestService.authorizeRequest(AppConstants.AccessLevel.OPTIONAL), (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;
    if (req.query.q) {
        return UsersService.searchUsers(req.query.q, rq).then(users => {
            let response = ResponseService.generateSuccessResponse(users, req.metadata);
            let data = (req.baseUrl == LEGACY_API) ? response.data.data : response.data;
            return res.status(response.http_status).send(data);
        }).catch(err => {
            Utility.debug(err);
            let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
            return res.status(response.http_status).send(response.data);
        });
    }
    UsersService.getUsers(rq.offset, rq.limit, rq).then((users) => {
        let response = ResponseService.generateSuccessResponse(users, req.metadata);
        let data = (req.baseUrl == LEGACY_API) ? response.data.data : response.data;
        return res.status(response.http_status).send(data);
    }).catch((err) => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

UsersRouter.get('/:id', RequestService.authorizeRequest(AppConstants.AccessLevel.OPTIONAL), (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;
    if (req.params.id === 'count') {
        return UsersService.getUsersCount(rq).then(count => {
            let response = ResponseService.generateSuccessResponse(count, req.metadata);
            let data = (req.baseUrl == LEGACY_API) ? response.data.data : response.data;
            return res.status(response.http_status).send(data);
        }).catch(err => {
            Utility.debug(err);
            let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
            return res.status(response.http_status).send(response.data);
        })
    }
    if (req.params.id === 'me') req.params.id = req.user ? req.user.id : null;
    UsersService.getUserById(req.params.id, rq).then(user => {
        let response = ResponseService.generateSuccessResponse(user, req.metadata);
        let data = (req.baseUrl == LEGACY_API) ? response.data.data : response.data;
        return res.status(response.http_status).send(data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

UsersRouter.put('/:id', [RequestService.authorizeRequest(AppConstants.AccessLevel.USER), avatarCoverUpload], (req, res) => {
    if (req.params.id === 'me') req.params.id = req.user ? req.user.id : null;
    if (req.user.id != req.params.id && req.user.role != 'admin') {
        let response = ResponseService.generateErrorResponse(ResponseErrors.PERMISSION_DENIED, {
            message: 'You do not have permission'
        });
        return res.status(response.http_status).send(response.data);
    }
    let rq = req.resolved_query;
    let avatar = (req.files && req.files.avatar) ? req.files.avatar[0] : null;
    let cover = (req.files && req.files.cover) ? req.files.cover[0] : null;
    UsersService.updateUserData(req.params.id, {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        avatar: avatar,
        cover: cover,
        gender: req.body.gender,
        birthday: req.body.birthday,
        requester: req.user,
        metadata: req.metadata
    }).then(user => {
        let response = ResponseService.generateSuccessResponse(user, req.metadata);
        let data = (req.baseUrl == LEGACY_API) ? response.data.data : response.data;
        return res.status(response.http_status).send(data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

UsersRouter.post('/:id/interests', RequestService.authorizeRequest(AppConstants.AccessLevel.USER), (req, res) => {
    UsersService.addInterests((req.body.interests || '').split(','), {
        requester: req.user,
        metadata: req.metadata
    }).then(user => {
        let response = ResponseService.generateSuccessResponse(user, req.metadata);
        let data = (req.baseUrl == LEGACY_API) ? response.data.data : response.data;
        return res.status(response.http_status).send(data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

UsersRouter.delete('/:id/interests/:name', RequestService.authorizeRequest(AppConstants.AccessLevel.USER), (req, res) => {
    UsersService.removeInterests((req.body.interests || '').split(','), {
        requester: req.user,
        metadata: req.metadata
    }).then(user => {
        let response = ResponseService.generateSuccessResponse(user, req.metadata);
        let data = (req.baseUrl == LEGACY_API) ? response.data.data : response.data;
        return res.status(response.http_status).send(data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

UsersRouter.post('/:id/settings', RequestService.authorizeRequest(AppConstants.AccessLevel.USER), (req, res) => {
    let push_settings = {
        events: req.body.push_events,
        business_activity: req.body.push_business_activity,
        following_activity: req.body.push_following_activity
    };
    let email_settings = {
        events: req.body.email_events,
        business_activity: req.body.email_business_activity,
        following_activity: req.body.email_following_activity,
        helpin_announcements: req.body.email_helpin_announcements
    };
    UsersService.updateSettings(req.body.language, req.body.currency,
        push_settings, email_settings, {
            requester: req.user,
            metadata: req.metadata
    }).then(user => {
        let response = ResponseService.generateSuccessResponse(user, req.metadata);
        let data = (req.baseUrl == LEGACY_API) ? response.data.data : response.data;
        return res.status(response.http_status).send(data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

UsersRouter.post('/natives/authorize', (req, res) => {
    UsersService.authorizeNativeUser(req.body.username, req.body.password)
        .then(user => {
            let response = ResponseService.generateSuccessResponse(user, req.metadata);
            let data = (req.baseUrl == LEGACY_API) ? response.data.data : response.data;
            return res.status(response.http_status).send(data);
        })
        .catch(err => {
            Utility.debug(err);
            let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
            return res.status(response.http_status).send(response.data);
        });
});

UsersRouter.post('/socials/authorize', (req, res) => {
    UsersService.authorizeSocialUser(req.body.provider, req.body.id, req.body.token)
    .then(user => {
        let response = ResponseService.generateSuccessResponse(user, req.metadata);
        let data = (req.baseUrl == LEGACY_API) ? response.data.data : response.data;
        return res.status(response.http_status).send(data);
    })
    .catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

// think about autoReap
UsersRouter.post('/natives', avatarCoverUpload, (req, res) => {
    let avatar = (req.files && req.files.avatar) ? req.files.avatar[0] : null;
    let cover = (req.files && req.files.cover) ? req.files.cover[0] : null;

    UsersService.createNativeUser(req.body.username,
        req.body.password,
        req.body.email, {
            avatar: avatar,
            cover: cover,
            name: req.body.name,
            gender: req.body.gender,
            birthday: req.body.birthday,
            unknown_id: req.body.unknown_id,
            metadata: req.metadata
        }).then((user) => {
            let response = ResponseService.generateSuccessResponse(user, req.metadata);
            let data = (req.baseUrl == LEGACY_API) ? response.data.data : response.data;
            return res.status(response.http_status).send(data);
        }).catch((err) => {
            Utility.debug(err);
            let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
            return res.status(response.http_status).send(response.data);
        });
});

UsersRouter.post('/socials', avatarCoverUpload, (req, res) => {
    let avatar = (req.files && req.files.avatar) ? req.files.avatar[0] : null;
    let cover = (req.files && req.files.cover) ? req.files.cover[0] : null;

    UsersService.createSocialUser(
        req.body.provider,
        req.body.id,
        req.body.token, {
            avatar: avatar,
            cover: cover,
            avatar_url: req.body.avatar_url,
            cover_url: req.body.cover_url,
            url: req.body.url,
            name: req.body.name,
            gender: req.body.gender,
            email: req.body.email,
            birthday: req.body.birthday,
            unknown_id: req.body.unknown_id,
            metadata: req.metadata
        }
    ).then(user => {
        let response = ResponseService.generateSuccessResponse(user, req.metadata);
        let data = (req.baseUrl == LEGACY_API) ? response.data.data : response.data;
        return res.status(response.http_status).send(data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    })
});

UsersRouter.post('/unknowns', (req, res) => {
    let interests = (req.body.interests || '').split(',');
    interests = interests.map(i => {
        if (i == 'drinks') return 'bars_pubs';
        return i;
    });
    UsersService.createUnknownUser(
        req.body.language,
        req.body.age_range,
        interests, {
            url: req.body.url,
            gender: req.body.gender
        }).then(user => {
            let response = ResponseService.generateSuccessResponse(user, req.metadata);
            let data = (req.baseUrl == LEGACY_API) ? response.data.data : response.data;
            return res.status(response.http_status).send(data);
        }).catch(err => {
            Utility.debug(err);
            let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
            return res.status(response.http_status).send(response.data);
        });
});

UsersRouter.delete('/:id', RequestService.authorizeRequest(AppConstants.AccessLevel.ADMIN), (req, res) => {
    UsersService.removeUser(req.pararms.id, {
        requester: req.user,
        metadata: req.metadata
    }).then(user => {
        let response = ResponseService.generateSuccessResponse(user, req.metadata);
        let data = (req.baseUrl == LEGACY_API) ? response.data.data : response.data;
        return res.status(response.http_status).send(data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

UsersRouter.put('/:id/merge', RequestService.authorizeRequest(AppConstants.AccessLevel.ADMIN), (req, res) => {
    UsersService.mergeProfiles(req.params.id, req.body.merge_id, {
        requester: req.user,
        metadata: req.metadata
    }).then(user => {
        let response = ResponseService.generateSuccessResponse(user, req.metadata);
        let data = (req.baseUrl == LEGACY_API) ? response.data.data : response.data;
        return res.status(response.http_status).send(data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

UsersRouter.post('/:id/following', RequestService.authorizeRequest(AppConstants.AccessLevel.USER), (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;
    rq.injections = Injections;

    UsersService.addFollowing(req.params.id, rq).then(user => {
        let response = ResponseService.generateSuccessResponse(user, rq.metadata);
        return res.status(response.http_status).send(response.data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

UsersRouter.delete('/:id/following', RequestService.authorizeRequest(AppConstants.AccessLevel.USER), (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;

    UsersService.removeFollowing(req.params.id, rq).then(resp => {
        let response = ResponseService.generateSuccessResponse(resp, rq.metadata);
        return res.status(response.http_status).send(response.data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

UsersRouter.post('/accounts/recover', RequestService.authorizeRequest(AppConstants.AccessLevel.OPTIONAL), (req, res) => {
    let rq = req.resolved_query;
    rq.metadata = req.metadata;
    rq.requester = req.user;

    UsersService.recoverPasswordByEmail(req.body.recovery_email, rq).then(resp => {
        let response = ResponseService.generateSuccessResponse(resp, rq.metadata);
        return res.status(response.http_status).send(response.data);
    }).catch(err => {
        Utility.debug(err);
        let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
        return res.status(response.http_status).send(response.data);
    });
});

module.exports = UsersRouter;
