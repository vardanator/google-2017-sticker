
const AuthValidator = require('./private/validator');
const ResponseErrors = require('./../response/errors');
const UsersService = require('./../users/service');
const AppConstants = require('./../settings/constants');

class AuthorizationService {

    authorizeUser(key, access) {
        return new Promise((resolve, reject) => {
            if (!key && access === AppConstants.AccessLevel.OPTIONAL) {
                return resolve(null);
            }
            let validation_results = AuthValidator.validateAll([
                {key: 'key', value: key, options: {required: true}},
                {key: 'access', value: access, options: {required: true}}
            ]);
            if (!validation_results.is_valid) {
                return reject({
                    reason: ResponseErrors.VALIDATION_ERROR,
                    more_info: validation_results
                })
            }

            UsersService.getUserRole(key).then(user => {
                if (!user) {
                    return reject({
                        reason: ResponseErrors.RESOURCE_NOT_FOUND,
                        more_info: {
                            code: AuthValidator.USER_NOT_FOUND,
                            message: 'User with specified key not found.'
                        }
                    });
                }
                if (AppConstants.AccessLevel[(user.role || '').toUpperCase()] < access) {
                    return reject({
                        reason: ResponseErrors.USER_AUTHORIZATION_FAILED,
                        more_info: {
                            code: AuthValidator.PERMISSION_DENIED,
                            message: 'No permissions for specified API key.'
                        }
                    });
                }
                return resolve(user);
            }).catch(err => {
                return reject({
                    reason: ResponseErrors.RESOURCE_NOT_FOUND,
                    more_info: {
                        code: AuthValidator.USER_NOT_FOUND,
                        message: 'User with specified key not found.'
                    }
                });
            })
        })
    }

}

module.exports = new AuthorizationService();
