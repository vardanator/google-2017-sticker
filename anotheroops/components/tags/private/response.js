const AppConstants = require('./../../settings/constants');
const AppConfigs = require('./../../settings/configs');

class TagsResponse {

    static generateResponse(tags, requester, lang) {
        if (!tags) return null;
        if (!requester || !requester.id || !requester.role) {
            return TagsResponse.generateRegularResponse(tags, lang);
        }
        if (AppConstants.AccessLevel[(requester.role || '').toUpperCase()] >= AppConstants.AccessLevel.ADMIN) {
            return TagsResponse.generateAdminResponse(tags, requester);
        }
        if (AppConstants.AccessLevel[(requester.role || '').toUpperCase()] >= AppConstants.AccessLevel.USER) {
            return TagsResponse.generatePOVResponse(tags, requester);
        }
        return TagsResponse.generateRegularResponse(tags, lang);
    }

    static generateRegularResponse(tags, lang) {
        lang = lang || AppConstants.language_values[0];
        return tags.getOnly(
            function id() { return this._id; },
            function value() { return this.value[lang] || this.value.en; },
            'global_weight', 'is_tag', 'is_keyword', 'is_feature'
        );
    }

    static generateAdminResponse(tags, requester) {
        let lang = requester.settings.language || AppConstants.language_values[0];
        return tags.getOnly(
            function id() { return this._id; },
            function value() { return this.value[lang] || this.value.en; },
            function value_en() { return this.value.en; },
            function value_ru() { return this.value.ru; },
            function value_am() { return this.value.am; },
            'global_weight', 'is_tag', 'is_keyword', 'is_feature'
        );
    }

    static generatePOVResponse(tags, requester) {
        let lang = requester.settings.language || AppConstants.language_values[0];
        return tags.getOnly(
            function id() { return this._id; },
            function value() { return this.value[lang] || this.value.en; },
            'global_weight', 'is_tag', 'is_keyword', 'is_feature'
        );
    }

}

module.exports = TagsResponse;
