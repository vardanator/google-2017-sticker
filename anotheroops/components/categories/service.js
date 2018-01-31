
const Utility = require('./../utility/service');
const PhotosService = require('./../photos/service');
const ResponseErrors = require('./../response/errors');
const AppConstants = require('./../settings/constants');
const SystemEvents = require('./../system-events/service');

const CategoriesDAO = require('./private/dao');
const CategoriesValidator = require('./private/validator');
const CategoriesResponse = require('./private/response');

class CategoriesService {

    constructor() {}

    createCategory(data, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            if (!options.requester || options.requester.role != AppConstants.UserRoles.ADMIN) {
                return reject({
                    reason: ResponseErrors.PERMISSION_DENIED,
                    more_info: { message: 'Only admin user is permitted to complete the action.' }
                });
            }

            let validation_params = Utility.constructValidationParams(data,
                AppConstants.categories.required_field_names);
            let categories_validation = CategoriesValidator.validateAll(validation_params);
            if (!categories_validation.is_valid) {
                return reject({
                    reason: ResponseErrors.VALIDATION_ERROR,
                    more_info: categories_validation
                });
            }

            let cat_src_object = Utility.checkAndSetSanitizedValues(
                categories_validation, AppConstants.categories.field_keys_mapping);

            this._uploadCategoryPhoto(data.photo).then(uploaded => {
                if (uploaded) {
                    cat_src_object.photo = uploaded;
                }

                return CategoriesDAO.insert(cat_src_object);
            }).then(category => {
                SystemEvents.emit(SystemEvents.EventTypes.CATEGORY_CREATED, category._id);
                return resolve(CategoriesResponse.generateResponse(category, options.requester));
                //resolve(category);
            }).catch(err => {
                SystemEvents.emit('error', err);
                let error_response = {
                    reason: ResponseErrors.CATEGORY_CREATION_FAILED
                };
                if (err && err.code === 11000) {
                    error_response.more_info = {
                        code: CategoriesValidator.CATEGORY_EXISTS,
                        message: 'Category already exists.'
                    };
                }
                return reject(error_response);
            });
        });
    }

    updateCategoryById(id, data, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            if (!options.requester || options.requester.role != AppConstants.UserRoles.ADMIN) {
                return reject({
                    reason: ResponseErrors.PERMISSION_DENIED,
                    more_info: { message: 'Only admin user is permitted to complete the action.' }
                });
            }

            let validation_params = Utility.constructValidationParams(data);
            let categories_validation = CategoriesValidator.validateAll(validation_params);
            if (!categories_validation.is_valid) {
                return reject({
                    reason: ResponseErrors.VALIDATION_ERROR,
                    more_info: categories_validation
                });
            }

            let cat_src_object = Utility.checkAndSetSanitizedValues(
                categories_validation, AppConstants.categories.field_keys_mapping);

            this._uploadCategoryPhoto(data.photo).then(uploaded => {
                if (uploaded) {
                    cat_src_object.photo = uploaded;
                }

                return CategoriesDAO.updateById(id, cat_src_object);
            }).then(category => {
                SystemEvents.emit(SystemEvents.EventTypes.CATEGORY_UPDATED, category._id);
                return resolve(CategoriesResponse.generateResponse(category, options.requester));
            }).catch(err => {
                SystemEvents.emit('error', err);
                return reject({
                    reason: ResponseErrors.CATEGORY_UPDATE_FAILED
                });
            });
        });
    }

    getCategories(options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            options.limit = 100;
            CategoriesDAO.fetchMany(options.filters, options).then(categories => {
                //resolve(categories);
                resolve(CategoriesResponse.generateResponse(categories, options.requester));
            }).catch(err => {
                SystemEvents.emit('error', err);
                return reject({
                    reason: ResponseErrors.INTERNAL_ERROR
                });
            });
        });
    }

    getCategoryById(id, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            CategoriesDAO.fetchOne({_id: id}, options).then(category => {
                resolve(CategoriesResponse.generateResponse(category, options.requester));
            }).catch(err => {
                SystemEvents.emit('error', err);
                return reject({
                    reason: ResponseErrors.INTERNAL_ERROR
                });
            });
        });
    }

    getCategoriesCount(options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            CategoriesDAO.getCount().then(count => {
                resolve({count: count});
            }).catch(err => {
                SystemEvents.emit('error', err);
                return reject({
                    reason: ResponseErrors.INTERNAL_ERROR
                });
            });
        });
    }

    searchCategories(q, groups, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            let query = {};
            q = CategoriesValidator.sanitizeQueryString(q);
            if (q) {
                query['$or'] = [
                    {'title.en': new RegExp('^' + q, 'i')},
                    {'title.ru': new RegExp('^' + q, 'i')},
                    {'title.am': new RegExp('^' + q, 'i')},
                    {'description.en': new RegExp('^' + q, 'i')},
                    {'description.ru': new RegExp('^' + q, 'i')},
                    {'description.am': new RegExp('^' + q, 'i')},
                ];
            }
            if (groups) {
                if (!query['$or']) query['$or'] = [];
                query['$or'].push({group_id: {$in: groups.split(',')}});
            }

            CategoriesDAO.fetchMany(query, options).then(categories => {
                resolve(CategoriesResponse.generateResponse(categories, options.requester));
            }).catch(err => {
                SystemEvents.emit('error', err);
                return reject({
                    reason: ResponseErrors.INTERNAL_ERROR
                });
            });
        });
    }

    removeCategoryById(id, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            if (!options.requester || options.requester.role != AppConstants.UserRoles.ADMIN) {
                return reject({
                    reason: ResponseErrors.PERMISSION_DENIED,
                    more_info: { message: 'Only admin user is permitted to complete the action.' }
                });
            }

            CategoriesDAO.removeById(id).then(resp => {
                resolve(CategoriesResponse.generateResponse(resp, options.requester));
            }).catch(err => {
                SystemEvents.emit('error', err);
                return reject({
                    reason: ResponseErrors.INTERNAL_ERROR
                })
            })
        })
    }

    _uploadCategoryPhoto(photo) {
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

module.exports = new CategoriesService();
