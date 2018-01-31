const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AppConstants = require('./../../settings/constants');

module.exports = (AppSettings, DataValidator) => {
    const UnitSettings = AppSettings.units;

    let ProductSchema = new Schema({
        photos: [
            {type: Schema.ObjectId, ref: 'photos'}
        ],
        name: {
            en: {type: String, maxlength: UnitSettings.product_name_maxlength},
            ru: {type: String, maxlength: UnitSettings.product_name_maxlength},
            am: {type: String, maxlength: UnitSettings.product_name_maxlength}
        },
        description: {
            en: {type: String, maxlength: UnitSettings.product_description_maxlength},
            ru: {type: String, maxlength: UnitSettings.product_description_maxlength},
            am: {type: String, maxlength: UnitSettings.product_description_maxlength}
        },
        price: String,
        sale_price: String,
        sale_deadline: Date,
        likes: [{type: Schema.ObjectId, ref: 'users'}],
        keywords: [String],
        rank: {type: Number, default: 0}
    });

    return mongoose.model('products', ProductSchema);
}
