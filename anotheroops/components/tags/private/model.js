const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = (AppSettings) => {
    let UnitSettings = AppSettings.units;

    let TagsSchema = new Schema({
        is_tag: {type: Boolean, default: false, index: true}, // otherwise - keyword
        is_feature: {type: Boolean, default: false, index: true}, // otherwise - keyword, or tag
        is_keyword: {type: Boolean, default: false, index: true},
        value: {
            en: {
                type: String,
                maxlength: UnitSettings.tag_maxlength,
                minlength: UnitSettings.tag_minlength,
                index: true
            },
            ru: {
                type: String,
                maxlength: UnitSettings.tag_maxlength,
                minlength: UnitSettings.tag_minlength,
                index: true
            },
            am: {
                type: String,
                maxlength: UnitSettings.tag_maxlength,
                minlength: UnitSettings.tag_minlength,
                index: true
            }
        },
        global_weight: {type: Number, default: 0},
        icon_name: String
    });

    return mongoose.model('tags', TagsSchema);

}
