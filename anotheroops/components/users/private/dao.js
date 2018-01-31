const AppSettings = require('./../../settings/service');
const UserValidator = require('./validator');

const dbconnection = require('./../../core/dbconnection');
const BaseDAO = require('./../../core/base-dao');

require('./model')(AppSettings, UserValidator);

class UsersDAO extends BaseDAO {
    constructor() {
        super(dbconnection.model('users'));
    }

}

module.exports = new UsersDAO();
