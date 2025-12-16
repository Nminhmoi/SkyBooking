const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // 1. Lấy token từ header
  // Hỗ trợ cả 2 chuẩn: 'x-auth-token' hoặc 'Authorization: Bearer ...'
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.header('x-auth-token')) {
    token = req.header('x-auth-token');
  }

  // 2. Kiểm tra nếu không có token
  if (!token) {
    return res.status(401).json({ message: 'Không có token, từ chối truy cập!' });
  }

  // 3. Xác thực token
  try {
    // Giải mã token bằng JWT_SECRET trong file .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Gán thông tin user đã giải mã vào req.user để các route sau sử dụng
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token không hợp lệ!' });
  }
};