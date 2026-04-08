const express = require('express');
const User = require('../models/userModel');
const Startup = require('../models/startupModel');
const Report = require('../models/reportModel');
const Collaboration = require('../models/collaborationModel');
const Feedback = require('../models/feedbackModel');
const { verifyToken, isAdmin } = require('../middlewares/auth');

const router = express.Router();

/* ==================== MODULE 14: ADMIN CONTROL ==================== */

// All admin routes require authentication + admin role
router.use(verifyToken);
router.use(isAdmin);

// Dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalStartups, totalCollabs, totalReports, pendingReports] = await Promise.all([
      User.countDocuments(),
      Startup.countDocuments(),
      Collaboration.countDocuments({ status: 'accepted' }),
      Report.countDocuments(),
      Report.countDocuments({ status: 'pending' }),
    ]);

    const recentUsers = await User.find().select('name email role createdAt isVerified')
      .sort({ createdAt: -1 }).limit(5);

    res.status(200).json({
      totalUsers,
      totalStartups,
      totalCollabs,
      totalReports,
      pendingReports,
      recentUsers
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stats.', error: err.message });
  }
});

// List all users with pagination
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, status } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (role) filter.role = role;
    if (status === 'verified') filter.isVerified = true;
    if (status === 'banned') filter.isBanned = true;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const users = await User.find(filter).select('-password -verificationToken')
      .skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 });
    const total = await User.countDocuments(filter);

    res.status(200).json({ users, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users.', error: err.message });
  }
});

// Verify user
router.put('/users/:id/verify', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isVerified: true, verificationToken: '' }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to verify user.', error: err.message });
  }
});

// Ban/Unban user
router.put('/users/:id/ban', async (req, res) => {
  try {
    const { ban, reason } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBanned: ban, banReason: ban ? reason : '' },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update user.', error: err.message });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'User deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user.', error: err.message });
  }
});

// Get reports
router.get('/reports', async (req, res) => {
  try {
    const { status = 'pending' } = req.query;
    const filter = {};
    if (status !== 'all') filter.status = status;

    const reports = await Report.find(filter)
      .populate('reporterId', 'name email avatar')
      .populate('reportedUserId', 'name email avatar')
      .sort({ createdAt: -1 });
    res.status(200).json(reports);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch reports.', error: err.message });
  }
});

// Handle report
router.put('/reports/:id', async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status, adminNote, resolvedAt: status === 'resolved' ? new Date() : undefined },
      { new: true }
    ).populate('reporterId', 'name email').populate('reportedUserId', 'name email');
    if (!report) return res.status(404).json({ message: 'Report not found.' });
    res.status(200).json(report);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update report.', error: err.message });
  }
});

// Submit report (accessible to any logged-in user)
router.post('/report', async (req, res) => {
  try {
    const { reportedUserId, reason, description } = req.body;
    const report = new Report({
      reporterId: req.user._id,
      reportedUserId,
      reason,
      description
    });
    await report.save();
    res.status(201).json(report);
  } catch (err) {
    res.status(500).json({ message: 'Failed to submit report.', error: err.message });
  }
});

module.exports = router;
