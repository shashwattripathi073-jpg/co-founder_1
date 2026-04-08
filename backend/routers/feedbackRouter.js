const express = require('express');
const Feedback = require('../models/feedbackModel');
const User = require('../models/userModel');
const { verifyToken } = require('../middlewares/auth');

const router = express.Router();

/* ==================== MODULE 13: FEEDBACK & RATING ==================== */

// Submit feedback
router.post('/add', verifyToken, async (req, res) => {
  try {
    const { toUserId, startupId, rating, comment, categories } = req.body;

    if (toUserId === req.user._id) {
      return res.status(400).json({ message: 'Cannot rate yourself.' });
    }

    // Check existing feedback
    const existing = await Feedback.findOne({ fromUserId: req.user._id, toUserId });
    if (existing) {
      return res.status(409).json({ message: 'You have already rated this user.' });
    }

    const feedback = new Feedback({
      fromUserId: req.user._id,
      toUserId,
      startupId: startupId || undefined,
      rating,
      comment,
      categories: categories || {}
    });

    await feedback.save();

    // Update user's average rating
    const allFeedback = await Feedback.find({ toUserId });
    const avgRating = allFeedback.reduce((sum, f) => sum + f.rating, 0) / allFeedback.length;
    await User.findByIdAndUpdate(toUserId, {
      averageRating: Math.round(avgRating * 10) / 10,
      totalRatings: allFeedback.length
    });

    res.status(201).json(feedback);
  } catch (err) {
    res.status(500).json({ message: 'Failed to submit feedback.', error: err.message });
  }
});

// Get feedback for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const feedback = await Feedback.find({ toUserId: req.params.userId })
      .populate('fromUserId', 'name avatar headline')
      .sort({ createdAt: -1 });
    res.status(200).json(feedback);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch feedback.', error: err.message });
  }
});

// Get feedback given by current user
router.get('/given', verifyToken, async (req, res) => {
  try {
    const feedback = await Feedback.find({ fromUserId: req.user._id })
      .populate('toUserId', 'name avatar headline')
      .sort({ createdAt: -1 });
    res.status(200).json(feedback);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch feedback.', error: err.message });
  }
});

module.exports = router;
