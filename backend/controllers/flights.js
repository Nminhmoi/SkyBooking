const Flight = require('../models/Flight');

// @desc    Lấy danh sách chuyến bay (Có hỗ trợ lọc theo nơi đi, nơi đến, ngày)
// @route   GET /api/flights
// @access  Public
exports.getFlights = async (req, res) => {
  try {
    const { from, to, date } = req.query;
    let query = {};

    // 1. Lọc theo Nơi đi (tìm kiếm gần đúng, không phân biệt hoa thường)
    if (from) {
      query.from = { $regex: from, $options: 'i' };
    }

    // 2. Lọc theo Nơi đến
    if (to) {
      query.to = { $regex: to, $options: 'i' };
    }

    // 3. Lọc theo Ngày bay
    // Vì DB lưu giờ cụ thể (startTime), nên ta phải tìm trong khoảng 24h của ngày đó
    if (date) {
      const searchDate = new Date(date);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      query.startTime = {
        $gte: searchDate, // Lớn hơn hoặc bằng 00:00 ngày đó
        $lt: nextDay      // Nhỏ hơn 00:00 ngày hôm sau
      };
    }

    // Chỉ lấy chuyến còn chỗ trống
    query.availableSeats = { $gt: 0 };

    const flights = await Flight.find(query).sort({ startTime: 1 }); // Sắp xếp giờ bay tăng dần

    res.status(200).json({
      success: true,
      count: flights.length,
      data: flights
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi Server', error: err.message });
  }
};

// @desc    Tạo dữ liệu chuyến bay mẫu (Chạy 1 lần để có dữ liệu test)
// @route   POST /api/flights/seed
// @access  Public (Thực tế nên bảo vệ bằng Admin)
exports.seedFlights = async (req, res) => {
  try {
    const sampleFlights = [
      {
        flightNumber: 'VN101',
        airline: 'Vietnam Airlines',
        from: 'Hà Nội',
        to: 'TP HCM',
        startTime: new Date('2026-1-30T08:00:00Z'),
        endTime: new Date('2026-1-30T10:00:00Z'),
        price: 1500000,
        availableSeats: 100
      },
      {
        flightNumber: 'VJ202',
        airline: 'VietJet Air',
        from: 'Hà Nội',
        to: 'Đà Nẵng',
        startTime: new Date('2026-1-25T14:30:00Z'),
        endTime: new Date('2026-1-250T15:45:00Z'),
        price: 800000,
        availableSeats: 150
      },
      {
        flightNumber: 'QH303',
        airline: 'Bamboo Airways',
        from: 'TP HCM',
        to: 'Hà Nội',
        startTime: new Date('2026-1-26T09:15:00Z'),
        endTime: new Date('2026-1-26T11:15:00Z'),
        price: 1800000,
        availableSeats: 50
      }
    ];

    await Flight.insertMany(sampleFlights);

    res.status(201).json({ success: true, message: 'Đã tạo dữ liệu chuyến bay mẫu!' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi tạo dữ liệu mẫu', error: err.message });
  }
};