const CoreValidator = require('./../../core/validator');
const AppConstants = require('./../../settings/constants');
const UnitSettings = require('./../../settings/service').units;

const ValidationErrors = {

};

const Rules = {
    name_en: {
        field_name: 'name_en',
        type: CoreValidator.Types.STRING,
        minlength: UnitSettings.name_minlength,
        maxlength: UnitSettings.name_maxlength
    },
    name_ru: {
        field_name: 'name_ru',
        type: CoreValidator.Types.STRING,
        minlength: UnitSettings.name_minlength,
        maxlength: UnitSettings.name_maxlength
    },
    name_am: {
        field_name: 'name_am',
        type: CoreValidator.Types.STRING,
        minlength: UnitSettings.name_minlength,
        maxlength: UnitSettings.name_maxlength
    },
    description_en: {
        field_name: 'description_en',
        type: CoreValidator.Types.STRING,
        minlength: UnitSettings.description_minlength,
        maxlength: UnitSettings.description_maxlength
    },
    description_ru: {
        field_name: 'description_ru',
        type: CoreValidator.Types.STRING,
        minlength: UnitSettings.description_minlength,
        maxlength: UnitSettings.description_maxlength
    },
    description_am: {
        field_name: 'description_am',
        type: CoreValidator.Types.STRING,
        minlength: UnitSettings.description_minlength,
        maxlength: UnitSettings.description_maxlength
    },
    price: {
        field_name: 'price',
        type: CoreValidator.Types.STRING
    },
    sale_price: {
        field_name: 'sale_price',
        type: CoreValidator.Types.STRING
    },
    sale_deadline: {
        field_name: 'sale_deadline',
        type: CoreValidator.Types.DATE
    }
};

class ProductsValidator extends CoreValidator {
    constructor() {
        super(Rules);
    }
}

module.exports = new ProductsValidator();
module.exports.Errors = ValidationErrors;
