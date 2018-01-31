const AppConstants = require('./../../settings/constants');
const AppConfigs = require('./../../settings/configs');
const AppSettings = require('./../../settings/service');

class ReviewsResponse {

    static generateResponse(reviews, requester, lang) {
        if (!reviews) return null;
        if (!requester || !requester.id || !requester.role) {
            return ReviewsResponse.generateRegularResponse(reviews, lang);
        }
        if (AppConstants.AccessLevel[(requester.role || '').toUpperCase()] >= AppConstants.AccessLevel.ADMIN) {
            return ReviewsResponse.generateAdminResponse(reviews, requester);
        }
        if (AppConstants.AccessLevel[(requester.role || '').toUpperCase()] >= AppConstants.AccessLevel.USER) {
            return ReviewsResponse.generatePOVResponse(reviews, requester);
        }
        return ReviewsResponse.generateRegularResponse(reviews, lang);
    }

    static generateRegularResponse(reviews, lang) {
        lang = lang || AppConstants.language_values[0];
        return reviews.getOnly(
            function id() { return this._id; },
            'user', 'text', 'rating',
            function up_votes() { return (this.up_votes || []).length; },
            function down_votes() { return (this.down_votes || []).length; },
            function is_edited() { return this.edits.is_edited; },
            function edited_date() { return this.edits.date; },
            function created() { return this.metadata.created; },
            function first_version() { return this.edits.first_version; },
            function unit() {
                if (!this.unit) return undefined;
                return this.unit.getOnly(
                    function id() { return this._id; },
                    function name() { return this.name ? this.name[lang] : undefined; },
                    function photo() {
                        if (!this.photo) return AppSettings.units.default_photo_url;
                        return AppConfigs.DOMAIN + AppConfigs.CDN_PREFIX + this.photo;
                    }
                );
            }
        );
    }

    static generateAdminResponse(reviews, requester) {
        let lang = requester.settings.language || AppConstants.language_values[0];
        return reviews.getOnly(
            function id() { return this._id; },
            'user', 'text', 'rating',
            function up_votes() { return (this.up_votes || []).length; },
            function up_voted_users() { return this.up_votes; },
            function down_votes() { return (this.down_votes || []).length; },
            function down_voted_users() { return this.down_votes; },
            function reports() { return this.reports; },
            function is_edited() { return this.edits.is_edited; },
            function edited_date() { return this.edits.date; },
            function created() { return this.metadata.created; },
            function first_version() { return this.edits.first_version; },
            function edits() { return this.edits; },
            function metadata() { return this.metadata; },
            function unit() {
                if (!this.unit) return undefined;
                return this.unit.getOnly(
                    function id() { return this._id; },
                    function name() { return this.name ? this.name[lang] : undefined; },
                    function photo() {
                        if (!this.photo) return AppSettings.units.default_photo_url;
                        return AppConfigs.DOMAIN + AppConfigs.CDN_PREFIX + this.photo;
                    }
                );
            }
        );
    }

    static generatePOVResponse(reviews, requester) {
        let lang = requester.settings.language || AppConstants.language_values[0];
        return reviews.getOnly(
            function id() { return this._id; },
            'user', 'text', 'rating',
            function up_votes() { return (this.up_votes || []).length; },
            function me_upvoted() { return (this.up_votes || []).includes(requester.id); },
            function down_votes() { return (this.down_votes || []).length; },
            function me_downvoted() { return (this.down_votes || []).includes(requester.id); },
            function is_edited() { return this.edits.is_edited; },
            function edited_date() { return this.edits.date; },
            function created() { return this.metadata.created; },
            function first_version() { return this.edits.first_version; },
            function unit() {
                if (!this.unit) return undefined;
                return this.unit.getOnly(
                    function id() { return this._id; },
                    function name() { return this.name ? this.name[lang] : undefined; },
                    function photo() {
                        if (!this.photo) return AppSettings.units.default_photo_url;
                        return AppConfigs.DOMAIN + AppConfigs.CDN_PREFIX + this.photo;
                    }
                );
            }
        );
    }

}

module.exports = ReviewsResponse;
