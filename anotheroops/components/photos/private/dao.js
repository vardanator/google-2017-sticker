const AppSettings = require('./../../settings/service');
const PhotoValidator = require('./validator');

const dbconnection = require('./../../core/dbconnection');
const BaseDAO = require('./../../core/base-dao');

require('./model')(AppSettings, PhotoValidator);

class PhotoDAO extends BaseDAO {
    constructor() {
        super(dbconnection.model('photos'));
    }
}

module.exports = new PhotoDAO();
