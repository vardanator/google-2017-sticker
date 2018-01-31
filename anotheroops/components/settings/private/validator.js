
const Validator = require('./../components/core/validator/service');
const SettingsValidationRules = require('./rules');

let DataTypes = {
    SETTINGS_SECTION: 'settings_section'
}

class SettingsValidator extends Validator {
    constructor() {
        super();
    }

    validate() {

    }
}

module.exports = SettingsValidator;
module.exports.DataTypes = DataTypes;
