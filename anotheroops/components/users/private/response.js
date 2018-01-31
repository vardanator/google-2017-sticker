const AppConstants = require('./../../settings/constants');
const AppConfigs = require('./../../settings/configs');
const UsersSettings = require('./../../settings/service').users;

class UserResponse {

    static generateResponse(users, requester) {
        if (!users) return null;
        if (!requester || !requester.id || !requester.role) {
            return UserResponse.generateRegularResponse(users);
        }
        if (!Array.isArray(users) && users._id == requester.id.toString()) {
            return UserResponse.generateSelfResponse(users);
        }
        if (AppConstants.AccessLevel[(requester.role || '').toUpperCase()] >= AppConstants.AccessLevel.ADMIN) {
            return UserResponse.generateAdminResponse(users);
        }
        if (AppConstants.AccessLevel[(requester.role || '').toUpperCase()] >= AppConstants.AccessLevel.USER) {
            return UserResponse.generatePOVResponse(users, requester);
        }
        return UserResponse.generateRegularResponse(users);
    }

    static generateRegularResponse(users) {
        return users.getOnly(
            function id() { return this._id; },
            function avatar() {
                if (!this.avatar) return UsersSettings.default_avatar_url;
                return AppConfigs.DOMAIN + AppConfigs.CDN_PREFIX + this.avatar;
            },
            function cover() {
                if (!this.cover) return UsersSettings.default_cover_url;
                return AppConfigs.DOMAIN + AppConfigs.CDN_PREFIX + this.cover;
            },
            'username', 'name', 'gender',
            'verified', 'points', 'badges', 'featured', 'top',
            'checkins', 'photos',
            function is_unknown() { return this.unknown.is_unknown; },
            function visited_places() { return this.activity ? (this.activity.recent_views || []).length : 0; }
        );
    }

    static generateSelfResponse(users) {
        return users.getOnly(
            function id() { return this._id; },
            'key', 'username', 'name', 'email', 'email_confirmed',
            function avatar() {
                if (!this.avatar) return UsersSettings.default_avatar_url;
                return AppConfigs.DOMAIN + AppConfigs.CDN_PREFIX + this.avatar;
            },
            function cover() {
                if (!this.cover) return UsersSettings.default_cover_url;
                return AppConfigs.DOMAIN + AppConfigs.CDN_PREFIX + this.cover;
            },
            'gender', 'birthday', 'verified',
            'points', 'badges', 'social', 'activity',
            'settings', 'featured', 'top',
            function is_unknown() { return this.unknown.is_unknown; },
            'phone', 'checkins', 'photos', 'bookmarks', 'following',
            'followers', 'blocks',
            function visited_places() { return this.activity ? (this.activity.recent_views || []).length : 0; }
        );
    }

    // POV = Point of View, e.g. get user data for other user
    static generatePOVResponse(users, pov_user) {
        return users.getOnly(
            function id() { return this._id; },
            'username', 'name',
            function avatar() {
                if (!this.avatar) return UsersSettings.default_avatar_url;
                return AppConfigs.DOMAIN + AppConfigs.CDN_PREFIX + this.avatar;
            },
            function cover() {
                if (!this.cover) return UsersSettings.default_cover_url;
                return AppConfigs.DOMAIN + AppConfigs.CDN_PREFIX + this.cover;
            },
            'verified', 'points', 'badges', 'featured', 'top',
            'checkins', 'photos', 'gender',
            function is_unknown() { return this.unknown ? this.unknown.is_unknown : undefined; },
            function is_follow() { return pov_user ? (pov_user.following || []).includes(this._id) : false; },
            function is_block() { return pov_user ? (pov_user.blocks || []).includes(this._id) : false; },
            function visited_places() { return this.activity ? (this.activity.recent_views || []).length : 0; }
        );
    }

    static generateAdminResponse(users) {
        return users.getOnly(
            function id() { return this._id; },
            'key', 'username', 'name', 'email', 'email_confirmed',
            function avatar() {
                if (!this.avatar) return UsersSettings.default_avatar_url;
                return AppConfigs.DOMAIN + AppConfigs.CDN_PREFIX + this.avatar;
            },
            function cover() {
                if (!this.cover) return UsersSettings.default_cover_url;
                return AppConfigs.DOMAIN + AppConfigs.CDN_PREFIX + this.cover;
            },
            'gender', 'birthday', 'verified',
            'points', 'badges', 'social', 'activity',
            'settings', 'featured', 'top',
            function is_unknown() { return this.unknown ? this.unknown.is_unknown : false; },
            'phone', 'checkins', 'photos', 'bookmarks', 'following',
            'followers', 'blocks', 'internal', 'metadata',
            function visited_places() { return this.activity ? (this.activity.recent_views || []).length : 0; }
        );
    }

}

module.exports = UserResponse;
