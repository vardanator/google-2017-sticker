const CoreValidator = require('./../../core/validator');
const AppConstants = require('./../../settings/constants');
const UnitSettings = require('./../../settings/service').units;

const ValidationErrors = {

};

const Rules = {
    value_en: {
        field_name: 'value_en',
        type: CoreValidator.Types.STRING,
        minlength: UnitSettings.tag_minlength,
        maxlength: UnitSettings.tag_maxlength
    },
    value_ru: {
        field_name: 'value_ru',
        type: CoreValidator.Types.STRING,
        minlength: UnitSettings.tag_minlength,
        maxlength: UnitSettings.tag_maxlength
    },
    value_am: {
        field_name: 'value_am',
        type: CoreValidator.Types.STRING,
        minlength: UnitSettings.tag_minlength,
        maxlength: UnitSettings.tag_maxlength
    },
    global_weight: {
        field_name: 'global_weight',
        type: CoreValidator.Types.INTEGER,
        minlength: UnitSettings.tag_weight_min_value,
        maxlength: UnitSettings.tag_weight_max_value
    },
    icon_name: {
        field_name: 'icon_name',
        type: CoreValidator.Types.ENUM,
        enum: AppConstants.icon_name_values,
        default: AppConstants.icon_name_values[0]
    },
    is_tag: {
        field_name: 'is_tag',
        type: CoreValidator.Types.BOOLEAN
    },
    is_feature: {
        field_name: 'is_feature',
        type: CoreValidator.Types.BOOLEAN
    },
    is_keyword: {
        field_name: 'is_keyword',
        type: CoreValidator.Types.BOOLEAN
    }
};

class TagsValidator extends CoreValidator {
    constructor() {
        super(Rules);
    }
}

module.exports = new TagsValidator();
module.exports.Errors = ValidationErrors;
