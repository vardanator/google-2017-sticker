const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const keygen = require('keygenerator');

const AppConstants = require('./../../settings/constants');

function generateAPIKey() {
    return (keygen._({ length: 2 }) + '-' + keygen._({ length: 6 })
        + '-' + keygen.number()
        + '-' + keygen._({ length: 6 })
        + '-' + keygen._({ length: 8 })).replace(/&/g, '');
}

module.exports = (AppSettings, UserValidator) => {
    const UsersSettings = AppSettings.users;
    const GenSettings = AppSettings.general;

    let UsersSchema = new Schema({
        key: {
            type: String,
            index: { unique: true },
            default: generateAPIKey
        },
        username: {
            type: String,
            index: { unique: true },
            lowercase: true,
            trim: true,
            minlength: UsersSettings.username_minlength,
            maxlength: UsersSettings.username_maxlength
        },
        password: {
            type: String,
            default: null,
            minlength: UsersSettings.password_minlength,
            maxlength: UsersSettings.password_maxlength
        },
        name: {
            type: String,
            trim: true,
            minlength: UsersSettings.name_minlength,
            maxlength: UsersSettings.name_maxlength
        },
        email: {
            type: String,
            trim: true,
            index: { unique: true, sparse: true },
            lowercase: true,
            maxlength: GenSettings.email_maxlength,
            validate: UserValidator.isEmail
        },
        email_confirmed: Boolean,
        phone: String,
        reviews: [
            {type: Schema.ObjectId, ref: 'reviews', index: true}
        ],
        checkins: [
            {type: Schema.ObjectId, ref: 'checkins', index: true}
        ],
        photos: [
            {type: Schema.ObjectId, ref: 'photos', index: true}
        ],
        bookmarks: [
            {type: Schema.ObjectId, ref: 'units', index: true}
        ],
        avatar: {type: Schema.ObjectId, ref: 'photos'},
        cover: {type: Schema.ObjectId, ref: 'photos'},
        gender: Boolean,
        birthday: Date,
        verified: { type: Boolean, default: false },
        points: { type: Number, default: 0 },
        badges: [String],
        role: { type: String, enum: AppConstants.user_roles, default: 'user' },
        social: {
            provider: { type: String, enum: AppConstants.social_providers },
            id: { type: String },
            token: { type: String, default: null, trim: true },
            url: { type: String, default: null, maxlength: GenSettings.url_maxlength, validator: UserValidator.isURL },
            email: { type: String, default: null, maxlength: GenSettings.email_maxlength, validator: UserValidator.isEmail },
            data: {}
        },
        blacklist: { type: Boolean, default: false },
        activity: {
            recent_views: [
                {type: Schema.ObjectId, ref: 'units'}
            ],
            recent_search: [String]
        },
        metadata: {
            created: { type: Date, default: Date.now },
            updated: { type: Date, default: Date.now },
            last_visit: { type: Date, default: Date.now },
            platform: {type: String, enum: AppConstants.platform_values},
            location: {
                ip: { type: String, validator: UserValidator.isIP },
                city: { type: String, maxlength: GenSettings.city_maxlength },
                country: { type: String, maxlength: GenSettings.country_maxlength },
                latitude: { type: Number, min: -90, max: 90, validator: UserValidator.isFloat },
                longitude: { type: Number, min: -180, max: 180, validator: UserValidator.isFloat }
            }
        },
        settings: {
            language: { type: String, enum: AppConstants.language_values, default: 'en' },
            currency: { type: String, enum: AppConstants.currency_values, default: 'AMD' },
            age_range: { type: String, enum: AppConstants.age_ranges, default: 'young' },
            interests: [{
                type: String, enum: AppConstants.user_interests
            }],
            push_notifications: {
                events: Boolean,
                business_activity: Boolean,
                following_activity: Boolean
            },
            email_notifications: {
                events: Boolean,
                business_activity: Boolean,
                following_activity: Boolean,
                helpin_announcements: Boolean
            }
        },
        temp_unknown_id: String,
        unknown: {
            is_unknown: { type: Boolean, default: false },
            real_social_profile: String,
            merged: { type: Boolean, default: false },
            previous_username: String
        },
        featured: { type: Boolean, default: false },
        top: { type: Boolean, default: false },
        following: [{
            type: Schema.ObjectId, ref: 'users'
        }],
        followers: [{
            type: Schema.ObjectId, ref: 'users'
        }],
        blocks: [{
            type: Schema.ObjectId, ref: 'users'
        }],
        internal: {
            rank: Number,
            notes: [String] // adding invisible notes from admin
        },
        tags: [
            {type: Schema.ObjectId, ref: 'tags', index: true}
        ]
    });

    UsersSchema.index({'social.provider' : 1, 'social.id': 1}, {unique: true, sparse: true});

    return mongoose.model('users', UsersSchema);
}
