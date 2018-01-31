const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AppSettings = require('./../settings/service');

module.exports = (AppSettings) => {
    const SearchSettings = AppSettings.search;

    let SearchSchema = new Schema({
        word: { type: String, required: true },
        documents: [{
            type: Schema.ObjectId, ref: 'units'
        }],
        weight: { type: Number, default: 1 }
    });

    SearchSchema.index({word: 1, weight: 1});

    return mongoose.model('search', SearchSchema);
}
