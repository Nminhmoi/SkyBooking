const Booking = require('../models/Booking');
const Flight = require('../models/Flight');

// @desc    Đặt vé mới
// @route   POST /api/bookings
// @access  Private (Cần đăng nhập)
exports.createBooking = async (req, res) => {
  try {
    const { flightId, passengers, bookingCode } = req.body; // passengers là mảng [{name, age}, ...]

    // 0. Kiểm tra dữ liệu đầu vào
    if (!flightId || !passengers || passengers.length === 0) {
      return res.status(400).json({ message: 'flightId và passengers là bắt buộc' });
    }

    if (!Array.isArray(passengers)) {
      return res.status(400).json({ message: 'passengers phải là mảng' });
    }

    // 1. Tìm chuyến bay
    const flight = await Flight.findById(flightId);
    if (!flight) {
      return res.status(404).json({ message: 'Không tìm thấy chuyến bay' });
    }

    // 2. Kiểm tra số chỗ còn lại
    const seatsToBook = passengers.length;
    if (flight.availableSeats < seatsToBook) {
      return res.status(400).json({ message: 'Không đủ chỗ ngồi cho số lượng hành khách này!' });
    }

    // 3. Tính tổng tiền
    const totalPrice = flight.price * seatsToBook;

    // 4. Tạo Booking mới (với bookingCode nếu có)
    const booking = await Booking.create({
      user: req.user.id, // Lấy từ middleware auth
      flight: flightId,
      passengers,
      bookingCode: bookingCode || '', // Lưu mã đặt vé (nếu không có thì rỗng)
      status: 'paid', // Set là đã thanh toán
      totalPrice
    });

    // 5. Cập nhật số ghế còn lại của chuyến bay (Trừ đi số vé đã đặt)
    flight.availableSeats -= seatsToBook;
    await flight.save();

    res.status(201).json({
      success: true,
      data: booking
    });

  } catch (err) {
    res.status(500).json({ message: 'Lỗi Server', error: err.message });
  }
};

// @desc    Xem lịch sử vé đã đặt của tôi
// @route   GET /api/bookings/my-tickets
// @access  Private
exports.getMyBookings = async (req, res) => {
  try {
    // Tìm booking của user hiện tại và lấy kèm thông tin chuyến bay (populate)
    const bookings = await Booking.find({ user: req.user.id })
      .populate('flight', 'flightNumber airline from to startTime price');

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi Server', error: err.message });
  }
};

// @desc    Xem tất cả vé (Chức năng cho Admin)
// @route   GET /api/bookings/all
// @access  Private/Admin
exports.getAllBookings = async (req, res) => {
  try {
    // Lấy tất cả booking, kèm thông tin User và Flight
    const bookings = await Booking.find()
      .populate('user', 'name email')
      .populate('flight', 'flightNumber airline from to startTime');

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi Server', error: err.message });
  }
};