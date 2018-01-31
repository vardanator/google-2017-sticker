
const express = require('express');
let PhotosRouter = express.Router();

const AppConstants = require('./../settings/constants');

const multer = require('multer');
const upload = multer();
const autoReap = require('multer-autoreap');

const PhotosService = require('./service');

PhotosRouter.use((req, res, next) => {
    // logging Photos related calls
    next();
});

// think about autoReap
PhotosRouter.post('/', upload.single('photo'), (req, res) => {
    let options = {};
    PhotosService.uploadPhoto(req.file, req.body.title, options).then((photo) => {
        res.send({
            id: photo._id
        });
    }).catch((err) => {
        console.log(err);
        return res.send(err);
    });
});

PhotosRouter.get('/:id', (req, res) => {
    PhotosService.getPhotoById(req.params.id).then((photo) => {
        return res.send({
            id: photo._id,
            url: '/cdn/photos/' + photo._id
        })
    }).catch((err) => {
        return res.send(err);
    })
});

module.exports = PhotosRouter;
