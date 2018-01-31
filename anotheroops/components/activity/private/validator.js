
const CoreValidator = require('./../../core/validator');
const AppConstants = require('./../../settings/constants');
const ActivitySettings = require('./../../settings/service').activity;

const Rules = {
    action: {
        field_name: 'action',
        type: CoreValidator.Types.ENUM,
        enum: ActivitySettings.action_values
    },
    info: {
        field_name: 'info',
        type: CoreValidator.Types.STRING,
        maxlength: ActivitySettings.info_maxlength
    }
};

class ActivityValidator extends CoreValidator {
    constructor() {
        super(Rules);
    }
}

module.exports = new ActivityValidator();
