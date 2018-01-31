const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = (AppSettings) => {
    let ActivitySettings = AppSettings.activity;

    let ActivitySchema = new Schema({
        user: {type: Schema.ObjectId, ref: 'users', index: true},
        action: {type: String, enum: ActivitySettings.action_values, default: ActivitySettings.action_values[0]},
        info: {type: String, maxlength: ActivitySettings.info_maxlength},
        target_id: {type: Schema.ObjectId},
        created: {type: Date, default: Date.now, expires: '50d'}
    });

    return mongoose.model('activity', ActivitySchema);

}
