const CoreValidator = require('./../../core/validator');
const AppConstants = require('./../../settings/constants');

const ValidationErrors = {
    KEY_NOT_PROVIDED: 'key_not_provided',
    PERMISSION_DENIED: 'permission_denied',
    USER_NOT_FOUND: 'user_not_found'
}

const Rules = {
    key: {
        field_name: 'key',
        type: CoreValidator.Types.STRING
    },
    access: {
        field_name: 'access',
        type: CoreValidator.Types.INTEGER,
        minlength: AppConstants.AccessLevel.OPTIONAL,
        maxlength: AppConstants.AccessLevel.ROOT
    }
}

class AuthValidator extends CoreValidator {

    constructor() {
        super(Rules);
    }

}

module.exports = new AuthValidator();
module.exports.Errors = ValidationErrors;
