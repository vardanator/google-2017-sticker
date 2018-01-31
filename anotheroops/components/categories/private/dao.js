const AppSettings = require('./../../settings/service');
const CategoriesValidator = require('./validator');

const dbconnection = require('./../../core/dbconnection');
const BaseDAO = require('./../../core/base-dao');

require('./model')(AppSettings, CategoriesValidator);

/*
 * This is a private class, must be called only by GroupsService
 * All data validation must be done in GroupsService, this class only makes assertions
*/
class CategoriesDAO extends BaseDAO {

    constructor() {
        super(dbconnection.model('categories'));
    }

}

module.exports = new CategoriesDAO();
