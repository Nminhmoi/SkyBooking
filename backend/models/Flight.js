const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({
    airline: { type: String, required: true },
    flightCode: { type: String, required: true }, // Mã chuyến bay (VN123)
    seats: { type: Number, required: true },      // Tổng số ghế
    availableSeats: { type: Number, required: true }, // Ghế còn trống
    from: { type: String, required: true },
    to: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    price: { type: Number, required: true }
});

module.exports = mongoose.model('Flight', flightSchema);