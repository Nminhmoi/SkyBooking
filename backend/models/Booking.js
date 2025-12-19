const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  flight: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Flight',
    required: true
  },
  passengers: [
    {
      name: { type: String, required: true },
      age: { type: Number, required: true }
    }
  ],
  // --- THÊM 2 DÒNG NÀY ---
  bookingCode: { 
    type: String, 
    default: '' // Lưu mã SKY... ví dụ: SKY8839
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'cancelled'],
    default: 'paid' // Mặc định là 'paid' vì khách bấm xác nhận rồi mới lưu
  },
  // -----------------------
  bookingDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Booking', BookingSchema);