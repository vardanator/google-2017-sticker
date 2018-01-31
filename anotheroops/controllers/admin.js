
const AdminRouter = require('./../components/admin/api');

class AdminApi {
    initialize(app) {
        app.use('/admin', AdminRouter);
    }
}

module.exports = new AdminApi();
