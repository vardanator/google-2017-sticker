const AppSettings = require('./../../settings/service');

const dbconnection = require('./../../core/dbconnection');
const BaseDAO = require('./../../core/base-dao');

require('./model')(AppSettings);

class CollectionsDAO extends BaseDAO {

    constructor() {
        super(dbconnection.model('collections'));
    }

}

module.exports = new CollectionsDAO();
