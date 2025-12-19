const express = require('express');
const router = express.Router();
const flightController = require('../controllers/flights');
const auth = require('../middleware/auth'); // Import bộ lọc đăng nhập

// 1. Xem danh sách: ĐỂ TRỐNG (Không thêm auth) -> Để ai cũng xem được
router.get('/', flightController.getFlights);

// 2. Thêm & Xóa: THÊM 'auth' và 'adminCheck' (nếu có) -> Để bảo vệ
// (Tạm thời bạn cứ thêm 'auth' vào để test trước đã)
router.post('/', auth, flightController.createFlight); 
router.delete('/:id', auth, flightController.deleteFlight);

module.exports = router;