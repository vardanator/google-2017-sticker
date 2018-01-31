const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AppConstants = require('./../constants.js');

let SettingListItem = new Schema({
    key: String,
    value: Schema.Types.Mixed,
    value_type: { type: String, enum: AppConstants.settings_value_types },
    display_name: String
});

let SettingsSchema = new Schema({
    section: {
        type: String,
        default: 'general',
        enum: AppConstants.settings_sections,
        required: true
    },
    version: { type: Number, default: 0 },
    platform: {
        type: String,
        default: null,
        enum: AppConstants.platforms
    }
    list: [SettingListItem]
});

module.exports = mongoose.model('settings', SettingsSchema);
