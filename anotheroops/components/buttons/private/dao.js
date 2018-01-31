const dbconnection = require('./../../core/dbconnection');
const BaseDAO = require('./../../core/base-dao');

require('./model');

class ButtonsDAO extends BaseDAO {
    constructor() {
        super(dbconnection.model('buttons'));
    }
}

module.exports = new ButtonsDAO();
