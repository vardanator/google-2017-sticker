const AppSettings = require('./../../settings/service');
const UnitsValidator = require('./validator');

const dbconnection = require('./../../core/dbconnection');
const BaseDAO = require('./../../core/base-dao');

require('./model')(AppSettings, UnitsValidator);

class UnitsDAO extends BaseDAO {

    constructor() {
        super(dbconnection.model('units'));
    }

}

module.exports = new UnitsDAO();
