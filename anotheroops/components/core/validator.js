const crypto = require('crypto');
const bleach = require('bleach');
const this_3rdparty = require('validator');

const AppConstants = require('./../settings/constants');
const AppSettings = require('./../settings/service');
const QuerySettings = AppSettings.queries;

const DataTypes = {
    STRING: 'string',
    INTEGER: 'integer',
    CLIENT_PLATFORM: 'client_platform',
    OBJECT: 'object',
    FILE: 'file',
    PHOTO: 'photo',
    EMAIL: 'email',
    BOOLEAN: 'boolean',
    DATE: 'date',
    ENUM: 'enum',
    URL: 'url',
    ENUM_ARRAY: 'enum_array',
    COORD_LATITUDE: 'coord_latitude',
    COORD_LONGITUDE: 'coord_longitude',
    HOUR: 'hour'
};

const ValidationErrors = {
    INVALID_STRING: 'invalid_string',
    INVALID_STRING_MIN_LENGTH: 'invalid_string_min_length',
    INVALID_STRING_MAX_LENGTH: 'invalid_string_max_length',
    NO_FILE: 'no_file',
    MISSING_REQUIRED_FIELD: 'missing_required_field',
    NOT_ASCII_STRING: 'not_ascii_string',
    CONTAINS_SPECIAL_CHARS: 'contains_special_chars',
    INVALID_OR_UNSUPPORTED_PHOTO: 'invalid_or_unsupported_photo',
    INVALID_EMAIL: 'invalid_email',
    INVALID_DATE: 'invalid_date',
    INVALID_BOOLEAN: 'invalid_boolean',
    INVALID_ENUM: 'invalid_enum',
    INVALID_URL: 'invalid_url',
    INVALID_INTEGER_MIN_VALUE: 'invalid_integer_min_value',
    INVALID_INTEGER_MAX_VALUE: 'invalid_integer_max_value',
    INVALID_INTEGER: 'invalid_integer',
    INVALID_LATITUDE_VALUE: 'invalid_latitude_value',
    INVALID_LONGITUDE_VALUE: 'invalid_longitude_value',
    INVALID_HOUR: 'invalid_hour'
};

class CoreValidator {

    constructor(rules) {
        this.rules = rules;
    }

    validate(value, rule, options) {
        switch(rule.type) {
            case DataTypes.STRING:
                return this.validateString(value, rule, options);
            break;
            case DataTypes.FILE:
                return this.validateFile(value, rule, options);
            break;
            case DataTypes.PHOTO:
                return this.validatePhoto(value, rule, options);
            break;
            case DataTypes.EMAIL:
                return this.validateEmail(value, rule, options);
            break;
            case DataTypes.DATE:
                return this.validateDate(value, rule, options);
            break;
            case DataTypes.BOOLEAN:
                return this.validateBoolean(value, rule, options);
            break;
            case DataTypes.ENUM:
                return this.validateEnum(value, rule, options);
            break;
            case DataTypes.URL:
                return this.validateURL(value, rule, options);
            break;
            case DataTypes.ENUM_ARRAY:
                return this.validateArrayOfEnums(value, rule, options);
            break;
            case DataTypes.INTEGER:
                return this.validateInteger(value, rule, options);
            break;
            case DataTypes.COORD_LATITUDE:
                return this.validateCoordLatitude(value, rule, options);
            break;
            case DataTypes.COORD_LONGITUDE:
                return this.validateCoordLongitude(value, rule, options);
            break;
            case DataTypes.HOUR:
                return this.validateHour(value, rule, options);
            break;
        }
    }

    validateAll(properties) {
        let results = {};
        for (let ix = 0; ix < (properties || []).length; ++ix) {
            let p = properties[ix];
            if (!p || !p.key) continue;
            if (!this.rules[p.key]) {
                results[p.key] = p.value;
                continue;
            }
            results[p.key] = this.validate(p.value, this.rules[p.key], p.options);
            if (results[p.key] && !results[p.key].is_valid) return results[p.key];
        }
        results.is_valid = true;
        return results;
    }

    validateString(value, rule, options) {
        options = options || {};
        if (undefined === value || null === value) {
            return options.required ? this.errorize(ValidationErrors.MISSING_REQUIRED_FIELD, rule)
                                    : this.successize();
        }
        if (typeof(value) !== 'string' || !value.hasOwnProperty('length')) {
            return this.errorize(ValidationErrors.INVALID_STRING, rule);
        }
        if (this.isInteger(rule.minlength) && value.length < rule.minlength) {
            return this.errorize(ValidationErrors.INVALID_STRING_MIN_LENGTH, rule);
        }
        if (this.isInteger(rule.maxlength) && value.length > rule.maxlength) {
            return this.errorize(ValidationErrors.INVALID_STRING_MAX_LENGTH, rule);
        }
        if (rule.special_characters) {
            let sc = rule.special_characters;
            if (sc.ascii_only && !this_3rdparty.isAscii(value)) {
                return this.errorize(ValidationErrors.NOT_ASCII_STRING, rule);
            }
            if (sc.no_special_chars) {
                (sc.whitelist || []).forEach((ch) => { value = value.replace(ch, ''); })
                if (!this_3rdparty.isAlphanumeric(value)) {
                    return this.errorize(ValidationErrors.CONTAINS_SPECIAL_CHARS, rule);
                }
            }
        }
        return this.successize(options.sanitize ? this.sanitizeString(value, options.sanitize) : undefined);
    }

    validateInteger(value, rule, options) {
        options = options || {};
        if (value === undefined || value === null) {
            return options.required ? this.errorize(ValidationErrors.MISSING_REQUIRED_FIELD, rule)
                    : this.successize();
        }
        value = parseInt(value);
        if (!this.isInteger(value)) {
            return this.errorize(ValidationErrors.INVALID_INTEGER, rule);
        }
        if (this.isInteger(rule.minlength) && value < rule.minlength) {
            return this.errorize(ValidationErrors.INVALID_INTEGER_MIN_VALUE, rule);
        }
        if (this.isInteger(rule.maxlength) && value > rule.maxlength) {
            return this.errorize(ValidationErrors.INVALID_INTEGER_MAX_VALUE, rule);
        }
        return this.successize(parseInt(value));
    }

    validateHour(value, rule, options) {
        options = options || {};
        if (value === undefined || value === null) {
            return options.required ? this.errorize(ValidationErrors.MISSING_REQUIRED_FIELD, rule)
                    : this.successize();
        }
        value = parseInt(value);
        if (value < 0 || value > 2400) {
            return this.errorize(ValidationErrors.INVALID_HOUR, rule);
        }
        return this.successize(value);
    }

    validateCoordLatitude(value, rule, options) {
        options = options || {};
        if (value === undefined || value === null) {
            return options.required ? this.errorize(ValidationErrors.MISSING_REQUIRED_FIELD, rule)
                    : this.successize();
        }
        value = parseFloat(value);
        if (!isFinite(value) || (value < -90) || (value > 90)) {
            return this.errorize(ValidationErrors.INVALID_LATITUDE_VALUE, rule);
        }
        return this.successize(value);
    }

    validateCoordLongitude(value, rule, options) {
        options = options || {};
        if (value === undefined || value === null) {
            return options.required ? this.errorize(ValidationErrors.MISSING_REQUIRED_FIELD, rule)
                    : this.successize();
        }
        value = parseFloat(value);
        if (!isFinite(value) || (value < -180) || (value > 180)) {
            return this.errorize(ValidationErrors.INVALID_LONGITUDE_VALUE, rule);
        }
        return this.successize(value);
    }

    validateFile(value, rule, options) {
        options = options || {};
        if (value === undefined || value === null) {
            return options.required ? this.errorize(ValidationErrors.NO_FILE, rule) : {is_valid: true};
        }
        return this.successize();
    }

    validatePhoto(value, rule, options) {
        options = options || {};
        if ((undefined === value || null === value )) {
            return options.required ? this.errorize(ValidationErrors.INVALID_OR_UNSUPPORTED_PHOTO, rule)
                                    : this.successize();
        }
        if (!value.mimetype || AppConstants.image_mimetype_values.indexOf(value.mimetype) == -1) {
            return this.errorize(ValidationErrors.INVALID_OR_UNSUPPORTED_PHOTO, rule);
        }
        return this.successize();
    }

    validateEmail(value, rule, options) {
        if (!value || typeof (value) !== 'string') {
            return options.required ? this.errorize(ValidationErrors.MISSING_REQUIRED_FIELD, rule)
                                    : this.successize();
        }
        value = value.toLowerCase();
        if (!this.isEmail(value)) {
            return this.errorize(ValidationErrors.INVALID_EMAIL, rule);
        }
        return this.successize(options.sanitize ? this.sanitizeEmail(value) : value);
    }

    validateDate(value, rule, options) {
        if (!value) {
            return options.required ? this.errorize(ValidationErrors.MISSING_REQUIRED_FIELD, rule)
                                    : this.successize();
        }
        console.log('value == ', value);
        console.log(Date.parse(value));
        if (isNaN(Date.parse(value))) {
            return this.errorize(ValidationErrors.INVALID_DATE, rule);
        }
        return this.successize(options.sanitize ? Date.parse(value) : undefined);
    }

    validateBoolean(value, rule, options) {
        if (!value) {
            return options.required ? this.errorize(ValidationErrors.MISSING_REQUIRED_FIELD, rule)
                                    : this.successize();
        }
        if (typeof(value) === 'boolean') {
            return this.successize(value);
        }
        if (typeof(value) === 'string' && '10malefemaletruefalseyesno'.includes(value)) {
            return this.successize((value === '1' || value === 'true' || value === 'male' || value === 'yes'));
        }
        return this.errorize(ValidationErrors.INVALID_BOOLEAN, rule);
    }

    validateEnum(value, rule, options) {
        if (!value) {
            return options.required ? this.errorize(ValidationErrors.MISSING_REQUIRED_FIELD, rule)
                : this.successize(options.sanitize ? rule.default : undefined);
        }
        if (rule.enum && !rule.enum.includes(value)) {
            return this.errorize(ValidationErrors.INVALID_ENUM, rule);
        }
        return this.successize(value);
    }

    validateArrayOfEnums(value, rule, options) {
        if (!value || !Array.isArray(value)) {
            return options.required ? this.errorize(ValidationErrors.MISSING_REQUIRED_FIELD, rule)
                : this.successize(options.sanitize ? [rule.default] : undefined);
        }
        for (let ix = 0; ix < value.length; ++ix) {
            if (!value[ix] && !options.required) continue;
            if (rule.enum && !rule.enum.includes(value[ix])) {
                return this.errorize(ValidationErrors.INVALID_ENUM, rule);
            }
        }
        return this.successize();
    }

    validateURL(value, rule, options) {
        if (!value) {
            return options.required ? this.errorize(ValidationErrors.MISSING_REQUIRED_FIELD, rule)
                : this.successize();
        }
        return this.isURL(value) ? this.successize(value)
                : this.errorize(ValidationErrors.INVALID_URL, rule);
    }

    sanitizeString(value, sanitize) {
        /*
        if (sanitize === 'hash') {
            return crypto.createHash('sha1').update(value + AppConstants.hash_salt).digest('hex');
        }
        */
        // Back-compatibility
        if (sanitize === 'hash') {
            let reversed = value.split('').reverse().join('');
            return crypto.createHash('md5').update(value + reversed).digest('hex');
        }
        return bleach.sanitize(value);
    }

    sanitizeBoolean(value) {
        if (typeof(value) === 'boolean') {
            return value;
        }
        if (typeof(value) === 'string' && '10malefemaletruefalseyesno'.includes(value)) {
            return (value === '1' || value === 'true' || value === 'male' || value === 'yes');
        }
        return undefined;
    }

    isURL(url, aggressive) {
        if (!url) return !aggressive;
        return this_3rdparty.isURL(url);
    }

    isEmail(email) {
        return this_3rdparty.isEmail(email);
    }

    isInteger(num) {
        return Number.isInteger(num);
    }

    isIP(ip) {
        return this_3rdparty.isIP(ip);
    }

    isFloat(float) {
        return this_3rdparty.isFloat(float);
    }

    sanitizeQueryOffset(offset) {
        offset = parseInt(offset);
        if (!this.isInteger(offset)) {
            return QuerySettings.offset_min;
        }
        return offset >= QuerySettings.offset_min && offset <= QuerySettings.offset_max ? offset : QuerySettings.offset_min;
    }

    sanitizeQueryLimit(limit) {
        limit = parseInt(limit);
        if (!this.isInteger(limit)) {
            return QuerySettings.limit_max;
        }
        return limit >= QuerySettings.limit_min && limit <= QuerySettings.limit_max ? limit : QuerySettings.limit_max;
    }

    sanitizeQueryString(str) {
        return bleach.sanitize(str || '');
    }

    sanitizeEmail(email) {
        return (email || '').toLowerCase();
    }

    errorize(error, rule) {
        return {
            is_valid: false,
            code: error,
            message: this.generateErrorMessage(error, rule)
        };
    }

    successize(sv) {
        return {
            is_valid: true,
            sanitized_value: sv
        }
    }

    generateErrorMessage(error, rule) {
        switch (error) {
            case ValidationErrors.INVALID_STRING:
                return `Invalid string value for [${rule.field_name}].`;
            case ValidationErrors.INVALID_STRING_MIN_LENGTH:
                return `Invalid string minimum length for '${rule.field_name}', must be >= ${rule.minlength}.`;
            case ValidationErrors.INVALID_STRING_MAX_LENGTH:
                return `Invalid string maximum length for '${rule.field_name}', must be <= ${rule.maxlength}.`;
            case ValidationErrors.NO_FILE:
                return `Requested value is missing for '${rule.field_name}' or not provided. Also missing '.path'.`;
            case ValidationErrors.MISSING_REQUIRED_FIELD:
                return `Missing required field '${rule.field_name}'.`;
            case ValidationErrors.NOT_ASCII_STRING:
                return `Invalid value for field '${rule.field_name}', contains non-ASCII characters.`;
            case ValidationErrors.CONTAINS_SPECIAL_CHARS:
                return `Alphanumeric value required for '${rule.field_name}', allowed only '${rule.special_characters.whitelist.join(' ')}'.`;
            case ValidationErrors.INVALID_EMAIL:
                return `Invalid email format for '${rule.field_name}'.`;
            case ValidationErrors.INVALID_DATE:
                return `Invalid date value for '${rule.field_name}'`;
            case ValidationErrors.INVALID_BOOLEAN:
                return `Invalid boolean value for '${rule.field_name}'`;
            case ValidationErrors.INVALID_URL:
                return `Invalid URL value for '${rule.field_name}'`;
            case ValidationErrors.INVALID_ENUM:
                return `Invalid enum value for '${rule.field_name}', should be one of '${rule.enum.join('|')}'`;
            case ValidationErrors.INVALID_LATITUDE_VALUE:
                return `Invalid latitude value for '${rule.field_name}'.`;
            case ValidationErrors.INVALID_LONGITUDE_VALUE:
                return `Invalid longitude value for '${rule.field_name}'.`;
            case ValidationErrors.INVALID_HOUR:
                return `Invalid hour value for '${rule.field_name}'.`;
            case ValidationErrors.INVALID_INTEGER:
                return `Invalid integer for '${rule.field_name}'.`;
            case ValidationErrors.INVALID_INTEGER_MIN_VALUE:
                return `Invalid integer minimum value for '${rule.field_name}', must be >= ${rule.minlength}.`;
            case ValidationErrors.INVALID_INTEGER_MAX_VALUE:
                return `Invalid integer maximum value for '${rule.field_name}', must be <= ${rule.maxlength}.`;
            default:
                return '';
            break;
        }
    }

}

module.exports = CoreValidator;
module.exports.Types = DataTypes;
module.exports.Errors = ValidationErrors;
