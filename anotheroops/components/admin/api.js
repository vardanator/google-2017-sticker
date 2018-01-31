const express = require('express');

const AdminRouter = express.Router();

AdminRouter.use((req, res, next) => {
    if (!req.user) {
        return res.render('admin/login');
    }
    return next();
});

AdminRouter.get('/dashboard', (req, res) => {
    res.render('admin/dashboard');
});

AdminRouter.get('/users', (req, res) => {
    res.render('admin/users');
});

AdminRouter.get('/units', (req, res) => {
    res.render('admin/units');
});

AdminRouter.get('/events', (req, res) => {
    res.render('admin/events');
});

AdminRouter.post('/login', (req, res) => {
    AdminService.authorizeAdmin(req.body.username, req.body.password).then(user => {
        req.user = user;
        res.render('admin/users');
    }).catch(err => {
        res.render('admin/login');
    })
});

module.exports = AdminRouter;
