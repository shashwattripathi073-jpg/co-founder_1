const express = require('express');
const Report = require('../models/reportModel');
const { verifyToken } = require('../middlewares/auth');

const router = express.Router();

// Submit report (any authenticated user)
router.post('/submit', verifyToken, async (req, res) => {
  try {
    const { reportedUserId, reason, description } = req.body;
    const report = new Report({
      reporterId: req.user._id,
      reportedUserId,
      reason,
      description
    });
    await report.save();
    res.status(201).json({ message: 'Report submitted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to submit report.', error: err.message });
  }
});

module.exports = router;
