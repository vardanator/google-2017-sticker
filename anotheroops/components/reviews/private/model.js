const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = (AppSettings) => {
    const ReviewSettings = AppSettings.reviews;

    let ReviewsSchema = new Schema({
        user: {type: Schema.ObjectId, ref: 'users', index: true, required: true},
        unit: {type: Schema.ObjectId, ref: 'units', index: true},
        text: {
            type: String,
            maxlength: ReviewSettings.text_maxlength,
            trim: true
        },
        rating: {
            type: Number,
            required: true,
            minlength: ReviewSettings.rating_minlength,
            maxlength: ReviewSettings.rating_maxlength
        },
        up_votes: [{type: Schema.ObjectId, ref: 'users'}],
        down_votes: [{type: Schema.ObjectId, ref: 'users'}],
        reports: [{type: Schema.ObjectId, ref: 'users'}],
        edits: {
            first_version: {
                type: String,
                maxlength: ReviewSettings.text_maxlength,
                trim: true
            },
            is_edited: {type: Boolean, default: false},
            edited_by: {type: Schema.ObjectId, ref: 'users'},
            date: Date
        },
        is_fb_review: {type: Boolean, default: false},
        metadata: {
            created: { type: Date, default: Date.now },
            updated: { type: Date, default: Date.now }
        }
    });

    ReviewsSchema.pre('save', (next) => {
        //this.metadata.updated = Date.now(); // not sure for arrow function and this
        next();
    })

    return mongoose.model('reviews', ReviewsSchema);
}
