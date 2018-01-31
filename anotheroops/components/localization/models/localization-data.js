const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let LocalizationDataSchema = new Schema({
    unit_id: { type: Schema.Types.ObjectId, index: true },
    keys: [{
        key: String,
        ru: String,
        am: String
    }]
});
