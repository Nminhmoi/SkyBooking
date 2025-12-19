const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const auth = require('../middleware/auth');

router.get('/', reviewController.getReviews);
router.post('/', auth, reviewController.createReview); // Cần đăng nhập mới được comment
router.delete('/:id', auth, reviewController.deleteReview);

module.exports = router;