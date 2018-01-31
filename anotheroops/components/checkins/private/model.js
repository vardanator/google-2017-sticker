const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = (AppSettings) => {
    let UsersSettings = AppSettings.users;

    let CheckinsSchema = new Schema({
        unit: {type: Schema.ObjectId, ref: 'units', index: true},
        user: {type: Schema.ObjectId, ref: 'users', index: true},
        title: {type: String, maxlength: UsersSettings.checkin_title_maxlength},
        date: {type: Date, default: Date.now}
    });

    return mongoose.model('checkins', CheckinsSchema);
}
