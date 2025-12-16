const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Hàm tạo Token (dùng chung cho cả Register và Login)
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d' // Token hết hạn sau 30 ngày
  });
};

// Hàm gửi phản hồi Token về client
const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user._id);

  // Loại bỏ mật khẩu khỏi dữ liệu trả về client để bảo mật
  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    token,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
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

    // 2. Tạo user mới (Password sẽ tự động mã hóa nhờ middleware trong Model)
    // Lưu ý: Chỉ cho phép tạo role 'admin' nếu cần thiết, thực tế nên chặn ở đây hoặc dùng secret key khác
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user' // Mặc định là user thường
    });

    // 3. Trả về token
    sendTokenResponse(user, 201, res);

  } catch (err) {
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

    // 2. Tìm user trong DB
    // Lưu ý: Cần .select('+password') vì trong Model ta để select: false
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    // 3. Kiểm tra mật khẩu (dùng method matchPassword đã viết trong Model)
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    // 4. Nếu đúng hết -> Trả về token
    sendTokenResponse(user, 200, res);

  } catch (err) {
    res.status(500).json({ message: 'Lỗi Server', error: err.message });
  }
};