const Review = require('../models/Review');

// @desc    Lấy tất cả bình luận (Mới nhất lên đầu)
// @route   GET /api/reviews
// @access  Public
exports.getReviews = async (req, res) => {
  try {
    // Lấy kèm tên user từ bảng User
    const reviews = await Review.find()
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(6); // Chỉ lấy 6 cái mới nhất hiển thị trang chủ

    res.status(200).json({ success: true, data: reviews });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi Server', error: err.message });
  }
};

// @desc    Viết bình luận mới
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const review = await Review.create({
      user: req.user.id, // Lấy từ token
      rating,
      comment
    });

    // Populate ngay lập tức để trả về frontend hiển thị luôn
    await review.populate('user', 'name');

    res.status(201).json({ success: true, data: review });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi Server', error: err.message });
  }
};