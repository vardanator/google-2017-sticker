const AppSettings = require('./../../settings/service');

const dbconnection = require('./../../core/dbconnection');
const BaseDAO = require('./../../core/base-dao');

require('./model')(AppSettings);

class ActivityDAO extends BaseDAO {

    constructor() {
        super(dbconnection.model('activity'));
    }

}

module.exports = new ActivityDAO();
