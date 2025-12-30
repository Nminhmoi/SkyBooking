const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Security Packages
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

// 1. Load biến môi trường
dotenv.config();

// 2. Kết nối Database
connectDB();

const app = express();

// --- MIDDLEWARES CƠ BẢN ---
app.use(express.json()); // Đọc dữ liệu JSON
app.use(cors()); // Cho phép Frontend gọi API

// --- MIDDLEWARES BẢO MẬT ---
app.use(helmet());
app.use(mongoSanitize());
app.use(xss());

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, 
  max: 100,
  message: 'Quá nhiều request, vui lòng thử lại sau.'
});
app.use('/api', limiter);

//ROUTES
app.use('/api/auth', require('./routes/auth'));
app.use('/api/bookings', require('./routes/booking')); 
app.use('/api/flights', require('./routes/flights'));
app.use('/api/reviews', require('./routes/reviews'));

// Default Route (Test server)
app.get('/', (req, res) => {
  res.status(200).json({ message: 'API SkyBooking đang chạy... ✈️' });
});

// Error Handler
app.use((req, res, next) => {
  res.status(404).json({ message: `Không tìm thấy đường dẫn: ${req.originalUrl}` });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Lỗi Server Nội bộ!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`));