const User = require('../models/User');
const jwt = require('jsonwebtoken');

// --- 1. SỬA HÀM NÀY: Nhận thêm 'role' để đóng gói vào Token ---
const signToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '3d' // Token hết hạn sau 3 ngày
  });
};

// Hàm gửi phản hồi Token về client
const sendTokenResponse = (user, statusCode, res) => {
  // Truyền cả id và role vào hàm ký tên
  const token = signToken(user._id, user.role);

  // Loại bỏ mật khẩu khỏi dữ liệu trả về client để bảo mật
  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    token,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role // Gửi role về frontend
    }
  });
};

// @desc    Đăng ký tài khoản mới
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Kiểm tra xem email đã tồn tại chưa
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email này đã được đăng ký!' });
    }

    // 2. Tạo user mới
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user' // Mặc định là user thường
    });

    // 3. Trả về token
    sendTokenResponse(user, 201, res);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi Server', error: err.message });
  }
};

// @desc    Đăng nhập
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Kiểm tra input
    if (!email || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu' });
    }

    // 2. Tìm user trong DB (Lấy cả password để so sánh)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    // 3. Kiểm tra mật khẩu
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    // 4. Nếu đúng hết -> Trả về token (đã bao gồm role nhờ hàm sendTokenResponse ở trên)
    sendTokenResponse(user, 200, res);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi Server', error: err.message });
  }
};