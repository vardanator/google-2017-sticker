const AppSettings = require('./../../settings/service');

const dbconnection = require('./../../core/dbconnection');
const BaseDAO = require('./../../core/base-dao');

require('./model')(AppSettings);

class TagsDAO extends BaseDAO {

    constructor() {
        super(dbconnection.model('tags'));
    }

}

module.exports = new TagsDAO();
