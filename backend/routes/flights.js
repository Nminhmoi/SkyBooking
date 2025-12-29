const express = require('express');
const router = express.Router();
const flightController = require('../controllers/flights'); 

// --- IMPORT CÁC MIDDLEWARE BẢO VỆ ---
const auth = require('../middleware/auth');           // 1. Kiểm tra đăng nhập
const checkRole = require('../middleware/checkRole'); // 2. Kiểm tra quyền Admin (File bạn vừa up)
const { validateFlight } = require('../middleware/validation'); // 3. Kiểm tra dữ liệu (File cần tạo thêm)

// --- ĐỊNH NGHĨA ROUTE ---

// 1. Xem danh sách: Ai cũng xem được (Public)
router.get('/', flightController.getFlights);

// 2. Thêm chuyến bay: Phải qua 3 lớp bảo vệ
// Thứ tự: Đăng nhập -> Check Admin -> Check dữ liệu -> Mới được Lưu
router.post('/', auth, checkRole, validateFlight, flightController.createFlight); 

// 3. Xóa chuyến bay: Phải qua 2 lớp bảo vệ
// Thứ tự: Đăng nhập -> Check Admin -> Mới được Xóa
router.delete('/:id', auth, checkRole, flightController.deleteFlight);

module.exports = router;