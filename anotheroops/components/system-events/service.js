const EventEmitter = require('events');

const ActivityService = require('./../activity/service');

const EventTypes = {
    GROUP_CREATED: 'group_created',
    GROUP_UPDATED: 'group_updated',
    GROUP_REMOVED: 'group_removed',
    CATEGORY_CREATED: 'category_created',
    CATEGORY_UPDATED: 'category_updated',
    CATEGORY_REMOVED: 'category_removed',
    UNIT_CREATED: 'unit_created',
    UNIT_UPDATED: 'unit_updated',
    PHOTO_UPLOADED: 'photo_uploaded',
    REVIEW_ADDED: 'review_added',
    REVIEW_EDITED: 'review_edited',
    REVIEW_DELETED: 'review_deleted',
    REVIEW_UPVOTED: 'review_upvoted',
    REVIEW_DOWNVOTED: 'review_downvoted',
    REVIEW_REPORTED: 'review_reported',
    NATIVE_USER_CREATED: 'native_user_created',
    SOCIAL_USER_CREATED: 'social_user_created',
    UNKNOWN_USER_CREATED: 'unknown_user_created',
    PHOTO_IMPORTED: 'photo_imported',
    USER_UPDATED: 'user_updated',
    ACTIVITY_CREATED: 'activity_created',
    USER_FOLLOW: 'user_follow'
}

class SystemEvents extends EventEmitter {
    constructor() {
        super();
    }
}

const systemEvents = new SystemEvents();

systemEvents.on(EventTypes.NATIVE_USER_CREATED, data => {
    // do something for native user
});

systemEvents.on('error', error => {
    console.log('Error: ', error);
});

systemEvents.on(EventTypes.USER_FOLLOW, data => {
    ActivityService.emit(EventTypes.USER_FOLLOW, data);
});

module.exports = systemEvents;
module.exports.EventTypes = EventTypes;
