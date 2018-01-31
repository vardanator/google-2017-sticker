
const Utility = require('./../utility/service');
const PhotosService = require('./../photos/service');
const ResponseErrors = require('./../response/errors');
const AppConstants = require('./../settings/constants');
const SystemEvents = require('./../system-events/service');

const ProductsDAO = require('./private/dao');
const ProductsValidator = require('./private/validator');
const ProductsResponse = require('./private/response');

class ProductsService {

    createProduct(data, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            if (!options.requester || options.requester.role != AppConstants.UserRoles.ADMIN) {
                return reject({
                    reason: ResponseErrors.PERMISSION_DENIED,
                    more_info: { message: 'Only admin user is permitted to complete the action.' }
                });
            }

            let validation_params = Utility.constructValidationParams(data, AppConstants.products.required_field_names);
            let product_validation = ProductsValidator.validateAll(validation_params);
            
            if (!product_validation.is_valid) {
                return reject({
                    reason: ResponseErrors.VALIDATION_ERROR,
                    more_info: product_validation
                });
            }

            let src_product_obj = Utility.checkAndSetSanitizedValues(
                product_validation, AppConstants.products.field_keys_mapping
            );

            this._uploadMultiplePhotos(data.photos).then(photo_ids => {
                if (photo_ids && photo_ids.length) {
                    src_product_obj.photos = photo_ids;
                }

                return ProductsDAO.insert(src_product_obj);
            }).then(product => {
                resolve(ProductsResponse.generateResponse(product, options.requester));
            }).catch(err => {
                SystemEvents.emit('error', err);
                return reject({
                    reason: ResponseErrors.PRODUCT_CREATION_FAILED
                });
            });
        });
    }

    updateProduct(id, data, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            if (!options.requester || options.requester.role != AppConstants.UserRoles.ADMIN) {
                return reject({
                    reason: ResponseErrors.PERMISSION_DENIED,
                    more_info: { message: 'Only admin user is permitted to complete the action.' }
                });
            }

            let validation_params = Utility.constructValidationParams(data);
            let product_validation = ProductsValidator.validateAll(validation_params);
            if (!product_validation.is_valid) {
                return reject({
                    reason: ResponseErrors.VALIDATION_ERROR,
                    more_info: product_validation
                });
            }

            let src_product_obj = Utility.checkAndSetSanitizedValues(
                product_validation, AppConstants.products.field_keys_mapping
            );

            ProductsDAO.updateById(id, src_product_obj).then(product => {
                resolve(ProductsResponse.generateResponse(product, options.requester));
            }).catch(err => {
                SystemEvents.emit('error', err);
                return reject({
                    reason: ResponseErrors.PRODUCT_CREATION_FAILED
                });
            });
        });
    }

    getProducts(options) {
        return new Promise((resolve, reject) => {
            options = options || {};

            ProductsDAO.fetchMany(options.filters, options).then(products => {
                resolve(ProductsResponse.generateResponse(products, options.requester));
            }).catch(err => {
                SystemEvents.emit('error', err);
                return reject({
                    reason: ResponseErrors.INTERNAL_ERROR
                });
            });
        });
    }

    getProductById(id, options) {
        return new Promise((resolve, reject) => {
            options = options || {};

            ProductsDAO.fetchOne({_id: id}, options).then(product => {
                resolve(ProductsResponse.generateResponse(product, options.requester));
            }).catch(err => {
                SystemEvents.emit('error', err);
                return reject({
                    reason: ResponseErrors.INTERNAL_ERROR
                });
            });
        });
    }

    getProductsCount(options) {
        return new Promise((resolve, reject) => {
            options = options || {};

            ProductsDAO.getCount(options).then(count => {
                resolve({count: count});
            }).catch(err => {
                reject({
                    reason: ResponseErrors.INTERNAL_ERROR
                });
            });
        });
    }

    removeProductById(id, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            if (!options.requester || options.requester.role != AppConstants.UserRoles.ADMIN) {
                return reject({
                    reason: ResponseErrors.PERMISSION_DENIED,
                    more_info: { message: 'Only admin user is permitted to complete the action.' }
                });
            }

            ProductsDAO.removeById(id, options).then(resp => {
                resolve(ProductsResponse.generateResponse(resp, options.requester));
            }).catch(err => {
                SystemEvents.emit('error', err);
                return reject({
                    reason: ResponseErrors.PRODUCT_UPDATE_FAILED,
                    more_info: {message: 'Failed to remove product.'}
                });
            });
        });
    }

    addProductPhoto(id, photo, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            if (!options.requester || options.requester.role != AppConstants.UserRoles.ADMIN) {
                return reject({
                    reason: ResponseErrors.PERMISSION_DENIED,
                    more_info: { message: 'Only admin user is permitted to complete the action.' }
                });
            }

            this._uploadMultiplePhotos([photo]).then(ids => {
                if (!ids || !ids.length || !ids[0]) {
                    return reject({
                        reason: ResponseErrors.PRODUCT_UPDATE_FAILED,
                        more_info: {message: 'Failed to upload photo.'}
                    });
                }
                let upd_query = {
                    $addToSet: {photos: ids[0]}
                };

                return ProductsDAO.updateByQuery({_id: id}, upd_query);
            }).then(product => {
                SystemEvents.emit(SystemEvents.EventTypes.PRODUCT_UPDATED, id);
                resolve(ProductsResponse.generateResponse(product, options.requester));
            }).catch(err => {
                SystemEvents.emit('error', err);
                reject({
                    reason: ResponseErrors.PRODUCT_UPDATE_FAILED,
                    more_info: {message: 'Failed to upload photo.'}
                });
            });
        });
    }

    removeProductPhoto(id, photo_id, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            if (!options.requester || options.requester.role != AppConstants.UserRoles.ADMIN) {
                return reject({
                    reason: ResponseErrors.PERMISSION_DENIED,
                    more_info: { message: 'Only admin user is permitted to complete the action.' }
                });
            }

            let upd_query = {
                $pull: {photos: photo_id}
            };
            ProductsDAO.updateByQuery({_id: id}, upd_query).then(product => {
                SystemEvents.emit(SystemEvents.EventTypes.PRODUCT_UPDATED, id);
                resolve(ProductsResponse.generateResponse(product, options.requester));
            }).catch(err => {
                SystemEvents.emit('error', err);
                reject({
                    reason: ResponseErrors.PRODUCT_UPDATE_FAILED,
                    more_info: {message: 'Failed to remove photo.'}
                });
            });
        });
    }

    _uploadMultiplePhotos(photos) {
        return new Promise((resolve, reject) => {
            let promises = (photos || []).map(p => this._uploadUnitSinglePhoto(p));
            Promise.all(promises).then(values => {
                resolve(values.filter(v => v != null));
            }).catch(err => resolve([]));
        });
    }


}

module.exports = new ProductsService();
