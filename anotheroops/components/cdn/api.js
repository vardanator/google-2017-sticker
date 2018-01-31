
const express = require('express');
let CDNRouter = express.Router();

const PhotoService = require('./../photos/service');

CDNRouter.use((req, res, next) => {
    // logging Photos related calls
    next();
});

CDNRouter.get('/photos/:id', (req, res) => {
    PhotoService.getPhotoById(req.params.id).then((photo) => {
        res.contentType(photo.content_type);
        res.setHeader('Cache-Control', 'public, max-age=31557600');
        res.send(photo.image);
    }).catch((err) => {
        return res.send(err);
    })
});

module.exports = CDNRouter;
