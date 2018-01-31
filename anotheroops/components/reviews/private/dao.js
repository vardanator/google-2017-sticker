const AppSettings = require('./../../settings/service');

const dbconnection = require('./../../core/dbconnection');
const BaseDAO = require('./../../core/base-dao');

require('./model')(AppSettings);

class ReviewsDAO extends BaseDAO {

    constructor() {
        super(dbconnection.model('reviews'));
    }

}

module.exports = new ReviewsDAO();
