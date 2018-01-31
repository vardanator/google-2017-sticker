const CoreValidator = require('./../../core/validator');
const PhotosSettings = require('./../../settings/service').photos;

const Rules = {
    title: {
        field_name: 'title',
        type: CoreValidator.Types.STRING,
        minlength: PhotosSettings.title_minlength,
        maxlength: PhotosSettings.title_maxlength
    },
    photo: {
        field_name: 'photo',
        type: CoreValidator.Types.PHOTO
    }
}

class PhotoValidator extends CoreValidator {

    constructor() {
        super(Rules);
    }

}

module.exports = new PhotoValidator();
