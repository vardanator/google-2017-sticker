
// TODO: change all enums to contain enum word in variable name
module.exports = {
    component_name_values: ['activity', 'nearby', 'home', 'inbox', 'profile'],
    platform_values: ['web', 'android', 'ios'],
    settings_value_types: ['array', 'number', 'string', 'boolean', 'date', 'object', 'photo'],
    language_values: ['en', 'ru', 'am'],
    user_role_values: ['user', 'editor', 'moderator', 'admin', 'root'],
    social_providers_values: ['facebook', 'google'],
    upload_destination: './uploads', // TODO: absolute path issues
    image_mimetype_values: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
    hash_salt: 'gundapala1mek',
    daytime_values: ['early_morning', 'morning', 'lunch', 'noon', 'evening', 'night'],
    user_action_values: ['business_view', 'business_like', 'business_unlike',
        'business_review', 'event_view', 'search', 'business_share', 'event_like',
        'event_unlike', 'etc'
    ],
    app_action_values: ['group_click', 'scroll', 'business_click', 'event_click', 'activity_button_click',
        'nearby_button_click', 'explore_button_click', 'inbox_button_click', 'to be continued'
    ],
    currency_values: ['USD', 'AMD', 'RUR'],
    age_range_values: ['pupil', 'teen', 'young', 'adult'],
    user_interest_values: ['active_life', 'arts', 'banks', 'beauty', 'cafe', 'cars',
        'coffee_tea', 'education', 'food', 'gym', 'health_medical', 'home_services',
        'hotels', 'movies', 'music', 'nightlife', 'pets', 'pizzeria', 'bars_pubs',
        'real_estate', 'shopping', 'spa_massage', 'sushi', 'travel'],
    AccessLevel: {
        OPTIONAL: 1,
        USER: 2,
        EDITOR: 3,
        MODERATOR: 4,
        ADMIN: 5,
        ROOT: 6
    },
    UserRoles: {
        USER: 'user',
        ADMIN: 'admin',
        MODERATOR: 'moderator',
        EDITOR: 'editor',
        ROOT: 'root'
    },
    icon_name_values: [ 'icon_placeholder',
        'food_icon', 'beauty_icon', 'hotels_icon',
        'services_icon', 'health_icon', 'kids_icon',
        'auto_icon', 'shopping_icon', 'fin_services_icon',
        'arts_icon', 'active_life_icon', 'cleaning_services_icon',
        'night_life_icon'
    ],
    text_style_values: ['bold', 'regular', 'italic'],
    text_direction_values: ['left', 'right', 'center', 'top', 'bottom'],
    action_reaction_values: ['toast', 'none', 'dialog', 'component'],
    request_method_values: ['get', 'post', 'put', 'delete'],
    buttons: {
        updatable_field_names: ['title_content_en', 'title_content_ru', 'title_content_am', 'title_color', 'title_style',
        'icon_name', 'color', 'disabled', 'disable_on_request', 'text_direction', 'order',
        'border_left', 'border_right', 'border_top', 'border_bottom', 'border_radius',
        'on_success_icon_name', 'on_success_disabled', 'on_success_color', 'on_success_title_color',
        'on_success_title_style', 'on_success_title_content_en', 'on_success_title_content_ru', 'on_success_title_content_am',
        'action_target', 'action_subtarget', 'action_target_params', 'action_request_url', 'action_request_method', 'component'],
        field_keys_mapping: [
            {lhs: 'title.content.en', rhs: 'title_content_en'}, {lhs: 'title.content.ru', rhs: 'title_content_ru'},
            {lhs: 'title.content.am', rhs: 'title_content_am'}, {lhs: 'title.color', rhs: 'title_color'},
            {lhs: 'title.style', rhs: 'title_style'}, 'icon_name', 'color', 'disabled', 'disable_on_request', 'text_direction', 'order',
            {lhs: 'border.left', rhs: 'border_left'}, {lhs: 'border.right', rhs: 'border_right'}, {lhs: 'border.top', rhs: 'border_top'},
            {lhs: 'border.bottom', rhs: 'border_bottom'}, {lhs: 'border.radius', rhs: 'border_radius'},
            {lhs: 'on_success.icon_name', rhs: 'on_success_icon_name'}, {lhs: 'on_success.disabled', rhs: 'on_success_disabled'},
            {lhs: 'on_success.color', rhs: 'on_success_color'}, {lhs: 'on_success.title.content.en', rhs: 'on_success_title_content_en'},
            {lhs: 'on_success.title.content.ru', rhs: 'on_success_title_content_ru'}, {lhs: 'on_success.title.content.am', rhs: 'on_success_title_content_am'},
            {lhs: 'on_success.title.color', rhs: 'on_success_title_color'}, {lhs: 'on_success.title.style', rhs: 'on_success_title_style'},
            {lhs: 'action.target', rhs: 'action_target'}, {lhs: 'action.subtarget', rhs: 'action_subtarget'},
            {lhs: 'action.target_params', rhs: 'action_target_params'}, {lhs: 'action.request.url', rhs: 'action_request_url'},
            {lhs: 'action.request.method', rhs: 'action_request_method'}, {lhs: 'action.request.params', rhs: 'action_request_params'}
        ]
    },
    categories: {
        updatable_field_names: ['group_id', 'title_en', 'title_ru', 'title_am',
        'description_en', 'description_ru', 'description_am'],
        required_field_names: ['group_id', 'title_en', 'title_ru', 'title_am'],
        field_keys_mapping: [
            'group_id', {lhs: 'title.en', rhs: 'title_en'}, {lhs: 'title.ru', rhs: 'title_ru'}, {lhs: 'title.am', rhs: 'title_am'},
            {lhs: 'description.en', rhs: 'description_en'}, {lhs: 'description.ru', rhs: 'description_ru'},
            {lhs: 'description.am', rhs: 'description_am'}
        ]
    },
    products: {
        updatable_field_names: [
            'name_en', 'name_ru', 'name_am', 'description_en', 'description_ru', 'description_am',
            'price', 'sale_price', 'sale_deadline'
        ],
        field_keys_mapping: [
            {lhs: 'name.en', rhs: 'name_en'}, {lhs: 'name.ru', rhs: 'name_ru'}, {lhs: 'name.am', rhs: 'name_am'},
            {lhs: 'description.en', rhs: 'description_en'}, {lhs: 'description.ru', rhs: 'description_ru'}, {lhs: 'description.am', rhs: 'description_am'},
            'price', 'sale_price', 'sale_deadline', 'keywords'
        ],
        required_field_names: ['name_en', 'name_ru', 'name_am']
    },
    units: {
        required_field_names: [
            'name_en', 'name_ru', 'name_am', 'address_street_en', 'address_street_ru', 'address_street_am'
        ],
        updatable_field_names: ['unit_type', 'name_en', 'name_ru', 'name_am', 'price', 'migration_id',
            'description_en', 'description_ru', 'description_am', 'about_en', 'about_ru', 'about_am',
            'address_country_en', 'address_country_ru', 'address_country_am', 'address_state_en',
            'address_state_ru', 'address_state_am', 'address_city_en', 'address_city_ru', 'address_city_am',
            'address_street_en', 'address_street_ru', 'address_street_am', 'address_zip',
            'address_more_info_en', 'address_more_info_ru', 'address_more_info_am', 'is_branch', 'parent_id',
            'top', 'recent', 'contact_phone', 'contact_email', 'contact_website',
            'contact_person_username', 'contact_person_name_en', 'contact_person_name_ru', 'contact_person_name_am',
            'contact_person_title_en', 'contact_person_title_ru', 'contact_person_title_am', 'contact_person_phone',
            'contact_person_email', 'contact_person_website', 'is_open24', 'working_hours_mon_start', 'working_hours_mon_end',
            'working_hours_tue_start', 'working_hours_tue_end', 'working_hours_wed_start', 'working_hours_wed_end',
            'working_hours_thu_start', 'working_hours_thu_end', 'working_hours_fri_start', 'working_hours_fri_end',
            'working_hours_sat_start', 'working_hours_sat_end', 'working_hours_sun_start', 'working_hours_sun_end',
            'products_naming_en', 'products_naming_ru', 'products_naming_am', 'founded', 'is_active', 'price', 'main_photo_id', 'other_photo_ids'
        ],
        field_keys_mapping: [
            'unit_type', {lhs: 'name.en', rhs: 'name_en'}, {lhs: 'name.ru', rhs: 'name_ru'}, {lhs: 'name.am', rhs: 'name_am'},
            {lhs: 'description.en', rhs: 'description_en'}, {lhs: 'description.ru', rhs: 'description_ru'},
            {lhs: 'description.am', rhs: 'description_am'}, {lhs: 'about.en', rhs: 'about_en'}, {lhs: 'about.ru', rhs: 'about_ru'},
            {lhs: 'about.am', rhs: 'about_am'}, {lhs: 'address.country.en', rhs: 'address_country_en'},
            {lhs: 'address.country.ru', rhs: 'address_country_ru'}, {lhs: 'address.country.am', rhs: 'address_country_am'},
            {lhs: 'address.state.en', rhs: 'address_state_en'}, {lhs: 'address.state.ru', rhs: 'address_state_ru'},
            {lhs: 'address.state.am', rhs: 'address_state_am'}, {lhs: 'address.city.en', rhs: 'address_city_en'},
            {lhs: 'address.city.ru', rhs: 'address_city_ru'}, {lhs: 'address.city.am', rhs: 'address_city_am'},
            {lhs: 'address.street.en', rhs: 'address_street_en'}, {lhs: 'address.street.ru', rhs: 'address_street_ru'},
            {lhs: 'address.street.am', rhs: 'address_street_am'}, {lhs: 'address.zip', rhs: 'address_zip'},
            {lhs: 'address.more_info.en', rhs: 'address_more_info_en'},
            {lhs: 'address.more_info.ru', rhs: 'address_more_info_ru'}, {lhs: 'address.more_info.am', rhs: 'address_more_info_am'},
            'is_branch', 'parent_id', 'top', 'recent', {lhs: 'contact.phone', rhs: 'contact_phone'}, {lhs: 'contact.email', rhs: 'contact_email'},
            {lhs: 'contact.website', rhs: 'contact_website'}, {lhs: 'contact.contact_person.username', rhs: 'contact_person_username'},
            {lhs: 'contact.contact_person.name.en', rhs: 'contact_person_name_en'}, {lhs: 'contact.contact_person.name.ru', rhs: 'contact_person_name_ru'},
            {lhs: 'contact.contact_person.name.am', rhs: 'contact_person_name_am'}, {lhs: 'contact.contact_person.title.en', rhs: 'contact_person_title_en'},
            {lhs: 'contact.contact_person.title.ru', rhs: 'contact_person_title_ru'}, {lhs: 'contact.contact_person.title.am', rhs: 'contact_person_title_am'},
            {lhs: 'contact.contact_person.phone', rhs: 'contact_person_phone'}, {lhs: 'contact.contact_person.email', rhs: 'contact_person_email'},
            {lhs: 'contact.contact_person.website', rhs: 'contact_person_website'}, 'is_open24', 'founded', 'is_active',
            {lhs: 'working_hours.mon.start', rhs: 'working_hours_mon_start'}, {lhs: 'working_hours.mon.end', rhs: 'working_hours_mon_end'},
            {lhs: 'working_hours.tue.start', rhs: 'working_hours_tue_start'}, {lhs: 'working_hours.tue.end', rhs: 'working_hours_tue_end'},
            {lhs: 'working_hours.wed.start', rhs: 'working_hours_wed_start'}, {lhs: 'working_hours.wed.end', rhs: 'working_hours_wed_end'},
            {lhs: 'working_hours.thu.start', rhs: 'working_hours_thu_start'}, {lhs: 'working_hours.thu.end', rhs: 'working_hours_thu_end'},
            {lhs: 'working_hours.fri.start', rhs: 'working_hours_fri_start'}, {lhs: 'working_hours.fri.end', rhs: 'working_hours_fri_end'},
            {lhs: 'working_hours.sat.start', rhs: 'working_hours_sat_start'}, {lhs: 'working_hours.sat.end', rhs: 'working_hours_sat_end'},
            {lhs: 'working_hours.sun.start', rhs: 'working_hours_sun_start'}, {lhs: 'working_hours.sun.end', rhs: 'working_hours_sun_end'},
            {lhs: 'products_naming.en', rhs: 'products_naming_en'}, {lhs: 'products_naming.ru', rhs: 'products_naming_ru'},
            {lhs: 'products_naming.am', rhs: 'products_naming_am'}, 'price', 'migration_id', 'price', 'main_photo_id', 'other_photo_ids'
        ]
    },
    tags: {
        updatable_field_names: [
            'value_en', 'value_ru', 'value_am', 'global_weight', 'icon_name',
            'is_tag', 'is_feature', 'is_keyword'
        ],
        field_keys_mapping: [
            {lhs: 'value.en', rhs: 'value_en'}, {lhs: 'value.ru', rhs: 'value_ru'},
            {lhs: 'value.am', rhs: 'value_am'}, 'global_weight', 'icon_name',
            'is_tag', 'is_feature', 'is_keyword'
        ],
        required_field_names: ['value_en']
    },
    api_urls: {
        SUBMIT_UNIT_REVIEW: 'units/:unit_id/reviews',
        HOME_CARDS: 'cards/:target'
    },
    request_methods: {
        GET: 'get',
        POST: 'post',
        PUT: 'put',
        DELETE: 'delete'
    },
    clarifiers: {
        CATEGORY_TYPE: 'category',
        TAG_TYPE: 'tag',
        COLLECTION_TYPE: 'collection'
    }
};
