
const ResponseErrors = require('./errors');

const http_status = {
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NOT_MODIFIED: 304,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500
}

class ResponseService {

    static generateCard() {

    }

    static generateSuccessResponse(data, options) {
        options = options || {};
        options.code = options.code || http_status.OK;
        data = Array.isArray(data) ? data : (data ? [data] : []);
        let resp = {
            count: data.length,
            processing_time: options.start_time ? ((new Date().getTime() - options.start_time) / 1000 + ' sec') : undefined,
            next_url: options.next_url,
            data: data
        };
        return {
            http_status: options.code,
            data: resp
        };
    }

    static generateErrorResponse(code, more_info) {
        let error_response = {
            http_status: http_status.INTERNAL_SERVER_ERROR,
            data: {
                error: code
            }
        }
        if (more_info) {
            error_response.data.more_info = {
                code: more_info.code,
                message: more_info.message
            }
        }
        switch (code) {
            case ResponseErrors.VALIDATION_ERROR:
                error_response.http_status = http_status.BAD_REQUEST;
            break;
            case ResponseErrors.USER_AUTHORIZATION_FAILED:
                error_response.http_status = http_status.UNAUTHORIZED;
            break;
            case ResponseErrors.RESOURCE_NOT_FOUND:
                error_response.http_status = http_status.NOT_FOUND;
            break;
            case ResponseErrors.PERMISSION_DENIED:
                error_response.http_status = http_status.FORBIDDEN;
            break;
            default:
                error_response.http_status = http_status.INTERNAL_SERVER_ERROR;
                error_response.code = 'unknown_error';
            break;
        }
        return error_response;
    }

}

module.exports = ResponseService;
