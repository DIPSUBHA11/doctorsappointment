const express = require('express');
const eventController = require('../controllers/appointment');
const router = express.Router();
router.get('/freeslot', eventController.getFreeSlot);
router.put('/createEvent',eventController.createEvent);
router.get('/getEvent',eventController.getEvent);


module.exports = router;