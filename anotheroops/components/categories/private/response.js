const AppConstants = require('./../../settings/constants');
const AppConfigs = require('./../../settings/configs');

class CategoriesResponse {

    static generateResponse(categories, requester) {
        if (!categories) return null;
        if (!requester || !requester.id || !requester.role) {
            return CategoriesResponse.generateRegularResponse(categories);
        }
        if (AppConstants.AccessLevel[(requester.role || '').toUpperCase()] >= AppConstants.AccessLevel.ADMIN) {
            return CategoriesResponse.generateAdminResponse(categories, requester);
        }
        if (AppConstants.AccessLevel[(requester.role || '').toUpperCase()] >= AppConstants.AccessLevel.USER) {
            return CategoriesResponse.generatePOVResponse(categories, requester);
        }
        return CategoriesResponse.generateRegularResponse(categories);
    }

    static generateRegularResponse(categories) {
        return categories.getOnly(
            function id() { return this._id; },
            function title() { return this.title.en; },
            function description() { return this.description.en; },
            function photo() {
                if (!this.photo) return undefined;
                return AppConfigs.DOMAIN + AppConfigs.CDN_PREFIX + this.photo;
            },
            'group_id'
        );
    }

    static generateAdminResponse(categories, requester) {
        return categories.getOnly(
            function id() { return this._id; },
            function title() {
                return this.title[requester.settings.language || AppConstants.language_values[0]];
            },
            function description() {
                return this.description[requester.settings.language || AppConstants.language_values[0]];
            },
            function photo() {
                if (!this.photo) return undefined;
                return AppConfigs.DOMAIN + AppConfigs.CDN_PREFIX + this.photo;
            },
            function title_en() { return this.title.en; },
            function title_ru() { return this.title.ru; },
            function title_am() { return this.title.am; },
            function description_en() { return this.description.en; },
            function description_ru() { return this.description.ru; },
            function description_am() { return this.description.am; },
            'group_id', 'metadata'
        );
    }

    static generatePOVResponse(categories, requester) {
        return categories.getOnly(
            function id() { return this._id; },
            function title() {
                return this.title[requester.settings.language || AppConstants.language_values[0]];
            },
            function description() {
                return this.description[requester.settings.language || AppConstants.language_values[0]];
            },
            function photo() {
                if (!this.photo) return undefined;
                return AppConfigs.DOMAIN + AppConfigs.CDN_PREFIX + this.photo;
            },
            'group_id'
        );
    }

}

module.exports = CategoriesResponse;
