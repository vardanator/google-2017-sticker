
const Utility = require('./../utility/service');
const PhotosService = require('./../photos/service');
const ResponseErrors = require('./../response/errors');
const AppConstants = require('./../settings/constants');
const SystemEvents = require('./../system-events/service');
const CategoriesService = require('./../categories/service');
const TagsService = require('./../tags/service');
const ProductsService = require('./../products/service');
const ReviewsService = require('./../reviews/service');
const AppSettings = require('./../settings/service');

const UnitsDAO = require('./private/dao');
const UnitsValidator = require('./private/validator');
const UnitsResponse = require('./private/response');

class UnitsService {
    constructor() {}

    createUnit(data, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            if (!options.requester || options.requester.role != AppConstants.UserRoles.ADMIN) {
                return reject({
                    reason: ResponseErrors.PERMISSION_DENIED,
                    more_info: { message: 'Only admin user is permitted to complete the action.' }
                });
            }

            let validation_params = Utility.constructValidationParams(data, AppConstants.units.required_field_names);
            let units_validation = UnitsValidator.validateAll(validation_params);
            if (!units_validation.is_valid) {
                return reject({
                    reason: ResponseErrors.VALIDATION_ERROR,
                    more_info: units_validation
                });
            }

            // Validate coordinates :unamused:
            let coord_validation = UnitsValidator.validateAll([
                {key: 'address_lon', value: data.address_lon, options: {required: false, sanitize: true}},
                {key: 'address_lat', value: data.address_lat, options: {required: false, sanitize: true}}
            ]);
            if (!coord_validation.is_valid) {
                return reject({
                    reason: ResponseErrors.VALIDATION_ERROR,
                    more_info: coord_validation
                });
            }

            let src_unit_object = Utility.checkAndSetSanitizedValues(
                units_validation, AppConstants.units.field_keys_mapping
            );
            let lon = coord_validation.address_lon.sanitized_value;
            let lat = coord_validation.address_lat.sanitized_value;
            if (lat && lon) {
                src_unit_object['address.location.type'] = 'Point';
                src_unit_object['address.location.coordinates'] = [lon, lat];
            }

            src_unit_object.tags = data.tags;
            src_unit_object.keywords = data.keywords;

            // Some logic checks
            if (src_unit_object.is_branch && !src_unit_object.parent_id) {
                return reject({
                    reason: ResponseErrors.VALIDATION_ERROR,
                    more_info: {message: 'Please provide the parent unit ID for the branch.'}
                });
            }

            let categories_req_options = options;
            categories_req_options.filters = {
                _id: {$in: (data.categories || []).filter(c => c)}
            };

            CategoriesService.getCategories(categories_req_options).then(categories => {
                if (!categories || !categories.length) {
                    return reject({
                        reason: ResponseErrors.RESOURCE_NOT_FOUND,
                        more_info: {message: 'Categories not found'}
                    });
                }
                src_unit_object.categories = categories.map(c => c.id);
                src_unit_object.contact_phones = data.contact_phones;
                src_unit_object.user = options.requester.id;

                if (data.main_photo_id) {
                    src_unit_object.photo = data.main_photo_id;
                }
                if (data.other_photo_ids) {
                    let other_photo_ids = (data.other_photo_ids || '').split(',').filter(s => s);
                    src_unit_object.photos = other_photo_ids;
                }

                return this._uploadUnitSinglePhoto(data.photo);
            }).then(photo_id => {
                if (photo_id) {
                    src_unit_object.photo = photo_id;
                }
                return this._uploadUnitSinglePhoto(data.cover);
            }).then(cover_id => {
                if (cover_id) {
                    src_unit_object.cover = cover_id;
                }

                return this._getOrCreateUnitTags(src_unit_object.tags, options);
            }).then(tags => {
                src_unit_object.tags = (tags || []).map(t => t.id);

                return this._getOrCreateUnitKeywords(src_unit_object.keywords, options);
            }).then(keywords => {
                src_unit_object.keywords = (keywords || []).map(k => k.id);

                return UnitsDAO.insert(src_unit_object);
            }).then(unit => {
                SystemEvents.emit(SystemEvents.EventTypes.UNIT_CREATED, unit._id);
                if (unit.is_branch) {
                    this.addBranch(unit.parent_id, unit._id, options);
                }

                //return resolve(unit);
                return resolve(UnitsResponse.generateResponse(unit, options.requester));
            }).catch(err => {
                SystemEvents.emit('error', err);
                return reject({
                    reason: ResponseErrors.UNIT_CREATION_FAILED,
                    more_info: {message: 'Failed to create. Contact admin.', code: err && err.code ? err.code : ''}
                });
            });

        });
    }

    updateUnit(id, data, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            if (!options.requester || options.requester.role != AppConstants.UserRoles.ADMIN) {
                return reject({
                    reason: ResponseErrors.PERMISSION_DENIED,
                    more_info: { message: 'Only admin user is permitted to complete the action.' }
                });
            }

            let validation_params = Utility.constructValidationParams(data);
            let units_validation = UnitsValidator.validateAll(validation_params);
            if (!units_validation.is_valid) {
                return reject({
                    reason: ResponseErrors.VALIDATION_ERROR,
                    more_info: units_validation
                });
            }

            // Validate coordinates :unamused:
            let coord_validation = UnitsValidator.validateAll([
                {key: 'address_lon', value: data.address_lon, options: {required: false, sanitize: true}},
                {key: 'address_lat', value: data.address_lat, options: {required: false, sanitize: true}}
            ]);
            if (!coord_validation.is_valid) {
                return reject({
                    reason: ResponseErrors.VALIDATION_ERROR,
                    more_info: coord_validation
                });
            }

            let src_unit_object = Utility.checkAndSetSanitizedValues(
                units_validation, AppConstants.units.field_keys_mapping
            );
            let lon = coord_validation.address_lon.sanitized_value;
            let lat = coord_validation.address_lat.sanitized_value;
            if (lat && lon) {
                src_unit_object['address.location.type'] = 'Point';
                src_unit_object['address.location.coordinates'] = [lon, lat];
            }

            src_unit_object.tags = data.tags;
            src_unit_object.keywords = data.keywords;

            // Some logic checks
            if (src_unit_object.is_branch && !src_unit_object.parent_id) {
                return reject({
                    reason: ResponseErrors.VALIDATION_ERROR,
                    more_info: {message: 'Please provide the parent unit ID for the branch.'}
                });
            }

            let categories_req_options = options;
            categories_req_options.filters = {
                _id: {$in: (data.categories || []).filter(c => c)}
            };
            CategoriesService.getCategories(categories_req_options).then(categories => {
                if (categories && categories.length) {
                    src_unit_object.categories = categories.map(c => c.id);
                }
                if (data.contact_phones && data.contact_phones.length) {
                    // addToSet needed though
                    src_unit_object['contact.phones'] = data.contact_phones;
                }
                src_unit_object['metadata.updated_by'] = data.user;

                if (data.main_photo_id) {
                    src_unit_object.photo = data.main_photo_id;
                }
                if (data.other_photo_ids) {
                    let other_photo_ids = (data.other_photo_ids || '').split(',').filter(s => s);
                    console.log('other_photo_ids == ', other_photo_ids);
                    UnitsDAO.updateByQuery({_id: id}, {$addToSet: {photos: {$each: other_photo_ids}}})
                        .then(data => console.log('silent updated photos')).catch(err => console.log(err));
                }

                return this._uploadUnitSinglePhoto(data.photo);
            }).then(photo_id => {
                if (photo_id) {
                    src_unit_object.photo = photo_id;
                }
                return this._uploadUnitSinglePhoto(data.cover);
            }).then(cover_id => {
                if (cover_id) {
                    src_unit_object.cover = cover_id;
                }

                return this._getOrCreateUnitTags(src_unit_object.tags, options);
            }).then(tags => {
                src_unit_object.tags = (tags || []).map(t => t.id);

                return this._getOrCreateUnitKeywords(src_unit_object.keywords, options);
            }).then(keywords => {
                src_unit_object.keywords = (keywords || []).map(k => k.id);

                return UnitsDAO.updateById(id, src_unit_object);
            }).then(unit => {
                SystemEvents.emit(SystemEvents.EventTypes.UNIT_UPDATED, unit._id);

                if (src_unit_object.is_branch) {
                    this.addBranch(unit.parent_id, unit._id, options);
                }
                else if ('is_branch' in src_unit_object && !src_unit_object.is_branch) {
                    this.removeBranch(unit.parent_id, unit._id, options);
                }

                return resolve(UnitsResponse.generateResponse(unit, options.requester));
            }).catch(err => {
                SystemEvents.emit('error', err);
                return reject({
                    reason: ResponseErrors.UNIT_UPDATE_FAILED,
                    more_info: {message: 'Failed to update. Contact admin.', code: err && err.code ? err.code : ''}
                });
            });
        });
    }

    searchUnits(q, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            options.populate = 'features tags keywords';
            q = UnitsValidator.sanitizeQueryString(q);
            let query = {
                $or: [
                    {'name.en': new RegExp('^' + q, 'i')},
                    {'name.ru': new RegExp('^' + q, 'i')},
                    {'name.am': new RegExp('^' + q, 'i')},
                    {'description.en': new RegExp('^' + q, 'i')},
                    {'description.ru': new RegExp('^' + q, 'i')},
                    {'description.am': new RegExp('^' + q, 'i')},
                    {'address.street.en': new RegExp('^' + q, 'i')},
                    {'address.street.ru': new RegExp('^' + q, 'i')},
                    {'address.street.am': new RegExp('^' + q, 'i')},
                ]
            };
            UnitsDAO.fetchMany(query, options).then(units => {
                resolve(UnitsResponse.generateResponse(units, options.requester));
            }).catch(err => {
                SystemEvents.emit('error', err);
                return reject({
                    reason: ResponseErrors.INTERNAL_ERROR
                });
            });
        });
    }

    getUnits(options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            options.populate = 'features tags keywords';
            UnitsDAO.fetchMany(options.filters, options).then(units => {
                resolve(UnitsResponse.generateResponse(units, options.requester));
            }).catch(err => {
                SystemEvents.emit('error', err);
                return reject({
                    reason: ResponseErrors.INTERNAL_ERROR
                });
            });
        });
    }

    geoSearchUnits(coordinates, options) {
        return new Promise((resolve, reject) => {
            if (!coordinates || !coordinates.length) {
                return reject({
                    reason: ResponseErrors.VALIDATION_ERROR,
                    more_info: {message: 'Coordinates not provided.'}
                });
            }
            UnitsDAO.geoSearch(coordinates, options.max_distance, options).then(units => {
                return resolve(UnitsResponse.generateResponse(units, options.requester));
            }).catch(err => {
                SystemEvents.emit('error', err);
                return reject({
                    reason: ResponseErrors.INTERNAL_ERROR
                });
            });
        });
    }

    getUnitById(id, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            options.populate = 'user parent_id branches categories features tags keywords reviews';
            let final_unit = null;
            UnitsDAO.fetchOne({_id: id}, options).then(unit => {
                if (!unit) {
                    return reject({
                        reason: ResponseErrors.RESOURCE_NOT_FOUND,
                        more_info: {message: 'Unit not found.'}
                    });
                }
                if (unit && options.requester && options.requester.id && options.injections
                        && options.injections.UsersService)
                {
                    options.injections.UsersService.updateRecentViews(options.requester.id, unit._id, options);
                }

                final_unit = unit;
                options.populate = null;
                options.select = '_id';
                return UnitsDAO.fetchMany({'name.en': unit.name.en}, options);
            }).then(branches => {
                branches = (branches || []).map(b => b._id).filter(b => b.toString() != final_unit._id.toString());
                final_unit.branches = branches;

                resolve(UnitsResponse.generateResponse(final_unit, options.requester));
            }).catch(err => {
                SystemEvents.emit('error', err);
                return reject({
                    reason: ResponseErrors.INTERNAL_ERROR
                });
            });
        });
    }

    getUnitsCount(options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            UnitsDAO.getCount().then(count => {
                resolve({count: count});
            }).catch(err => {
                SystemEvents.emit('error', err);
                return reject({
                    reason: ResponseErrors.INTERNAL_ERROR
                });
            });
        });
    }

    removeUnitById(id, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            if (!options.requester || options.requester.role != AppConstants.UserRoles.ADMIN) {
                return reject({
                    reason: ResponseErrors.PERMISSION_DENIED,
                    more_info: { message: 'Only admin user is permitted to complete the action.' }
                });
            }

            UnitsDAO.removeById(id, options).then(resp => {
                resolve(UnitsResponse.generateResponse(resp, options.requester));
            }).catch(err => {
                SystemEvents.emit('error', err);
                return reject({
                    reason: ResponseErrors.INTERNAL_ERROR
                })
            })
        });
    }

    uploadUnitPhotos(id, photos, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            if (!options.requester || options.requester.role != AppConstants.UserRoles.ADMIN) {
                return reject({
                    reason: ResponseErrors.PERMISSION_DENIED,
                    more_info: { message: 'Only admin user is permitted to complete the action.' }
                });
            }

            this._uploadUnitMultiplePhotos(photos).then(photo_ids => {
                if (!photo_ids || !photo_ids.length) {
                    return reject({
                        reason: ResponseErrors.INTERNAL_ERROR,
                        more_info: {message: 'No photos.'}
                    });
                }
                let upd_query = {
                    $addToSet: {
                        photos: {$each: photo_ids}
                    }
                };

                return UnitsDAO.updateByQuery({_id: id}, upd_query);
            }).then(unit => {
                //resolve(unit);
                resolve(UnitsResponse.generateResponse(unit, options.requester));
            }).catch(err => {
                SystemEvents.emit('error', err);
                return reject({
                    reason: ResponseErrors.UNIT_UPDATE_FAILED,
                    more_info: {message: 'Failed to add photo.'}
                });
            });
        });
    }

    removeUnitPhoto(id, photo_id, options) {
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

            UnitsDAO.updateByQuery({_id: id}, upd_query).then(unit => {
                resolve(UnitsResponse.generateResponse(unit, options.requester));
            }).catch(err => {
                SystemEvents.emit('error', err);
                return reject({
                    reason: ResponseErrors.UNIT_UPDATE_FAILED,
                    more_info: {message: 'Failed to remove photo.'}
                });
            });
        });
    }

    getFeatures(id, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            options.populate = 'features';
            options.select = {features: 1};
            UnitsDAO.fetchOne({_id: id}, options).then(unit => {
                if (!unit) {
                    return reject({
                        reason: ResponseErrors.RESOURCE_NOT_FOUND,
                        more_info: {message: 'Unit not found.'}
                    });
                }
                resolve(UnitsResponse.generateResponse(unit, options.requester));
            }).catch(err => {
                SystemEvents.emit('error', err);
                reject({
                    reason: ResponseErrors.INTERNAL_ERROR
                });
            });
        });
    }

    addFeature(id, feature_id, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            if (!options.requester || options.requester.role != AppConstants.UserRoles.ADMIN) {
                return reject({
                    reason: ResponseErrors.PERMISSION_DENIED,
                    more_info: { message: 'Only admin user is permitted to complete the action.' }
                });
            }

            TagsService.getTagById(feature_id, options).then(feature => {
                if (!feature || !feature.is_feature) {
                    return reject({
                        reason: ResponseErrors.RESOURCE_NOT_FOUND,
                        more_info: {message: 'No such feature.'}
                    });
                }

                let upd_query = {
                    $addToSet: {features: feature_id}
                };

                return UnitsDAO.updateByQuery({_id: id}, upd_query);
            }).then(unit => {
                resolve(UnitsResponse.generateResponse(unit, options.requester));
            }).catch(err => {
                SystemEvents.emit('error', err);
                return reject({
                    reason: ResponseErrors.UNIT_UPDATE_FAILED,
                    more_info: {message: 'Failed to add feature.'}
                });
            });
        });
    }

    removeFeature(id, feature_id, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            if (!options.requester || options.requester.role != AppConstants.UserRoles.ADMIN) {
                return reject({
                    reason: ResponseErrors.PERMISSION_DENIED,
                    more_info: { message: 'Only admin user is permitted to complete the action.' }
                });
            }

            TagsService.getTagById(feature_id, options).then(feature => {
                if (!feature || !feature.is_feature) {
                    return reject({
                        reason: ResponseErrors.RESOURCE_NOT_FOUND,
                        more_info: {message: 'No such feature.'}
                    });
                }

                let upd_query = {
                    $pull: {features: feature_id}
                };

                return UnitsDAO.updateByQuery({_id: id}, upd_query);
            }).then(unit => {
                resolve(UnitsResponse.generateResponse(unit, options.requester));
            }).catch(err => {
                SystemEvents.emit('error', err);
                return reject({
                    reason: ResponseErrors.UNIT_UPDATE_FAILED,
                    more_info: {message: 'Failed to remove feature.'}
                });
            });

        });
    }

    getTags(id, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            options.populate = 'tags';
            options.select = {tags: 1};

            UnitsDAO.fetchOne({_id: id}, options).then(unit => {
                resolve(UnitsResponse.generateResponse(unit, options.requester));
            }).catch(err => {
                SystemEvents.emit('error', err);
                return reject({
                    reason: ResponseErrors.INTERNAL_ERROR
                });
            });
        });
    }

    addTags(id, tags, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            if (!options.requester || options.requester.role != AppConstants.UserRoles.ADMIN) {
                return reject({
                    reason: ResponseErrors.PERMISSION_DENIED,
                    more_info: { message: 'Only admin user is permitted to complete the action.' }
                });
            }

            let tag_options = {
                filters: {
                    _id: {$in: tags},
                    is_tag: true
                }
            };
            TagsService.getTags(tag_options, options).then(tags => {
                if (!tags || !tags.length) {
                    return reject({
                        reason: ResponseErrors.RESOURCE_NOT_FOUND,
                        more_info: {message: 'No tags were found.'}
                    });
                }

                let upd_query = {
                    $addToSet: {tags: {$each: tags}}
                };
                return UnitsDAO.updateByQuery({_id: id}, upd_query);
            }).then(unit => {
                resolve(UnitsResponse.generateResponse(unit, options.requester));
            }).catch(err => {
                SystemEvents.emit('error', err);
                return reject({
                    reason: ResponseErrors.UNIT_UPDATE_FAILED,
                    more_info: {message: 'Failed to add tag.'}
                });
            });
        });
    }

    removeTag(id, tag_id, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            if (!options.requester || options.requester.role != AppConstants.UserRoles.ADMIN) {
                return reject({
                    reason: ResponseErrors.PERMISSION_DENIED,
                    more_info: { message: 'Only admin user is permitted to complete the action.' }
                });
            }

            TagsService.getTagById(tag_id, options).then(tag => {
                if (!tag) {
                    return reject({
                        reason: ResponseErrors.RESOURCE_NOT_FOUND,
                        more_info: {message: 'Tag not found.'}
                    });
                }

                let upd_query = {
                    $pull: {tags: tag}
                };
                return UnitsDAO.updateByQuery({_id: id}, upd_query);
            }).then(unit => {
                resolve(UnitsResponse.generateResponse(unit, options.requester));
            }).catch(err => {
                SystemEvents.emit('error', err);
                return reject({
                    reason: ResponseErrors.UNIT_UPDATE_FAILED,
                    more_info: {message: 'Failed to remove tag.'}
                });
            });
        });
    }

    getKeywords(id, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            options.populate = 'keywords';
            options.select = {keywords: 1};

            UnitsDAO.fetchOne({_id: id}, options).then(unit => {
                resolve(UnitsResponse.generateResponse(unit, options.requester));
            }).catch(err => {
                SystemEvents.emit('error', err);
                return reject({
                    reason: ResponseErrors.INTERNAL_ERROR
                });
            });
        });
    }

    addKeywords(id, keywords, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            if (!options.requester || options.requester.role != AppConstants.UserRoles.ADMIN) {
                return reject({
                    reason: ResponseErrors.PERMISSION_DENIED,
                    more_info: { message: 'Only admin user is permitted to complete the action.' }
                });
            }

            let tag_options = {
                filters: {
                    _id: {$in: keywords},
                    is_tag: false,
                    is_feature: false
                }
            };
            TagsService.getTags(tag_options, options).then(keywords => {
                if (!keywords || !keywords.length) {
                    return reject({
                        reason: ResponseErrors.RESOURCE_NOT_FOUND,
                        more_info: {message: 'No keywords were found.'}
                    });
                }

                let upd_query = {
                    $addToSet: {keywords: {$each: keywords}}
                };
                return UnitsDAO.updateByQuery({_id: id}, upd_query);
            }).then(unit => {
                resolve(UnitsResponse.generateResponse(unit, options.requester));
            }).catch(err => {
                SystemEvents.emit('error', err);
                return reject({
                    reason: ResponseErrors.UNIT_UPDATE_FAILED,
                    more_info: {message: 'Failed to add keyword.'}
                });
            });
        });
    }

    removeKeyword(id, k_id, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            if (!options.requester || options.requester.role != AppConstants.UserRoles.ADMIN) {
                return reject({
                    reason: ResponseErrors.PERMISSION_DENIED,
                    more_info: { message: 'Only admin user is permitted to complete the action.' }
                });
            }

            TagsService.getTagById(k_id, options).then(keyword => {
                if (!keyword || keyword.is_tag || keyword.is_feature) {
                    return reject({
                        reason: ResponseErrors.RESOURCE_NOT_FOUND,
                        more_info: {message: 'Keyword not found.'}
                    });
                }

                let upd_query = {
                    $pull: {keywords: keyword}
                };
                return UnitsDAO.updateByQuery({_id: id}, upd_query);
            }).then(unit => {
                resolve(UnitsResponse.generateResponse(unit, options.requester));
            }).catch(err => {
                SystemEvents.emit('error', err);
                return reject({
                    reason: ResponseErrors.UNIT_UPDATE_FAILED,
                    more_info: {message: 'Failed to remove keyword.'}
                });
            });
        });
    }

    getProducts(id, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            options.populate = 'products';
            options.select = { products: 1 };

            UnitsDAO.fetchOne({_id: id}, options).then(unit => {
                resolve(UnitsResponse.generateResponse(unit, options.requester));
            }).catch(err => {
                SystemEvents.emit('error', err);
                return reject({
                    reason: ResponseErrors.INTERNAL_ERROR
                });
            });
        });
    }

    addProduct(id, product_id, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            if (!options.requester || options.requester.role != AppConstants.UserRoles.ADMIN) {
                return reject({
                    reason: ResponseErrors.PERMISSION_DENIED,
                    more_info: { message: 'Only admin user is permitted to complete the action.' }
                });
            }

            ProductsService.getProductById(product_id, options).then(product => {
                if (product) {
                    return reject({
                        reason: ResponseErrors.RESOURCE_NOT_FOUND,
                        more_info: {message: 'No such product.'}
                    });
                }

                let upd_query = {
                    $addToSet: {products: product_id}
                };

                return UnitsDAO.updateByQuery({_id: id}, upd_query);
            }).then(unit => {
                resolve(UnitsResponse.generateResponse(unit, options.requester));
            }).catch(err => {
                SystemEvents.emit('error', err);
                return reject({
                    reason: ResponseErrors.UNIT_UPDATE_FAILED,
                    more_info: {message: 'Failed to add product.'}
                });
            });
        });
    }

    removeProduct(id, product_id, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            if (!options.requester || options.requester.role != AppConstants.UserRoles.ADMIN) {
                return reject({
                    reason: ResponseErrors.PERMISSION_DENIED,
                    more_info: { message: 'Only admin user is permitted to complete the action.' }
                });
            }

            ProductsService.getProductById(product_id, options).then(product => {
                if (product) {
                    return reject({
                        reason: ResponseErrors.RESOURCE_NOT_FOUND,
                        more_info: {message: 'No such product.'}
                    });
                }

                let upd_query = {
                    $pull: {products: product_id}
                };

                return UnitsDAO.updateByQuery({_id: id}, upd_query);
            }).then(unit => {
                resolve(UnitsResponse.generateResponse(unit, options.requester));
            }).catch(err => {
                SystemEvents.emit('error', err);
                return reject({
                    reason: ResponseErrors.UNIT_UPDATE_FAILED,
                    more_info: {message: 'Failed to remove product.'}
                });
            });
        });
    }

    addBranch(id, branch_id, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            if (!options.requester || options.requester.role != AppConstants.UserRoles.ADMIN) {
                return reject({
                    reason: ResponseErrors.PERMISSION_DENIED,
                    more_info: { message: 'Only admin user is permitted to complete the action.' }
                });
            }

            this.getUnitById(branch_id, options).then(unit => {
                if (!unit) {
                    return reject({
                        reason: ResponseErrors.RESOURCE_NOT_FOUND,
                        more_info: {message: 'Insertable branch unit not found.'}
                    });
                }
                let upd_query = {
                    $addToSet: {branches: unit.id}
                };

                return UnitsDAO.updateByQuery({_id: id}, upd_query);
            }).then(unit => {
                SystemEvents.emit(SystemEvents.EventTypes.UNIT_UPDATED, unit._id);
                return resolve(UnitsResponse.generateResponse(unit, options.requester));
            }).catch(err => {
                SystemEvents.emit('error', err);
                return reject({
                    reason: ResponseErrors.UNIT_UPDATE_FAILED,
                    more_info: {message: 'Failed to update the unit.'}
                });
            });
        });
    }

    removeBranch(id, branch_id, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            if (!options.requester || options.requester.role != AppConstants.UserRoles.ADMIN) {
                return reject({
                    reason: ResponseErrors.PERMISSION_DENIED,
                    more_info: { message: 'Only admin user is permitted to complete the action.' }
                });
            }

            this.getUnitById(branch_id, options).then(unit => {
                if (!unit) {
                    return reject({
                        reason: ResponseErrors.RESOURCE_NOT_FOUND,
                        more_info: {message: 'Removable branch unit not found.'}
                    });
                }
                let upd_query = {
                    $pull: {branches: unit.id}
                };

                return UnitsDAO.updateByQuery({_id: id}, upd_query);
            }).then(unit => {
                SystemEvents.emit(SystemEvents.EventTypes.UNIT_UPDATED, unit._id);
                UnitsDAO.updateById({_id: branch_id}, {$set: {parent_id: null}});
                return resolve(UnitsResponse.generateResponse(unit, options.requester));
            }).catch(err => {
                SystemEvents.emit('error', err);
                return reject({
                    reason: ResponseErrors.UNIT_UPDATE_FAILED,
                    more_info: {message: 'Failed to update the unit.'}
                });
            });
        });
    }

    getBranches(id, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            options.populate = 'branches';
            options.select = {branches: 1};

            UnitsDAO.fetchOne({_id: id}, options).then(unit => {
                resolve(UnitsResponse.generateResponse(unit.branches, options.requester));
            }).catch(err => {
                SystemEvents.emit('error', err);
                return reject({
                    reason: ResponseErrors.INTERNAL_ERROR
                });
            });
        });
    }

    getUserPhotos(id, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            options.select = {user_photos: 1};

            UnitsDAO.fetchOne({_id: id}, options).then(unit => {
                resolve(unit.user_photos);
            }).catch(err => {
                SystemEvents.emit('error', err);
                return reject({
                    reason: ResponseErrors.INTERNAL_ERROR
                });
            });
        });
    }

    addUserPhoto(id, photo, options) {
        return new Promise((resolve, reject) => {
            options = options || {};

            if (!photo) {
                return reject({
                    reason: ResponseErrors.VALIDATION_ERROR,
                    more_info: {message: 'No photo provided.'}
                });
            }

            this._uploadUnitSinglePhoto(photo).then(uploaded_id => {
                if (!uploaded_id) {
                    return reject({
                        reason: ResponseErrors.UNIT_UPDATE_FAILED,
                        more_info: {message: 'Failed to upload photo.'}
                    });
                }

                let upd_query = {
                    $addToSet: {user_photos: uploaded_id}
                };
                return UnitsDAO.updateByQuery({_id: id}, upd_query);
            }).then(unit => {
                resolve(UnitsResponse.generateResponse(unit, options.requester));
            }).catch(err => {
                SystemEvents.emit('error', err);
                return reject({
                    reason: ResponseErrors.UNIT_UPDATE_FAILED,
                    more_info: {message: 'Failed to upload user photo.'}
                });
            });
        });
    }

    removeUserPhoto(id, photo_id, options) {
        return new Promise((resolve, reject) => {
            options = options || {};

            let upd_query = {
                $pull: {user_photos: photo_id}
            };

            UnitsDAO.updateByQuery({_id: id}, upd_query).then(unit => {
                SystemEvents.emit(SystemEvents.EventTypes.PHOTO_REMOVED, photo_id);
                return resolve(UnitsResponse.generateResponse(unit, options.requester));
            }).catch(err => {
                SystemEvents.emit('error', err);
                return reject({
                    reason: ResponseErrors.INTERNAL_ERROR,
                    more_info: {message: 'Failed to remove photo.'}
                });
            });
        });
    }

    getReviews(id, options) {
        return new Promise((resolve, reject) => {
            options = options || {};

            UnitsDAO.fetchOne({_id: id}, options).then(unit => {
                if (!unit) {
                    return reject({
                        reason: ResponseErrors.RESOURCE_NOT_FOUND,
                        more_info: {message: 'Unit not found.'}
                    });
                }

                options.filters = {
                    _id: {$in: unit.reviews || []}
                };

                return ReviewsService.getReviews(options);
            }).then(reviews => {
                return resolve(reviews);
            }).catch(err => {
                SystemEvents.emit('error', err);
                return reject({
                    reason: INTERNAL_ERROR
                });
            });
        });
    }

    addReview(id, data, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            if (!options.requester || !options.requester.id || !options.requester.role) {
                return reject({
                    reason: ResponseErrors.PERMISSION_DENIED,
                    more_info: { message: 'Only registered users allowed to submit a review.' }
                });
            }

            options.unit = id;
            ReviewsService.createReview(data.rating, data.text, options).then(review => {
                if (!review || !review.id) {
                    return reject({
                        reason: ResponseErrors.REVIEW_CREATION_FAILED,
                        more_info: {message: 'Failed to submit review.'}
                    });
                }

                let upd_query = {
                    $addToSet: {
                        reviews: review.id
                    }
                };
                if (review.rating > 0) {
                    upd_query['$inc'] = {
                        'stats.review_rating': review.rating,
                        'stats.reviews_count': 1
                    }
                }

                if (options.injections && options.injections.ActivityService) {
                    options.injections.ActivityService.postActivity(
                        AppSettings.activity.actions.REVIEW,
                        review.id,
                        options
                    ).then(activity => { console.log('successfully posted activity'); })
                    .catch(err => { console.log('error while posting activity ', err); })
                }

                return UnitsDAO.updateByQuery({_id: id}, upd_query);
            }).then(unit => {
                SystemEvents.emit(SystemEvents.EventTypes.UNIT_UPDATED);
                //return resolve(UnitsResponse.generateResponse(unit, options.requester));
                resolve(unit);
            }).catch(err => {
                SystemEvents.emit('error', err);
                return reject({
                    reason: ResponseErrors.UNIT_UPDATE_FAILED,
                    more_info: {message: 'Failed to add review.'}
                });
            });
        });
    }

    removeReview(id, review_id, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            if (!options.requester || !options.requester.id || !options.requester.role) {
                return reject({
                    reason: ResponseErrors.PERMISSION_DENIED,
                    more_info: { message: 'Only registered users allowed to submit a review.' }
                });
            }

            ReviewsService.removeReview(review_id, options).then(review => {
                let upd_query = {
                    $pull: {reviews: review_id}
                };
                return UnitsDAO.updateByQuery({_id: id}, upd_query);
            }).then(unit => {
                SystemEvents.emit(SystemEvents.EventTypes.UNIT_UPDATED, unit._id);
                return resolve(UnitsResponse.generateResponse(unit, options.requester));
            }).catch(err => {
                SystemEvents.emit('error', err);
                return reject({
                    reason: ResponseErrors.UNIT_UPDATE_FAILED
                });
            });
        });
    }

    getStats(id, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            if (!options.requester || !options.requester.id || options.requester.role != AppConstants.UserRoles.ADMIN) {
                return reject({
                    reason: ResponseErrors.PERMISSION_DENIED,
                    more_info: { message: 'Only registered users allowed to submit a review.' }
                });
            }

            options.select = {
                stats: 1
            };

            UnitsDAO.fetchOne({_id: id}, options).then(unit => {
                resolve(UnitsResponse.generateResponse(unit, options.requester));
            }).catch(err => {
                SystemEvents.emit('error', err);
                return reject({
                    reason: ResponseErrors.INTERNAL_ERROR
                });
            });
        });
    }

    updateStats() {
        // TODO:
    }

    _createUnitTag(tag, options) {
        return new Promise((resolve, reject) => {
            if (!tag) { return resolve(null); }
            options.is_tag = true;
            TagsService.getTagByName(tag, options).then(tag_found => {
                if (tag_found) {
                    return resolve(tag_found);
                }

                let tag_data = {
                    value_en: tag,
                    is_tag: true
                };

                return TagsService.addTag(tag_data, options).then(tag => {
                    resolve(tag);
                }).catch(err => { /*console.log(err);*/ resolve(null); });
            }).catch(err => resolve(null));
        });
    }

    _getOrCreateUnitTags(tags, options) {
        return new Promise((resolve, reject) => {
            let promises = (tags || []).map(t => this._createUnitTag(t, options));
            Promise.all(promises).then(values => {
                resolve(values.filter(v => v != null));
            }).catch(err => resolve([]));
        });
    }

    _createUnitKeyword(keyword, options) {
        return new Promise((resolve, reject) => {
            if (!keyword) { return resolve(null); }
            options.is_keyword = true;
            TagsService.getTagByName(keyword, options).then(keyword_found => {
                if (keyword_found) {
                    return resolve(keyword_found);
                }
                let kw_data = {
                    value_en: keyword,
                    is_keyword: true,
                    is_tag: false
                };
                return TagsService.addTag(kw_data, options).then(kw => {
                    resolve(kw);
                }).catch(err => resolve(null));
            }).catch(err => resolve(null));
        });
    }

    _getOrCreateUnitKeywords(keywords, options) {
        return new Promise((resolve, reject) => {
            let promises = (keywords || []).map(k => this._createUnitKeyword(k, options));
            Promise.all(promises).then(values => {
                resolve(values.filter(v => v != null));
            }).catch(err => resolve([]));
        });
    }

    _uploadUnitSinglePhoto(photo) {
        return new Promise((resolve, reject) => {
            PhotosService.uploadPhoto(photo)
                .then(uploaded => resolve(uploaded.id))
                .catch(err => resolve(null));
        });
    }

    _uploadUnitMultiplePhotos(photos) {
        return new Promise((resolve, reject) => {
            let promises = (photos || []).map(p => this._uploadUnitSinglePhoto(p));
            Promise.all(promises).then(values => {
                resolve(values.filter(v => v != null));
            }).catch(err => resolve([]));
        });
    }
}

module.exports = new UnitsService();
