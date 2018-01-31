const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = (AppSettings) => {

    let CategoriesSettings = AppSettings.categories;

    let CategoriesSchema = new Schema({
        title: {
            en: {
                type: String,
                maxlength: CategoriesSettings.title_maxlength,
                minlength: CategoriesSettings.title_minlength,
                trim: true,
                required: true
            },
            ru: {
                type: String,
                maxlength: CategoriesSettings.title_maxlength,
                minlength: CategoriesSettings.title_minlength,
                trim: true,
                required: true
            },
            am: {
                type: String,
                maxlength: CategoriesSettings.title_maxlength,
                minlength: CategoriesSettings.title_minlength,
                trim: true,
                required: true
            }
        },
        description: {
            en: {
                type: String,
                maxlength: CategoriesSettings.description_maxlength,
                minlength: CategoriesSettings.description_minlength,
                trim: true
            },
            ru: {
                type: String,
                maxlength: CategoriesSettings.description_maxlength,
                minlength: CategoriesSettings.description_minlength,
                trim: true
            },
            am: {
                type: String,
                maxlength: CategoriesSettings.description_maxlength,
                minlength: CategoriesSettings.description_minlength,
                trim: true
            }
        },
        photo: {type: Schema.ObjectId, ref: 'photos'},
        group_id: {type: Schema.ObjectId, ref: 'groups', index: true, required: true},
        metadata: {
            created: { type: Date, default: Date.now },
            updated: { type: Date, default: Date.now }
        }
    });

    CategoriesSchema.pre('save', (next) => {
        //this.metadata.updated = Date.now(); fails don't know why
        next();
    });

    return mongoose.model('categories', CategoriesSchema);
}
