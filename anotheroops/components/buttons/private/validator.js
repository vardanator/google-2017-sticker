const CoreValidator = require('./../../core/validator');
const AppConstants = require('./../../settings/constants');
const AppSettings = require('./../../settings/service');
const ButtonSettings = AppSettings.buttons;

const ValidationErrors = {

};

// TODO: Rules don't possess programming best practices :unamused:
const Rules = {
    id: {
        field_name: 'id',
        type: CoreValidator.Types.STRING
    },
    name: {
        field_name: 'name',
        type: CoreValidator.Types.STRING,
        minlength: ButtonSettings.name_minlength,
        maxlength: ButtonSettings.name_maxlength
    },
    component: {
        field_name: 'component',
        type: CoreValidator.Types.ENUM,
        enum: AppConstants.component_name_values
    },
    color: {
        field_name: 'color',
        type: CoreValidator.Types.STRING
    },
    icon_name: {
        field_name: 'icon_name',
        type: CoreValidator.Types.ENUM,
        enum: AppConstants.icon_name_values
    },
    title_content_en: {
        field_name: 'title_content_en',
        type: CoreValidator.Types.STRING,
        minlength: ButtonSettings.name_minlength,
        maxlength: ButtonSettings.name_maxlength
    },
    title_content_ru: {
        field_name: 'title_content_ru',
        type: CoreValidator.Types.STRING,
        minlength: ButtonSettings.name_minlength,
        maxlength: ButtonSettings.name_maxlength
    },
    title_content_am: {
        field_name: 'title_content_am',
        type: CoreValidator.Types.STRING,
        minlength: ButtonSettings.name_minlength,
        maxlength: ButtonSettings.name_maxlength
    },
    title_color: {
        field_name: 'title_color',
        type: CoreValidator.Types.STRING
    },
    title_style: {
        field_name: 'title_style',
        type: CoreValidator.Types.ENUM,
        enum: AppConstants.text_style_values
    },
    disabled: {
        field_name: 'disabled',
        type: CoreValidator.Types.BOOLEAN
    },
    disable_on_request: {
        field_name: 'disable_on_request',
        type: CoreValidator.Types.BOOLEAN
    },
    text_direction: {
        field_name: 'text_direction',
        type: CoreValidator.Types.ENUM,
        enum: AppConstants.text_direction_values,
        default: 'center'
    },
    order: {
        field_name: 'order',
        type: CoreValidator.Types.INTEGER,
        minlength: ButtonSettings.order_minlength
    },
    border_left: {
        field_name: 'border_left',
        type: CoreValidator.Types.STRING,
        minlength: ButtonSettings.border_minlength,
        maxlength: ButtonSettings.border_maxlength
    },
    border_right: {
        field_name: 'border_right',
        type: CoreValidator.Types.STRING,
        minlength: ButtonSettings.border_minlength,
        maxlength: ButtonSettings.border_maxlength
    },
    border_top: {
        field_name: 'border_top',
        type: CoreValidator.Types.STRING,
        minlength: ButtonSettings.border_minlength,
        maxlength: ButtonSettings.border_maxlength
    },
    border_bottom: {
        field_name: 'border_bottom',
        type: CoreValidator.Types.STRING,
        minlength: ButtonSettings.border_minlength,
        maxlength: ButtonSettings.border_maxlength
    },
    border_radius: {
        field_name: 'border_radius',
        type: CoreValidator.Types.INTEGER,
        minlength: ButtonSettings.border_radius_minlength,
        maxlength: ButtonSettings.border_radius_maxlength
    },
    on_success_icon_name: {
        field_name: 'on_success_icon_name',
        type: CoreValidator.Types.ENUM,
        enum: AppConstants.icon_name_values
    },
    on_success_disabled: {
        field_name: 'on_success_disabled',
        type: CoreValidator.Types.BOOLEAN
    },
    on_success_color: {
        field_name: 'on_success_color',
        type: CoreValidator.Types.STRING
    },
    on_success_title_style: {
        field_name: 'on_success_title_style',
        type: CoreValidator.Types.ENUM,
        enum: AppConstants.text_style_values
    },
    on_success_title_color: {
        field_name: 'on_success_title_color',
        type: CoreValidator.Types.STRING
    },
    on_success_title_content_en: {
        field_name: 'on_success_title_content_en',
        type: CoreValidator.Types.STRING,
        minlength: ButtonSettings.name_minlength,
        maxlength: ButtonSettings.name_maxlength
    },
    on_success_title_content_ru: {
        field_name: 'on_success_title_content_ru',
        type: CoreValidator.Types.STRING,
        minlength: ButtonSettings.name_minlength,
        maxlength: ButtonSettings.name_maxlength
    },
    on_success_title_content_am: {
        field_name: 'on_success_title_content_am',
        type: CoreValidator.Types.STRING,
        minlength: ButtonSettings.name_minlength,
        maxlength: ButtonSettings.name_maxlength
    },
    action_target: {
        field_name: 'action_target',
        type: CoreValidator.Types.STRING
    },
    action_subtarget: {
        field_name: 'action_subtarget',
        type: CoreValidator.Types.STRING
    },
    action_target_params: {
        field_name: 'action_target_params',
        type: CoreValidator.Types.STRING
    },
    action_reaction: {
        field_name: 'action_reaction',
        type: CoreValidator.Types.ENUM,
        enum: AppConstants.action_reaction_values
    },
    action_dialog_name: {
        field_name: 'action_dialog_name',
        type: CoreValidator.Types.STRING
    },
    action_request_url: {
        field_name: 'action_request_url',
        type: CoreValidator.Types.URL
    },
    action_request_method: {
        field_name: 'action_request_method',
        type: CoreValidator.Types.ENUM,
        enum: AppConstants.request_method_values
    }
};

class ButtonsValidator extends CoreValidator {
    constructor() {
        super(Rules);
    }
}

module.exports = new ButtonsValidator();
module.exports.Errors = ValidationErrors;
