const mongoose = require('mongoose');

const FlightSchema = new mongoose.Schema({
  airline: { type: String, required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true }, // Bắt buộc phải có
  price: { type: Number, required: true }
});

module.exports = mongoose.model('Flight', FlightSchema);