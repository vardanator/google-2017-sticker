const AppSettings = require('./../../settings/service');

const dbconnection = require('./../../core/dbconnection');
const BaseDAO = require('./../../core/base-dao');

require('./model')(AppSettings);

class ProductsDAO extends BaseDAO {

    constructor() {
        super(dbconnection.model('products'));
    }

}

module.exports = new ProductsDAO();
