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

// Hàm lấy ngẫu nhiên 1 phần tử trong mảng
const random = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Hàm lấy số ngẫu nhiên trong khoảng min-max
const randomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// @desc    Lấy danh sách chuyến bay (Có lọc)
// @route   GET /api/flights
// @access  Public
exports.getFlights = async (req, res) => {
  try {
    const { from, to, date } = req.query;
    let query = {};

    if (from) query.from = { $regex: from, $options: 'i' };
    if (to) query.to = { $regex: to, $options: 'i' };

    if (date) {
      const searchDate = new Date(date);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      query.startTime = { $gte: searchDate, $lt: nextDay };
    }

    query.availableSeats = { $gt: 0 };
    
    const flights = await Flight.find(query).sort({ startTime: 1 });

    res.status(200).json({
      success: true,
      count: flights.length,
      data: flights
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi Server', error: err.message });
  }
};

// @desc    Tạo 100 chuyến bay ngẫu nhiên (SEED DATA)
// @route   POST /api/flights/seed
// @access  Public
exports.seedFlights = async (req, res) => {
  try {
    // 1. Xóa dữ liệu cũ
    await Flight.deleteMany(); 

    const sampleFlights = [];
    // Dùng Set để lưu các mã chuyến bay đã tạo nhằm kiểm tra trùng lặp cực nhanh
    const usedFlightNumbers = new Set();

    for (let i = 0; i < 100; i++) {
      
      let from = random(airports);
      let to = random(airports);
      while (from === to) {
        to = random(airports);
      }

      const airlineData = random(airlines);

      // --- SỬA LỖI TRÙNG LẶP (DUPLICATE KEY) TẠI ĐÂY ---
      let flightNumber;
      let isDuplicate = true;
      
      // Vòng lặp: Nếu trùng thì random lại, đến khi nào không trùng thì thôi
      while (isDuplicate) {
        flightNumber = `${airlineData.code}${randomNumber(100, 999)}`;
        if (!usedFlightNumbers.has(flightNumber)) {
          usedFlightNumbers.add(flightNumber); // Đánh dấu đã dùng
          isDuplicate = false; // Thoát vòng lặp
        }
      }
      // -------------------------------------------------

      const today = new Date();
      const randomDays = randomNumber(0, 30);
      const randomHour = randomNumber(6, 22);
      
      const startTime = new Date(today);
      startTime.setDate(today.getDate() + randomDays);
      startTime.setHours(randomHour, randomNumber(0, 59), 0);

      const flightDuration = randomNumber(90, 150);
      const endTime = new Date(startTime.getTime() + flightDuration * 60000);

      const rawPrice = randomNumber(800, 3000) * 1000; 
      
      sampleFlights.push({
        flightNumber, // Sử dụng số hiệu đã được kiểm tra trùng
        airline: airlineData.name,
        from,
        to,
        startTime,
        endTime,
        price: rawPrice,
        availableSeats: randomNumber(50, 200)
      });
    }

    await Flight.insertMany(sampleFlights);

    res.status(201).json({ 
      success: true, 
      message: `Đã xóa dữ liệu cũ và tạo mới ${sampleFlights.length} chuyến bay thành công!` 
    });

  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi tạo dữ liệu mẫu', error: err.message });
  }
};