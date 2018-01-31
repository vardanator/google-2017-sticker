const AppSettings = require('./../../settings/service');
const GroupValidator = require('./validator');

const dbconnection = require('./../../core/dbconnection');
const BaseDAO = require('./../../core/base-dao');

require('./model')(AppSettings, GroupValidator);

/*
 * This is a private class, must be called only by GroupsService
 * All data validation must be done in GroupsService, this class only makes assertions
*/
class GroupsDAO extends BaseDAO {

    constructor() {
        super(dbconnection.model('groups'));
    }

}

module.exports = new GroupsDAO();
