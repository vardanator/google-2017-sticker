const CoreValidator = require('./../../core/validator');
const AppConstants = require('./../../settings/constants');
const CategorySettings = require('./../../settings/service').categories;

const ValidationErrors = {

};

const Rules = {
    id: {
        field_name: 'id',
        type: CoreValidator.Types.STRING
    },
    title_en: {
        field_name: 'title_en',
        type: CoreValidator.Types.STRING,
        minlength: CategorySettings.title_minlength,
        maxlength: CategorySettings.title_maxlength
    },
    title_ru: {
        field_name: 'title_ru',
        type: CoreValidator.Types.STRING,
        minlength: CategorySettings.title_minlength,
        maxlength: CategorySettings.title_maxlength
    },
    title_am: {
        field_name: 'title_am',
        type: CoreValidator.Types.STRING,
        minlength: CategorySettings.title_minlength,
        maxlength: CategorySettings.title_maxlength
    },
    description_en: {
        field_name: 'description_en',
        type: CoreValidator.Types.STRING,
        minlength: CategorySettings.description_minlength,
        maxlength: CategorySettings.description_maxlength
    },
    description_ru: {
        field_name: 'description_ru',
        type: CoreValidator.Types.STRING,
        minlength: CategorySettings.description_minlength,
        maxlength: CategorySettings.description_maxlength
    },
    description_am: {
        field_name: 'description_am',
        type: CoreValidator.Types.STRING,
        minlength: CategorySettings.description_minlength,
        maxlength: CategorySettings.description_maxlength
    },
    group_id: {
        field_name: 'group_id',
        type: CoreValidator.Types.STRING
    }
};

class CategoriesValidator extends CoreValidator {
    constructor() {
        super(Rules);
    }
}

module.exports = new CategoriesValidator();
module.exports.Errors = ValidationErrors;
