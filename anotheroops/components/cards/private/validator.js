
const CoreValidator = require('./../../core/validator');
const AppConstants = require('./../../settings/constants');
const CardsSettings = require('./../../settings/service').cards;
const UnitSettings = require('./../../settings/service').units;

const Rules = {
    latitude: {
        field_name: 'latitude',
        type: CoreValidator.Types.COORD_LATITUDE
    },
    longitude: {
        field_name: 'longitude',
        type: CoreValidator.Types.COORD_LONGITUDE
    },
    clarifier: {
        field_name: 'clarifier',
        type: CoreValidator.Types.STRING
    },
    is_open: {
        field_name: 'is_open',
        type: CoreValidator.Types.BOOLEAN
    },
    price: {
        field_name: 'price',
        type: CoreValidator.Types.INTEGER,
        minlength: UnitSettings.price_minlength,
        maxlength: UnitSettings.price_maxlength
    }
};

class CardsValidator extends CoreValidator {
    constructor() {
        super(Rules);
    }
}

module.exports = new CardsValidator();
