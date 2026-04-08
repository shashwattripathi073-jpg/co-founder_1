const express = require('express');
const Collaboration = require('../models/collaborationModel');
const User = require('../models/userModel');
const { verifyToken } = require('../middlewares/auth');

const router = express.Router();

/* ==================== MODULE 9: COLLABORATION REQUESTS ==================== */

// Send collaboration request
router.post('/send', verifyToken, async (req, res) => {
  try {
    const { receiverId, startupId, roleTitle, message } = req.body;

    if (receiverId === req.user._id) {
      return res.status(400).json({ message: 'Cannot send request to yourself.' });
    }

    // Check if request already exists
    const existing = await Collaboration.findOne({
      senderId: req.user._id,
      receiverId,
      startupId: startupId || null,
      status: { $in: ['pending', 'accepted'] }
    });
    if (existing) {
      return res.status(409).json({ message: 'Request already sent.' });
    }

    const collab = new Collaboration({
      senderId: req.user._id,
      receiverId,
      startupId: startupId || undefined,
      roleTitle,
      message
    });

    const saved = await collab.save();
    const populated = await saved.populate([
      { path: 'senderId', select: 'name email avatar headline' },
      { path: 'receiverId', select: 'name email avatar headline' },
      { path: 'startupId', select: 'name tagline' }
    ]);

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to send request.', error: err.message });
  }
});

// Get incoming requests
router.get('/incoming', verifyToken, async (req, res) => {
  try {
    const requests = await Collaboration.find({ receiverId: req.user._id })
      .populate('senderId', 'name email avatar headline university skills')
      .populate('startupId', 'name tagline domain')
      .sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch requests.', error: err.message });
  }
});

// Get outgoing requests
router.get('/outgoing', verifyToken, async (req, res) => {
  try {
    const requests = await Collaboration.find({ senderId: req.user._id })
      .populate('receiverId', 'name email avatar headline university skills')
      .populate('startupId', 'name tagline domain')
      .sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch requests.', error: err.message });
  }
});

// Respond to request (accept/reject)
router.put('/respond/:id', verifyToken, async (req, res) => {
  try {
    const { status, responseMessage } = req.body;
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be accepted or rejected.' });
    }

    const collab = await Collaboration.findOne({ _id: req.params.id, receiverId: req.user._id, status: 'pending' });
    if (!collab) return res.status(404).json({ message: 'Request not found.' });

    collab.status = status;
    collab.responseMessage = responseMessage || '';
    collab.respondedAt = new Date();
    await collab.save();

    const populated = await collab.populate([
      { path: 'senderId', select: 'name email avatar headline' },
      { path: 'receiverId', select: 'name email avatar headline' },
    ]);

    res.status(200).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to respond.', error: err.message });
  }
});

// Withdraw request
router.put('/withdraw/:id', verifyToken, async (req, res) => {
  try {
    const collab = await Collaboration.findOneAndUpdate(
      { _id: req.params.id, senderId: req.user._id, status: 'pending' },
      { status: 'withdrawn' },
      { new: true }
    );
    if (!collab) return res.status(404).json({ message: 'Request not found.' });
    res.status(200).json(collab);
  } catch (err) {
    res.status(500).json({ message: 'Failed to withdraw.', error: err.message });
  }
});

module.exports = router;
