const mongoose = require('mongoose');

const FlightSchema = new mongoose.Schema({
  flightNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true // Tự động viết hoa (ví dụ: VN123)
  },
  airline: {
    type: String,
    required: true
  },
  from: {
    type: String,
    required: true, // Ví dụ: "Hà Nội"
    index: true // Đánh index để tìm kiếm nhanh hơn
  },
  to: {
    type: String,
    required: true, // Ví dụ: "TP HCM"
    index: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  availableSeats: {
    type: Number,
    required: true,
    min: 0
  }
});

module.exports = mongoose.model('Flight', FlightSchema);