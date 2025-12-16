const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User', // Liên kết tới bảng User
    required: true
  },
  flight: {
    type: mongoose.Schema.ObjectId,
    ref: 'Flight', // Liên kết tới bảng Flight
    required: true
  },
  passengers: [
    {
      name: { type: String, required: true },
      age: { type: Number }
    }
  ],
  totalPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['booked', 'cancelled'],
    default: 'booked'
  },
  bookingDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Booking', BookingSchema);