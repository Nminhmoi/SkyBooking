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

// @desc    Xóa bình luận (Chỉ chủ bài viết mới xóa được)
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Không tìm thấy bình luận' });
    }

    // Kiểm tra quyền: ID người login (req.user.id) CÓ TRÙNG VỚI ID người viết (review.user) không?
    // Lưu ý: review.user là ObjectId nên cần convert sang String để so sánh
    if (review.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Bạn không có quyền xóa bình luận này!' });
    }

    await review.deleteOne();

    res.status(200).json({ success: true, message: 'Đã xóa bình luận' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi Server', error: err.message });
  }
};