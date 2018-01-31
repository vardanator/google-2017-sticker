
class BaseDAO {
    constructor(collection) {
        this.collection = collection;
    }

    insert(src_obj) {
        return this.collection.create(src_obj);
    }

    getCount() {
        return this.collection.count();
    }

    fetchOne(query, options) {
        options = options || {};
        options.select = options.select || {};
        options.populate = options.populate || '';
        return this.collection.findOne(query)
            .populate(options.populate)
            .select(options.select)
            .exec();
    }

    fetchMany(query, options) {
        options = options || {};
        if (options.offset === undefined || options.offset === null ||
            options.limit === undefined || options.limit === null) {
                console.log('ATTENTION!!! DAO contract violation at fetchMany');
                throw('DAO contract violation');
        }
        options.select = options.select || {};
        options.sort = options.sort || {};
        options.populate = options.populate || '';
        return this.collection.find(query)
            .populate(options.populate)
            .sort(options.sort)
            .skip(options.offset)
            .limit(options.limit)
            .select(options.select)
            .exec();
    }

    searchStrStartsWith(query, options) {
        options = options || {};
        if (options.offset === undefined || options.offset === null ||
            options.limit === undefined || options.limit === null) {
                console.log('ATTENTION!!! DAO contract violation at searchStrStartsWith');
            throw('DAO contract violation');
        }
        options.select = options.select || {};
        options.sort = options.sort || {};
        let db_query = {};
        Object.keys(query).forEach(key => {
            db_query[key] = new RegExp('^' + query[key], 'i');
        });
        return this.collection.find(db_query)
            .sort(options.sort)
            .skip(options.offset)
            .limit(options.limit)
            .select(options.select)
            .exec();
    }

    geoSearch(coordinates, max_distance, options) {
        options = options || {};
        options.filters = options.filters || {};
        return this.collection.aggregate([
            {
                $geoNear: {
                    near: { type: 'Point', coordinates: coordinates },
                    distanceField: 'distance',
                    maxDistance: max_distance || 200000,
                    query: options.filters,
                    spherical: true
                }
            }, {
                $skip: options.offset || 0
            }, {
                $limit: options.limit || 20
            }
        ]);
    }

    updateById(id, fields, exclude_keys) {
        if (!fields || JSON.stringify(fields) === JSON.stringify({})) {
            console.log('ATTENTION!!! Empty fields in updateById');
            throw 'Empty fields';
        }
        (exclude_keys || []).forEach(exclude => {
            delete fields[exclude];
        });

        return this.collection.findByIdAndUpdate(id, {$set: fields},
            {runValidators: true});
    }

    updateByQuery(query, upd_query) {
        if (!query || !upd_query || JSON.stringify(query) == JSON.stringify({})) {
            console.log('ATTENTION!! Danger update query');
            throw 'Empty query for update';
        }
        return this.collection.findOneAndUpdate(query, upd_query, {runValidators: true});
    }

    removeById(id) {
        return this.collection.findByIdAndRemove(id);
    }

    removeByQuery(query) {
        return this.collection.findOneAndRemove(query);
    }

}

module.exports = BaseDAO;
