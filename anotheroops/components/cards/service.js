const moment = require('moment-timezone');

const Utility = require('./../utility/service');
const ResponseErrors = require('./../response/errors');
const AppConstants = require('./../settings/constants');
const SystemEvents = require('./../system-events/service');
const AppSettings = require('./../settings/service');
const AppConfigs = require('./../settings/configs');

//const CardsDAO = require('./private/dao');
const CardsValidator = require('./private/validator');
const CardsResponse = require('./private/response');
const CardsSettings = require('./../settings/service').cards;

const ItemTypes = {
    LARGE: 'large_item',
    REGULAR: 'regular_item',
    DETAILED_PHOTOS: 'detailed_photos_item',
    WIDE: 'wide_item',
    VERTICAL: 'vertical_item',
    ACTIVITY: 'activity_item',
    MAP_WIDGET: 'map_widget',
    RATING: 'rating_item',
    REVIEW: 'review_item',
    USER_WIDGET: 'user_widget',
    RANDOM_ITEM: 'random_item',
    PHOTO: 'photo',
    UNIT_ACTIONS: 'unit_actions'
}

class CardsService {

    constructor() {}

    getActivityCards(options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            options.injections = options.injections || {};
            const ActivityService = options.injections.ActivityService;
            const ReviewsService = options.injections.ReviewsService;
            if (!ActivityService || !ReviewsService) {
                return reject({
                    reason: ResponseErrors.CONTRACT_VIOLATION,
                    more_info: {message: 'No ActivityService or ReviewsService injected.'}
                });
            }
            options.requester = {id: null};
            options.sort = {
                created: -1
            };
            let review_activities = [];
            ActivityService.getActivityForUser(options.requester.id, options).then(activities => {
                review_activities = (activities || []).filter(a => a.action == 'review');

                let review_options = {
                    filters: {
                        _id: {$in: review_activities.map(a => a.target_id)}
                    },
                    populate: 'unit',
                    offset: 0,
                    limit: review_activities.length
                };
                return ReviewsService.getReviews(review_options);
            }).then(reviews => {
                (reviews || []).forEach(r => {
                    for (let ix = 0; ix < review_activities.length; ++ix) {
                        if (review_activities[ix] && review_activities[ix].target_id.toString() == r.id.toString()) {
                            review_activities[ix].review = r;
                        }
                    }
                });
                let cards = (review_activities || []).map(a => this.generateActivityCard(a));
                return resolve(cards);
            }).catch(err => {
                SystemEvents.emit('error', err);
                return reject({
                    reason: ResponseErrors.INTERNAL_ERROR
                });
            });
        });
    }

    getNearbyCards(latitude, longitude, group, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            options.injections = options.injections || {};

            const UnitsService = options.injections.UnitsService;
            const CategoriesService = options.injections.CategoriesService;
            const GroupsService = options.injections.GroupsService;
            if (!UnitsService || !CategoriesService || !GroupsService) {
                return reject({
                    reason: ResponseErrors.CONTRACT_VIOLATION,
                    more_info: {message: 'One of [UnitsService, CategoriesService] not injected.'}
                });
            }

            let validation = CardsValidator.validateAll([
                {key: 'latitude', value: latitude, options: {required: true, sanitize: true}},
                {key: 'longitude', value: longitude, options: {required: true, sanitize: true}},
                {key: 'is_open', value: options.is_open, options: {required: false, sanitize: true}},
                {key: 'price', value: options.price, options: {required: false, sanitize: true}}
            ]);
            if (!validation.is_valid) {
                return reject({
                    reason: ResponseErrors.VALIDATION_ERROR,
                    more_info: validation
                });
            }

            let category_classification = [];

            if (group == 'food') { group = 'Food'; }
            if (group == 'beauty') { group = 'Beauty'; }
            if (group == 'hotel') { group = 'Hotels'; }
            if (group == 'shopping') { group = 'Shopping'; }
            if (group == 'nightLife') { group = 'Night life'; }

            options.filters = {};
            GroupsService.getGroups(options).then(groups => {
                groups = (groups || []).filter(g => {
                    return g.id && g.id.toString() == group || g.title == group
                });
                if (groups && groups.length) {
                    options.filters = {
                        group_id: groups[0].id
                    }
                }

                return CategoriesService.getCategories(options);

            }).then(categories => {
                options.filters = this._constructUnitsQuery(validation);
                if (categories && categories.length) {
                    options.filters.categories = {
                        $in: (categories || []).map(c => {
                            category_classification.push({title: c.title, id: c.id});
                            return c.id;
                        })
                    };
                }

                let geo = [
                    validation.longitude.sanitized_value,
                    validation.latitude.sanitized_value
                ];

                /*
                options.filters['address.location'] = {
                    $near: {
                            $geometry : {
                                type : "Point" ,
                                coordinates : geo,
                                spherical: true,
                                distanceField: 'distance'
                            },
                    }
                }

                return UnitsService.getUnits(options);
                */
                options.limit = 20;
                return UnitsService.geoSearchUnits(geo, options);
            }).then(units => {
                let classified_units = this._classifyUnits(units, category_classification, options.requester);
                let cards = this.generateNearbyCards(classified_units);
                return resolve(cards);
            }).catch(err => {
                SystemEvents.emit('error', err);
                if (err.reason) return reject(err);
                return reject({
                    reason: ResponseErrors.INTERNAL_ERROR
                });
            });
        });
    }

    getOtherGroupCards(options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            options.injections = options.injections || {};

            const GroupsService = options.injections.GroupsService;
            if (!GroupsService) {
                return reject({
                    reason: ResponseErrors.CONTRACT_VIOLATION,
                    more_info: {
                        message: 'One of [GroupsService] is not injections'
                    }
                });
            }

            GroupsService.getGroups(options).then(groups => {
                groups = groups.filter(g => !['Food', 'Beauty', 'Hotels', 'Shopping', 'Night life'].includes(g.title));
                return resolve(groups);
            }).catch(err => {
                return reject({
                    reason: ResponseErrors.INTERNAL_ERROR
                })
            });
        });
    }

    getHomeCards(group, clarifier, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            options.injections = options.injections || {};

            const UnitsService = options.injections.UnitsService;
            const CategoriesService = options.injections.CategoriesService;
            const TagsService = options.injections.TagsService;
            const GroupsService = options.injections.GroupsService;
            const CollectionsService = options.injections.CollectionsService;
            if (!UnitsService || !CategoriesService || !TagsService || !GroupsService || !CollectionsService) {
                return reject({
                    reason: ResponseErrors.CONTRACT_VIOLATION,
                    more_info: {
                        message: 'One of [UnitsService, CategoriesService, TagsService, GroupsService, CollectionsService] is not injected.'
                    }
                });
            }

            let validation = CardsValidator.validateAll([
                {key: 'is_open', value: options.is_open, options: {required: false, sanitize: true}},
                {key: 'price', value: options.price, options: {required: false, sanitize: true}}
            ]);
            if (!validation.is_valid) {
                return reject({
                    reason: ResponseErrors.VALIDATION_ERROR,
                    more_info: validation
                });
            }

            if (clarifier && clarifier.id && clarifier.type == AppConstants.clarifiers.COLLECTION_TYPE) {
                // return units by collection
            }

            let category_classification = [];

            let units_query = this._constructUnitsQuery(validation);

            if (group == 'food') { group = 'Food'; }
            if (group == 'beauty') { group = 'Beauty'; }
            if (group == 'hotel') { group = 'Hotels'; }
            if (group == 'shopping') { group = 'Shopping'; }
            if (group == 'nightLife') { group = 'Night life'; }

            options.filters = {};
            let saved_offset = options.offset;
            options.offset = 0;

            GroupsService.getGroups(options).then(groups => {
                groups = (groups || []).filter(g => {
                    return g.id && g.id.toString() == group || g.title == group
                });

                if (groups && groups.length) {
                    options.filters = {
                        group_id: {$in: groups.map(g => g.id)}
                    }
                }
                if (options.categories) {
                    let categories_filtering = options.categories.split(',');
                    categories_filtering = categories_filtering.filter(c => c);
                    if (categories_filtering.length) {
                        options.filters._id = {
                            $in: options.categories.split(',')
                        };
                    }
                }
                if (clarifier && clarifier.id && clarifier.type == AppConstants.clarifiers.CATEGORY_TYPE) {
                    options.filters._id = {
                        $in: clarifier.id
                    }
                }

                options.offset = 0;
                return CategoriesService.getCategories(options);

            }).then(categories => {
                if (categories && categories.length) {
                    units_query.categories = {
                        $in: (categories || []).map(c => {
                            category_classification.push({title: c.title, id: c.id});
                            return c.id;
                        })
                    };
                }
                options.is_tag = true;
                return this._getTagsForClarifier(clarifier, options);
            }).then(tags => {
                if (tags) {
                    units_query.tags = {$in: tags};
                }

                options.filters = units_query;
                options.limit = 20;
                options.offset = saved_offset;
                options.sort = {'stats.searched_count': -1, 'stats.reviews_count': -1, 'stats.five_stars': -1 };
                return UnitsService.getUnits(options);
            }).then(units => {
                let classified_units = this._classifyUnits(units, category_classification, options.requester);
                let cards = this.generateHomeCards(classified_units);
                return resolve(cards);
            }).catch(err => {
                SystemEvents.emit('error', err);
                if (err.reason) return reject(err);
                return reject({
                    reason: ResponseErrors.INTERNAL_ERROR
                });
            });
        });
    }

    getHomeClarifiers(group, tracking_id, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            options.injections = options.injections || {};

            const UnitsService = options.injections.UnitsService;
            const CategoriesService = options.injections.CategoriesService;
            const TagsService = options.injections.TagsService;
            const GroupsService = options.injections.GroupsService;
            const CollectionsService = options.injections.CollectionsService;
            if (!UnitsService || !CategoriesService || !TagsService || !GroupsService || !CollectionsService) {
                return reject({
                    reason: ResponseErrors.CONTRACT_VIOLATION,
                    more_info: {message: 'One of [UnitsService, CategoriesService, TagsService, GroupsService, CollectionsService] is not injected.'}
                });
            }

            let clarifiers = [];

            if (group == 'food') { group = 'Food'; }
            if (group == 'beauty') { group = 'Beauty'; }
            if (group == 'hotel') { group = 'Hotels'; }
            if (group == 'shopping') { group = 'Shopping'; }
            if (group == 'nightLife') { group = 'Night life'; }

            if (!group || group == 'home' || group == 'Home') {
                return CollectionsService.getCollections(options).then(cols => {
                    return resolve(cols);
                }).catch(err => {
                    return reject({
                        reason: ResponseErrors.INTERNAL_ERROR
                    });
                });
            }

            options.filters = {};
            GroupsService.getGroups(options).then(groups => {
                if (group == 'other') {
                    groups = groups.filter(g => !['Food', 'Beauty', 'Hotels', 'Shopping', 'Night life'].includes(g.title));
                } else {
                    groups = (groups || []).filter(g => {
                        return g.id && g.id.toString() == group || g.title == group
                    });
                }

                if (groups && groups.length) {
                    options.filters = {
                        group_id: groups[0].id
                    }
                }

                return CategoriesService.getCategories(options);
            }).then(categories => {
                return resolve(this.generateCategoryClarifiers(categories, tracking_id));
            }).catch(err => {
                SystemEvents.emit('error', err);
                if (err.reason) return reject(err);
                return reject({
                    reason: ResponseErrors.INTERNAL_ERROR
                });
            });
        });
    }

    generateCategoryClarifiers(categories, tracking_id) {
        let clarifiers = categories.map(c => {
            return {
                id: c.id,
                type: AppConstants.clarifiers.CATEGORY_TYPE,
                value: c.title
            }
        });
        return clarifiers;
    }

    getEventCards(options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            options.injections = options.injections || {};

            const UnitsService = options.injections.UnitsService;
            if (!UnitsService) {
                return reject({
                    reason: ResponseErrors.CONTRACT_VIOLATION,
                    more_info: {message: 'One of [UnitsService] is not injected.'}
                });
            }

            options.filters = {
                unit_type: AppSettings.units.unit_type.EVENT
            };
            options.sort = {
                'metadata.created': -1
            };
            UnitsService.getUnits(options).then(events => {
                let classified_events = this._classifyEvents(events, options.requester);
                let cards = this.generateEventCards(classified_events);
                return resolve(cards);
            }).catch(err => {
                SystemEvents.emit('error', err);
                return reject({
                    reason: ResponseErrors.INTERNAL_ERROR
                });
            });

        });
    }

    getProfileCards(user_id, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            options.injections = options.injections || {};

            const UsersService = options.injections.UsersService;
            const ReviewsService = options.injections.ReviewsService;
            const UnitsService = options.injections.UnitsService;
            if (!UsersService || !ReviewsService || !UnitsService) {
                return reject({
                    reason: ResponseErrors.CONTRACT_VIOLATION,
                    more_info: {message: 'One of [UsersService, ReviewsService, UnitsService] is not injected.'}
                });
            }
            if (!user_id) {
                return reject({
                    reason: ResponseErrors.VALIDATION_ERROR,
                    more_info: {message: 'User ID not provided.'}
                });
            }

            let final_user = null;
            UsersService.getUserById(user_id, options).then(user => {
                if (!user) {
                    return reject({
                        reason: ResponseErrors.RESOURCE_NOT_FOUND,
                        more_info: {message: 'User not found.'}
                    })
                }
                final_user = user;

                options.populate = 'unit user';
                options.sort = {'metadata.created': -1};
                return ReviewsService.getReviewsByUser(final_user.id, options);
            }).then(reviews => {
                if (reviews && reviews.length) {
                    final_user.reviews = reviews;
                }

                options.populate = '';
                options.filters = {
                    _id: {$in: final_user.activity ? (final_user.activity.recent_views || []).slice(0, 5) : []}
                };
                return UnitsService.getUnits(options);
            }).then(recent_views => {
                if (recent_views && recent_views.length) {
                    final_user.activity = {
                        recent_views: recent_views
                    }
                }

                return resolve(this.generateUserProfileCards(final_user, options));
            }).catch(err => {
                SystemEvents.emit('error', err);
                return reject({
                    reason: ResponseErrors.INTERNAL_ERROR
                });
            });
        });
    }

    getSearchCards(options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            options.injections = options.injections || {};

        });
    }

    getUnitsListCards(q, suggestion, units, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            options.injections = options.injections || {};

            const UnitsService = options.injections.UnitsService;
            if (!UnitsService) {
                return reject({
                    reason: ResponseErrors.CONTRACT_VIOLATION,
                    more_info: {message: 'One of [UnitsService] is not injected.'}
                });
            }

            units = (units || []).filter(u => u);
            if (units && units.length) {
                options.filters = {
                    _id: {$in: units}
                };
                return UnitsService.getUnits(options).then(units => {
                    return resolve(this.generateUnitsListCards(units));
                }).catch(err => {
                    SystemEvents.emit('error', err);
                    return reject({
                        reason: ResponseErrors.INTERNAL_ERROR
                    });
                });
            }

            q = CardsValidator.sanitizeQueryString(q);
            let units_query = {};
            if (q) {
                units_query['$or'] = [
                    {'name.en': new RegExp('^' + q, 'i')},
                    {'name.ru': new RegExp('^' + q, 'i')},
                    {'name.am': new RegExp('^' + q, 'i')},
                    {'address.street.en': new RegExp('^' + q, 'i')},
                    {'address.street.ru': new RegExp('^' + q, 'i')},
                    {'address.street.am': new RegExp('^' + q, 'i')},
                    {'name.en': new RegExp('.*' + q + '.*', 'i')},
                    {'name.ru': new RegExp('.*' + q + '.*', 'i')},
                    {'name.am': new RegExp('.*' + q + '.*', 'i')}
                ]
            }

            // TODO: remember to add search by tags also for input 'q'

            options.is_tag = true;
            this._getTagsForClarifier(suggestion, options).then(tags => {
                if (tags && tag.length) {
                    units_query.tags = {$in: tags}
                }

                options.is_tag = false;
                options.is_keyword = true;
                return this._getTagsForClarifier(suggestion, options);
            }).then(keywords => {
                if (keywords && keywords.length) {
                    units_query.keywords = {$in: keywords}
                }

                options.is_keyword = false;
                options.is_feature = true;
                return this._getTagsForClarifier(suggestion, options);
            }).then(features => {
                if (features && features.length) {
                    units_query.features = {$in: features}
                }

                options.filters = units_query;
                if (!options.filters || (JSON.stringify(options.filters) == JSON.stringify({}))) {
                    return resolve([]);
                }
                return UnitsService.getUnits(options);
            }).then(units => {
                return resolve(this.generateUnitsListCards(units));
            }).catch(err => {
                SystemEvents.emit('error', err);
                return reject({
                    reason: ResponseErrors.INTERNAL_ERROR
                });
            });
        });
    }

    getUnitCards(unit, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            options.injections = options.injections || {};

            const UnitsService = options.injections.UnitsService;
            const ReviewsService = options.injections.ReviewsService;
            if (!UnitsService || !ReviewsService) {
                return reject({
                    reason: ResponseErrors.CONTRACT_VIOLATION,
                    more_info: {message: 'One of [UnitsService, ReviewsService] is not injected.'}
                });
            }

            options.populate = 'tags';
            UnitsService.getUnitById(unit, options).then(unit => {
                if (!unit) {
                    return reject({
                        reason: ResponseErrors.RESOURCE_NOT_FOUND,
                        more_info: {message: 'Unit not found.'}
                    });
                }

                // donno wtf is going on with the tags
                //unit.tags = (unit.tags || []).filter(t => t && t.value && t.value.en).map(t => t.value.en);
                let reviews = (unit.reviews || []).map(r => r.id);
                options.filters = {
                    _id: {$in: reviews}
                };
                options.populate = 'user';
                options.select = undefined;
                options.sort = {'metadata.created': -1};
                ReviewsService.getReviews(options).then(reviews => {
                    unit.reviews = reviews;
                    switch (unit.unit_type) {
                        case AppSettings.units.unit_type.EVENT:
                            return resolve(this.generateEventPageCards(unit, options.requester));
                        case AppSettings.units.unit_type.BUSINESS:
                            return resolve(this.generateUnitPageCards(unit, options.requester));
                        case AppSettings.units.unit_type.PERSON:
                            return resolve(this.generatePersonPageCards(unit, options.requester));
                        default:
                            return resolve(this.generateUnitPageCards(unit, options.requester));
                    }
                }).catch(err => {
                    SystemEvents.emit('error', err);
                    return reject({
                        reason: ResponseErrors.INTERNAL_ERROR
                    });
                });
            }).catch(err => {
                SystemEvents.emit('error', err);
                return reject({
                    reason: ResponseErrors.INTERNAL_ERROR
                });
            });

        });
    }

    getFiltersDialog(group, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            options.injections = options.injections || {};

            if (group == 'food') { group = 'Food'; }
            if (group == 'beauty') { group = 'Beauty'; }
            if (group == 'hotel') { group = 'Hotels'; }
            if (group == 'shopping') { group = 'Shopping'; }
            if (group == 'nightLife') { group = 'Night life'; }

            const CategoriesService = options.injections.CategoriesService;
            const GroupsService = options.injections.GroupsService;
            if (!CategoriesService || !GroupsService) {
                return reject({
                    reason: ResponseErrors.CONTRACT_VIOLATION,
                    more_info: {message: 'One of [CategoriesService] is not injected.'}
                });
            }

            let dialog_elements = [
                {key: 'is_open', type: 'check_box', label: 'Open Now'},
                {key: 'price', type: 'picker', label: 'Price Range', values: ['$', '$$', '$$$', '$$$$']}
            ];

            options.filters = {
                $or: [
                    {'title.en': group},
                    {'title.ru': group},
                    {'title.am': group}
                ]
            };

            GroupsService.getGroups(options).then(groups => {
                options.filters = {};
                if (groups && groups.length) {
                    options.filters = {
                        group_id: {$in: groups.map(g => g.id)}
                    };
                }

                return CategoriesService.getCategories(options);
            }).then(categories => {
                if (group && categories && categories.length) {
                    dialog_elements.push({key: 'desc', type: 'text', label: 'Categories'});
                    categories.forEach(cat => {
                        dialog_elements.push({
                            key: 'category',
                            type: 'check_box',
                            value: cat.id,
                            label: cat.title,
                            image: cat.photo
                        });
                    })
                }

                let dialog = {
                    title: 'Filter Places',
                    description: 'Choose the filters below to search particular places',
                    elements: dialog_elements,
                    button: this.generateFiltersSubmitButton()
                };
                return resolve(dialog);
            }).catch(err => {
                SystemEvents.emit('error', err);
                return reject({
                    reason: ResponseErrors.INTERNAL_ERROR
                });
            });
        })
    }

    // Secondary methods with helpers

    generateCard(header, items, buttons, footer, options) {
        options = options || {};
        return {
            id: Date.now(),
            header: header,
            items: items,
            buttons: buttons,
            footer: footer,
            border: options.border,
            render_items: options.render_items,
            item_type: options.item_type,
            width: options.width || 100,
            render_buttons: options.render_buttons,
            opacity: options.opacity,
            order: options.order,
            background_color: options.background_color
        };
    }

    generateActivityCard(activity) {
        let footer = null;
        let buttons = null;
        let header = this.generateCardHeadline(null, null, null);
        let items = [this.generateActivityItem(activity)];
        return this.generateCard(header, items, buttons, footer, {
            item_type: ItemTypes.ACTIVITY,
            render_items: CardsSettings.items_rendering.VERTICAL
        });
    }

    generateActivityItem(activity) {
        return {
            user_id: activity.user.id,
            username: activity.user.username,
            avatar: activity.user.avatar,
            user_info: activity.action,
            activity_info: activity.item.info,
            photos: activity.item.photos,
            review: activity.review
        };
    }

    generateNearbyCards(classified_units) {
        let cards = [];
        cards = cards.concat(this.generateUnitCard(classified_units.top_picks, ItemTypes.WIDE, {
            source: CardsSettings.targets.NEARBY
        }));
        cards = cards.concat(this.generateUnitCard(classified_units.recent, ItemTypes.DETAILED_PHOTOS, {
            source: CardsSettings.targets.NEARBY
        }));
        let by_categories = classified_units.by_categories;
        Object.keys(classified_units.by_categories).forEach(cat => {
            cards = cards.concat(this.generateUnitCard(by_categories[cat], ItemTypes.REGULAR, {
                source: CardsSettings.targets.NEARBY,
                headline_text: cat
            }));
        });
        // TODO: implement localization tr() function for global translation
        cards = cards.concat(this.generateUnitCard(classified_units.recently_viewed, ItemTypes.VERTICAL, {
            headline_text: 'Recently viewed',
            source: CardsSettings.targets.NEARBY
        }));
        cards = cards.concat(this.generateUnitCard(classified_units.others, ItemTypes.RANDOM_ITEM, {
            source: CardsSettings.targets.NEARBY
        }));
        return cards;
    }

    generateHomeCards(classified_units) {
        let cards = [];
        cards = cards.concat(this.generateUnitCard(classified_units.top_picks, ItemTypes.WIDE, {
            order: cards.length,
            source: CardsSettings.targets.HOME
        }));
        cards = cards.concat(this.generateUnitCard(classified_units.recent, ItemTypes.DETAILED_PHOTOS, {
            order: cards.length,
            source: CardsSettings.targets.HOME
        }));
        let by_categories = classified_units.by_categories;
        Object.keys(classified_units.by_categories).forEach(cat => {
            cards = cards.concat(this.generateUnitCard(by_categories[cat], ItemTypes.REGULAR, {
                headline_text: cat,
                order: cards.length,
                source: CardsSettings.targets.HOME
            }));
        });
        // TODO: implement localization tr() function for global translation
        cards = cards.concat(this.generateUnitCard(classified_units.recently_viewed, ItemTypes.VERTICAL, {
            headline_text: 'Recently viewed',
            order: cards.length,
            source: CardsSettings.targets.HOME
        }));
        cards = cards.concat(this.generateUnitCard(classified_units.others, ItemTypes.RANDOM_ITEM, {
            order: cards.length,
            source: CardsSettings.targets.HOME
        }));
        return cards;
    }

    generateUnitCard(data, item_type, options) {
        data = data || [];
        options = options || {};
        // Major refactoring needed
        let header = this.generateCardHeadline(null, options.headline_text, null);
        let footer = null;
        let buttons = null;
        let items = [];
        let cards_arr = [];
        let card_options = {
            order: options.order,
            item_type: item_type,
            width: 100,
            render_items: CardsSettings.items_rendering.VERTICAL
        };
        let count = 0;

        switch (item_type) {
            case ItemTypes.WIDE:
                (data || []).forEach(item => {
                    let wide_item = this.generateUnitWideItem(item, options);
                    card_options.order++;
                    cards_arr.push(this.generateCard(header, [wide_item], buttons, footer, card_options));
                });
                break;
            case ItemTypes.DETAILED_PHOTOS:
                count = CardsSettings.detailed_photos_items_count_per_card;
                for (let ix = 0; ix < data.length; ix += count) {
                    for (let jx = 0; jx < count && (jx + ix) < data.length; ++jx) {
                        items.push(this.generateUnitDetailedPhotosItem(data[ix + jx], options));
                    }
                    card_options.order++;
                    cards_arr.push(this.generateCard(header, items, buttons, footer, card_options));
                    items = [];
                }
                break;
            case ItemTypes.REGULAR:
                count = CardsSettings.regular_items_count_per_card;
                for (let ix = 0; ix < data.length; ix += count) {
                    for (let jx = 0; jx < count && (jx + ix) < data.length; ++jx) {
                        items.push(this.generateUnitRegularItem(data[ix + jx], options));
                    }
                    card_options.order++;
                    cards_arr.push(this.generateCard(header, items, buttons, footer, card_options));
                    items = [];
                }
                break;
            case ItemTypes.VERTICAL:
                card_options.render_items = CardsSettings.items_rendering.HORIZONTAL;
                count = CardsSettings.vertical_items_count_per_card;
                for (let ix = 0; ix < data.length; ix += count) {
                    for (let jx = 0; jx < count && (jx + ix) < data.length; ++jx) {
                        items.push(this.generateUnitVerticalItem(data[ix + jx], options));
                    }
                    card_options.order++;
                    cards_arr.push(this.generateCard(header, items, buttons, footer, card_options));
                    items = [];
                }
                break;
            case ItemTypes.LARGE:
                (data || []).forEach(item => {
                    items.push(this.generateUnitLargeItem(item, options));
                    card_options.order++;
                    cards_arr.push(this.generateCard(header, items, buttons, footer, card_options));
                });
                break;
            case ItemTypes.RANDOM_ITEM:
                let regulars = data.slice(0, 10);
                let wides = data.slice(11, 17);
                let detailed = data.slice(17, 25);
                let large = data.slice(25, 30);
                let vertical = data.slice(30);


                cards_arr = cards_arr.concat(this.generateUnitCard(regulars, ItemTypes.REGULAR, {
                    order: card_options.order + cards_arr.length,
                    source: options.source
                }));
                cards_arr = cards_arr.concat(this.generateUnitCard(wides, ItemTypes.WIDE, {
                    order: card_options.order,
                    source: options.source
                }));

                cards_arr = cards_arr.concat(this.generateUnitCard(detailed, ItemTypes.DETAILED_PHOTOS, {
                    order: card_options.order + cards_arr.length,
                    headline_text: 'Detailed photos',
                    source: options.source
                }));
                cards_arr = cards_arr.concat(this.generateUnitCard(large, ItemTypes.LARGE, {
                    order: card_options.order + cards_arr.length,
                    source: options.source
                }));
                cards_arr = cards_arr.concat(this.generateUnitCard(vertical, ItemTypes.VERTICAL, {
                    order: card_options.order + cards_arr.length,
                    headline_text: 'Random vertical',
                    source: options.source
                }));
                break;
            default:

        }
        return cards_arr;
    }

    generateUnitsListCards(units, options) {
        options = options || {};
        let header = this.generateCardHeadline(null, null, null);
        let footer = null;
        let buttons = null;
        let cards_arr = [];
        let card_options = {
            order: options.order || 0,
            item_type: ItemTypes.WIDE,
            width: 100,
            render_items: CardsSettings.items_rendering.VERTICAL
        };
        let count = 0;

        (units || []).forEach(item => {
            let wide_item = this.generateUnitWideItem(item, options);
            card_options.order++;
            cards_arr.push(this.generateCard(header, [wide_item], buttons, footer, card_options));
        });
        return cards_arr;
    }

    generateUserProfileCards(user, options) {
        let is_me = (options.requester && options.requester.id && options.requester.id.toString() == user.id.toString());
        let user_info = {
            photo: user.avatar,
            cover: user.cover,
            name: user.name,
            username: user.username,
            points: user.points,
            birthday: user.birthday,
            gender: user.gender,
            email: is_me ? user.email : undefined,
            phone: is_me ? user.phone : undefined,
            show_edit: is_me ? 1 : undefined,
            reviews_count: (user.reviews || []).length,
            visited_places: user.visited_places,
            settings: is_me ? user.settings : undefined
        }
        let card_options = {
            item_type: ItemTypes.USER_WIDGET,
            render_items: 'vertical',
            width: 100,
            order: 0
        };
        let edit_profile_btn = is_me ? this.generateEditProfileButton(user.id) : null;
        let follow_btn = this.generateFollowUserButton(user.id, options.requester);
        let block_btn = this.generateBlockUserButton(user.id, options.requester);
        let buttons = is_me ? [edit_profile_btn] : [follow_btn, block_btn];
        let user_card = this.generateCard(null, [user_info], buttons, null, card_options);

        let reviews_header = this.generateCardHeadline(null, 'Reviews', null);
        let show_more_reviews_btn = this.generateSeeAllReviewsButton(user.id);
        let review_items = (user.reviews || []).map(r => this.generateReviewItem(r, {user_pov: true}));
        card_options.item_type = ItemTypes.REVIEW;
        card_options.order++;
        let reviews_card = this.generateCard(reviews_header, review_items, [show_more_reviews_btn], null, card_options);

        let recently_viewed = null;
        if (is_me && user.activity && user.activity.recent_views) {
            recently_viewed = this.generateUnitCard(user.activity.recent_views, ItemTypes.VERTICAL, {
                headline_text: 'Recently viewed',
                source: CardsSettings.targets.PROFILE,
                order: card_options.order++
            });
        }

        let cards = [];
        cards = cards.concat(user_card);
        cards = cards.concat(reviews_card);
        cards = cards.concat(recently_viewed);
        cards = cards.filter(c => c);
        return cards;
    }

    generateEditProfileButton(user_id) {
        return null;
    }

    generateFollowUserButton(user_id, follower) {
        return null;
    }

    generateBlockUserButton(user_id, blocker) {
        return null;
    }

    generateSeeAllReviewsButton(user_id) {
        return null;
    }

    generateItemActionObject(target, subtarget, source, request) {
        return {
            target: target,
            subtarget: subtarget,
            target_params: {
                from_screen: source,
                unit_id: subtarget
            },
            request: request
        }
    }

    generateUnitWideItem(item, options) {
        item = item || {};
        options = options || {};
        item.address = item.address || {};
        item.address.coordinates = item.address.coordinates || {};
        return {
            id: item.id,
            open: item.is_open,
            photo: item.photo,
            title: item.name,
            hours: item.hours,
            rating: item.rating,
            address: item.address.street,
            latitude: this._parseLatitude(item.address),
            longitude: this._parseLongitude(item.address),
            distance: item.distance,
            review_label: item.reviews_count + ' reviews', // localization needed
            action: this.generateItemActionObject(CardsSettings.targets.UNIT, item.id, options.source)
        };
    }

    generateUnitDetailedPhotosItem(item, options) {
        item = item || {};
        options = options || {};
        item.address = item.address || {};
        item.address.coordinates = item.address.coordinates || {};
        return {
            id: item.id,
            photo: item.photo,
            title: item.name,
            rating: item.rating,
            price: item.price,
            open: item.is_open,
            review_label: item.reviews_count + ' reviews',
            other_photos: item.photos,
            latitude: this._parseLatitude(item.address),
            longitude: this._parseLongitude(item.address),
            distance: item.distance,
            action: this.generateItemActionObject(CardsSettings.targets.UNIT, item.id, options.source)
        };
    }

    generateUnitRegularItem(item, options) {
        item = item || {};
        options = options || {};
        item.address = item.address || {};
        item.address.coordinates = item.address.coordinates || {};
        return {
            id: item.id,
            tags: (item.tags || []).slice(0, 3),
            open: item.is_open,
            title: item.name,
            photo: item.photo,
            price: item.price,
            rating: item.rating,
            address: item.address.street,
            latitude: this._parseLatitude(item.address),
            longitude: this._parseLongitude(item.address),
            distance: item.distance,
            review_label: item.reviews_count + ' reviews',
            action: this.generateItemActionObject(CardsSettings.targets.UNIT, item.id, options.source)
        };
    }

    generateUnitVerticalItem(item, options) {
        item = item || {};
        options = options || {};
        item.address = item.address || {};
        item.address.coordinates = item.address.coordinates || {};
        return {
            id: item.id,
            title: item.name,
            address: item.address.street,
            rating: item.rating,
            reviews_count: item.reviews_count,
            photo: item.photo,
            latitude: this._parseLatitude(item.address),
            longitude: this._parseLongitude(item.address),
            distance: item.distance,
            action: this.generateItemActionObject(CardsSettings.targets.UNIT, item.id, options.source)
        };
    }

    generateUnitLargeItem(item, options) {
        item = item || {};
        options = options || {};
        item.address = item.address || {};
        item.address.coordinates = item.address.coordinates || {};
        options = options || {};
        return {
            id: item.id,
            show_back_icon: options.show_back_icon,
            open: options.source == CardsSettings.targets.EVENTS ? undefined : item.is_open,
            title: item.name,
            price: item.price,
            hours: item.hours,
            photo: item.photo,
            rating: item.rating,
            address: item.address.street,
            latitude: this._parseLatitude(item.address),
            longitude: this._parseLongitude(item.address),
            distance: item.distance,
            review_label: options.source == CardsSettings.targets.EVENTS ? 'Navasar, Arami 42/1' : item.reviews_count + ' reviews',
            tags: options.source == CardsSettings.targets.EVENTS ? '#jeanpaulexistentialcafe #navavar' : item.tags,
            action: !options.no_action
                    ? this.generateItemActionObject(CardsSettings.targets.UNIT, item.id, options.source)
                    : undefined
        };
    }

    generatePhotoItem(item, options) {
        item = item || {};
        options = options || {};
        return {
            photo: item,
            action: this.generatePhotoActionObject(CardsSettings.targets.PHOTO_VIEWER, options)
        };
    }

    generatePhotoActionObject(target, options) {
        options = options || {};
        return {
            target: target,
            subtarget: null,
            target_params: {
                from_screen: options.source,
                photoViewerArray: options.photos
            }
        }
    }

    generatePhotosCard(photos, options) {
        let items = [];
        (photos || []).forEach(photo => {
            items.push(this.generatePhotoItem(photo, options))
        });
        let header = this.generateCardHeadline(null, 'Photos', null);
        let card_options = {
            item_type: ItemTypes.VERTICAL,
            width: 100,
            render_items: CardsSettings.items_rendering.HORIZONTAL,
            order: options.order
        };
        let cards = [];
        cards.push(this.generateCard(header, items, null, null, card_options));
        return cards;
    }

    generateReviewItem(review, options) {
        options = options || {};
        review.user = review.user || {};
        review.metadata = review.metadata || {};
        let name = options.user_pov ? review.unit.name : review.user.username;
        let avatar = '';
        if (options.user_pov) {
            avatar = review.unit.photo;
        } else {
            avatar = review.user.avatar ? AppConfigs.DOMAIN + AppConfigs.CDN_PREFIX + review.user.avatar : AppSettings.users.default_avatar_url;
        }

        let date_prettyfying = {year: 'numeric', month: 'short', day: '2-digit'};
        return {
            id: options.user_pov ? review.unit.id : review.user.id,
            is_unit: options.user_pov,
            title: name,
            username: review.user.username,
            photo: avatar,
            text: review.text,
            rating: review.rating,
            date: new Intl.DateTimeFormat('en-US', date_prettyfying).format(review.created)
        };
    }

    generateReviewsCard(reviews, options) {
        let items = (reviews || []).map(r => this.generateReviewItem(r, options));
        let header = this.generateCardHeadline(null, 'Reviews', null);
        let card_options = {
            item_type: ItemTypes.REVIEW,
            width: 100,
            render_items: CardsSettings.items_rendering.VERTICAL,
            order: options.order
        };
        let buttons = []; // review card buttons

        let cards = [];
        cards.push(this.generateCard(header, items, null, null, card_options));
        return cards;
    }

    generateUnitMapWidgetCard(unit, options) {
        options = options || {};
        let map_data = {
            address: unit.address.street.en,
            button_title: 'Get Directions',
            unit_list: [{
                title: unit.name,
                disabled: true,
                latitude: this._parseLatitude(unit.address),
                longitude: this._parseLongitude(unit.address),
                distance: unit.distance,
                address: unit.address.street,
                rating: unit.rating,
                countReview: unit.reviews_count,
                photo: unit.photo
            }],
            width: 100,
            item_type: ItemTypes.MAP_WIDGET,
            order: options.order,
            header: null,
            footer: null,
            buttons: null
        };
        return map_data;
    }


    generateEventCards(classified_events, user) {
        let cards = this.generateUnitCard(classified_events.others, ItemTypes.LARGE, {
            order: 0,
            source: CardsSettings.targets.EVENTS,
            headline_text: 'Saturday, Dec 2, 9.00pm'
        });
        return cards;
    }

    generateFiltersSubmitButton(target, subtarget) {
        let button = {
            title: 'Apply Filters'
        };
        let url = AppConfigs.DOMAIN + AppConfigs.API_BASE_URL
                + AppConstants.api_urls.HOME_CARDS.replace(':target', target || 'home')
                + (subtarget ? '?group=' + subtarget : '');
        button.action = {
            target: target || CardsSettings.targets.HOME,
            subtarget: subtarget,
            target_params: {
                from_screen: CardsSettings.targets.FILTERS,
                group: subtarget
            }
        };
        return button;
    }

    generateSubmitReviewButton(unit, requester) {
        let button = {
            title: 'Submit Review'
        };
        /*
        if (!requester || !requester.key) {
            button.action = {
                target: CardsSettings.targets.SIGN_IN,
                subtarget: null,
                target_params: {
                    from_screen: CardsSettings.targets.UNIT,
                    unit_id: unit.id
                }
            }
        }
        */
        let url = AppConfigs.DOMAIN + AppConfigs.API_BASE_URL
                + AppConstants.api_urls.SUBMIT_UNIT_REVIEW.replace(':unit_id', unit.id);
        button.action = {
            target: CardsSettings.targets.API,
            subtarget: null,
            target_params: null,
            request: {
                url: url,
                method: AppConstants.request_methods.POST
            }
        }
        return button;
    }

    generateUnitPageCards(unit, requester) {
        let main_header = this.generateUnitCard([unit], ItemTypes.LARGE, {
            show_back_icon: true,
            no_action: true,
            order: 0
        });

        let rating_item_card = {
            item_type: ItemTypes.RATING,
            order: 1,
            action: {
                target: 'dialog',
                subtarget: 'add_review_dialog',
                target_params: {
                    title: 'Review ' + unit.name,
                    description: 'Share your feedback or recommendation about ' + unit.name,
                    elements: [
                        {key: 'unit_photo', type: 'photo', label: null, images: [{uri: unit.photo}]},
                        {key: 'text', type: 'text_input', label: 'Input your comment', input_type: 'default' }
                    ],
                    button: this.generateSubmitReviewButton(unit, requester)
                }
            }
        };
        let unit_actions_card = {
            item_type: ItemTypes.UNIT_ACTIONS,
            order: 2,
            phone_number: unit.contact ? unit.contact.phone : undefined,
            web_site: unit.contact ? unit.contact.website : undefined,
            branches: unit.branches ? unit.branches : []
        };
        let map_card = this.generateUnitMapWidgetCard(unit, {
            order: 3
        });
        let photos_card = this.generatePhotosCard(unit.photos, {
            source: CardsSettings.targets.UNIT,
            photos: unit.photos,
            order: 4
        });
        let reviews_card = this.generateReviewsCard(unit.reviews, {
            order: 5
        });

        let cards = [];
        cards = cards.concat(main_header);
        cards = cards.concat(rating_item_card);
        cards = cards.concat(unit_actions_card);
        cards = cards.concat(map_card);
        cards = cards.concat(photos_card);
        cards = cards.concat(reviews_card);
        return cards;
    }

    generateEventPageCards(unit) {
        let main_header = this.generateUnitCard([unit], ItemTypes.LARGE, {
            show_back_icon: true,
            no_action: true
        });
        let photos_card = this.generatePhotosCard(unit.photos, {
            source: CardsSettings.targets.UNIT,
            photos: unit.photos
        });
        let reviews_card = this.generateReviewsCard(unit.reviews);

        let cards = [];
        cards = cards.concat(main_header);
        cards = cards.concat(photos_card);
        cards = cards.concat(reviews_card);
        return cards;
    }

    generatePersonPageCards(unit) {

    }

    generateCardHeadline(icon, title, actions) {
        if (!icon && !title && !actions) return null;
        return {
            icon_name: icon,
            content: this.generateTextComponent(title),
            actions: actions
        }
    }

    generateTextComponent(content, color, style) {
        return content;
        /*
        return {
            content: content,
            color: color,
            style: style
        }
        */
    }

    _constructUnitsQuery(validation) {
        let units_query = {};
        if (validation && validation.is_open && validation.is_open.sanitized_value) {
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
            units_query['working_hours.' + day + '.start'] = {
                $lte: converted_date.hours() * 100
            };
        }
        if (validation && validation.price && validation.price.sanitized_value) {
            units_query.price = validation.price.sanitized_value;
        }
        return units_query;
    }

    _classifyUnits(units, categories, user) {
        // top_picks, by categories, newest, recently_viewed, you_may_like
        // sponsored, todays_specials
        // branches
        // same street
        // same tags with high weight

        categories = categories || [];
        user = user || {};
        let classified_units = {};
        classified_units.top_picks = units.filter(u => {
            if (u.top) {
                u.already_picked = true;
                return true;
            }
            return false;
        });
        classified_units.recent = units.filter(u => {
            if (u.recent) {
                u.already_picked = true;
                return true;
            }
            return false;
        });
        classified_units.by_categories = {};
        categories.forEach(cat => {
            classified_units.by_categories[cat.title] = units.filter(u => {
                if (u.categories.includes(cat.id)) {
                    u.already_picked = true;
                    return true;
                }
                return false;
            });
        });
        /* TODO:
        classified_units.newest = units.filter(u => {
            if (!u.metadata || !u.metadata.created) return false;

        })
        */
        classified_units.recently_viewed = units.filter(u => {
            if (user.activity && user.activity.recent_views && user.activity.recent_views.includes(u.id)) {
                u.already_picked = true;
                return true;
            }
            return false;
        });

        // TODO:
        // define branches

        // TODO:
        // define crossing streets by location
        // place for each street the units

        classified_units.others = units.filter(u => !u.already_picked);

        return classified_units;
    }

    _classifyEvents(events, user) {
        return {
            others: events
        }
    }

    _getTagsForClarifier(clarifier, options) {
        // REMARK: this function always resolves
        return new Promise((resolve, reject) => {
            if (!clarifier) return resolve(null);
            if (!options.injections || !options.injections.TagsService) {
                SystemEvents.emit('error', 'in _getTagsForClarifier, CONTRACT_VIOLATION, no TagsService injected.');
                return resolve(null);
            }
            options.filters = {
                $or: [
                    {'value.en': clarifier},
                    {'value.ru': clarifier},
                    {'value.am': clarifier}
                ]
            };
            if (options.is_tag) {
                options.filters.is_tag = true;
            }
            if (options.is_keyword) {
                options.filters.is_keyword = true;
            }
            if (options.is_feature) {
                options.filters.is_feature = true;
            }
            options.injections.TagsService.getTags(options).then(tags => {
                if (!tags || !tags.length) return resolve(null);
                return resolve(tags.map(t => t.id));
            }).catch(err => {
                SystemEvents.emit('error', err);
                return resolve(null);
            });
        });
    }

    _parseLatitude(address) {
        if (address && address.coordinates && address.coordinates.length) {
            return address.coordinates[1];
        }
        return undefined;
    }

    _parseLongitude(address) {
        if (address && address.coordinates && address.coordinates.length) {
            return address.coordinates[0];
        }
        return undefined;
    }

}

module.exports = new CardsService();
