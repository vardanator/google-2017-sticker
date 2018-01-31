const AppConstants = require('./../../settings/constants');
const AppConfigs = require('./../../settings/configs');

class GroupsResponse {

    static generateResponse(groups, requester) {
        if (!groups) return null;
        if (!requester || !requester.id || !requester.role) {
            return GroupsResponse.generateRegularResponse(groups);
        }
        if (AppConstants.AccessLevel[(requester.role || '').toUpperCase()] >= AppConstants.AccessLevel.ADMIN) {
            return GroupsResponse.generateAdminResponse(groups, requester);
        }
        if (AppConstants.AccessLevel[(requester.role || '').toUpperCase()] >= AppConstants.AccessLevel.USER) {
            return GroupsResponse.generatePOVResponse(groups, requester);
        }
        return GroupsResponse.generateRegularResponse(groups);
    }

    static generateRegularResponse(groups) {
        return groups.getOnly(
            function id() { return this._id; },
            function title() { return this.title.en; },
            function photo() {
                if (!this.photo) return undefined;
                return AppConfigs.DOMAIN + AppConfigs.CDN_PREFIX + this.photo;
            },
            'icon_name', 'is_primary'
        );
    }

    static generateAdminResponse(groups, requester) {
        return groups.getOnly(
            function id() { return this._id; },
            function title() {
                return this.title[requester.settings.language || AppConstants.language_values[0]];
            },
            function title_en() { return this.title.en; },
            function title_ru() { return this.title.ru; },
            function title_am() { return this.title.am; },
            function photo() {
                if (!this.photo) return undefined;
                return AppConfigs.DOMAIN + AppConfigs.CDN_PREFIX + this.photo;
            },
            'icon_name', 'is_primary', 'categories', 'query_clarifiers', 'metadata'
        );
    }

    // TODO: possibly add some AI-specific moments
    static generatePOVResponse(groups, requester) {
        return groups.getOnly(
            function id() { return this._id; },
            function title() { return this.title[requester.settings.language || AppConstants.language_values[0]]; },
            function photo() {
                if (!this.photo) return undefined;
                return AppConfigs.DOMAIN + AppConfigs.CDN_PREFIX + this.photo;
            },
            'icon_name', 'is_primary'
        );
    }

}

module.exports = GroupsResponse;
