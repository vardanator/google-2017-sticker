const AppConstants = require('./../../settings/constants');
const AppConfigs = require('./../../settings/configs');

class SearchResponse {

    static generateResponse(data, requester) {
        return (data || []).getOnly(
            'word', 'documents'
        );
    }

}

module.exports = SearchResponse;
