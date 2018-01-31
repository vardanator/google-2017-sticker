const AppConstants = require('./../../settings/constants');
const AppConfigs = require('./../../settings/configs');

class ProductsResponse {

    static generateResponse(products, requester, lang) {
        if (!products) return null;
        if (!requester || !requester.id || !requester.role) {
            return ProductsResponse.generateRegularResponse(products, lang);
        }
        if (AppConstants.AccessLevel[(requester.role || '').toUpperCase()] >= AppConstants.AccessLevel.ADMIN) {
            return ProductsResponse.generateAdminResponse(products, requester);
        }
        if (AppConstants.AccessLevel[(requester.role || '').toUpperCase()] >= AppConstants.AccessLevel.USER) {
            return ProductsResponse.generatePOVResponse(products, requester);
        }
        return ProductsResponse.generateRegularResponse(products, lang);
    }

    static generateRegularResponse(products, lang) {
        lang = lang || AppConstants.language_values[0];
        return products.getOnly(
            function id() { return this._id; },
            function name() { return this.name[lang]; },
            function description() { return this.description[lang]; },
            'price', 'sale_price', 'sale_deadline',
            function likes_count() { return (this.likes || []).length; },
            'keywords'
        );
    }

    static generateAdminResponse(products, requester) {
        let lang = requester.settings.language || AppConstants.language_values[0];
        return products.getOnly(
            function id() { return this._id; },
            function name() { return this.name[lang]; },
            function name_en() { return this.name.en; },
            function name_ru() { return this.name.ru; },
            function name_am() { return this.name.am; },
            function description() { return this.description[lang]; },
            function description_en() { return this.description.en; },
            function description_ru() { return this.description.ru; },
            function description_am() { return this.description.am; },
            'price', 'sale_price', 'sale_deadline',
            function likes_count() { return (this.likes || []).length; },
            'keywords'
        );
    }

    static generatePOVResponse(products, requester) {
        let lang = requester.settings.language || AppConstants.language_values[0];
        return products.getOnly(
            function id() { return this._id; },
            function name() { return this.name[lang]; },
            function description() { return this.description[lang]; },
            'price', 'sale_price', 'sale_deadline',
            function likes_count() { return (this.likes || []).length; },
            'keywords'
        );
    }

}

module.exports = ProductsResponse;
