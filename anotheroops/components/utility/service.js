
class Utility {

    static checkAndSetSanitizedValues(results, keys, src_obj) {
        src_obj = src_obj || {};
        (keys || []).forEach(key_raw => {
            let key = {
                lhs: null,
                rhs: null
            };
            if (!key_raw.rhs || !key_raw.lhs) {
                key.lhs = key_raw;
                key.rhs = key_raw;
            } else {
                key = key_raw;
            }
            if (results[key.rhs] && results[key.rhs].sanitized_value != undefined
                && results[key.rhs].sanitized_value != null)
            {
                src_obj[key.lhs] = results[key.rhs].sanitized_value;
            }
            // plain value
            if (results[key.rhs] && results[key.rhs].is_valid == undefined) {
                src_obj[key.lhs] = results[key.rhs];
            }
        });
        return src_obj;
    }

    static copyProperties(src, dest, keys) {
        (keys || []).forEach(key => {
            dest[key] = src[key];
        });
        return dest;
    }

    static constructValidationParams(src, required_keys) {
        src = src || {};
        return Object.keys(src).map(k => {
            return {key: k, value: src[k], options: {required: (required_keys || []).includes(k), sanitize: true}}
        });
    }

    static debug(err) {
        console.log('### DEBUG MESSAGE: ', err);
    }

}

module.exports = Utility;
