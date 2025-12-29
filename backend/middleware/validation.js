// middleware/validation.js
exports.validateFlight = (req, res, next) => {
    const { airline, from, to, startTime, price } = req.body;

    // 1. Kiểm tra thiếu trường
    if (!airline || !from || !to || !startTime || !price) {
        return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin (Hãng, Từ, Đến, Giờ, Giá)!" });
    }

    // 2. Kiểm tra giá tiền hợp lệ
    if (isNaN(price) || Number(price) < 0) {
        return res.status(400).json({ message: "Giá vé phải là số dương!" });
    }

    next(); // Dữ liệu OK, cho qua
};