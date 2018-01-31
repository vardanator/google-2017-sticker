const CoreValidator = require('./../../core/validator');
const AppConstants = require('./../../settings/constants');
const UnitSettings = require('./../../settings/service').units;
const UsersSettings = require('./../../settings/service').users;

const ValidationErrors = {

};

const Rules = {
    unit_type: {
        field_name: 'unit_type',
        type: CoreValidator.Types.ENUM,
        enum: UnitSettings.unit_types,
        default: UnitSettings.unit_types[0]
    },
    name_en: {
        field_name: 'name_en',
        type: CoreValidator.Types.STRING,
        minlength: UnitSettings.name_minlength,
        maxlength: UnitSettings.name_maxlength
    },
    name_ru: {
        field_name: 'name_ru',
        type: CoreValidator.Types.STRING,
        minlength: UnitSettings.name_minlength,
        maxlength: UnitSettings.name_maxlength
    },
    name_am: {
        field_name: 'name_am',
        type: CoreValidator.Types.STRING,
        minlength: UnitSettings.name_minlength,
        maxlength: UnitSettings.name_maxlength
    },
    description_en: {
        field_name: 'description_en',
        type: CoreValidator.Types.STRING,
        minlength: UnitSettings.description_minlength,
        maxlength: UnitSettings.description_maxlength
    },
    description_ru: {
        field_name: 'description_ru',
        type: CoreValidator.Types.STRING,
        minlength: UnitSettings.description_minlength,
        maxlength: UnitSettings.description_maxlength
    },
    description_am: {
        field_name: 'description_am',
        type: CoreValidator.Types.STRING,
        minlength: UnitSettings.description_minlength,
        maxlength: UnitSettings.description_maxlength
    },
    about_en: {
        field_name: 'about_en',
        type: CoreValidator.Types.STRING,
        minlength: UnitSettings.about_minlength,
        maxlength: UnitSettings.about_maxlength
    },
    about_ru: {
        field_name: 'about_ru',
        type: CoreValidator.Types.STRING,
        minlength: UnitSettings.about_minlength,
        maxlength: UnitSettings.about_maxlength
    },
    about_am: {
        field_name: 'about_am',
        type: CoreValidator.Types.STRING,
        minlength: UnitSettings.about_minlength,
        maxlength: UnitSettings.about_maxlength
    },
    address_country_en: {
        field_name: 'address_country_en',
        type: CoreValidator.Types.ENUM,
        enum: UnitSettings.countries.en,
        default: UnitSettings.countries.en[0]
    },
    address_country_ru: {
        field_name: 'address_country_ru',
        type: CoreValidator.Types.ENUM,
        enum: UnitSettings.countries.ru,
        default: UnitSettings.countries.ru[0]
    },
    address_country_am: {
        field_name: 'address_country_am',
        type: CoreValidator.Types.ENUM,
        enum: UnitSettings.countries.am,
        default: UnitSettings.countries.am[0]
    },
    address_state_en: {
        field_name: 'address_state_en',
        type: CoreValidator.Types.ENUM,
        enum: UnitSettings.states.en,
        default: UnitSettings.states.en[0]
    },
    address_state_ru: {
        field_name: 'address_state_ru',
        type: CoreValidator.Types.ENUM,
        enum: UnitSettings.states.ru,
        default: UnitSettings.states.ru[0]
    },
    address_state_am: {
        field_name: 'address_state_am',
        type: CoreValidator.Types.ENUM,
        enum: UnitSettings.states.am,
        default: UnitSettings.states.am[0]
    },
    address_city_en: {
        field_name: 'address_city_en',
        type: CoreValidator.Types.ENUM,
        enum: UnitSettings.cities.en,
        default: UnitSettings.cities.en[0]
    },
    address_city_ru: {
        field_name: 'address_city_ru',
        type: CoreValidator.Types.ENUM,
        enum: UnitSettings.cities.ru,
        default: UnitSettings.cities.ru[0]
    },
    address_city_am: {
        field_name: 'address_city_am',
        type: CoreValidator.Types.ENUM,
        enum: UnitSettings.cities.am,
        default: UnitSettings.cities.am[0]
    },
    address_street_en: {
        field_name: 'address_street_en',
        type: CoreValidator.Types.STRING,
        maxlength: UnitSettings.street_maxlength
    },
    address_street_ru: {
        field_name: 'address_street_ru',
        type: CoreValidator.Types.STRING,
        maxlength: UnitSettings.street_maxlength
    },
    address_street_am: {
        field_name: 'address_street_am',
        type: CoreValidator.Types.STRING,
        maxlength: UnitSettings.street_maxlength
    },
    address_zip: {
        field_name: 'address_zip',
        type: CoreValidator.Types.STRING,
        maxlength: UnitSettings.zip_maxlength
    },
    address_lon: {
        field_name: 'address_lon',
        type: CoreValidator.Types.COORD_LONGITUDE
    },
    address_lat: {
        field_name: 'address_lat',
        type: CoreValidator.Types.COORD_LATITUDE
    },
    address_more_info_en: {
        field_name: 'address_more_info_en',
        type: CoreValidator.Types.STRING,
        maxlength: UnitSettings.description_maxlength
    },
    address_more_info_ru: {
        field_name: 'address_more_info_ru',
        type: CoreValidator.Types.STRING,
        maxlength: UnitSettings.description_maxlength
    },
    address_more_info_am: {
        field_name: 'address_more_info_am',
        type: CoreValidator.Types.STRING,
        maxlength: UnitSettings.description_maxlength
    },
    is_branch: {
        field_name: 'is_branch',
        type: CoreValidator.Types.BOOLEAN
    },
    parent_id: {
        field_name: 'parent_id',
        type: CoreValidator.Types.STRING
    },
    top: {
        field_name: 'top',
        type: CoreValidator.Types.BOOLEAN
    },
    recent: {
        field_name: 'recent',
        type: CoreValidator.Types.BOOLEAN
    },
    contact_phone: {
        field_name: 'contact_phone',
        type: CoreValidator.Types.STRING,
        maxlength: UnitSettings.phone_maxlength
    },
    contact_email: {
        field_name: 'contact_email',
        type: CoreValidator.Types.EMAIL
    },
    contact_website: {
        field_name: 'contact_website',
        type: CoreValidator.Types.URL
    },
    contact_person_username: {
        field_name: 'contact_person_username',
        type: CoreValidator.Types.STRING,
        minlength: UsersSettings.username_minlength,
        maxlength: UsersSettings.username_maxlength
    },
    contact_person_name_en: {
        field_name: 'contact_person_name_en',
        type: CoreValidator.Types.STRING,
        minlength: UsersSettings.name_minlength,
        maxlength: UsersSettings.name_maxlength
    },
    contact_person_name_ru: {
        field_name: 'contact_person_name_ru',
        type: CoreValidator.Types.STRING,
        minlength: UsersSettings.name_minlength,
        maxlength: UsersSettings.name_maxlength
    },
    contact_person_name_am: {
        field_name: 'contact_person_name_am',
        type: CoreValidator.Types.STRING,
        minlength: UsersSettings.name_minlength,
        maxlength: UsersSettings.name_maxlength
    },
    contact_person_title_en: {
        field_name: 'contact_person_title_en',
        type: CoreValidator.Types.STRING,
        maxlength: UsersSettings.name_maxlength
    },
    contact_person_title_ru: {
        field_name: 'contact_person_title_en',
        type: CoreValidator.Types.STRING,
        maxlength: UsersSettings.name_maxlength
    },
    contact_person_title_am: {
        field_name: 'contact_person_title_en',
        type: CoreValidator.Types.STRING,
        maxlength: UsersSettings.name_maxlength
    },
    contact_person_phone: {
        field_name: 'contact_person_phone',
        type: CoreValidator.Types.STRNIG,
        maxlength: UnitSettings.phone_maxlength
    },
    contact_person_email: {
        field_name: 'contact_person_email',
        type: CoreValidator.Types.EMAIL
    },
    contact_person_website: {
        field_name: 'contact_person_website',
        type: CoreValidator.Types.URL
    },
    is_open24: {
        field_name: 'is_open24',
        type: CoreValidator.Types.BOOLEAN
    },
    working_hours_mon_start: {
        field_name: 'working_hours_mon_start',
        type: CoreValidator.Types.HOUR
    },
    working_hours_mon_end: {
        field_name: 'working_hours_mon_end',
        type: CoreValidator.Types.HOUR
    },
    working_hours_tue_start: {
        field_name: 'working_hours_tue_start',
        type: CoreValidator.Types.HOUR
    },
    working_hours_tue_end: {
        field_name: 'working_hours_tue_end',
        type: CoreValidator.Types.HOUR
    },
    working_hours_wed_start: {
        field_name: 'working_hours_wed_start',
        type: CoreValidator.Types.HOUR
    },
    working_hours_wed_end: {
        field_name: 'working_hours_wed_end',
        type: CoreValidator.Types.HOUR
    },
    working_hours_thu_start: {
        field_name: 'working_hours_thu_start',
        type: CoreValidator.Types.HOUR
    },
    working_hours_thu_end: {
        field_name: 'working_hours_thu_end',
        type: CoreValidator.Types.HOUR
    },
    working_hours_fri_start: {
        field_name: 'working_hours_fri_start',
        type: CoreValidator.Types.HOUR
    },
    working_hours_fri_end: {
        field_name: 'working_hours_fri_end',
        type: CoreValidator.Types.HOUR
    },
    working_hours_sat_start: {
        field_name: 'working_hours_sat_start',
        type: CoreValidator.Types.HOUR
    },
    working_hours_sat_end: {
        field_name: 'working_hours_sat_end',
        type: CoreValidator.Types.HOUR
    },
    working_hours_sun_start: {
        field_name: 'working_hours_sun_start',
        type: CoreValidator.Types.HOUR
    },
    working_hours_sun_end: {
        field_name: 'working_hours_sun_end',
        type: CoreValidator.Types.HOUR
    },
    products_naming_en: {
        field_name: 'products_naming_en',
        type: CoreValidator.Types.ENUM,
        enum: UnitSettings.products_naming_values.en
    },
    products_naming_ru: {
        field_name: 'products_naming_ru',
        type: CoreValidator.Types.ENUM,
        enum: UnitSettings.products_naming_values.ru
    },
    products_naming_am: {
        field_name: 'products_naming_am',
        type: CoreValidator.Types.ENUM,
        enum: UnitSettings.products_naming_values.am
    },
    founded: {
        field_name: 'founded',
        type: CoreValidator.Types.DATE
    },
    is_active: {
        field_name: 'is_active',
        type: CoreValidator.Types.BOOLEAN
    },
    price: {
        field_name: 'price',
        type: CoreValidator.Types.INTEGER,
        minlength: UnitSettings.price_minlength,
        maxlength: UnitSettings.price_maxlength
    }
};

class UnitsValidator extends CoreValidator {
    constructor() {
        super(Rules);
    }
}

module.exports = new UnitsValidator();
module.exports.Errors = ValidationErrors;
