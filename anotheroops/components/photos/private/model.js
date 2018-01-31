const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = (AppSettings, DataValidator) => {
    const PhotosSettings = AppSettings.photos;

    let PhotoSchema = new Schema({
        image: Buffer,
        content_type: String,
        mime: String,
        size: Number,
        width: Number,
        height: Number,
        title: {
            type: String,
            default: null,
            minlength: PhotosSettings.title_minlength,
            maxlength: PhotosSettings.title_maxlength
        },
        user_id: { type: Schema.ObjectId },
        entity_id: { type: Schema.ObjectId, index: true },
        metadata: {
            created: { type: Date, default: Date.now },
            updated: { type: Date, default: Date.now }
        }
    });

    return mongoose.model('photos', PhotoSchema);
}
