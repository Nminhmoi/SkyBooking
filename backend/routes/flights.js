const express = require('express');
const router = express.Router();
const flightController = require('../controllers/flights');
const auth = require('../middleware/auth'); // <--- 1. Gọi middleware auth

// GET /api/flights
// Thêm 'auth' vào giữa để yêu cầu đăng nhập mới được tìm
router.get('/', auth, flightController.getFlights); 

// POST /api/flights/seed
router.post('/seed', flightController.seedFlights);

module.exports = router;