const CoreValidator = require('./../../core/validator');
const AppSettings = require('./../../settings/service');
const UsersSettings = AppSettings.users;
const GeneralSettings = AppSettings.general;
const AppConstants = require('./../../settings/constants');

const ValidationErrors = {
    USERNAME_ALREADY_EXISTS: 'username_already_exists',
    SOCIAL_USER_ALREADY_REGISTERED: 'social_user_already_registered',
    INVALID_USERNAME: 'invalid_username',
    INCORRECT_PASSWORD: 'incorrect_password',
    INVALID_SOCIAL_ID: 'invalid_social_id',
    INVALID_AUTH_DATA: 'invalid_auth_data'
};

const Rules = {
    username: {
        field_name: 'username',
        type: CoreValidator.Types.STRING,
        minlength: UsersSettings.username_minlength,
        maxlength: UsersSettings.username_maxlength,
        special_characters: {
            ascii_only: true,
            no_special_chars: true,
            whitelist: ['_', '.', '-']
        }
    },
    password: {
        field_name: 'password',
        type: CoreValidator.Types.STRING,
        minlength: UsersSettings.password_minlength,
        maxlength: UsersSettings.password_maxlength
    },
    email: {
        field_name: 'email',
        type: CoreValidator.Types.EMAIL
    },
    name: {
        field_name: 'name',
        type: CoreValidator.Types.STRING,
        maxlength: UsersSettings.name_maxlength,
        minlength: UsersSettings.name_minlength
    },
    gender: {
        field_name: 'gender',
        type: CoreValidator.Types.BOOLEAN
    },
    birthday: {
        field_name: 'birthday',
        type: CoreValidator.Types.DATE
    },
    provider: {
        field_name: 'provider',
        type: CoreValidator.Types.ENUM,
        enum: AppConstants.social_provider_values
    },
    url: {
        field_name: 'url',
        type: CoreValidator.Types.URL
    },
    id: {
        field_name: 'id',
        type: CoreValidator.Types.STRING
    },
    token: {
        field_name: 'token',
        type: CoreValidator.Types.STRING
    },
    language: {
        field_name: 'language',
        type: CoreValidator.Types.ENUM,
        enum: AppConstants.language_values,
        default: 'en'
    },
    interests: {
        field_name: 'interests',
        type: CoreValidator.Types.ENUM_ARRAY,
        enum: AppConstants.user_interest_values
    },
    age_range: {
        field_name: 'age_range',
        type: CoreValidator.Types.ENUM,
        enum: AppConstants.age_range_values,
        default: 'young'
    },
    phone: {
        field_name: 'phone',
        type: CoreValidator.Types.STRING
    }
}

class UserValidator extends CoreValidator {

    constructor() {
        super(Rules);
    }

}

module.exports = new UserValidator();
module.exports.Errors = ValidationErrors;
