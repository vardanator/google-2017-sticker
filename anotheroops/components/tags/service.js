
const Utility = require('./../utility/service');
const ResponseErrors = require('./../response/errors');
const AppConstants = require('./../settings/constants');
const SystemEvents = require('./../system-events/service');

const TagsDAO = require('./private/dao');
const TagsValidator = require('./private/validator');
const TagsResponse = require('./private/response');

class TagsService {

    addTag(data, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            if (!options.requester || options.requester.role != AppConstants.UserRoles.ADMIN) {
                return reject({
                    reason: ResponseErrors.PERMISSION_DENIED,
                    more_info: { message: 'Only admin user is permitted to complete the action.' }
                });
            }

            let validation_params = Utility.constructValidationParams(data, AppConstants.tags.required_field_names);
            let tags_validation = TagsValidator.validateAll(validation_params);
            if (!tags_validation.is_valid) {
                return reject({
                    reason: ResponseErrors.VALIDATION_ERROR,
                    more_info: tags_validation
                });
            }

            let src_tags_object = Utility.checkAndSetSanitizedValues(
                tags_validation, AppConstants.tags.field_keys_mapping
            );

            TagsDAO.insert(src_tags_object).then(tag => {
                resolve(TagsResponse.generateResponse(tag, options.requester));
                //resolve(tag);
            }).catch(err => {
                SystemEvents.emit('error', err);
                return reject({
                    reason: ResponseErrors.TAG_CREATION_FAILED,
                    more_info: {message: err.code === 11000 ? 'Tag already exists' : ''}
                });
            });
        });
    }

    updateTag(id, data, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            if (!options.requester || options.requester.role != AppConstants.UserRoles.ADMIN) {
                return reject({
                    reason: ResponseErrors.PERMISSION_DENIED,
                    more_info: { message: 'Only admin user is permitted to complete the action.' }
                });
            }

            let validation_params = Utility.constructValidationParams(data);
            let tags_validation = TagsValidator.validateAll(validation_params);
            if (!tags_validation.is_valid) {
                return reject({
                    reason: ResponseErrors.VALIDATION_ERROR,
                    more_info: tags_validation
                });
            }

            let src_tags_object = Utility.checkAndSetSanitizedValues(
                tags_validation, AppConstants.tags.field_keys_mapping
            );
            if ('is_tag' in src_tags_object && src_tags_object.is_tag) {
                src_tags_object.is_feature = false;
                src_tags_object.is_keyword = false;
            }
            if ('is_keyword' in src_tags_object && src_tags_object.is_keyword) {
                src_tags_object.is_tag = false;
                src_tags_object.is_feature = false;
            }
            if ('is_feature' in src_tags_object && src_tags_object.is_feature) {
                src_tags_object.is_tag = false;
                src_tags_object.is_keyword = false;
            }

            TagsDAO.updateById(id, src_tags_object).then(tag => {
                resolve(TagsResponse.generateResponse(tag, options.requester));
            }).catch(err => {
                SystemEvents.emit('error', err);
                return reject({
                    reason: ResponseErrors.TAG_UPDATE_FAILED
                });
            });
        });
    }

    getTagById(id, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            TagsDAO.fetchOne({_id: id}, options).then(tag => {
                let resp = TagsResponse.generateResponse(tag, options.requester);
                if (Array.isArray(resp) && !resp.length) return resolve(null);
                resolve(resp);
            }).catch(err => {
                SystemEvents.emit('error', err);
                reject({
                    reason: ResponseErrors.INTERNAL_ERROR
                });
            });
        });
    }

    getTagsCount(options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            TagsDAO.getCount().then(count => {
                resolve({count: count});
            }).catch(err => {
                SystemEvents.emit('error', err);
                reject({
                    reason: ResponseErrors.INTERNAL_ERROR
                });
            });
        });
    }

    removeTag(id, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            TagsDAO.removeById(id, options).then(resp => {
                resolve(TagsResponse.generateResponse(resp, options.requester));
            }).catch(err => {
                SystemEvents.emit('error', err);
                reject({
                    reason: ResponseErrors.INTERNAL_ERROR
                });
            });
        });
    }

    getTagByName(name, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            let query = {};
            let or_query = {
                $or: [
                    {'value.en': name},
                    {'value.ru': name},
                    {'value.am': name}
                ]
            };
            if ('is_keyword' in options && options.is_keyword) {
                query['$and'] = [
                    or_query,
                    {is_keyword: true}
                ];
            } else
            if ('is_tag' in options && options.is_tag) {
                query['$and'] = [
                    or_query,
                    {is_tag: true}
                ];
            } else {
                query = or_query;
            }

            TagsDAO.fetchOne(query, options).then(tag => {
                resolve(TagsResponse.generateResponse(tag, options.requester));
                //resolve(tag);
            }).catch(err => {
                SystemEvents.emit('error', err);
                reject({
                    reason: INTERNAL_ERROR
                });
            });
        })
    }

    getTags(options) {
        return new Promise((resolve, reject) => {
            options = options || {};

            TagsDAO.fetchMany(options.filters, options).then(tags => {
                return resolve(TagsResponse.generateResponse(tags, options.requester));
            }).catch(err => {
                SystemEvents.emit('error', err);
                reject({
                    reason: ResponseErrors.INTERNAL_ERROR
                });
            });
        });
    }

    searchTags(q, tags_only, features_only, options) {
        return new Promise((resolve, reject) => {
            options = options || {};

            q = TagsValidator.sanitizeQueryString(q);
            tags_only = TagsValidator.sanitizeBoolean(tags_only);
            features_only = TagsValidator.sanitizeBoolean(features_only);
            let query = {
                $or: [
                    {'value.en': new RegExp('^' + q, 'i')},
                    {'value.ru': new RegExp('^' + q, 'i')},
                    {'value.am': new RegExp('^' + q, 'i')}
                ]
            };
            if (tags_only != undefined) {
                query['$or'].push({is_tag: tags_only});
            }
            if (features_only != undefined) {
                query['$or'].push({is_feature: features_only});
            }

            TagsDAO.fetchMany(query, options).then(tags => {
                resolve(TagsResponse.generateResponse(tags, options.requester));
            }).catch(err => {
                SystemEvents.emit('error', err);
                reject({
                    reason: ResponseErrors.INTERNAL_ERROR
                });
            });
        });

    }

}

module.exports = new TagsService();
