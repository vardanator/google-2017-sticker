const cors = require('cors');

const GroupsApi = require('./../components/groups/api');
const PhotosApi = require('./../components/photos/api');
const CDNApi = require('./../components/cdn/api');
const UsersApi = require('./../components/users/api');
const ButtonsApi = require('./../components/buttons/api');
const CategoriesApi = require('./../components/categories/api');
const ReviewsApi = require('./../components/reviews/api');
const TagsApi = require('./../components/tags/api');
const ProductsApi = require('./../components/products/api');
const UnitsApi = require('./../components/units/api');
const ActivityApi = require('./../components/activity/api');
const CardsApi = require('./../components/cards/api');
const CollectionsApi = require('./../components/collections/api');

const RequestService = require('./../components/request/service');

class ApiV1 {
    constructor() {}

    initialize(app) {

        app.use(cors({origin: 'http://localhost:8080'}));

        app.use(RequestService.checkAttacks);
        app.use(RequestService.parseMetadata);
        app.use(RequestService.resolveQuery);
        app.use(['/api/v1/groups', '/api/groups'], GroupsApi);
        app.use('/api/v1/photos', PhotosApi);
        app.use('/cdn', CDNApi);
        app.use(['/api/v1/users', '/api/users'], UsersApi);
        app.use('/api/v1/buttons', ButtonsApi);
        app.use(['/api/v1/categories', '/api/categories'], CategoriesApi);
        app.use(['/api/v1/reviews', '/api/reviews'], ReviewsApi);
        app.use('/api/v1/tags', TagsApi);
        app.use('/api/v1/products', ProductsApi);
        app.use(['/api/v1/units', '/api/businesses'], UnitsApi);
        app.use('/api/v1/activity', ActivityApi);
        app.use('/api/v1/cards', CardsApi);
        app.use('/api/v1/collections', CollectionsApi);

        app.get('/', (req, res) => {
            res.render('index');
        });

        app.get('/service-privacy-policy', (req, res) => {
            res.render('service');
        });

        app.get('/terms-of-use', (req, res) => {
            res.render('terms');
        });

        app.get('/about', (req, res) => {
            res.render('about');
        });

        // Legacy API
        require('./legacy-api')(app);

    }

}

module.exports = new ApiV1();
