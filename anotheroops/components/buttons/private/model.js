const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let ButtonsSchema = new Schema({
    name: {type: String, index: {unique: true} },
    component: {type: String, index: true},
    color: String,
    icon_name: String,
    title: {
        content: {
            en: String,
            ru: String,
            am: String
        },
        color: String,
        style: String
    },
    disabled: Boolean,
    disable_on_request: Boolean,
    text_direction: String,
    order: Number,
    border: {
        left: String,
        right: String,
        top: String,
        bottom: String,
        radius: String
    },
    on_success: {
        icon_name: String,
        disabled: Boolean,
        color: String,
        title: {
            content: {
                en: String,
                ru: String,
                am: String
            },
            color: String,
            style: String
        }
    },
    action: {
        target: String,
        subtarget: String,
        target_params: String,
        request: {
            url: String,
            method: String,
            body: {}
        }
    }
});

module.exports = mongoose.model('buttons', ButtonsSchema);
