const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = (AppSettings, DataValidator) => {
    const GroupsSettings = AppSettings.groups;

    let GroupsSchema = new Schema({
        title: {
            en: {
                type: String,
                trim: true,
                required: true,
                index: { unique: true },
                minlength: GroupsSettings.title_minlength,
                maxlength: GroupsSettings.title_maxlength
            },
            ru: {
                type: String,
                trim: true,
                required: true,
                index: { unique: true },
                minlength: GroupsSettings.title_minlength,
                maxlength: GroupsSettings.title_maxlength
            },
            am: {
                type: String,
                trim: true,
                required: true,
                index: { unique: true },
                minlength: GroupsSettings.title_minlength,
                maxlength: GroupsSettings.title_maxlength
            }
        },
        icon_name: { type: String, default: null },
        photo: {
            type: Schema.ObjectId,
            ref: 'photos'
        },
        is_primary: { type: Boolean, default: false },
        query_clarifiers: [
            {type: Schema.ObjectId, ref: 'buttons'}
        ],
        metadata: {
            created: { type: Date, default: Date.now },
            updated: { type: Date, default: Date.now }
        }
    });

    return mongoose.model('groups', GroupsSchema);
}
