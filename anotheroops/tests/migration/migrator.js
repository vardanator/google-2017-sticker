const fs = require('fs');
const request = require('request-promise');
const request_old = require('request');
const GroupsService = require('./../../components/groups/service');
const CategoriesService = require('./../../components/categories/service');
const UnitsService = require('./../../components/units/service');
const UsersService = require('./../../components/users/service');

let localize = {
    Services: {am: 'Ծառայություններ', icon: 'services_icon'},
    Health: {am: 'Առողջություն', icon: 'health_icon'},
    Kids: {am: 'Երեխաներ', icon: 'kids_icon'},
    Automotive: {am: 'Ավտոմեքենաներ', icon: 'auto_icon'},
    Food: {am: 'Սնունդ', icon: 'food_icon'},
    Beauty: {am: 'Գեղեցկություն', icon: 'beauty_icon'},
    Shopping: {am: 'Շոփինգ', icon: 'shopping_icon'},
    Hotels: {am: 'Հյուրանոց', icon: 'hotels_icon'}
};
localize['Financial services'] = {am: 'Ֆին․ Ծառայություններ', icon: 'fin_services_icon'};
localize['Arts & Entertainment'] = {am: 'Արվեստ և Զվարճանք', icon: 'arts_icon'};
localize['Active life'] = {am: 'Ակտիվ կյանք', icon: 'active_life_icon'};
localize['Cleaning services'] = {am: 'Մաքրման ծառայություններ', icon: 'cleaning_services_icon'};
localize['Night life'] = {am: 'Գիշերային կյանք', icon: 'night_life_icon'};

let service_options = {
    requester: {
        id: '59a2efa4ce70b634beac1446',
        role: 'admin',
        key: 'L2-tHEDpx-07943044-n3Y2ka-6wvmI4mN',
        settings: {
            language: 'en'
        }
    }
};

let old_categories = [ { id: '58b9847a638645bc5728304d', title: 'Rent of vehicles' },
  { id: '58aa9f86858a5c61776abc45',
    title: 'transport services/logistic' },
  { id: '589b0db3fb90e2c0660c6d6b', title: 'Stomatology' },
  { id: '58948afc5f46cc5e77edc286', title: 'Support/advice' },
  { id: '58907ca68aa85ac918007495',
    title: 'Trade and business centers' },
  { id: '58873968e708213966d7b748', title: 'Sauna' },
  { id: '587df651c2930cd902cda027', title: 'Financial services' },
  { id: '5874c0f48b1241b8466a0e9c',
    title: 'Care and pet products' },
  { id: '5863c341f76e82ab7597ee29', title: 'Construction' },
  { id: '585a33364932587331532420', title: 'Hospital' },
  { id: '585a33144932587331531e15', title: 'Medical center' },
  { id: '5859325e849da5a8196158aa', title: 'Pharmacy' },
  { id: '585794c1cc9979dd52d97946', title: 'Non-food products' },
  { id: '580f357f1483162c66055890', title: 'Study' },
  { id: '58025b91ccc91c0c55db6db8', title: 'Tea-House' },
  { id: '58012dbfccc91c0c55da071f', title: 'Sushi Bars' },
  { id: '57ff4e3cccc91c0c55d1fff9', title: 'Currency Exchange' },
  { id: '57ff4e09ccc91c0c55d1fff7', title: 'Banks & ATMs' },
  { id: '57ff4deaccc91c0c55d1fff5', title: 'Insurance' },
  { id: '57ff4c2accc91c0c55d1fff1', title: 'Oil Change stations' },
  { id: '57ff4a9accc91c0c55d1f09a', title: 'Gas Stations' },
  { id: '57ff4a15ccc91c0c55d1eaa9', title: 'Tires' },
  { id: '57ff473bccc91c0c55d1e926', title: 'Opera & Ballet' },
  { id: '57ff4712ccc91c0c55d1e924', title: 'Botanical Gardens' },
  { id: '57ff46c3ccc91c0c55d1e922', title: 'Museums' },
  { id: '57ff4697ccc91c0c55d1e198', title: 'Art Galleries' },
  { id: '57ff455dccc91c0c55d1cc0f', title: 'Stadiums & Arenas' },
  { id: '57ff44e5ccc91c0c55d1cc0d', title: 'Cinema' },
  { id: '57ff3e8accc91c0c55d1a514', title: 'Parks' },
  { id: '57ff3e60ccc91c0c55d1a512', title: 'Swimming Pools' },
  { id: '57ff3e2dccc91c0c55d1a510', title: 'Playgrounds' },
  { id: '57ff3de3ccc91c0c55d1a50e', title: 'Bike Rentals' },
  { id: '57ff3dadccc91c0c55d1a50c', title: 'Tennis' },
  { id: '57ff3d14ccc91c0c55d19f3a', title: 'Zoos' },
  { id: '57ff3ce8ccc91c0c55d19dc8', title: 'Bowling' },
  { id: '57ff3cc7ccc91c0c55d19dc6', title: 'Fitness' },
  { id: '57ff3c4cccc91c0c55d19be4', title: 'Amusement parks' },
  { id: '57ff2c08ccc91c0c55d16eca', title: 'Golf' },
  { id: '57f76f917d8bade84484b9e3', title: 'Travel' },
  { id: '57f24bd8fbf7aaba3456ce93', title: 'Leisure' },
  { id: '57ee24c1269c9f1031e7732f', title: 'Dry cleaning' },
  { id: '57ee249b269c9f1031e7732d', title: 'Laundry' },
  { id: '57eb98c8a80a964a2acd7af9', title: 'Auto Repair' },
  { id: '57eb982aa80a964a2acd7406', title: 'Car Wash' },
  { id: '57e693c4c0eb2c751f5a22ea', title: 'Gifts' },
  { id: '57e66ee00a49a27d1adfa5d3', title: 'Cigarettes/alcohol' },
  { id: '57e664860a49a27d1adf7daa', title: 'Foods/Dried Fruits' },
  { id: '57e4e29a0a49a27d1adeb6a4', title: 'Toys' },
  { id: '57c74f1c477397fe775ddb7b', title: 'Tavern' },
  { id: '57a9a8e5238f54c330ed40c3', title: 'Casino' },
  { id: '57a9a8d9238f54c330ed40c1', title: 'Dance Clubs' },
  { id: '57a9a8ce238f54c330ed40bf', title: 'Bars & Pubs' },
  { id: '57a9a8ab238f54c330ed40bd', title: 'Strip clubs' },
  { id: '57a9971d238f54c330ed40ba', title: 'Gym / Pool' },
  { id: '57a9970b238f54c330ed40b8',
    title: 'Spa / Massage / Solarium' },
  { id: '57a996fc238f54c330ed40b6', title: 'Cosmetology' },
  { id: '57a996e7238f54c330ed40b4',
    title: 'Beauty salon / Tattoo' },
  { id: '57a996a9238f54c330ed40b2', title: 'Supermarkets' },
  { id: '57a9969b238f54c330ed40b0', title: 'Car Dealers' },
  { id: '57a99684238f54c330ed40ae', title: 'Home decor' },
  { id: '57a99673238f54c330ed40ac', title: 'Book / Stationery' },
  { id: '57a99597238f54c330ed40aa', title: 'Athletic Goods' },
  { id: '57a99587238f54c330ed40a8',
    title: 'Flower / Wedding salon' },
  { id: '57a99577238f54c330ed40a6', title: 'Optics' },
  { id: '57a9894c238f54c330ed40a4', title: 'Perfume / Cosmetics' },
  { id: '57a9893d238f54c330ed40a2', title: 'Watch / Jewelry' },
  { id: '57a9892d238f54c330ed40a0', title: 'Electronics' },
  { id: '57a9891b238f54c330ed409e', title: 'Children\'s store' },
  { id: '57a9890c238f54c330ed409c',
    title: 'Clothes / Shoes / Accessories' },
  { id: '57a988d4238f54c330ed409a', title: 'Karaoke' },
  { id: '57a988a8238f54c330ed4098', title: 'Rest house' },
  { id: '57a98891238f54c330ed4096', title: 'Motel / Hostel' },
  { id: '57a98881238f54c330ed4094', title: 'Hotel' },
  { id: '57a882c4238f54c330ed4092', title: 'Banquet Halls' },
  { id: '57a882ae238f54c330ed4090', title: 'Jazz clubs' },
  { id: '57a8828c238f54c330ed408e', title: 'Children\'s cafe' },
  { id: '57a87fcc238f54c330ed408b', title: 'Pizzeria' },
  { id: '57a87faf238f54c330ed4089', title: 'Fast Food' },
  { id: '57a87f97238f54c330ed4087', title: 'Cafe' },
  { id: '579f2bab7bba2d637e122afc', title: 'Restaurant' } ];

let old_category_ids = {};
old_categories.forEach(c => {
    old_category_ids[c.id] = c.title;
});

function migrate_groups() {
    let options = {
        uri: 'http://helpin.am/api/groups',
        qs: {
            key: 'U2-2F4w8E-95557935-NJGIn2-DzLSwinA'
        },
        json: true
    }
    request(options).then(res => {
        let data = res.groups;
        console.log('groups length == ', data.length);
        data.forEach(group => {
            let title = {
                en: group.en_title,
                ru: group.i18n.ru.title
            };
            title.am = localize[title.en].am;
            let icon_name = localize[title.en].icon;
            let is_primary = ['Food', 'Shopping', 'Beauty', 'Hotels', 'Night life'].includes(title.en);

            GroupsService.createGroup(title, icon_name, null, is_primary, service_options).then(grp => {
                console.log('success for ', grp.title);
            }).catch(err => {
                console.log(err);
                console.log('error ' + title.en);
            })
        });
    }).catch(err => {
        console.log(err);
    })
}

function download_bufferize(url) {
    return new Promise((resolve, reject) => {
        if (!url) {
            return resolve(null);
        }
        let tmp_path = './photos/' + Date.now();
        request_old(url).pipe(fs.createWriteStream(tmp_path)).on('close', function() {
            let file_buffer = fs.readFileSync(tmp_path);
            return resolve({
                buffer: file_buffer
            });
        }).on('error', function(err) {
            console.log(err);
            reject(err);
        });
    });
}

function migrate_one_category(groups, cats, count) {
    console.log('category count == ', count)
    if (count >= cats.length) { console.log('DONE CATEGORY MIGRATING!'); return; }
    let cat = cats[count++];
    download_bufferize(cat.photo).then(file => {
        let category_data = {
            title_en: cat.title,
            title_ru: cat.i18n.ru.title,
            title_am: 'blank',
            group_id: groups[cat.groups[0].title],
            photo: file
        };
        CategoriesService.createCategory(category_data, service_options).then(created => {
            console.log('created category == ', created.title);
            migrate_one_category(groups, cats, count);
        }).catch(err => {
            migrate_one_category(groups, cats, count);
            console.log(err);
        });
    });
}

function migrate_categories() {
    service_options.offset = 0;
    service_options.limit = 100;
    GroupsService.getGroups(service_options).then(groups => {
        let group_ids = {};
        groups.forEach(g => {
            group_ids[g.title.en] = '' + g._id;
        });

        let options = {
            uri: 'http://helpin.am/api/categories?limit=100',
            qs: {
                key: 'U2-2F4w8E-95557935-NJGIn2-DzLSwinA'
            },
            json: true
        };
        request(options).then(res => {
            let data = res;

            console.log('all cats == ', data.length);
            //migrate_one_category(test);
            migrate_one_category(group_ids, data, 0);

        }).catch(err => {
            console.log(err);
        })
    });
}

function migrate_one_user(users, count) {
    if (count >= users.length) { console.log('DONE USER MIGRATING!'); return; }
    console.log('user count == ', count);
    let user = users[count++];
    if (user.avatar == '-avatar-default-path-') { user.avatar = null; }
    download_bufferize(user.avatar).then(file => {
        service_options.offset = 0;
        service_options.limit = 700;
        service_options.avatar = file;
        service_options.name = user.name;
        service_options.username = user.username;

        if (user.social && (user.social.provider == 'facebook' || user.social.provider == 'google')) {
            UsersService.createSocialUser(user.social.provider, user.social.id, user.social.token, service_options).then(user => {
                console.log('social created');
                migrate_one_user(users, count);
            }).catch(err => {
                console.log(err);
                migrate_one_user(users, count);
            });
        } else {
            UsersService.createNativeUser(user.username, user.password, user.email, service_options).then(user => {
                console.log('user created');
                migrate_one_user(users, count);
            }).catch(err => {
                console.log(err);
                migrate_one_user(users, count);
            });
        }
    });
}

function migrate_users() {
    let options = {
        uri: 'http://helpin.am/api/users?limit=700',
        qs: {
            key: 'U2-2F4w8E-95557935-NJGIn2-DzLSwinA'
        },
        json: true
    }
    request(options).then(res => {
        let data = res;
        console.log('users length == ', data.length);
        migrate_one_user(data, 0);
    }).catch(err => {
        console.log(err);
    })
}

function download_many(photos) {
    return new Promise((resolve, reject) => {
        let promises = (photos || []).map(p => download_bufferize(p));
        Promise.all(promises).then(values => {
            return resolve(values);
        }).catch(err => {
            console.log(err);
            return resolve([]);
        });
    });
}

function migrate_one_unit(units, count) {
    if (count >= units.length) { console.log('DONE UNIT MIGRATING!'); return; }
    console.log('unit count == ', count);
    let unit = units[count++];

    // BIG fixes go here
    if (unit.main_address && ['armenia', 'Armeia', 'Armeni'].includes(unit.main_address.country)) { unit.main_address.country = 'Armenia'; }
    if (unit.main_address && ['Vanadzor'].includes(unit.main_address.state)) { unit.main_address.state = 'Lori'; }
    if (unit.main_address && ['Armavir Marz'].includes(unit.main_address.state)) { unit.main_address.state = 'Armavir'; }
    if (unit.main_address && ['Aragatsotn Marz'].includes(unit.main_address.state)) { unit.main_address.state = 'Aragatsotn'; }
    if (unit.main_address && ['Lori Marz'].includes(unit.main_address.state)) { unit.main_address.state = 'Lori'; }
    if (unit.main_address && ['yerevan', 'Yerevn', 'Yervan', 'yervan', 'Yerevan , +374-60-519394'].includes(unit.main_address.city)) { unit.main_address.city = 'Yerevan'; }
    if (unit.main_address && ['Tsakgadzor'].includes(unit.main_address.city)) { unit.main_address.city = 'Tsaghkadzor'; }
    if (unit.main_address && ['Abovyan region'].includes(unit.main_address.city)) { unit.main_address.city = 'Abovyan'; }
    if (unit.main_address && ['Arzakan village'].includes(unit.main_address.city)) { unit.main_address.city = 'Arzakan Village'; }
    if (unit.main_address && ['Artsakh'].includes(unit.main_address.state)) { unit.main_address.state = 'Nagorno-Karabakh'; }

    if (unit.website == 'htpp:/www.facebook.com/RGAMgroup') { unit.website = 'http://www.facebook.com/RGAMgroup' }
    if (unit.website == 'https://web.facebook.com/pages/Opera-Club/360283734051474374 10541222') { unit.website = null; }
    if (unit.photo == '-business-default-photo-url-') { unit.photo = null; }

    let cat_titles = unit.categories.map(c => {
        return old_category_ids[c];
    });

    let unit_data = {};
    service_options.filters = {
        'title.en': {$in: cat_titles}
    };
    CategoriesService.getCategories(service_options).then(cats => {
        unit_data.categories = cats;
        download_bufferize(unit.photo).then(file => {
            unit_data.photo = file;
            unit_data.name_en = unit.name;
            unit_data.name_ru = (unit.i18n && unit.i18n.ru) ? unit.i18n.ru.name || unit.name : unit.name;
            unit_data.name_am = unit.name;
            unit_data.description_en = unit.description;
            unit_data.description_ru = (unit.i18n && unit.i18n.ru) ? unit.i18n.ru.description : '';
            unit_data.about_en = unit.about;
            unit_data.about_ru = (unit.i18n && unit.i18n.ru) ? unit.i18n.ru.about : '';
            unit_data.address_street_en = (unit.main_address) ? unit.main_address.street || '<blank>' : '<blank>';
            unit_data.address_street_ru = (unit.main_address && unit.main_address.i18n && unit.main_address.i18n.ru) ? unit.main_address.i18n.ru.street || '<blank>' : '<blank>';
            unit_data.address_country_en = (unit.main_address) ? unit.main_address.country : 'Armenia';
            unit_data.address_street_am = '<blank>';
            unit_data.address_state_en = (unit.main_address) ? unit.main_address.state || 'Yerevan' : 'Yerevan';
            unit_data.address_city_en = (unit.main_address) ? unit.main_address.city || 'Yerevan' : 'Yerevan';
            unit_data.address_zip = (unit.main_address) ? unit.main_address.zip : '';
            unit_data.address_lat = (unit.main_address && unit.main_address.coordinates) ? unit.main_address.coordinates[0] : null;
            unit_data.address_lon = (unit.main_address && unit.main_address.coordinates) ? unit.main_address.coordinates[1] : null;
            unit_data.is_open24 = unit.open24;
            unit_data.contact_phone = unit.main_phone;
            unit_data.contact_phones = unit.phones;
            unit_data.contact_email = unit.email;
            unit_data.contact_website = unit.website;
            unit_data.price = unit.price;
            unit_data.working_hours_mon_start = (unit.working_hours && unit.working_hours.monfri) ? unit.working_hours.monfri.start : null;
            unit_data.working_hours_mon_end = (unit.working_hours && unit.working_hours.monfri) ? unit.working_hours.monfri.end : null;
            unit_data.working_hours_tue_start = (unit.working_hours && unit.working_hours.monfri) ? unit.working_hours.monfri.start : null;
            unit_data.working_hours_tue_end = (unit.working_hours && unit.working_hours.monfri) ? unit.working_hours.monfri.end : null;
            unit_data.working_hours_wed_start = (unit.working_hours && unit.working_hours.monfri) ? unit.working_hours.monfri.start : null;
            unit_data.working_hours_wed_end = (unit.working_hours && unit.working_hours.monfri) ? unit.working_hours.monfri.end : null;
            unit_data.working_hours_thu_start = (unit.working_hours && unit.working_hours.monfri) ? unit.working_hours.monfri.start : null;
            unit_data.working_hours_thu_end = (unit.working_hours && unit.working_hours.monfri) ? unit.working_hours.monfri.end : null;
            unit_data.working_hours_fri_start = (unit.working_hours && unit.working_hours.monfri) ? unit.working_hours.monfri.start : null;
            unit_data.working_hours_fri_end = (unit.working_hours && unit.working_hours.monfri) ? unit.working_hours.monfri.end : null;
            unit_data.working_hours_sat_start = (unit.working_hours && unit.working_hours.saturday) ? unit.working_hours.saturday.start : null;
            unit_data.working_hours_sat_end = (unit.working_hours && unit.working_hours.saturday) ? unit.working_hours.saturday.end : null;
            unit_data.working_hours_sun_start = (unit.working_hours && unit.working_hours.sunday) ? unit.working_hours.sunday.start : null;
            unit_data.working_hours_sun_end = (unit.working_hours && unit.working_hours.sunday) ? unit.working_hours.sunday.end : null;
            unit_data.price = unit.price;
            unit_data.tags = unit.tags;
            unit_data.keywords = unit.keywords;
            unit_data.migration_id = unit.id;
            unit_data.top = unit.top;
            unit_data.recent = unit.recent;
            delete service_options.filters;
            UnitsService.createUnit(unit_data, service_options).then(created_unit => {
                console.log('success == ', created_unit._id);
                download_many(unit.photos).then(unit_photos => {
                    UnitsService.uploadUnitPhotos(created_unit._id, unit_photos, service_options).then(updated_unit => {
                        let migrated_unit_id = updated_unit._id;
                        let original_unit_id = unit.id;

                        let options = {
                            uri: 'http://helpin.am/api/businesses/' + original_unit_id + '/reviews',
                            qs: {
                                key: 'U2-2F4w8E-95557935-NJGIn2-DzLSwinA'
                            },
                            json: true
                        };
                        request(options).then(res => {
                            let reviews = res;
                            migrate_reviews(migrated_unit_id, reviews);
                            migrate_one_unit(units, count);
                        }).catch(err => {
                            migrate_one_unit(units, count);
                            console.log(err);
                        })


                    }).catch(err => {
                        migrate_one_unit(units, count);
                        console.log(err);
                    })
                });
            }).catch(err =>  {
                console.log(err);
                migrate_one_unit(units, count);
            });
        });
    });
}

function migrate_units(offset, limit) {
    service_options.offset = 0;
    service_options.limit = 100;

    let options = {
        uri: 'http://helpin.am/api/businesses?offset='+offset+'&limit='+limit,
        qs: {
            key: 'U2-2F4w8E-95557935-NJGIn2-DzLSwinA'
        },
        json: true
    };
    request(options).then(res => {
        let data = res;

        console.log('all units == ', data.length);
        //migrate_one_category(test);
        //migrate_one_category(group_ids, data, 0);
        migrate_one_unit(data, 0);

    }).catch(err => {
        console.log(err);
    })
}

function migrate_one_review(reviews, count) {
    if (count >= reviews.length) { console.log('DONE REVIEW MIGRATING!'); return; }
    console.log('review count == ', count);
    let review = reviews[count++];

    UsersService.getUsers(0, 700, {filters: {username: review.username}}).then(data => {
        if (!data || !data.length || !data[0]) {
            return migrate_one_review(reviews, count);
        }
        let user = data[0];
        let review_req_options = {
            requester: user
        };
        UnitsService.addReview(review.unit_id, review, review_req_options).then(rev => {
            migrate_one_review(reviews, count);
        }).catch(err => {
            console.log(err);
            migrate_one_review(reviews, count);
        });
    }).catch(err => {
        console.log(err);
        migrate_one_review(reviews, count);
    });
}

function migrate_reviews(unit_id, reviews) {

    reviews = reviews.map(r => {
        r.unit_id = unit_id;
        r.username = r.user.username;
        return r;
    });

    console.log('reviews to start migrate == ', reviews.length);
    migrate_one_review(reviews, 0);
}

function migrate_branches() {

}

//migrate_groups();
//migrate_categories();
//migrate_users();


migrate_units(0, 100);
// migrate_units(100, 100);
// migrate_units(200, 100);
// migrate_units(300, 100);
// migrate_units(400, 100);
// migrate_units(500, 100);
// migrate_units(600, 100);
// migrate_units(700, 100);
// migrate_units(800, 100);
// migrate_units(900, 100);
// migrate_units(1000, 100);
// migrate_units(1100, 100);
// migrate_units(1200, 100);
// migrate_units(1300, 100);
// migrate_units(1400, 100);
// migrate_units(1500, 100);
// migrate_units(1600, 100);
// migrate_units(1700, 100);
// migrate_units(1800, 100);
// migrate_units(1900, 100);
// migrate_units(2000, 100);
// migrate_units(2100, 100);
// migrate_units(2200, 100);
// migrate_units(2300, 100);
// migrate_units(2400, 100);
// migrate_units(2500, 100);
// migrate_units(2600, 100);
// migrate_units(2700, 100);
// migrate_units(2800, 100);
// migrate_units(2900, 100);
// migrate_units(3000, 100);
// migrate_units(3100, 100);
// migrate_units(3200, 100);
// migrate_units(3300, 100);
// migrate_units(3400, 100);
// migrate_units(3500, 100);
// migrate_units(3600, 100);
// migrate_units(3700, 100);
// migrate_units(3800, 100);
// migrate_units(3900, 100);
// migrate_units(4000, 100);
// migrate_units(4100, 100);
// migrate_units(4200, 100);
// migrate_units(4300, 100);
// migrate_units(4400, 100);
// migrate_units(4500, 100);
// migrate_units(4600, 100);
// migrate_units(4700, 100);
// migrate_units(4800, 100);
// migrate_units(4900, 100);
// migrate_units(5000, 100);
// migrate_units(5100, 100);
// migrate_units(5200, 100);
// migrate_units(5300, 100);
// migrate_units(5400, 100);
// migrate_units(5500, 100);
// migrate_units(5600, 100);
// migrate_units(5700, 100);
// migrate_units(5800, 100);
// migrate_units(5900, 100);
// migrate_units(6000, 100);
// migrate_units(6100, 100);
// migrate_units(6200, 100);
// migrate_units(6300, 100);
// migrate_units(6400, 100);
// migrate_units(6500, 100);
// migrate_units(6600, 100);
// migrate_units(6700, 100);
// migrate_units(6800, 100);
// migrate_units(6900, 100);
// migrate_units(7000, 100);
// migrate_units(7100, 100);
// migrate_units(7200, 100);
// migrate_units(7300, 100);
// migrate_units(7400, 100);
// migrate_units(7500, 100);
// migrate_units(7600, 100);
// migrate_units(7700, 100);
// migrate_units(7800, 100);
// migrate_units(7900, 100);
