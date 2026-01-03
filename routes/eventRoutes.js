const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const upload = require('../middleware/upload');

router.get('/events', eventController.getEvents);
router.post('/events', upload.single('image'), eventController.createEvent);
router.put('/events/:id', upload.single('image'), eventController.updateEvent);
router.delete('/events/:id', eventController.deleteEvent);

module.exports = router;
