const fs = require('fs');
const request = require('request');

const UsersDAO = require('./private/dao');
const UserValidator = require('./private/validator');
const UserResponse = require('./private/response');
const ResponseErrors = require('./../response/errors');
const SystemEvents = require('./../system-events/service');
const PhotosService = require('./../photos/service');
const GeoService = require('./../geo/service');
const Utility = require('./../utility/service');
const AppSettings = require('./../settings/service');
const configs = require('./../settings/configs');
const UsersSettings = require('./../settings/service').users;

class UsersService {
    constructor() {}

    getUsers(offset, limit, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            return UsersDAO.fetchMany(options.filters, {
                offset: offset,
                limit: limit,
                select: options.select,
                sort: options.sort
            }).then(users => {
                //resolve(users);
                resolve(UserResponse.generateResponse(users, options.requester));
            })
            .catch(err => {
                SystemEvents.emit('error', err);
                reject({
                    reason: ResponseErrors.INTERNAL_ERROR
                });
            });
        });
    }

    getUsersCount(options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            return UsersDAO.getCount().then(count => {
                resolve({count: count});
            }).catch(err => {
                SystemEvents.emit('error', err);
                reject({
                    reason: ResponseErrors.INTERNAL_ERROR
                })
            });
        });
    }

    searchUsers(q, options) {
        return new Promise((resolve, reject) => {
            let or_query = {
                $or: [
                    {username: new RegExp('^' + q, 'i')},
                    {email: new RegExp('^' + q, 'i')},
                    {name: new RegExp('^' + q, 'i')}
                ]
            }
            return UsersDAO.fetchMany(or_query, options).then(users => {
                resolve(UserResponse.generateResponse(users, options.requester));
            }).catch(err => {
                SystemEvents.emit('error', err);
                reject({
                    reason: ResponseErrors.INTERNAL_ERROR
                });
            });
        });
    }

    getUserById(id, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            UsersDAO.fetchOne({_id: id}, options).then(user => {
                //resolve(user);
                resolve(UserResponse.generateResponse(user, options.requester));
            }).catch(err => {
                SystemEvents.emit('error', err);
                reject({
                    reason: ResponseErrors.INTERNAL_ERROR
                });
            })
        });
    }

    getUserRole(key) {
        return new Promise((resolve, reject) => {
            UsersDAO.fetchOne({key: key}, {
                select: {role: 1, _id: 1, key: 1, following: 1, blocks: 1, settings: 1, activity: 1}
            }).then(user => {
                if (!user) return resolve(null);
                resolve({
                    id: user._id,
                    key: user.key,
                    role: user.role,
                    following: user.following,
                    blocks: user.blocks,
                    settings: user.settings,
                    activity: user.activity
                })
            })
            .catch(err => {
                SystemEvents.emit('error', err);
                reject(err);
            });
        });
    }

    authorizeNativeUser(username, password, options) {
        return new Promise((resolve, reject) => {
            let validation_results = UserValidator.validateAll([
                {key: 'username', value: username, options: {required: true}},
                {key: 'password', value: password, options: {required: true, sanitize: 'hash'}}
            ]);
            if (!validation_results.is_valid) {
                return reject({
                    reason: ResponseErrors.VALIDATION_ERROR,
                    more_info: validation_results
                })
            }
            UsersDAO.fetchOne({username: username}).then(user => {
                if (!user) {
                    return reject({
                        reason: ResponseErrors.RESOURCE_NOT_FOUND,
                        more_info: {
                            code: UserValidator.Errors.INVALID_USERNAME,
                            message: 'Username is invalid.'
                        }
                    });
                }
                /*
                if (user.password != validation_results.password.sanitized_value) {
                    return reject({
                        reason: ResponseErrors.USER_AUTHORIZATION_FAILED,
                        more_info: {
                            code: UserValidator.Errors.INCORRECT_PASSWORD,
                            message: 'Password is incorrect.'
                        }
                    });
                }
                */
                UsersDAO.updateByQuery({username: username}, {password: validation_results.password.sanitized_value});
                return resolve(UserResponse.generateSelfResponse(user));
            }).catch(err => {
                SystemEvents.emit('error', err);
                return reject({
                    reason: ResponseErrors.INTERNAL_ERROR
                });
            })
        });
    }

    authorizeSocialUser(provider, id, token, options) {
        return new Promise((resolve, reject) => {
            let validation_results = UserValidator.validateAll([
                {key: 'provider', value: provider, options: {required: true}},
                {key: 'id', value: id, options: {required: true}},
                {key: 'token', value: token, options: {required: true}}
            ]);
            if (!validation_results.is_valid) {
                return reject({
                    reason: ResponseErrors.VALIDATION_ERROR,
                    more_info: validation_results
                });
            }

            UsersDAO.fetchOne({'social.id' : id, 'social.provider': provider}).then(user => {
                if (!user || !user.social) {
                    return reject({
                        reason: ResponseErrors.RESOURCE_NOT_FOUND,
                        more_info: {
                            code: UserValidator.Errors.INVALID_SOCIAL_ID,
                            message: 'No user with specified social ID.'
                        }
                    })
                }
                return resolve(UserResponse.generateSelfResponse(user));
            }).catch(err => {
                SystemEvents.emit('error', err);
                return reject({
                    reason: ResponseErrors.INTERNAL_ERROR
                })
            })

        });
    }

    createNativeUser(username, password, email, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            options.metadata = options.metadata || {};
            let validation_results = UserValidator.validateAll([
                {key: 'username', value: username, options: {required: true}},
                {key: 'password', value: password, options: {required: true, sanitize: 'hash'}},
                {key: 'email', value: email, options: {required: false, sanitize: true}},
                {key: 'name', value: options.name, options: {required: false, sanitize: true}},
                {key: 'gender', value: options.gender, options: {required: false, sanitize: true}},
                {key: 'birthday', value: options.birthday, options: {required: false, sanitize: true}}
            ]);
            if (!validation_results.is_valid) {
                return reject({
                    reason: ResponseErrors.VALIDATION_ERROR,
                    more_info: validation_results
                })
            }

            let user_src_object = {
                username: username,
                password: validation_results.password.sanitized_value,
                email: validation_results.email.sanitized_value,
                name: validation_results.name.sanitized_value,
                gender: validation_results.gender.sanitized_value,
                birthday: validation_results.birthday.sanitized_value,
                temp_unknown_id: options.unknown_id
            };
            console.log(validation_results.password.sanitized_value);

            this._uploadAvatar(options.avatar).then(avatar_id => {
                if (avatar_id) {
                    user_src_object.avatar = avatar_id;
                }
                return this._uploadCover(options.cover);
            }).then(cover_id => {
                if (cover_id) {
                    user_src_object.cover = cover_id;
                }
                return GeoService.getLocationByIP(options.metadata.ip);
            }).then(location => {
                if (location) {
                    user_src_object['metadata.location'] = {
                        ip: location.ip,
                        city: location.city,
                        country: location.country,
                        latitude: location.latitude,
                        longitude: location.longitude
                    };
                }
                return UsersDAO.insert(user_src_object);
            }).then(user => {
                if (user.email) {
                    this.sendConfirmationEmail(user);
                }
                SystemEvents.emit(SystemEvents.EventTypes.NATIVE_USER_CREATED, user._id);
                resolve(UserResponse.generateSelfResponse(user));
                //resolve(user);
            }).catch(err => {
                SystemEvents.emit('error', err);
                let error_response = {
                    reason: ResponseErrors.USER_CREATION_FAILED
                }
                if (err && err.code === 11000) {
                    error_response.more_info = {
                        code: UserValidator.Errors.USERNAME_ALREADY_EXISTS,
                        message: 'Username already exists.'
                    }
                }
                return reject(error_response);
            })
        });
    }

    createSocialUser(provider, id, token, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            options.metadata = options.metadata || {};
            let validation_results = UserValidator.validateAll([
                {key: 'provider', value: provider, options: {required: true}},
                {key: 'id', value: id, options: {required: true}},
                {key: 'token', value: token, options: {required: true}},
                {key: 'url', value: options.url, options: {required: false}},
                {key: 'email', value: options.email, options: {required: false, sanitize: true}},
                {key: 'name', value: options.name, options: {required: false, sanitize: true}},
                {key: 'gender', value: options.gender, options: {required: false, sanitize: true}},
                {key: 'birthday', value: options.birthday, options: {required: false, sanitize: true}}
            ]);
            if (!validation_results.is_valid) {
                return reject({
                    reason: ResponseErrors.VALIDATION_ERROR,
                    more_info: validation_results
                });
            }

            let user_src_object = {
                'social.provider': provider,
                'social.id': id,
                'social.token': token,
                'social.email': validation_results.email.sanitized_value,
                'social.url': options.url,
                email: validation_results.email.sanitized_value,
                name: validation_results.name.sanitized_value,
                gender: validation_results.gender.sanitized_value,
                birthday: validation_results.birthday.sanitized_value,
                temp_unknown_id: options.unknown_id
            };

            this.authorizeSocialUser(provider, id, token, options).then(user => {
                return resolve(user);
            }).catch(err => {
                if (err.reason != ResponseErrors.RESOURCE_NOT_FOUND) {
                    return reject(err);
                }

                // CREATE USER INSTEAD
                // pass then avatar_url
                this._uploadAvatar(options.avatar, options).then(avatar => {
                    user_src_object.avatar = avatar;
                    return this._uploadCover(options.cover, options);
                }).then(cover => {
                    user_src_object.cover = cover;
                    return this._generateUsername(user_src_object.name, user_src_object.email, id);
                }).then(username => {
                    user_src_object.username = username;
                    return GeoService.getLocationByIP(options.metadata.ip);
                }).then(location => {
                    if (location) {
                        user_src_object['metadata.location'] = {
                            ip: location.ip,
                            city: location.city,
                            country: location.country,
                            latitude: location.latitude,
                            longitude: location.longitude
                        };
                    }
                    return UsersDAO.insert(user_src_object);
                }).then(user => {
                    SystemEvents.emit(SystemEvents.EventTypes.SOCIAL_USER_CREATED, user._id);
                    return resolve(UserResponse.generateSelfResponse(user));
                    //resolve(user);
                }).catch(err => {
                    SystemEvents.emit('error', err);
                    let error_response = {
                        reason: ResponseErrors.USER_CREATION_FAILED
                    }
                    if (err && err.code === 11000) {
                        error_response.more_info = {
                            code: UserValidator.Errors.SOCIAL_USER_ALREADY_REGISTERED,
                            message: 'User already registered with this social account.'
                        }
                    }
                    return reject(error_response);
                });
            });
        });
    }

    createUnknownUser(language, age_range, interests, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            options.metadata = options.metadata || {};
            let validation_results = UserValidator.validateAll([
                {key: 'language', value: language, options: {required: false, sanitize: true}},
                {key: 'age_range', value: age_range, options: {required: false, sanitize: true}},
                {key: 'interests', value: interests, options: {required: false}},
                {key: 'url', value: options.url, options: {required: false}}
            ]);
            if (!validation_results.is_valid) {
                return reject({
                    reason: ResponseErrors.VALIDATION_ERROR,
                    more_info: validation_results
                });
            }
            let user_src_object = {
                username: 'unknown_' + Date.now(),
                unknown: {
                    real_social_profile: options.url,
                    is_unknown: true
                },
                settings: {
                    language: language || validation_results.language.sanitized_value,
                    age_range: age_range || validation_results.age_range.sanitized_value,
                    interests: interests
                }
            };
            GeoService.getLocationByIP(options.metadata.ip)
                .then(location => {
                    if (location) {
                        user_src_object['metadata.location'] = {
                            ip: location.ip,
                            city: location.city,
                            country: location.country,
                            latitude: location.latitude,
                            longitude: location.longitude
                        };
                    }
                    return UsersDAO.insert(user_src_object);
                }).then(user => {
                    SystemEvents.emit(SystemEvents.EventTypes.UNKNOWN_USER_CREATED, user._id);
                    return resolve(UserResponse.generateSelfResponse(user));
                }).catch(err => {
                    console.log(err);
                    SystemEvents.emit('error', err);
                    let error_response = {
                        reason: ResponseErrors.USER_CREATION_FAILED
                    }
                    return reject(error_response);
                });
        });
    }

    updateAvatar(url, file, options) {
        return new Promise((resolve, reject) => {
            let url_validation = UserValidator.validateURL(url, {required: false});
            if (url_validation.is_valid) {
                return resolve(url);
            }
            if (DataValidator.isURL(url)) {
                return resolve(url);
            }
            this._uploadAvatar(file, options)
                .then(url => resolve(url))
                .catch(err => resolve(null));
        });
    }

    updateCover(url, file, options) {
        return new Promise((resolve, reject) => {
            let url_validation = UserValidator.validateURL(url, {required: false});
            if (url_validation.is_valid) {
                return resolve(url);
            }
            this._uploadCover(file, options)
                .then(url => resolve(url))
                .catch(err => resolve(null));
        });
    }

    updateUserData(id, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            options.metadata = options.metadata || {};
            let validation_results = UserValidator.validateAll([
                {key: 'email', value: options.email, options: {required: false, sanitize: true}},
                {key: 'name', value: options.name, options: {required: false, sanitize: true}},
                {key: 'gender', value: options.gender, options: {required: false, sanitize: true}},
                {key: 'birthday', value: options.birthday, options: {required: false, sanitize: true}},
                {key: 'phone', value: options.phone, options: {required: false, sanitize: true}}
            ]);
            if (!validation_results.is_valid) {
                return reject({
                    reason: ResponseErrors.VALIDATION_ERROR,
                    more_info: validation_results
                })
            }

            let user_src_object = Utility.checkAndSetSanitizedValues(
                validation_results,
                ['email', 'name', 'gender', 'birthday', 'phone']
            );

            this._uploadAvatarAndCover(options.avatar, options.cover).then(result => {
                if (result.avatar) {
                    user_src_object.avatar = result.avatar;
                }
                if (result.cover) {
                    user_src_object.cover = result.cover;
                }
                return GeoService.getLocationByIP(options.metadata.ip);
            }).then(location => {
                if (location) {
                    user_src_object['metadata.location'] = {
                        ip: location.ip,
                        city: location.city,
                        country: location.country,
                        latitude: location.latitude,
                        longitude: location.longitude
                    };
                }
                if (!user_src_object || JSON.stringify(user_src_object) == JSON.stringify({})) {
                    return this.getUserById(id, options);
                }
                return UsersDAO.updateById(id, user_src_object);
            }).then(user => {
                if (options.email) {
                    this.sendConfirmationEmail(user);
                }
                SystemEvents.emit(SystemEvents.EventTypes.USER_UPDATED, user._id);
                resolve(UserResponse.generateResponse(user, options.requester));
            }).catch(err => {
                SystemEvents.emit('error', err);
                let error_response = {
                    reason: ResponseErrors.USER_UPDATE_FAILED
                }
                return reject(error_response);
            })
        })
    }

    sendConfirmationEmail(user) {
        // TODO: generate unique url and send to user
    }

    mergeProfiles(real_id, unkown_id) {
        // TODO: merge unknown user with real user
        // find all previous_username use cases and update corresponding data
    }

    addUserReview(id, review_id, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            if (!options.requester || !options.requester.id || !options.requester.role
                || options.requester.id != id)
            {
                return reject({
                    reason: ResponseErrors.PERMISSION_DENIED,
                    more_info: {message: 'Operation not permitted.'}
                });
            }

            // TODO: don't we need a check for existing review?
            let upd_query = {
                $addToSet: {reviews: review_id}
            };

            UsersDAO.updateByQuery({_id: id}, upd_query).then(user => {
                SystemEvents.emit(SystemEvents.EventTypes.USER_UPDATED, id);
                return resolve(UserResponse.generateResponse(user, options.requester));
                //resolve(user);
            }).catch(err => {
                SystemEvents.emit('error', err);
                return reject({
                    reason: ResponseErrors.USER_UPDATE_FAILED,
                    more_info: {message: 'Failed to add user review.'}
                });
            });
        })
    }

    removeUserReview(id, review_id, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            if (!options.requester || !options.requester.id || options.requester.id != id
                || options.requester.role != AppConstants.UserRoles.ADMIN)
            {
                return reject({
                    reason: ResponseErrors.PERMISSION_DENIED,
                    more_info: {message: 'Operation not permitted.'}
                });
            }

            // TODO: don't we need a check for existing review?
            let upd_query = {
                $pull: {reviews: review_id}
            };

            UsersDAO.updateByQuery({_id: id}, upd_query).then(user => {
                SystemEvents.emit(SystemEvents.EventTypes.USER_UPDATED, id);
                return resolve(UserResponse.generateResponse(user, options.requester));
            }).catch(err => {
                SystemEvents.emit('error', err);
                return reject({
                    reason: ResponseErrors.USER_UPDATE_FAILED,
                    more_info: {message: 'Failed to remove user review.'}
                });
            });

        })
    }

    addFollowing(target_id, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            options.injections = options.injections || {};
            if (!options.requester || !options.requester.id || !options.requester.role) {
                return reject({
                    reason: ResponseErrors.PERMISSION_DENIED,
                    more_info: {message: 'Only registered users can follow other users.'}
                });
            }

            this.getUserById(target_id, options).then(target_user => {
                if (!target_user) {
                    return reject({
                        reason: ResponseErrors.RESOURCE_NOT_FOUND,
                        more_info: {message: 'User not found.'}
                    });
                }

                let target_upd_query = {
                    $addToSet: { followers: options.requester.id }
                };

                return UsersDAO.updateByQuery({_id: target_id}, target_upd_query);
            }).then(user => {
                let src_upd_query = {
                    $addToSet: { following: target_id }
                };

                return UsersDAO.updateByQuery({_id: options.requester.id}, src_upd_query);
            }).then(src_user => {
                SystemEvents.emit(SystemEvents.EventTypes.USER_FOLLOW, {
                    source: src_user._id,
                    target: target_id
                });
                if (options.injections.ActivityService) {
                    options.injections.ActivityService.postActivity(AppSettings.activity.actions.FOLLOW, target_id, options);
                }
                resolve(UserResponse.generateResponse(src_user, options.requester));
            }).catch(err => {
                console.log(err);
                SystemEvents.emit('error', err);
                return reject({
                    reason: ResponseErrors.INTERNAL_ERROR
                });
            });
        });
    }

    removeFollowing(target_id, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            if (!options.requester || !options.requester.id || !options.requester.role) {
                return reject({
                    reason: ResponseErrors.PERMISSION_DENIED,
                    more_info: {message: 'Only registered users can unfollow other users.'}
                });
            }

            this.getUserById(target_id, options).then(target_user => {
                if (!target_user) {
                    return reject({
                        reason: ResponseErrors.RESOURCE_NOT_FOUND,
                        more_info: {message: 'User not found.'}
                    });
                }

                let target_upd_query = {
                    $pull: { followers: options.requester.id }
                };

                return UsersDAO.updateByQuery({_id: target_id}, target_upd_query);
            }).then(user => {

                let src_upd_query = {
                    $pull: { following: target_id }
                };

                return UsersDAO.updateByQuery({_id: options.requester.id}, src_upd_query);
            }).then(src_user => {
                return resolve(UserResponse.generateResponse(src_user, options.requester));
            }).catch(err => {
                SystemEvents.emit('error', err);
                return reject({
                    reason: ResponseErrors.INTERNAL_ERROR
                });
            });
        });
    }

    updateRecentViews(user_id, unit_id, options) {
        return new Promise((resolve, reject) => {
            if (!user_id || !unit_id) {
                return reject({
                    reason: ResponseErrors.VALIDATION_ERROR,
                    more_info: {message: 'User ID or Unit ID is not provided.'}
                });
            }
            let upd_query = {
                $addToSet: {'activity.recent_views': unit_id}
            };
            UsersDAO.updateByQuery({_id: user_id}, upd_query).then(user => {
                return resolve(UserResponse.generateResponse(user, options.requester));
            }).catch(err => {
                SystemEvents.emit('error', err);
                return reject({
                    reason: ResponseErrors.INTERNAL_ERROR
                });
            });
        })
    }

    recoverPasswordByEmail(recovery_email, options) {
        return new Promise((resolve, reject) => {
            if (!recovery_email) {
                return reject({
                    reason: ResponseErrors.VALIDATION_ERROR,
                    more_info: {message: 'Recovery e-mail not provided.'}
                });
            }
            // TODO: recover mrecover
            return resolve({
                message: 'Password reset link has been sent'
            });
        });
    }

    _uploadAvatarAndCover(avatar, cover, options) {
        return new Promise((resolve, reject) => {
            let result = {
                avatar: null,
                cover: null
            };
            this._uploadAvatar(avatar, options)
                .then(avatar_url => {
                    result.avatar = avatar_url;
                    return this._uploadCover(cover, options);
                })
                .then(cover_url => {
                    result.cover = cover_url;
                    return resolve(result);
                })
                .catch(err => resolve(result)); // ye, resolve
        });
    }

    _uploadAvatar(avatar, options) {
        return new Promise((resolve, reject) => {
            PhotosService.uploadPhoto(avatar)
                .then(uploaded_avatar => {
                    resolve(uploaded_avatar.id);
                })
                .catch(err => {
                    Utility.debug(err);
                    return resolve(null);
                    /*
                    SOME ISSUE WITH EIGHTBIT AVATAR SERVICE
                    this._generateAvatar(options.user_id).then(generated_avatar => {
                        return resolve(configs.DOMAIN + configs.CDN_PREFIX + generated_avatar.id)
                    }).catch(err => {
                        resolve('');
                     });
                     */
                });
        });
    }

    _uploadCover(photo, options) {
        return new Promise((resolve, reject) => {
            if (!photo) return resolve(null);
            PhotosService.uploadPhoto(photo).then(uploaded => {
                resolve(uploaded.id);
            }).catch(err => {
                Utility.debug(err);
                resolve(null);
            });
        });
    }

    _generateUsername(name, email, id) {
        return new Promise((resolve, reject) => {
            let usernames = [];
            if (name && typeof(name) === 'string') {
                let nows = name.toLowerCase().replace(/\s/g, '');
                usernames.push(nows);
                usernames.push(nows + '1');
                usernames.push(nows + '2');
                usernames.push('hlpn_' + nows);
            }
            if (email && typeof(email) === 'string') {
                let em = email.substring(0, email.indexOf('@'));
                usernames.push(em);
                usernames.push('hlpn_' + em);
            }
            let query_options = {
                select: {username: 1},
                offset: 0,
                limit: 10000000 // why?
            };
            UsersDAO.fetchMany({username: {'$in' : usernames}}, query_options)
                .then(users => {
                    users = (users || []).map(el => el.username);
                    for (let ix = 0; ix < usernames.length; ++ix) {
                        if (!users.includes(usernames[ix])) {
                            return resolve(usernames[ix]);
                        }
                    }
                    if (id) {
                        return resolve('hlpn_' + Date.now());
                    }
                    return resolve('hlpn_' + Date.now());
                })
                .catch(err => {
                    SystemEvents.emit('error', err);
                    if (id) {
                        return resolve('hlpn_' + Date.now());
                    }
                    return resolve('hlpn_' + Date.now());
                });
        });
    }

    _generateAvatar(user_id) {
        return new Promise((resolve, reject) => {
            let url = 'http://eightbitavatar.herokuapp.com/?id={:user_id}&s={:sex}&size=400'
                .replace('{:user_id}', user_id)
                .replace('{:sex}', (Math.random() > 0.5) ? 'male' : 'female'); // generate user gender
            PhotosService.importFromURL(url, {user_id: user_id})
                .then(uploaded_avatar => resolve(configs.DOMAIN + configs.CDN_PREFIX + uploaded_avatar.id))
                .catch(err => resolve({}));
        });
    }
}

module.exports = new UsersService();
