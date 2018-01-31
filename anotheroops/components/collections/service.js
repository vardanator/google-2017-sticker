const Utility = require('./../utility/service');
const ResponseErrors = require('./../response/errors');
const AppConstants = require('./../settings/constants');
const SystemEvents = require('./../system-events/service');
const AppSettings = require('./../settings/service');
const AppConfigs = require('./../settings/configs');

const CollectionsDAO = require('./private/dao');
const CollectionsResponse = require('./private/response');

class CollectionsService {
    getCollections(options) {
        return new Promise((resolve, reject) => {
            options = options || {};

            CollectionsDAO.fetchMany(options.filters, options).then(collections => {
                return resolve(CollectionsResponse.generateResponse(collections, options.requester));
            }).catch(err => {
                SystemEvents.emit('error', err);
                reject({
                    reason: ResponseErrors.INTERNAL_ERROR
                });
            })
        });
    }

    addCollection(name, units, options) {
        return new Promise((resolve, reject) => {
            if (!name || !units || !units.length) {
                return reject({
                    reason: ResponseErrors.VALIDATION_ERROR,
                    more_info: {message: 'No input data.'}
                });
            }

            let src_obj = {
                name: name,
                units: units.filter(u => u)
            };

            CollectionsDAO.insert(src_obj).then(collection => {
                resolve(CollectionsResponse.generateResponse(collection, options.requester));
            }).catch(err => {
                SystemEvents.emit('error', err);
                return reject({
                    reason: ResponseErrors.INTERNAL_ERROR,
                    more_info: {message: 'Failed to create collection'}
                });
            });
        });
    }

    removeCollection(id, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            CollectionsDAO.removeById(id, options).then(resp => {
                resolve(CollectionsResponse.generateResponse(resp, options.requester));
            }).catch(err => {
                SystemEvents.emit('error', err);
                reject({
                    reason: ResponseErrors.INTERNAL_ERROR
                });
            });
        });
    }
}

module.exports = new CollectionsService();
