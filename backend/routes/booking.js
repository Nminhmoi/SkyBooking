const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

router.post('/', auth, bookingController.createBooking);
router.get('/my-tickets', auth, bookingController.getMyBookings);
router.get('/all', auth, checkRole, bookingController.getAllBookings);

module.exports = router;
