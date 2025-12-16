module.exports = (req, res, next) => {
  // req.user đã có dữ liệu từ middleware auth.js chạy trước đó
  if (req.user && req.user.role === 'admin') {
    next(); // Là admin thì cho đi tiếp
  } else {
    res.status(403).json({ 
      message: 'Bạn không có quyền thực hiện hành động này (Yêu cầu quyền Admin)' 
    });
  }
};