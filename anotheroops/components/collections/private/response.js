const AppConstants = require('./../../settings/constants');
const AppConfigs = require('./../../settings/configs');

class CollectionsResponse {
    static generateResponse(collections) {
        return (collections || []).getOnly(
            function id() {return this._id; },
            'name',
            'units'
        );
    }
}

module.exports = CollectionsResponse;
