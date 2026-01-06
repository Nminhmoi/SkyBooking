const Flight = require('../models/Flight');

// Danh sách sân bay/thành phố phổ biến ở VN
const airports = [
  "Hà Nội", "TP HCM", "Đà Nẵng", "Nha Trang", 
  "Phú Quốc", "Đà Lạt", "Hải Phòng", "Cần Thơ", 
  "Huế", "Quy Nhơn", "Vinh", "Thanh Hóa"
];

const airlines = [
  { name: "Vietnam Airlines", code: "VN" },
  { name: "VietJet Air", code: "VJ" },
  { name: "Bamboo Airways", code: "QH" },
  { name: "Vietravel Airlines", code: "VU" }
];


// @desc    Lấy danh sách chuyến bay
exports.getFlights = async (req, res) => {
  try {
    const { from, to, date } = req.query;
    let query = {};

    if (from) query.from = { $regex: from, $options: 'i' }; 
    if (to) query.to = { $regex: to, $options: 'i' };
    if (date) {
      const searchDate = new Date(date);
      if (!isNaN(searchDate)) {
          const nextDay = new Date(date);
          nextDay.setDate(nextDay.getDate() + 1);
          query.startTime = { $gte: searchDate, $lt: nextDay };
      }
    }

    const flights = await Flight.find(query).sort({ startTime: 1 });
    res.status(200).json(flights); // Trả về mảng trực tiếp cho dễ xử lý ở FE

  } catch (err) {
    res.status(500).json({ message: 'Lỗi Server', error: err.message });
  }
};


// @desc    Tạo chuyến bay mới (ADMIN)
// @route   POST /api/flights
exports.createFlight = async (req, res) => {
  console.log("DỮ LIỆU NHẬN ĐƯỢC:", req.body); 

  try {
    // 1. Lấy đủ các trường từ Frontend gửi lên
    // LƯU Ý: Phải lấy cả flightCode và seats
    const { airline, flightCode, seats, from, to, startTime, price } = req.body;

    // 2. Kiểm tra dữ liệu
    if (!airline || !flightCode || !seats || !from || !to || !startTime || !price) {
      return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin!" });
    }

    // 3. Xử lý ngày tháng
    let start = new Date(startTime);
    let end = req.body.endTime ? new Date(req.body.endTime) : new Date(start.getTime() + 2 * 60 * 60 * 1000);

    // 4. TẠO OBJECT ĐỂ LƯU
    // Quan trọng: Bỏ đoạn tự động sinh mã đi, dùng mã người dùng nhập
    const newFlight = new Flight({
      flightCode: flightCode,   // <--- Dùng mã Admin nhập
      airline,
      from,
      to,
      startTime: start,
      endTime: end,
      price: Number(price),
      seats: Number(seats),           // <--- Lưu tổng số ghế
      availableSeats: Number(seats)   // <--- Mới tạo thì ghế trống = tổng ghế
    });

    const savedFlight = await newFlight.save();
    console.log("--> ĐÃ LƯU:", savedFlight);

    res.status(201).json(savedFlight);

  } catch (err) {
    console.error("LỖI:", err); 
    res.status(500).json({ message: "Lỗi Server: " + err.message });
  }
};

// @desc    Xóa chuyến bay
exports.deleteFlight = async (req, res) => {
  try {
    await Flight.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Đã xóa" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};