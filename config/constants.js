module.exports = {
  MAX_FILE_SIZE: 5 * 1024 * 1024,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_IMAGE_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 5,
  MAX_LIMIT: 100,
  
  COLLECTIONS: {
    EVENTS: 'events',
  },
  
  EVENT_TYPES: {
    CONFERENCE: 'conference',
    WORKSHOP: 'workshop',
    MEETUP: 'meetup',
    WEBINAR: 'webinar',
    OTHER: 'other'
  },
  
  MESSAGES: {
    EVENT_CREATED: 'Event created successfully',
    EVENT_UPDATED: 'Event updated successfully',
    EVENT_DELETED: 'Event deleted successfully',
    EVENT_NOT_FOUND: 'Event not found',
    INVALID_ID: 'Invalid event ID format',
    MISSING_FIELDS: 'Missing required fields',
    INVALID_DATE: 'Invalid date format',
    NO_CHANGES: 'No changes detected',
  },
  
  STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    INTERNAL_ERROR: 500
  }
};
