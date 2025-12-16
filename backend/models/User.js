const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vui lòng nhập tên'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Vui lòng nhập email'],
    unique: true, // Email không được trùng
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Email không hợp lệ'
    ]
  },
  password: {
    type: String,
    required: [true, 'Vui lòng nhập mật khẩu'],
    minlength: 6,
    select: false // Mặc định không trả về password khi query
  },
  role: {
    type: String,
    enum: ['user', 'admin'], // Chỉ cho phép 2 quyền này
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware: Tự động mã hóa mật khẩu trước khi lưu vào DB
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method: So sánh mật khẩu nhập vào với mật khẩu đã mã hóa
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);