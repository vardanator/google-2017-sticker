const Utility = require('./../utility/service');
const ResponseErrors = require('./../response/errors');
const AppConstants = require('./../settings/constants');
const SystemEvents = require('./../system-events/service');

const SearchDAO = require('./private/dao');
const SearchValidator = require('./private/validator');
const SearchValidator = require('./private/response');

class SearchService {

    search(q, options) {
        return new Promise((resolve, reject) => {
            options = options || {};

            q = SearchValidator.sanitizeQueryString(q);
            //SearchDAO.fetchOne({})
        });
    }

}

module.exports = SearchService;
