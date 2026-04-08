const express = require('express');
const Startup = require('../models/startupModel');
const { verifyToken } = require('../middlewares/auth');

const router = express.Router();

/* ==================== MODULE 4 & 5: STARTUP IDEAS & ROLE DEFINITIONS ==================== */

// Create startup idea
router.post('/add', verifyToken, async (req, res) => {
  try {
    const startup = new Startup({
      ...req.body,
      founderId: req.user._id,
      teamMembers: [req.user._id]
    });
    const saved = await startup.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create startup.', error: err.message });
  }
});

// Get all active startups
router.get('/getall', async (req, res) => {
  try {
    const { domain, stage, search, page = 1, limit = 20 } = req.query;
    const filter = { isActive: true };

    if (domain) filter.domain = { $regex: domain, $options: 'i' };
    if (stage) filter.stage = stage;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { tagline: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const startups = await Startup.find(filter)
      .populate('founderId', 'name email avatar university headline')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Startup.countDocuments(filter);
    res.status(200).json({ startups, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch startups.', error: err.message });
  }
});

// Get startups by founder
router.get('/my', verifyToken, async (req, res) => {
  try {
    const startups = await Startup.find({ founderId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(startups);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch startups.', error: err.message });
  }
});

// Get startup by ID
router.get('/:id', async (req, res) => {
  try {
    const startup = await Startup.findById(req.params.id)
      .populate('founderId', 'name email avatar university headline skills')
      .populate('teamMembers', 'name avatar headline');
    if (!startup) return res.status(404).json({ message: 'Startup not found.' });
    res.status(200).json(startup);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch startup.', error: err.message });
  }
});

// Update startup
router.put('/update/:id', verifyToken, async (req, res) => {
  try {
    const startup = await Startup.findOne({ _id: req.params.id, founderId: req.user._id });
    if (!startup) return res.status(404).json({ message: 'Startup not found or unauthorized.' });

    const allowedFields = ['name', 'tagline', 'description', 'domain', 'stage', 'vision', 'requiredRoles', 'isActive'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) startup[field] = req.body[field];
    });

    const saved = await startup.save();
    res.status(200).json(saved);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update startup.', error: err.message });
  }
});

// Delete startup
router.delete('/delete/:id', verifyToken, async (req, res) => {
  try {
    const result = await Startup.findOneAndDelete({ _id: req.params.id, founderId: req.user._id });
    if (!result) return res.status(404).json({ message: 'Startup not found or unauthorized.' });
    res.status(200).json({ message: 'Startup deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete startup.', error: err.message });
  }
});

module.exports = router;
