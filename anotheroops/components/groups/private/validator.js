
const CoreValidator = require('./../../core/validator');
const AppConstants = require('./../../settings/constants');
const GroupsSettings = require('./../../settings/service').groups;

const ValidationErrors = {
    GROUP_TITLE_EXISTS: 'group_title_exists'
};

const Rules = {
    id: {
        field_name: 'id',
        type: CoreValidator.Types.STRING
    },
    title_en: {
        field_name: 'title_en',
        type: CoreValidator.Types.STRING,
        minlength: GroupsSettings.title_minlength,
        maxlength: GroupsSettings.title_maxlength
    },
    title_ru: {
        field_name: 'title_ru',
        type: CoreValidator.Types.STRING,
        minlength: GroupsSettings.title_minlength,
        maxlength: GroupsSettings.title_maxlength
    },
    title_am: {
        field_name: 'title_am',
        type: CoreValidator.Types.STRING,
        minlength: GroupsSettings.title_minlength,
        maxlength: GroupsSettings.title_maxlength
    },
    icon_name: {
        field_name: 'icon_name',
        type: CoreValidator.Types.ENUM,
        enum: AppConstants.icon_name_values
    },
    is_primary: {
        field_name: 'is_primary',
        type: CoreValidator.Types.BOOLEAN
    }
}

class GroupValidator extends CoreValidator {

    constructor() {
        super(Rules);
    }

}

module.exports = new GroupValidator();
module.exports.Errors = ValidationErrors;
