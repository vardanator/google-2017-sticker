const fs = require('fs');
const request = require('request');
const probe = require('probe-image-size');

const PhotoDAO = require('./private/dao');
const PhotoValidator = require('./private/validator');
const ResponseErrors = require('./../response/errors');
const SystemEvents = require('./../system-events/service');

class PhotoService {
    constructor() {}

    uploadPhoto(file, title, options) {
        return new Promise(
            (resolve, reject) => {
                options = options || {};
                /*
                let photo_validation = PhotoValidator.validateAll([
                    {key: 'photo', value: file, options: {required: true}},
                    {key: 'title', value: title, options: {required: false, sanitize: true}}
                ]);
                if (!photo_validation.is_valid) {
                    return reject({
                        reason: ResponseErrors.VALIDATION_ERROR,
                        more_info: photo_validation
                    });
                }
                */
                // Temporary check
                if (!file || !file.buffer) {
                    return reject({
                        reason: ResponseErrors.VALIDATION_ERROR,
                        more_info: {message: 'Photo not provided.'}
                    });
                }

                let image = probe.sync(file.buffer);
                if (!image) {
                    return reject({
                        error: ResponseErrors.THIRD_PARTY_ERROR,
                        more_info: {message:'Image file error'}
                    });
                }
                PhotoDAO.insert({
                    image: file.buffer,
                    content_type: image.type,
                    mime: image.mime,
                    width: image.width,
                    height: image.height,
                    size: file.size,
                    //title: photo_validation.title.sanitized_value,
                    user_id: options.user_id || undefined,
                    entity_id: options.entity_id
                }).then((photo) => {
                    SystemEvents.emit(SystemEvents.EventTypes.PHOTO_UPLOADED, photo._id);
                    photo.id = photo._id;
                    delete photo._id;
                    return resolve(photo);
                }).catch((err) => {
                    SystemEvents.emit('error', err);
                    return reject({
                        reason: ResponseErrors.UPLOAD_ERROR
                    })
                });
            }
        )
    }

    importFromURL(url, options) {
        return new Promise((resolve, reject) => {
            var tmp_path = "/tmp/hlpn-profile-" + Date.now();
            request.head(url, function (err, res, body) {
                if (!res.headers['content-type'] || res.headers['content-type'].indexOf('image/') == -1) {
                    return reject({
                        reason: ResponseErrors.UPLOAD_ERROR
                    });
                }
                request(url).pipe(fs.createWriteStream(tmp_path)).on('close', function() {
                    let buffer = fs.readFileSync(tmp_path);
                    let image = probe.sync(buffer);
                    if (!image) {
                        fs.unlink(tmp_path);
                        return reject({
                            error: ResponseErrors.THIRD_PARTY_ERROR,
                            message: err
                        });
                    }
                    PhotoDAO.insert({
                        image: buffer,
                        content_type: image.type,
                        mime: image.mime,
                        width: image.width,
                        height: image.height,
                        user_id: options.user_id || undefined,
                        entity_id: options.entity_id
                    }).then((photo) => {
                        SystemEvents.emit(SystemEvents.EventTypes.PHOTO_IMPORTED, photo._id);
                        photo.id = photo._id;
                        delete photo._id;
                        fs.unlink(tmp_path);
                        return resolve(photo);
                    }).catch((err) => {
                        console.log('uploadPhoto err = ', err);
                        fs.unlink(tmp_path);
                        return reject({
                            reason: ResponseErrors.UPLOAD_ERROR
                        })
                    });
                });
            });
        });
    }

    getPhotoById(id) {
        return PhotoDAO.fetchOne({_id: id});
    }
}

module.exports = new PhotoService();
