
const Utility = require('./../utility/service');
const PhotosService = require('./../photos/service');
const ResponseErrors = require('./../response/errors');
const SystemEvents = require('./../system-events/service');
const ButtonsService = require('./../buttons/service');
const AppConstants = require('./../settings/constants');

const GroupsDAO = require('./private/dao');
const GroupsValidator = require('./private/validator');
const GroupsResponse = require('./private/response');

class GroupsService {

    constructor() {}

    createGroup(title, icon_name, photo, is_primary, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            console.log('OPTIONS === ', options);
            if (!options.requester || options.requester.role != AppConstants.UserRoles.ADMIN) {
                return reject({
                    reason: ResponseErrors.PERMISSION_DENIED,
                    more_info: { message: 'Only admin user is permitted to complete the action.' }
                });
            }
            let group_validation = GroupsValidator.validateAll([
                {key: 'title_en', value: title.en, options: {required: true, sanitize: true}},
                {key: 'title_ru', value: title.ru, options: {required: true, sanitize: true}},
                {key: 'title_am', value: title.am, options: {required: true, sanitize: true}},
                {key: 'icon_name', value: icon_name, options: {required: true}},
                {key: 'is_primary', value: is_primary, options: {required: false, sanitize: true}}
            ]);
            if (!group_validation.is_valid) {
                return reject({
                    reason: ResponseErrors.VALIDATION_ERROR,
                    more_info: group_validation
                })
            }

            let group_src_object = Utility.checkAndSetSanitizedValues(
                group_validation, [
                    {lhs: 'title.en', rhs: 'title_en'}, {lhs: 'title.ru', rhs: 'title_ru'},
                    {lhs: 'title.am', rhs: 'title_am'}, 'icon_name', 'is_primary'
                ]);

            this._uploadGroupPhoto(photo).then(uploaded_id => {
                if (uploaded_id) {
                    group_src_object.photo = uploaded_id;
                }
                return GroupsDAO.insert(group_src_object);
            }).then(group => {
                SystemEvents.emit(SystemEvents.EventTypes.GROUP_CREATED, group._id);
                return resolve(GroupsResponse.generateResponse(group, options.requester));
                //resolve(group);
            }).catch(err => {
                SystemEvents.emit('error', err);
                let error_response = {
                    reason: ResponseErrors.GROUP_CREATION_FAILED
                };
                if (err && err.code === 11000) {
                    error_response.more_info = {
                        code: GroupsValidator.Errors.GROUP_TITLE_EXISTS,
                        message: 'Group with one of (EN|RU|AM) titles already exists.'
                    }
                }
                return reject(error_response);
            });
        });
    }

    updateGroupById(id, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            if (!options.requester || options.requester.role != AppConstants.UserRoles.ADMIN) {
                return reject({
                    reason: ResponseErrors.PERMISSION_DENIED,
                    more_info: { message: 'Only admin user is permitted to complete the action.' }
                });
            }
            let group_validation = GroupsValidator.validateAll([
                {key: 'title_en', value: options.title.en, options: {required: false, sanitize: true}},
                {key: 'title_ru', value: options.title.ru, options: {required: false, sanitize: true}},
                {key: 'title_am', value: options.title.am, options: {required: false, sanitize: true}},
                {key: 'icon_name', value: options.icon_name, options: {required: false}},
                {key: 'is_primary', value: options.is_primary, options: {required: false, sanitize: true}}
            ]);
            if (!group_validation.is_valid) {
                return reject({
                    reason: ResponseErrors.VALIDATION_ERROR,
                    more_info: validation_results
                })
            }

            let group_src_object = Utility.checkAndSetSanitizedValues(
                group_validation, [
                    {lhs: 'title.en', rhs: 'title_en'}, {lhs: 'title.ru', rhs: 'title_ru'},
                    {lhs: 'title.am', rhs: 'title_am'}, 'icon_name', 'is_primary'
                ]);

            this._uploadGroupPhoto(options.photo).then(uploaded_id => {

                if (uploaded_id) {
                    group_src_object.photo = uploaded_id;
                }

                return GroupsDAO.updateById(id, group_src_object);
            }).then(group => {
                SystemEvents.emit(SystemEvents.EventTypes.GROUP_UPDATED, group._id);
                return resolve(GroupsResponse.generateResponse(group, options.requester));
            }).catch(err => {
                SystemEvents.emit('error', err);
                return reject({
                    reason: ResponseErrors.GROUP_UPDATE_FAILED
                });
            })
        });
    }

    searchGroups(q, is_primary, options) {
        return new Promise((resolve, reject) => {
            q = GroupsValidator.sanitizeQueryString(q);
            let gv =  GroupsValidator.validateAll([{key: 'is_primary', value: is_primary, options: {required: false, sanitize: true}}]);
            is_primary = gv.is_primary.sanitized_value;

            let or_query = {};
            if (q) {
                or_query['$or'] = [
                    {'title.en': new RegExp('^' + q, 'i')},
                    {'title.ru': new RegExp('^' + q, 'i')},
                    {'title.am': new RegExp('^' + q, 'i')}
                ];
            }
            if (is_primary != undefined || is_primary != null) {
                if (!or_query['$or']) or_query['$or'] = [];
                or_query['$or'].push({'is_primary': is_primary});
            }

            GroupsDAO.fetchMany(or_query, options).then(groups => {
                resolve(GroupsResponse.generateResponse(groups, options.requester));
            }).catch(err => {
                SystemEvents.emit('error', err);
                return reject({
                    reason: ResponseErrors.INTERNAL_ERROR
                });
            });
        });
    }

    getGroups(options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            GroupsDAO.fetchMany(options.filters, options).then(groups => {
                resolve(GroupsResponse.generateResponse(groups, options.requester));
                //resolve(groups);
            }).catch(err => {
                SystemEvents.emit('error', err);
                return reject({
                    reason: ResponseErrors.INTERNAL_ERROR
                })
            });
        });
    }

    getGroupById(id, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            GroupsDAO.fetchOne({_id: id}, options).then(groups => {
                resolve(GroupsResponse.generateResponse(groups, options.requester));
            }).catch(err => {
                SystemEvents.emit('error', err);
                return reject({
                    reason: ResponseErrors.INTERNAL_ERROR
                });
            });
        });
    }

    getGroupsCount(options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            return GroupsDAO.getCount().then(count => {
                resolve({count: count});
            }).catch(err => {
                SystemEvents.emit('error', err);
                reject({
                    reason: ResponseErrors.INTERNAL_ERROR
                });
            });
        });
    }

    removeGroupById(id, options) {
        // TODO: think if we allow group delete
    }

    getGroupQueryClarifiers(id, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            options.populate = 'query_clarifiers';
            GroupsDAO.fetchOne({_id: id}, options).then(group => {
                if (!group) {
                    return reject({
                        reason: ResponseErrors.RESOURCE_NOT_FOUND,
                        more_info: {message: 'Group not found.'}
                    });
                }
                return resolve(group.query_clarifiers);
            }).catch(err => {
                SystemEvents.emit('error', err);
                return reject({
                    reason: ResponseErrors.INTERNAL_ERROR
                })
            })
        });
    }

    addGroupQueryClarifier(id, button_id, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            if (!options.requester || options.requester.role != AppConstants.UserRoles.ADMIN) {
                return reject({
                    reason: ResponseErrors.PERMISSION_DENIED
                })
            }

            this.getGroupById(id, options).then(group => {
                if (!group) {
                    return reject({
                        reason: ResponseErrors.RESOURCE_NOT_FOUND,
                        more_info: {message: 'Group not found.'}
                    });
                }
                return ButtonsService.getButtonById(button_id, options);
            }).then(button => {
                if (!button) {
                    return reject({
                        reason: ResponseErrors.RESOURCE_NOT_FOUND,
                        more_info: {message: 'Button not found.'}
                    });
                }

                let upd_query = {
                    $addToSet: { query_clarifiers: button_id }
                };
                return GroupsDAO.updateByQuery({_id: id}, upd_query);
            }).then(ok => {
                SystemEvents.emit(SystemEvents.EventTypes.GROUP_UPDATED, id);
                return resolve(GroupsResponse.generateResponse(group, options.requester));
            }).catch(err => {
                SystemEvents.emit('error', err);
                return reject({
                    reason: ResponseErrors.GROUP_UPDATE_FAILED,
                    more_info: {message: 'Failed to update the group.'}
                });
            });
        });
    }

    removeGroupQueryClarifier(id, button_id, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            if (!options.requester || options.requester.role != AppConstants.UserRoles.ADMIN) {
                return reject({
                    reason: ResponseErrors.PERMISSION_DENIED
                });
            }

            this.getGroupById(id, options).then(group => {
                if (!group) {
                    return reject({
                        reason: ResponseErrors.RESOURCE_NOT_FOUND,
                        more_info: {message: 'Group not found.'}
                    });
                }
                return ButtonsService.getButtonById(button_id, options);
            }).then(button => {
                if (!button) {
                    return reject({
                        reason: ResponseErrors.RESOURCE_NOT_FOUND,
                        more_info: {message: 'Button not found.'}
                    });
                }

                let upd_query = {
                    $pull: { query_clarifiers: button_id }
                };
                return GroupsDAO.updateByQuery({_id: id}, upd_query);
            }).then(group => {
                SystemEvents.emit(SystemEvents.EventTypes.GROUP_UPDATED, group._id);
                return resolve(GroupsResponse.generateResponse(group, options.requester));
            }).catch(err => {
                SystemEvents.emit('error', err);
                return reject({
                    reason: ResponseErrors.GROUP_UPDATE_FAILED,
                    more_info: {message: 'Failed to update the group.'}
                });
            });

        });
    }

    // Private functions

    _uploadGroupPhoto(photo) {
        return new Promise((resolve, reject) => {
            PhotosService.uploadPhoto(photo)
                .then(uploaded_photo => {
                    resolve(uploaded_photo.id);
                })
                .catch(err => {
                    SystemEvents.emit('error', err);
                    resolve(null); // silencing errors
                });
        })
    }

}

module.exports = new GroupsService();
