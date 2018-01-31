const AppConstants = require('./../../settings/constants');
const AppConfigs = require('./../../settings/configs');
const UsersSettings = require('./../../settings/service').users;

class ActivityResponse {

    static generateResponse(activity, requester) {
        let lang = requester.settings
                ? requester.settings.language || AppConstants.language_values[0]
                : AppConstants.language_values[0];
        if (!activity) return null;
        return (activity || []).getOnly(
            function user() {
                return ActivityResponse.generateSimpleUser(this.user);
            },
            'info', 'action', 'created', 'item', 'target_id'
        );
    }

    static generateSimpleUser(user) {
        if (!user) return undefined;
        return user.getOnly(
            function id() {
                return this._id;
            }, 'username', 'name',
            function avatar() {
                if (!this.avatar) return UsersSettings.default_avatar_url;
                return AppConfigs.DOMAIN + AppConfigs.CDN_PREFIX + this.avatar;
            }
        );
    }

    static generateUnitData(unit, lang) {
        if (!unit) return undefined;
        return unit.getOnly(
            function id() {
                return this._id;
            },
            function name() {
                return this.name[lang];
            },
            function photo() {
                if (!this.photo) return undefined;
                return AppConfigs.DOMAIN + AppConfigs.CDN_PREFIX + this.photo;
            }
        );
    }

    static generateReviewData(review) {
        if (!review) return undefined;
        return review.getOnly(
            function id() {
                return this._id;
            },
            'rating', 'text'
        );
    }

}

module.exports = ActivityResponse;
