
const ButtonsDAO = require('./private/dao');
const ButtonsValidator = require('./private/validator');
const ButtonsResponse = require('./private/response');

const Utility = require('./../utility/service');
const ResponseErrors = require('./../response/errors');
const AppConstants = require('./../settings/constants');
const SystemEvents = require('./../system-events/service');

class ButtonsService {

    constructor() {}

    getButtons(component, q, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            let query = {
                $or: []
            };
            if (component) {
                query.component = component;
            }
            if (q) {
                q = ButtonsValidator.validateQueryString(q);
                q['$or'].push({name: new RegExp('^' + q, 'i')});
                q['$or'].push({component: new RegExp('^' + q, 'i')});
                q['$or'].push({'title.en': new RegExp('^' + q, 'i')});
                q['$or'].push({'title.ru': new RegExp('^' + q, 'i')});
                q['$or'].push({'title.am': new RegExp('^' + q, 'i')});
            } else {
                delete query['$or'];
            }
            ButtonsDAO.fetchMany(query, options).then(buttons => {
                resolve(ButtonsResponse.generateResponse(buttons, options.requester));
            }).catch(err => {
                SystemEvents.emit('error', err);
                return reject({
                    reason: ResponseErrors.INTERNAL_ERROR
                });
            });
        });
    }

    getButtonById(id, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            ButtonsDAO.fetchOne({_id: id}, options).then(button => {
                resolve(ButtonsResponse.generateResponse(button, options.requester));
            }).catch(err => {
                SystemEvents.emit('error', err);
                return reject({
                    reason: ResponseErrors.INTERNAL_ERROR
                });
            });
        });
    }

    createButton(name, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            if (!options.requester || options.requester.role != AppConstants.UserRoles.ADMIN) {
                return reject({
                    reason: ResponseErrors.PERMISSION_DENIED,
                    more_info: { message: 'Only admin user is permitted to complete the action.' }
                });
            }

            let bd = options.button_data || {};
            bd.name = name;
            let validation_params = Utility.constructValidationParams(bd, ['name']);
            let button_validation = ButtonsValidator.validateAll(validation_params);
            if (!button_validation.is_valid) {
                return reject({
                    reason: ResponseErrors.VALIDATION_ERROR,
                    more_info: button_validation
                });
            }

            let button_src_object = Utility.checkAndSetSanitizedValues(button_validation, AppConstants.buttons.field_keys_mapping);
            ButtonsDAO.insert(button_src_object).then(button => {
                resolve(ButtonsResponse.generateResponse(button, options.requester));
            }).catch(err => {
                SystemEvents.emit('error', err);
                return reject({
                    reason: ResponseErrors.INTERNAL_ERROR
                });
            });
        });
    }

    updateButtonById(id, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            if (!options.requester || options.requester.role != AppConstants.UserRoles.ADMIN) {
                return reject({
                    reason: ResponseErrors.PERMISSION_DENIED,
                    more_info: { message: 'Only admin user is permitted to complete the action.' }
                });
            }

            let bd = options.button_data || {};
            bd.id = id;
            let validation_params = Utility.constructValidationParams(bd, ['id']);
            let button_validation = ButtonsValidator.validateAll(validation_params);
            if (!button_validation.is_valid) {
                return reject({
                    reason: ResponseErrors.VALIDATION_ERROR,
                    more_info: button_validation
                });
            }

            let button_src_object = Utility.checkAndSetSanitizedValues(button_validation, AppConstants.buttons.field_keys_mapping);
            ButtonsDAO.updateById(id, button_src_object, ['id']).then(button => {
                resolve(ButtonsResponse.generateResponse(button, options.requester));
            }).catch(err => {
                SystemEvents.emit('error', err);
                return reject({
                    reason: ResponseErrors.INTERNAL_ERROR
                });
            });
        });
    }

    removeButtonById(id, options) {
        options = options || {};
        if (!options.requester || options.requester.role != AppConstants.UserRoles.ADMIN) {
            return reject({
                reason: ResponseErrors.PERMISSION_DENIED,
                more_info: { message: 'Only admin user is permitted to complete the action.' }
            });
        }
        if (!id) {
            return reject({
                reason: ResponseErrors.VALIDATION_ERROR,
                more_info: { message: 'ID is not specified.' }
            })
        }

        ButtonsDAO.removeById(id).then(resp => {
            resolve(ButtonsResponse.generateResponse(resp, options.requester));
        }).catch(err => {
            SystemEvents.emit('error', err);
            return reject({
                reason: ResponseErrors.INTERNAL_ERROR
            });
        });
    }

}

module.exports = new ButtonsService();
