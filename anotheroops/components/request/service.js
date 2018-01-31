
const CoreValidator = require('./../core/validator');
const AuthService = require('./../authorization/service');
const ResponseService = require('./../response/service');

const DataValidator = new CoreValidator();

class RequestService {

    static resolveQuery(req, res, next) {
        let offset = req.query.offset;
        let limit = req.query.limit;
        let filters = req.query.filters;
        let select = req.query.select;
        let sort = req.query.sort;
        let resolved_query = {
            offset: DataValidator.sanitizeQueryOffset(offset),
            limit: DataValidator.sanitizeQueryLimit(limit)
        };
        (filters || '').split(',').forEach(f => {
            if (!f) return;
            resolved_query[f] = 1;
        });
        (select || '').split(',').forEach(s => {
            if (!s) return;
            resolved_query[s] = 1;
        });
        (sort || '').split(',').forEach(s => {
            if (!s) return;
            if (s[0] === '+') {
                resolved_query[s.substr(1)] = 1;
            } else
            if (s[0] === '-') {
                resolved_query[s.substr(1)] = -1;
            } else {
                resolved_query[s] = 1;
            }
        });
        req.resolved_query = resolved_query;
        return next();
    }

    static authorizeRequest(access) {
        return function (req, res, next) {
            AuthService.authorizeUser(req.query.key, access)
                .then(user => {
                    req.user = user;
                    return next();
                })
                .catch(err => {
                    console.log('some error = ', err);
                    let response = ResponseService.generateErrorResponse(err.reason, err.more_info);
                    return res.status(response.http_status).send(response.data);
                })
        }
    }

    static parseMetadata(req, res, next) {
        req.metadata = {
            platform: req.headers['platform'],
            version: req.headers['version'],
            ip: req.headers['x-real-ip'],
            device_id: req.headers['device-id'],
            agent: req.headers['user-agent'],
            lang: req.headers['lang'],
            start_time: (new Date()).getTime()
        };
        next();
    }

    static checkAttacks(req, res, next) {
        /*
        if (req.metadata.ip) {
            return res.send('hello, friend');
        }
        */
        next();
    }

}

module.exports = RequestService;
