const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AppConstants = require('./../../settings/constants');

module.exports = (AppSettings) => {
    let CollectionsSettings = AppSettings.collections;

    let CollectionsScheme = new Schema({
        name: {
            type: String,
            maxlength: CollectionsSettings.name_maxlength
        },
        units: [{
            type: Schema.ObjectId,
            ref: 'units'
        }]
    });

    return mongoose.model('collections', CollectionsScheme);

}
