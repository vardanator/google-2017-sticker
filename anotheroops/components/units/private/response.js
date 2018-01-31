const moment = require('moment-timezone');

const AppConstants = require('./../../settings/constants');
const AppConfigs = require('./../../settings/configs');
const AppSettings = require('./../../settings/service');

class UnitsResponse {

    // Major refactor needed

    static generateResponse(units, requester, lang) {
        if (!units) return null;
        if (!requester || !requester.id || !requester.role) {
            return UnitsResponse.generateRegularResponse(units, lang);
        }
        if (AppConstants.AccessLevel[(requester.role || '').toUpperCase()] >= AppConstants.AccessLevel.ADMIN) {
            return UnitsResponse.generateAdminResponse(units, requester);
        }
        if (AppConstants.AccessLevel[(requester.role || '').toUpperCase()] >= AppConstants.AccessLevel.USER) {
            return UnitsResponse.generatePOVResponse(units, requester);
        }
        return UnitsResponse.generateRegularResponse(units, lang);
    }

    static generateRegularResponse(units, lang) {
        lang = lang || AppConstants.language_values[0];
        return units.getOnly(
            function id() { return this._id; },
            'unit_type',
            function name() { return this.name ? this.name[lang] : undefined; },
            function description() { return this.description ? this.description[lang] : undefined; },
            function about() { return this.about ? this.about[lang] : undefined; },
            function address() {
                return UnitsResponse.generateAddress(this.address, lang);
            },
            'is_branch', 'parent_id', 'branches',
            function branches_count() { return (this.branches || []).length; },
            'categories', 'top', 'recent', 'price',
            function contact() {
                return UnitsResponse.generateContactData(this.contact, lang);
            },
            function photo() {
                if (!this.photo) return AppSettings.units.default_photo_url;
                return AppConfigs.DOMAIN + AppConfigs.CDN_PREFIX + this.photo;
            },
            function cover() {
                if (!this.cover) return AppSettings.units.default_photo_url;
                return AppConfigs.DOMAIN + AppConfigs.CDN_PREFIX + this.cover;
            },
            'is_open24', 'working_hours', 'features',
            function photos() {
                return (this.photos || []).map(p => AppConfigs.DOMAIN + AppConfigs.CDN_PREFIX + p);
            },
            function user_photos() {
                return (this.user_photos || []).map(p => AppConfigs.DOMAIN + AppConfigs.CDN_PREFIX + p);
            },
            function products_naming() {
                return this.products_naming ? this.products_naming[lang] : undefined;
            },
            function products() {
                return UnitsResponse.generateProducts(this.products, lang);
            },
            'founded',
            function tags() {
                //return (this.tags || []).map(t => t.value[lang]);
                return (this.tags || []).map(t => t && t.value ? t.value.en : undefined);
            },
            function keywords() {
                //return (this.keywords || []).map(k => k.value[lang]);
                return (this.keywords || []).map(k => k && k.value ? k.value.en : undefined);
            },
            function reviews() {
                return UnitsResponse.generateReviews(this.reviews, lang);
            },
            'metadata',
            function is_open() {
                return UnitsResponse.isUnitOpen(this.working_hours);
            },
            function hours() {
                return UnitsResponse.getUnitHours(this.working_hours);
            },
            function rating() {
                if (this.stats && this.stats.reviews_count != 0 && this.stats.review_rating != 0) {
                    return this.stats.review_rating / this.stats.reviews_count;
                }
                return 0;
            },
            function reviews_count() {
                return this.stats ? this.stats.reviews_count || 0 : 0;
            },
            'distance'
        );
    }

    static generateAdminResponse(units, requester) {
        let lang = requester.settings.language || AppConstants.language_values[0];
        return units.getOnly(
            function id() { return this._id; },
            'unit_type',
            function name() { return this.name ? this.name[lang] : undefined; },
            function name_en() { return this.name ? this.name.en : undefined; },
            function name_ru() { return this.name ? this.name.ru : undefined; },
            function name_am() { return this.name ? this.name.am : undefined; },
            function description() { return this.description ? this.description[lang] : undefined; },
            function description_en() { return this.description ? this.description.en : undefined; },
            function description_ru() { return this.description ? this.description.ru : undefined; },
            function description_am() { return this.description ? this.description.am : undefined; },
            function about() { return this.about ? this.about[lang] : undefined; },
            function about_en() { return this.about ? this.about.en : undefined; },
            function about_ru() { return this.about ? this.about.ru : undefined; },
            function about_am() { return this.about ? this.about.am : undefined; },
            function address() {
                return UnitsResponse.generateAddress(this.address, lang, true);
            },
            'is_branch', 'parent_id', 'branches',
            function branches_count() { return (this.branches || []).length; },
            'categories', 'top', 'recent', 'price',
            function contact() {
                return UnitsResponse.generateContactData(this.contact, lang, true);
            },
            function photo() {
                if (!this.photo) return AppSettings.units.default_photo_url;
                return AppConfigs.DOMAIN + AppConfigs.CDN_PREFIX + this.photo;
            },
            function cover() {
                if (!this.cover) return AppSettings.units.default_photo_url;
                return AppConfigs.DOMAIN + AppConfigs.CDN_PREFIX + this.cover;
            },
            'is_open24', 'working_hours', 'features',
            function photos() {
                return (this.photos || []).map(p => AppConfigs.DOMAIN + AppConfigs.CDN_PREFIX + p);
            },
            function user_photos() {
                return (this.user_photos || []).map(p => AppConfigs.DOMAIN + AppConfigs.CDN_PREFIX + p);
            },
            function products_naming() {
                return this.products_naming ? this.products_naming[lang] : undefined;
            },
            function products_naming_en() { return this.products_naming ? this.products_naming.en : undefined; },
            function products_naming_ru() { return this.products_naming ? this.products_naming.ru : undefined; },
            function products_naming_am() { return this.products_naming ? this.products_naming.am : undefined; },
            function products() {
                return UnitsResponse.generateProducts(this.products, lang, true);
            },
            'founded',
            function tags() {
                //return (this.tags || []).map(t => t.value[lang]);
                return (this.tags || []).map(t => t && t.value ? t.value.en : undefined);
            },
            function keywords() {
                //return (this.keywords || []).map(k => k.value[lang]);
                return (this.keywords || []).map(k => k && k.value ? k.value.en : undefined);
            },
            function reviews() {
                return UnitsResponse.generateReviews(this.reviews, lang, true);
            },
            'stats', 'internal', 'is_active', 'metadata',
            function is_open() {
                return UnitsResponse.isUnitOpen(this.working_hours);
            },
            function hours() {
                return UnitsResponse.getUnitHours(this.working_hours);
            },
            function rating() {
                if (this.stats && this.stats.reviews_count != 0 && this.stats.review_rating != 0) {
                    return this.stats.review_rating / this.stats.reviews_count;
                }
                return 0;
            },
            function reviews_count() {
                return this.stats ? this.stats.reviews_count || 0 : 0;
            },
            'distance'
        );
    }

    static generatePOVResponse(units, requester) {
        let lang = requester.settings.language || AppConstants.language_values[0];
        return units.getOnly(
            function id() { return this._id; },
            'unit_type',
            function name() { return this.name ? this.name[lang] : undefined; },
            function description() { return this.description ? this.description[lang] : undefined; },
            function about() { return this.about ? this.about[lang] : undefined; },
            function address() {
                return UnitsResponse.generateAddress(this.address, lang);
            },
            'is_branch', 'parent_id', 'branches',
            function branches_count() { return (this.branches || []).length; },
            'categories', 'top', 'recent', 'price',
            function contact() {
                return UnitsResponse.generateContactData(this.contact, lang);
            },
            function photo() {
                if (!this.photo) return AppSettings.units.default_photo_url;
                return AppConfigs.DOMAIN + AppConfigs.CDN_PREFIX + this.photo;
            },
            function cover() {
                if (!this.cover) return AppSettings.units.default_photo_url;
                return AppConfigs.DOMAIN + AppConfigs.CDN_PREFIX + this.cover;
            },
            'is_open24', 'working_hours', 'features',
            function photos() {
                return (this.photos || []).map(p => AppConfigs.DOMAIN + AppConfigs.CDN_PREFIX + p);
            },
            function user_photos() {
                return (this.user_photos || []).map(p => AppConfigs.DOMAIN + AppConfigs.CDN_PREFIX + p);
            },
            function products_naming() {
                return this.products_naming ? this.products_naming[lang] : undefined;
            },
            function products() {
                return UnitsResponse.generateProducts(this.products, lang);
            },
            'founded',
            function tags() {
                //return (this.tags || []).map(t => t.value[lang]);
                return (this.tags || []).map(t => t && t.value ? t.value.en : undefined);
            },
            function keywords() {
                //return (this.keywords || []).map(k => k.value[lang]);
                return (this.keywords || []).map(k => k && k.value ? k.value.en : undefined);
            },
            function reviews() {
                return UnitsResponse.generateReviews(this.reviews, lang);
            },
            'metadata',
            function is_open() {
                return UnitsResponse.isUnitOpen(this.working_hours);
            },
            function hours() {
                return UnitsResponse.getUnitHours(this.working_hours);
            },
            function rating() {
                if (this.stats && this.stats.reviews_count != 0 && this.stats.review_rating != 0) {
                    return this.stats.review_rating / this.stats.reviews_count;
                }
                return 0;
            },
            function reviews_count() {
                return this.stats ? this.stats.reviews_count || 0 : 0;
            },
            'distance'
        );
    }

    static generateReviews(reviews, lang, admin) {
        if (!reviews) return null;
        if (Array.isArray(reviews) && !reviews.length) return null;
        return reviews.getOnly(
            function id() { return this._id; },
            'user', 'text', 'rating',
            function up_votes() { return (this.up_votes || []).length; },
            function up_voted_users() { return admin ? this.up_votes : undefined; },
            function down_votes() { return (this.down_votes || []).length; },
            function down_voted_users() { return admin ? this.down_votes : undefined; },
            function reports() { return admin ? this.reports : undefined; },
            function is_edited() { return this.edits ? this.edits.is_edited : undefined; },
            function edited_date() { return this.edits ? this.edits.date : undefined; },
            function created() { return this.metadata ? this.metadata.created : undefined; },
            function first_version() { return this.edits ? this.edits.first_version : undefined; },
            function edits() { return admin ? this.edits : undefined; },
            function metadata() { return admin ? this.metadata : undefined; }
        );
    }

    static generateTags(tags, lang, admin) {
        if (!tags) return null;
        return tags.getOnly(
            function id() { return this._id || this; },
            function value() { return this.value ? this.value[lang || 'en'] : undefined; },
            function value_en() { return (admin && this.value) ? this.value.en : undefined; },
            function value_ru() { return (admin && this.value) ? this.value.ru : undefined; },
            function value_am() { return (admin && this.value) ? this.value.am : undefined; },
            function global_weight() { return admin ? this.global_weight : undefined }
        );
    }

    static generateKeywords(keywords, lang, admin) {
        if (!keywords) return null;
        lang = lang || AppConstants.language_values[0];
        return keywords.getOnly(
            function id() { return this._id; },
            function value() { return this.value ? this.value[lang] : undefined; },
            function value_en() { return admin ? this.value.en : undefined; },
            function value_ru() { return admin ? this.value.ru : undefined; },
            function value_am() { return admin ? this.value.am : undefined; },
            function global_weight() { return admin ? this.global_weight : undefined }
        );
    }

    static generateProducts(products, lang, admin) {
        if (!products) return null;
        lang = lang || AppConstants.language_values[0];
        return products.getOnly(
            function id() { return this._id; },
            function photos() {
                return (this.photos || []).map(p => AppConfigs.DOMAIN + AppConfigs.CDN_PREFIX + p);
            },
            function name() {
                return this.name ? this.name[lang] : undefined;
            },
            function name_en() { return admin ? this.name.en : undefined; },
            function name_ru() { return admin ? this.name.ru : undefined; },
            function name_am() { return admin ? this.name.am : undefined; },
            function description() {
                return this.description ? this.description[lang] : undefined;
            },
            function description_en() { return admin ? this.description.en : undefined; },
            function description_ru() { return admin ? this.description.ru : undefined; },
            function description_am() { return admin ? this.description.am : undefined; },
            'price', 'sale_price', 'sale_deadline',
            function likes_count() { return (this.likes || []).length; },
            'keywords'
        );
    }

    static generateAddress(address, lang, admin) {
        if (!address) return null;
        lang = lang || AppConstants.language_values[0];
        return address.getOnly(
            function country() { return this.country ? this.country[lang] : undefined; },
            function country_en() { return admin && this.country ? this.country.en : undefined; },
            function country_ru() { return admin && this.country ? this.country.ru : undefined; },
            function country_am() { return admin && this.country ? this.country.am : undefined; },
            function state() { return this.state ? this.state[lang] : undefined; },
            function state_en() { return admin && this.state ? this.state.en : undefined; },
            function state_ru() { return admin && this.state ? this.state.ru : undefined; },
            function state_am() { return admin && this.state ? this.state.am : undefined; },
            function city() { return this.city ? this.city[lang] : undefined; },
            function city_en() { return admin && this.city ? this.city.en : undefined; },
            function city_ru() { return admin && this.city ? this.city.ru : undefined; },
            function city_am() { return admin && this.city ? this.city.am : undefined; },
            function street() { return this.street ? this.street[lang] : undefined; },
            function street_en() { return admin && this.street ? this.street.en : undefined; },
            function street_ru() { return admin && this.street ? this.street.ru : undefined; },
            function street_am() { return admin && this.street ? this.street.am : undefined; },
            'zip', function coordinates() { return this.location.coordinates; },
            function more_info() { return this.more_info ? this.more_info[lang] : undefined; },
            function more_info_en() { return admin && this.more_info ? this.more_info.en : undefined; },
            function more_info_ru() { return admin && this.more_info ? this.more_info.ru : undefined; },
            function more_info_am() { return admin && this.more_info ? this.more_info.am : undefined; }
        );
    }

    static generateContactData(contact, lang, admin) {
        if (!contact) return undefined;
        return contact.getOnly(
            'phone', 'phones', 'email', 'website',
            function contact_person() {
                return UnitsResponse.generateContactPerson(this.contact_person, lang, admin);
            }
        );
    }

    static generateContactPerson(contact, lang, admin) {
        lang = lang || AppConstants.language_values[0];
        if (!contact) return undefined;
        return contact.getOnly(
            'username',
            function name() {
                return this.name ? this.name[lang] : undefined;
            },
            function name_en() { return admin && this.name ? this.name.en : undefined; },
            function name_ru() { return admin && this.name ? this.name.ru : undefined; },
            function name_am() { return admin && this.name ? this.name.am : undefined; },
            function title() {
                return this.title ? this.title[lang] : undefined;
            },
            function title_en() { return admin && this.title ? this.title.en : undefined; },
            function title_ru() { return admin && this.title ? this.title.ru : undefined; },
            function title_am() { return admin && this.title ? this.title.am : undefined; },
            'phone', 'email', 'website'
        );
    }

    static isUnitOpen(working_hours) {
        if (!working_hours) return false;
        let today = (new Date().getTime()) + 4*60*60*1000; // Yerevan time
        let today_date = new Date(today);
        let day_number = today_date.getDay();

        let day = (day_number == 1) ? 'mon'
                : (day_number == 2) ? 'tue'
                : (day_number == 3) ? 'wed'
                : (day_number == 4) ? 'thu'
                : (day_number == 5) ? 'fri'
                : (day_number == 6) ? 'sat'
                : 'sun';
        if (!working_hours[day]) return false; // fuck
        let start = working_hours[day].start;
        let end = working_hours[day].end;
        let start_hours = start / 100;
        let start_minutes = start % 100;
        let end_hours = end / 100;
        let end_minutes = end % 100;

        let converted_date = moment(today_date);
        let opening_today = moment().year(converted_date.year()).month(converted_date.month()).date(converted_date.date())
            .hour(start_hours).minute(start_minutes);
        let date = converted_date.date();
        if (end < start) ++date; // bubble up the day
        let closing_today = moment().year(converted_date.year()).month(converted_date.month()).date(date)
            .hour(end_hours).minute(end_minutes);

        return (today_date >= opening_today.toDate()) && (today_date <= closing_today.toDate());
    }

    static getUnitHours(working_hours) {
        if (!working_hours) return false;
        let converted_date = moment(new Date());
        converted_date = converted_date.tz('Asia/Yerevan');
        let today = converted_date.days();
        let day = (today == 1) ? 'mon'
                : (today == 2) ? 'tue'
                : (today == 3) ? 'wed'
                : (today == 4) ? 'thu'
                : (today == 5) ? 'fri'
                : (today == 6) ? 'sat'
                : 'sun';
        if (!working_hours[day]) return false; // fuck-2
        let start = working_hours[day].start;
        let end = working_hours[day].end;
        let start_hours = parseInt(start / 100);
        let start_minutes = start % 100;
        if (!start_minutes) {
            start_minutes = '00';
        }
        let start_am = start_hours < 12 ? 'am' : 'pm';
        let end_hours = parseInt(end / 100);
        let end_minutes = end % 100;
        if (!end_minutes) {
            end_minutes = '00';
        }
        let end_am = end_hours < 12 ? 'am' : 'pm';

        let hours = '' + start_hours + ':' + start_minutes + ' - ' + end_hours + ':' + end_minutes;
        //let hours = '' + start_hours +start_am + ' - ' + end_hours + end_am;
        return hours;
    }

}

module.exports = UnitsResponse;
