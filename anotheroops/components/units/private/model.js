const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AppConstants = require('./../../settings/constants');

module.exports = (AppSettings, DataValidator) => {

    const UnitSettings = AppSettings.units;
    const GenSettings = AppSettings.general;
    const UsersSettings = AppSettings.users;

    let AddressSchema = new Schema({
        country: {
            en: {type: String, default: UnitSettings.countries.en[0], enum: UnitSettings.countries.en},
            ru: {type: String, default: UnitSettings.countries.ru[0], enum: UnitSettings.countries.ru},
            am: {type: String, default: UnitSettings.countries.am[0], enum: UnitSettings.countries.am}
        },
        state: {
            en: {type: String, default: UnitSettings.states.en[0], enum: UnitSettings.states.en},
            ru: {type: String, default: UnitSettings.states.ru[0], enum: UnitSettings.states.ru},
            am: {type: String, default: UnitSettings.states.am[0], enum: UnitSettings.states.am}
        },
        city: {
            en: {type: String, default: UnitSettings.cities.en[0], enum: UnitSettings.cities.en},
            ru: {type: String, default: UnitSettings.cities.ru[0], enum: UnitSettings.cities.ru},
            am: {type: String, default: UnitSettings.cities.am[0], enum: UnitSettings.cities.am}
        },
        street: {
            en: {type: String, index: true, maxlength: UnitSettings.street_maxlength, trim: true},
            ru: {type: String, index: true, maxlength: UnitSettings.street_maxlength, trim: true},
            am: {type: String, index: true, maxlength: UnitSettings.street_maxlength, trim: true}
        },
        zip: { type: String, default: null, maxlength: UnitSettings.zip_maxlength, trim: true },
        location: {
            type: {type: String},
            coordinates: [Number]
        },
        more_info: {
            en: {type: String, maxlength: UnitSettings.more_info_maxlength},
            ru: {type: String, maxlength: UnitSettings.more_info_maxlength},
            am: {type: String, maxlength: UnitSettings.more_info_maxlength}
        }
    });

    AddressSchema.index({'location': '2dsphere'});

    let PersonSchema = new Schema({
        username: {type: String, ref: 'users', lowercase: true,
            trim: true,
            minlength: UsersSettings.username_minlength,
            maxlength: UsersSettings.username_maxlength
        },
        name: {
            en: {
                type: String,
                trim: true,
                minlength: UsersSettings.name_minlength,
                maxlength: UsersSettings.name_maxlength
            },
            ru: {
                type: String,
                trim: true,
                minlength: UsersSettings.name_minlength,
                maxlength: UsersSettings.name_maxlength
            },
            am: {
                type: String,
                trim: true,
                minlength: UsersSettings.name_minlength,
                maxlength: UsersSettings.name_maxlength
            }
        },
        title: {
            en: {type: String, maxlength: UsersSettings.name_maxlength, trim: true},
            ru: {type: String, maxlength: UsersSettings.name_maxlength, trim: true},
            am: {type: String, maxlength: UsersSettings.name_maxlength, trim: true}
        },
        phone: {type: String, maxlength: UnitSettings.phone_maxlength, trim: true},
        email: {
            type: String,
            trim: true,
            lowercase: true,
            maxlength: GenSettings.email_maxlength,
            validate: DataValidator.isEmail
        },
        website: {type: String, maxlength: GenSettings.url_maxlength, trim: true}
    });

    let HoursSchema = new Schema({
        start: {
            type: Number,
            minlength: UnitSettings.working_hour_min_value,
            maxlength: UnitSettings.working_hour_max_value
        },
        end: {
            type: Number,
            minlength: UnitSettings.working_hour_min_value,
            maxlength: UnitSettings.working_hour_max_value
        }
    });

    let UnitsSchema = new Schema({
        user: {type: Schema.ObjectId, ref: 'users'},
        migration_id: String, // remove later
        unit_type: {
            type: String,
            enum: UnitSettings.unit_types,
            default: 'business',
            index: true
        },
        name: {
            en: {
                type: String,
                maxlength: UnitSettings.name_maxlength,
                minlength: UnitSettings.name_minlength,
                trim: true,
                index: true
            },
            ru: {
                type: String,
                maxlength: UnitSettings.name_maxlength,
                minlength: UnitSettings.name_minlength,
                trim: true,
                index: true
            },
            am: {
                type: String,
                maxlength: UnitSettings.name_maxlength,
                minlength: UnitSettings.name_minlength,
                trim: true,
                index: true
            }
        },
        description: {
            en: {
                type: String,
                maxlength: UnitSettings.description_maxlength,
                minlength: UnitSettings.description_minlength,
                trim: true
            },
            ru: {
                type: String,
                maxlength: UnitSettings.description_maxlength,
                minlength: UnitSettings.description_minlength,
                trim: true
            },
            am: {
                type: String,
                maxlength: UnitSettings.description_maxlength,
                minlength: UnitSettings.description_minlength,
                trim: true
            }
        },
        about: {
            en: {
                type: String,
                maxlength: UnitSettings.about_maxlength,
                minlength: UnitSettings.about_minlength,
                trim: true
            },
            ru: {
                type: String,
                maxlength: UnitSettings.about_maxlength,
                minlength: UnitSettings.about_minlength,
                trim: true
            },
            am: {
                type: String,
                maxlength: UnitSettings.about_maxlength,
                minlength: UnitSettings.about_minlength,
                trim: true
            }
        },
        address: AddressSchema,
        is_branch: {type: Boolean, index: true, default: false},
        parent_id: {type: Schema.ObjectId, ref: 'units', index: true},
        branches: [
            {type: Schema.ObjectId, ref: 'units'}
        ],
        /*
        TODO: currently ignoring
        groups: [
            {type: Schema.ObjectId, ref: 'groups', index: true}
        ],
        */
        categories: [
            {type: Schema.ObjectId, ref: 'categories', index: true}
        ],
        top: Boolean,
        recent: Boolean,
        contact: {
            phone: {type: String, maxlength: UnitSettings.phone_maxlength, trim: true},
            phones: [{
                type: String, maxlength: UnitSettings.phone_maxlength, trim: true
            }],
            email: {
                type: String,
                trim: true,
                lowercase: true,
                maxlength: GenSettings.email_maxlength,
                validate: DataValidator.isEmail
            },
            website: {type: String, maxlength: GenSettings.url_maxlength, trim: true},
            contact_person: {type: PersonSchema, default: null}
        },
        photo: {type: Schema.ObjectId, ref: 'photos'},
        cover: {type: Schema.ObjectId, ref: 'photos'},
        is_open24: {type: Boolean, default: false},
        working_hours: {
            mon: HoursSchema,
            tue: HoursSchema,
            wed: HoursSchema,
            thu: HoursSchema,
            fri: HoursSchema,
            sat: HoursSchema,
            sun: HoursSchema
        },
        price: {
            type: Number,
            minlength: UnitSettings.price_minlength,
            maxlength: UnitSettings.price_maxlength,
            default: null
        },
        features: [
            {type: Schema.ObjectId, ref: 'tags', index: true}
        ],
        photos: [{type: Schema.ObjectId, ref: 'photos' }],
        user_photos: [{type: Schema.ObjectId, ref: 'photos' }],
        products_naming: {
            en: {type: String, enum: UnitSettings.products_naming_values.en},
            ru: {type: String, enum: UnitSettings.products_naming_values.ru},
            am: {type: String, enum: UnitSettings.products_naming_values.am}
        },
        products: [{
            type: Schema.ObjectId, ref: 'products', index: true
        }],
        founded: {type: Date, default: null},
        tags: [
            {type: Schema.ObjectId, ref: 'tags', index: true}
        ],
        keywords: [
            {type: Schema.ObjectId, ref: 'tags', index: true}
        ],
        reviews: [
            {type: Schema.ObjectId, ref: 'reviews', index: true}
        ],
        stats: {
            views_count: {type: Number, default: 0},
            reviews_count: {type: Number, default: 0},
            review_rating: { type: Number, default: 0.0, index: true },
            searched_count: {type: Number, default: 0},
            five_stars: {type: Number, default: 0},
            four_stars: {type: Number, default: 0},
            three_stars: {type: Number, default: 0},
            two_stars: {type: Number, default: 0},
            one_stars: {type: Number, default: 0},
            photos_clicked: {type: Number, default: 0},
            subscriptions_count: {type: Number, default: 0},
            likes_count: {type: Number, default: 0},
            total_weight: { type: Number, index: true },
        },
        internal: {
            rank: Number,
            notes: [String]
        },
        is_active: {type: Boolean, default: true},
        metadata: {
            created: {type: Date, default: Date.now},
            updated: {type: Date, default: Date.now},
            updated_by: {type: Schema.ObjectId, ref: 'users'}
        }
    });

    UnitsSchema.index({
        'stats.views_count': -1,
        'stats.searched_count': -1,
        'stats.reviews_count': -1,
        'stats.five_stars': -1,
        'stats.likes_count': -1,
        'stats.subscriptions_count': -1,
        'stats.photos_clicked': -1,
        'stats.four_stars': -1
    });


    return mongoose.model('units', UnitsSchema);

}
