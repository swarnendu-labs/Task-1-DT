const { ObjectId } = require('mongodb');
const { getDB } = require('../config/database');
const path = require('path');
const fs = require('fs');

const COLLECTION_NAME = 'events';
const DEFAULT_PAGE_LIMIT = 5;
const MAX_PAGE_LIMIT = 100;

const getEvents = async (req, res) => {
  try {
    const db = getDB();
    const collection = db.collection(COLLECTION_NAME);

    if (req.query.id) {
      const eventId = req.query.id;
      
      if (!ObjectId.isValid(eventId)) {
        return res.status(400).json({ 
          error: 'Invalid event ID format',
          hint: 'Event ID should be a valid MongoDB ObjectId (24 hex characters)'
        });
      }

      const event = await collection.findOne({ _id: new ObjectId(eventId) });
      
      if (!event) {
        return res.status(404).json({ 
          error: 'Event not found',
          id: eventId 
        });
      }

      return res.status(200).json(event);
    }

    if (req.query.type === 'latest') {
      let limit = parseInt(req.query.limit);
      let page = parseInt(req.query.page);
      
      limit = isNaN(limit) ? DEFAULT_PAGE_LIMIT : Math.min(limit, MAX_PAGE_LIMIT);
      page = isNaN(page) || page < 1 ? 1 : page;
      
      const skip = (page - 1) * limit;

      const events = await collection
        .find({})
        .sort({ schedule: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();

      const totalEvents = await collection.countDocuments({});
      const totalPages = Math.ceil(totalEvents / limit);

      return res.status(200).json({
        events,
        pagination: {
          currentPage: page,
          totalPages,
          totalEvents,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      });
    }

    const events = await collection.find({}).toArray();
    return res.status(200).json(events);

  } catch (error) {
    console.error('Error in getEvents:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch events', 
      message: error.message 
    });
  }
};

const createEvent = async (req, res) => {
  try {
    const db = getDB();
    const collection = db.collection(COLLECTION_NAME);

    const {
      name,
      tagline,
      schedule,
      description,
      moderator,
      category,
      sub_category,
      rigor_rank,
      uid
    } = req.body;

    const missingFields = [];
    if (!name) missingFields.push('name');
    if (!tagline) missingFields.push('tagline');
    if (!schedule) missingFields.push('schedule');
    if (!description) missingFields.push('description');

    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        fields: missingFields 
      });
    }

    const scheduleDate = new Date(schedule);
    if (isNaN(scheduleDate.getTime())) {
      return res.status(400).json({ 
        error: 'Invalid schedule date format',
        hint: 'Use ISO 8601 format (e.g., 2026-03-15T10:00:00.000Z)'
      });
    }

    const newEvent = {
      type: 'event',
      uid: uid ? parseInt(uid) : null,
      name: name.trim(),
      tagline: tagline.trim(),
      schedule: scheduleDate,
      description: description.trim(),
      moderator: moderator ? moderator.trim() : null,
      category: category || null,
      sub_category: sub_category || null,
      rigor_rank: rigor_rank ? parseInt(rigor_rank) : null,
      attendees: [],
      created_at: new Date(),
      updated_at: new Date()
    };

    if (req.file) {
      newEvent.files = {
        image: `/uploads/${req.file.filename}`
      };
    }

    const result = await collection.insertOne(newEvent);

    return res.status(201).json({
      message: 'Event created successfully',
      id: result.insertedId,
      event: { ...newEvent, _id: result.insertedId }
    });

  } catch (error) {
    console.error('Error creating event:', error);
    
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
        console.log('Cleaned up uploaded file after error');
      } catch (cleanupError) {
        console.error('Failed to cleanup file:', cleanupError);
      }
    }
    
    return res.status(500).json({ 
      error: 'Failed to create event', 
      message: error.message 
    });
  }
};

const updateEvent = async (req, res) => {
  try {
    const db = getDB();
    const collection = db.collection(COLLECTION_NAME);
    const eventId = req.params.id;

    if (!ObjectId.isValid(eventId)) {
      return res.status(400).json({ error: 'Invalid event ID format' });
    }

    const existingEvent = await collection.findOne({ _id: new ObjectId(eventId) });
    if (!existingEvent) {
      return res.status(404).json({ 
        error: 'Event not found',
        id: eventId 
      });
    }

    const {
      name,
      tagline,
      schedule,
      description,
      moderator,
      category,
      sub_category,
      rigor_rank,
      uid
    } = req.body;

    const updateData = {
      updated_at: new Date()
    };

    if (name) updateData.name = name.trim();
    if (tagline) updateData.tagline = tagline.trim();
    if (description) updateData.description = description.trim();
    if (moderator) updateData.moderator = moderator.trim();
    if (category) updateData.category = category;
    if (sub_category) updateData.sub_category = sub_category;
    
    if (rigor_rank) {
      const rank = parseInt(rigor_rank);
      if (!isNaN(rank)) updateData.rigor_rank = rank;
    }
    if (uid) {
      const userId = parseInt(uid);
      if (!isNaN(userId)) updateData.uid = userId;
    }

    if (schedule) {
      const scheduleDate = new Date(schedule);
      if (isNaN(scheduleDate.getTime())) {
        return res.status(400).json({ error: 'Invalid schedule date format' });
      }
      updateData.schedule = scheduleDate;
    }

    if (req.file) {
      if (existingEvent.files && existingEvent.files.image) {
        const oldImagePath = path.join(__dirname, '..', existingEvent.files.image);
        if (fs.existsSync(oldImagePath)) {
          try {
            fs.unlinkSync(oldImagePath);
            console.log(`Deleted old image: ${existingEvent.files.image}`);
          } catch (err) {
            console.error('Failed to delete old image:', err.message);
          }
        }
      }
      
      updateData.files = {
        image: `/uploads/${req.file.filename}`
      };
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(eventId) },
      { $set: updateData }
    );

    if (result.modifiedCount === 0) {
      return res.status(200).json({ 
        message: 'No changes detected',
        event: existingEvent 
      });
    }

    const updatedEvent = await collection.findOne({ _id: new ObjectId(eventId) });

    return res.status(200).json({
      message: 'Event updated successfully',
      event: updatedEvent
    });

  } catch (error) {
    console.error('Error updating event:', error);
    return res.status(500).json({ 
      error: 'Failed to update event', 
      message: error.message 
    });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const db = getDB();
    const collection = db.collection(COLLECTION_NAME);
    const eventId = req.params.id;

    if (!ObjectId.isValid(eventId)) {
      return res.status(400).json({ error: 'Invalid event ID format' });
    }

    const event = await collection.findOne({ _id: new ObjectId(eventId) });
    
    if (!event) {
      return res.status(404).json({ 
        error: 'Event not found',
        id: eventId 
      });
    }

    const result = await collection.deleteOne({ _id: new ObjectId(eventId) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.files && event.files.image) {
      const imagePath = path.join(__dirname, '..', event.files.image);
      if (fs.existsSync(imagePath)) {
        try {
          fs.unlinkSync(imagePath);
          console.log(`Cleaned up image: ${event.files.image}`);
        } catch (err) {
          console.error('Warning: Failed to delete image file:', err.message);
        }
      }
    }

    return res.status(200).json({
      message: 'Event deleted successfully',
      id: eventId
    });

  } catch (error) {
    console.error('Error deleting event:', error);
    return res.status(500).json({ 
      error: 'Failed to delete event', 
      message: error.message 
    });
  }
};

module.exports = {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent
};
