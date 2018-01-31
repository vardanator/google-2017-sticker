
const mongoose = require('mongoose');

const AppConfigs = require('./../settings/configs');
console.log('IMPORTANT! Called once');
mongoose.Promise = global.Promise;
module.exports = mongoose.createConnection(AppConfigs.DB_URL);
