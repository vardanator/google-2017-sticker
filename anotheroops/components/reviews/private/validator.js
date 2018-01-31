const CoreValidator = require('./../../core/validator');
const AppConstants = require('./../../settings/constants');
const ReviewSettings = require('./../../settings/service').reviews;

const Rules = {
    text: {
        field_name: 'text',
        type: CoreValidator.Types.STRING,
        minlength: ReviewSettings.text_minlength,
        maxlength: ReviewSettings.text_maxlength
    },
    rating: {
        field_name: 'rating',
        type: CoreValidator.Types.INTEGER,
        minlength: ReviewSettings.rating_minlength,
        maxlength: ReviewSettings.rating_maxlength
    },
    is_fb_review: {
        field_name: 'is_fb_review',
        type: CoreValidator.Types.BOOLEAN
    }
};

class ReviewsValidator extends CoreValidator {
    constructor() {
        super(Rules);
    }
}

module.exports = new ReviewsValidator();
