const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AppConstants = require('./../../settings/constants');

module.exports = (AppSettings, DataValidator) => {
    let AiSchema = new Schema({
        user: {
            type: Schema.ObjectId,
            ref: 'users',
            index: {unique: true}
        },
        interested_groups: [{
            group_id: { type: Schema.ObjectId, ref: 'groups' },
            weight: Number,
            increase: Number // -/+ percentage since last value
        }],
        interested_categories: [{
            category_id: { type: Schema.ObjectId, ref: 'categories' },
            weight: Number,
            increase: Number
        }],
        most_actions_by_groups: [{
            group_id: { type: Schema.ObjectId, ref: 'groups' },
            action: { type: String, enum: AppConstants.user_actions, index: true },
            order: Number,
            daytime: { type: String, enum: AppConstants.daytimes }
        }],
        most_actions_by_categories: [{
            category_id: { type: Schema.ObjectId, ref: 'categories' },
            action: { type: String, enum: AppConstants.user_actions, index: true },
            order: Number,
            daytime: { type: String, enum: AppConstants.daytimes }
        }],
        most_actions_by_businesses: [{
            business_id: { type: Schema.ObjectId, ref: 'businesses' },
            actionaction: { type: String, enum: AppConstants.user_actions, index: true },
            order: Number,
            daytime: { type: String, enum: AppConstants.daytimes }
        }],
        app_mostly_used: {
            daytimes: [{
                name: {type: String, enum: AppConstants.daytimes }
                order: Number
            }],
            user_actions: [{
                action: { type: String, enum: AppConstants.user_actions },
                order: Number
            }],
            app_actions: [{
                action: { type: String, enum: AppConstants.app_actions },
                order: Number
            }]
        },
        is_tourist: { type: Number, default: 0 },
        most_used_language: {
            language: { type: String, enum: AppConstants.languages },
            actions: { type: String, enum: AppConstants.user_actions },
            order: Number
        },
        most_visited_profiles: [{
            user_id: { type: Schema.ObjectId, ref: 'users' },
            daytime: { type: String, enum: AppConstants.daytimes },
            timing: Number,
            order: Number,
            actions: [{ type: String, enum: AppConstants.user_actions }]
        }],
        actions_before_like: [{
            action: String,
            order: Number,
            location: {
                latitude: { type: Number, min: -90, max: 90, validator: DataValidator.isFloat },
                longitude: { type: Number, min: -180, max: 180, validator: DataValidator.isFloat }
            }
        }]
    });
}
