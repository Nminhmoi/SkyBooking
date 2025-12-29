module.exports = (req, res, next) => {
  console.log("🔍 DEBUG CHECK ROLE:");
  console.log("Dữ liệu User nhận được từ Auth:", req.user);
  console.log("Role đang check:", req.user ? req.user.role : "Không tìm thấy role");


  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ 
      message: 'Bạn không có quyền thực hiện hành động này (Yêu cầu quyền Admin)' 
    });
  }
};