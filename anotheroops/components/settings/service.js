
const AppSettings = {
    groups: {
        title_minlength: 3,
        title_maxlength: 30,
        default_photo_url: '-bla-bla-'
    },
    categories: {
        title_maxlength: 30,
        title_minlength: 3,
        description_minlength: 0,
        description_maxlength: 500,
        default_photo_url: '-bla-bla-'
    },
    photos: {
        title_minlength: 0,
        title_maxlength: 300
    },
    users: {
        username_minlength: 4,
        username_maxlength: 50,
        name_minlength: 4,
        name_maxlength: 50,
        password_minlength: 4,
        password_maxlength: 50,
        points_comment: 1,
        points_rate: 1,
        points_subscription: 1,
        points_upload: 1,
        points_follow: 1,
        points_profile_update: 1,
        points_sharing: 1,
        points_like: 1,
        checkin_title_maxlength: 100,
        reserved_usernames: ['helpin', 'www', 'etc'],
        default_avatar_url: 'https://cdn21.picsart.com/145116821005201.png',
        default_cover_url: 'https://cdn102.picsart.com/201968254000201.jpg'
    },
    units: {
        name_maxlength: 100,
        name_minlength: 2,
        description_maxlength: 1000,
        description_minlength: 0,
        about_maxlength: 2500,
        about_minlength: 0,
        street_maxlength: 200,
        zip_maxlength: 10,
        phone_maxlength: 20,
        default_photo_url: 'https://cdn102.picsart.com/201968254000201.jpg',
        default_cover_url: 'https://cdn102.picsart.com/201968254000201.jpg',
        working_hour_min_value: 0,
        working_hour_max_value: 2400,
        tag_minlength: 3,
        tag_maxlength: 30,
        tag_weight_min_value: 0,
        tag_weight_max_value: 100,
        price_minlength: 1,
        price_maxlength: 4,
        unit_types: ['business', 'event', 'person'],
        unit_type: {
            BUSINESS: 'business',
            EVENT: 'event',
            PERSON: 'person'
        },
        countries: {
            en: ['Armenia', 'Georgia', 'Russia', 'Nagorno-Karabakh'],
            ru: ['Армения', 'Грузия', 'Россия', 'Нагорный Карабах'],
            am: ['Հայաստան', 'Վրաստան', 'Ռուսաստան', 'Լեռնային Ղարաբաղի Հանրապետություն']
        },
        states: {
            en: ['Yerevan', 'Shirak', 'Lori', 'Tbilisi', 'Moscow', 'Kotayk', 'Armavir',
                'Stepanakert', 'Aragatsotn', 'Syunik', 'Tavush', 'Gegharkunik', 'Ararat', 'Vayots Dzor'],
            ru: ['Ереван', 'Ширак', 'Лори', 'Тбилиси', 'Москва', 'Котайк', 'Армавир', 'Степанакерт',
                'Арагацотн', 'Сюник', 'Тавуш', 'Гегаркуник', 'Арарат', 'Вайоц Дзор'],
            am: ['Երևան', 'Շիրակ', 'Լոռի', 'Թբիլիսի', 'Մոսկվա', 'Կոտայք', 'Արմավիր', 'Ստեփանակերտ',
                'Արագածոտն', 'Սյունիք', 'Տավուշ', 'Գեղարքունիք', 'Արարատ', 'Վայոց Ձոր']
        },
        cities: {
            en: ['Yerevan', 'Gyumri', 'Vanadzor', 'Tbilisi', 'Moscow', 'Tsaghkadzor',
                'Abovyan', 'Echmiadzin', 'Stepanakert', 'Verin Ptghni village',
                'Apnagyugh village', 'Kapan', 'Arinj village', 'Jrvezh village',
                'Vagharshapat', 'Armavir', 'Ijevan', 'Hrazdan', 'Martuni', 'Masis',
                'Dilijan', 'Arzakan', 'Dzoraghbyur village', 'Arzakan Village', 'Sevan',
                'Parakar community', 'Berd', 'Lenughi village', 'Yeghvard', 'Tairov village',
                'Stepanavan', 'Vedi', 'Zovuni', 'Goris', 'Byureghavan', 'Charentsavan',
                'Vayk', 'Metsamor', 'Ayntap', 'Gavar', 'Artashat', 'Akhalkalaki', 'Ashtarak',
                'Byurakan', 'Jermuk', 'Hankavan', 'Arzni', 'Balahovit', 'Ararat', 'Yeghegnadzor'],
            ru: ['Ереван', 'Гюмри', 'Ванадзор', 'Тбилиси', 'Москва', 'Цахкадзор',
                'Абовян', 'Эджмиацин', 'Степанакерт', 'Птгни', 'Апнагюх', 'Капан', 'Горис',
                'Ариндж', 'Джрвеж', 'Армавир', 'Иджеван', 'Граздан', 'Мартуни', 'Масис', 'Дилиджан', 'Ехегнадзор'],
            am: ['Երևան', 'Գյումրի', 'Վանաձոր', 'Թբիլիսի', 'Մոսկվա', 'Ծաղկաձոր',
                'Աբովյան', 'Էջմիածին', 'Ստեփանակերտ', 'Վերին Պտղնի', 'Ափնագյուղ',
                'Ղափան', 'Առինջ', 'Ջրվեժ', 'Արմավիր', 'Իջևան', 'Հրազդան', 'Մարտունի',
                'Դիլիջան', 'Մասիս', 'Եղեգնաձոր', 'Գորիս']
        },
        products_naming_values: {
            en: ['Menu', 'Shoes'],
            ru: ['Меню', 'Обувь'],
            am: ['Մենյու', 'Կոշկեղեն']
        },
        // leave here to think
        features: {
            ACCEPTS_CREDIT_CARDS: {
                display_name: {
                    en: 'Accepts Credit Cards',
                    ru: 'Принимает Кредитные Карты',
                    am: 'Կրեդիտ Քարտ'
                },
                icon_name: 'CREDIT_CARD_ICON'
            }
        }
    },
    general: {
        email_maxlength: 255,
        url_maxlength: 2084
    },
    queries: {
        offset_min: 0,
        offset_max: 999999999,
        limit_min: 0,
        limit_max: 60,
        users: {
            offset_min: 0,
            offset_max: 999999999,
            limit_min: 0,
            limit_max: 60
        }
    },
    components: {
        activity: {
            action_buttons: ['create_post', 'create_event']
        }
    },
    icons: {
        CREDIT_CARD_ICON: 'credit card icon URL',
        FOOD_GROUP_ICON: 'food group icon URL'
    },
    reviews: {
        text_minlength: 0,
        text_maxlength: 500,
        rating_minlength: 1,
        rating_maxlength: 5
    },
    buttons: {
        name_minlength: 3,
        name_maxlength: 30,
        border_minlength: 0,
        border_maxlength: 30,
        border_radius_minlength: 0,
        border_radius_maxlength: 5
    },
    activity: {
        actions: {
            POST: 'post',
            REVIEW: 'review',
            FOLLOW: 'follow',
            SUBSCRIBE: 'subscribe',
            USER_UPDATE: 'user_update',
            UNIT_UPDATE: 'unit_update',
            REVIEW_UPVOTE: 'review_upvote',
            REVIEW_DOWNVOTE: 'review_downvote'
        },
        action_values: ['post', 'review', 'follow', 'subscribe', 'user_update',
            'unit_update', 'review_upvote', 'review_downvote'],
        info_maxlength: 1000
    },
    cards: {
        vertical_items_count_per_card: 7,
        regular_items_count_per_card: 3,
        detailed_photos_items_count_per_card: 3,
        items_rendering: {
            VERTICAL: 'vertical',
            HORIZONTAL: 'horizontal'
        },
        targets: {
            HOME: 'home',
            UNIT: 'unit',
            NEARBY: 'nearby',
            EVENTS: 'events',
            PHOTO_VIEWER: 'photo_viewer',
            DIALOG: 'dialog',
            API: 'api',
            SIGN_IN: 'signin',
            SIGN_UP: 'signup',
            PROFILE: 'profile',
            ACTIVITY: 'activity',
            MAPS: 'maps',
            FILTERS: 'filters'
        }
    },
    collections: {
        name_maxlength: 50
    }
};

module.exports = AppSettings;
