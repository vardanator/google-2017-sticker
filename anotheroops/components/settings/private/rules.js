
const BaseTypes = require('./../../components/core/validator/public/service').DataTypes;
const DataTypes = require('./validator').DataTypes;

module.exports = {
    section: {
        type: DataTypes.SETTINGS_SECTION,
        required: true,
        sanitize: true
    },
    version: {
        type: BaseTypes.UNSIGNED_INTEGER,
        required: false,
        sanitize: true
    },
    platform: {
        type: BaseTypes.CLIENT_PLATFORM,
        required: false,
        sanitize: true
    },
    list_item_key: {
        type: BaseTypes.STRING,
        required: true,
        sanitize: true
    },
    list_item_value: {
        type: BaseTypes.OBJECT,
        required: true,
        sanitize: false
    },
    list_item_value_type: {
        type: BaseTypes.STRING,
        required: true,
        sanitize: true
    },
    list_item_display_name: {
        type: BaseTypes.STRING,
        required: false,
        sanitize: true
    },
    list_item_display_name_ru: {
        type: BaseTypes.STRING,
        required: false,
        sanitize: true
    },
    list_item_display_name_am: {
        type: BaseTypes.STRING,
        required: false,
        sanitize: true
    }
}
