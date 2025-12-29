const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // 1. Lấy token từ header
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.header('x-auth-token')) {
    token = req.header('x-auth-token');
  }

  // Debug: Xem Token có đến nơi không
  console.log("---------------------------------------");
  console.log("🔑 AUTH DEBUG:");
  console.log("Token nhận được:", token ? "Có (Đang giải mã...)" : "KHÔNG CÓ");

  // 2. Nếu không có token
  if (!token) {
    return res.status(401).json({ message: 'Không tìm thấy Token xác thực!' });
  }

  // 3. Xác thực token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    console.log("🔓 Nội dung Token đã giải mã:", decoded);

    // --- ĐOẠN QUAN TRỌNG: TỰ ĐỘNG NHẬN DIỆN CẤU TRÚC ---
    if (decoded.user) {
        // Trường hợp 1: Token lồng nhau { user: { id: ..., role: ... } }
        req.user = decoded.user;
        console.log("=> Đã gán req.user = decoded.user");
    } else {
        // Trường hợp 2: Token phẳng { id: ..., role: ... }
        req.user = decoded;
        console.log("=> Đã gán req.user = decoded (Dạng phẳng)");
    }
    // ----------------------------------------------------

    next();
  } catch (err) {
    console.error("❌ Lỗi giải mã Token:", err.message);
    res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn!' });
  }
};