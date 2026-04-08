const express = require('express');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const { verifyToken } = require('../middlewares/auth');
require('dotenv').config();

const router = express.Router();

/* ==================== MODULE 1: USER REGISTRATION ==================== */

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, university } = req.body;

    // Check if user already exists
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered.' });
    }

    const user = new User({ name, email, password, role, university });
    const saved = await user.save();

    // Generate token
    const token = jwt.sign(
      { _id: saved._id, email: saved.email, role: saved.role, isAdmin: saved.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        _id: saved._id,
        name: saved.name,
        email: saved.email,
        role: saved.role,
        university: saved.university,
        isAdmin: saved.isAdmin,
      }
    });
  } catch (err) {
    console.log('Register error:', err);
    res.status(500).json({ message: 'Registration failed.', error: err.message });
  }
});

/* ==================== MODULE 2: AUTHENTICATION ==================== */

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (user.isBanned) {
      return res.status(403).json({ message: 'Account has been suspended.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { _id: user._id, email: user.email, role: user.role, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        university: user.university,
        avatar: user.avatar,
        isAdmin: user.isAdmin,
        isVerified: user.isVerified,
      }
    });
  } catch (err) {
    console.log('Login error:', err);
    res.status(500).json({ message: 'Login failed.', error: err.message });
  }
});

// Get current user (from token)
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user.', error: err.message });
  }
});

/* ==================== MODULE 3: PROFILE MANAGEMENT ==================== */

router.put('/profile', verifyToken, async (req, res) => {
  try {
    const allowedFields = [
      'name', 'bio', 'headline', 'avatar', 'university',
      'skills', 'interests', 'domains', 'experience', 'education',
      'portfolio', 'linkedIn', 'github', 'location',
      'availability', 'commitment', 'goals', 'workStyle'
    ];

    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');

    // Recalculate profile completeness
    user.profileCompleteness = user.calcCompleteness();
    await user.save();

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Profile update failed.', error: err.message });
  }
});

// Get user profile by ID (public)
router.get('/profile/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -verificationToken');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching profile.', error: err.message });
  }
});

/* ==================== MODULE 8: SEARCH & FILTER ==================== */

router.get('/search', async (req, res) => {
  try {
    const { q, skills, domain, availability, location, role, page = 1, limit = 20 } = req.query;

    const filter = { isBanned: false };

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { bio: { $regex: q, $options: 'i' } },
        { headline: { $regex: q, $options: 'i' } },
        { university: { $regex: q, $options: 'i' } },
      ];
    }
    if (skills) {
      const skillArr = skills.split(',').map(s => s.trim());
      filter.skills = { $in: skillArr };
    }
    if (domain) {
      filter.domains = { $in: domain.split(',').map(d => d.trim()) };
    }
    if (availability) filter.availability = availability;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (role) filter.role = role;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const users = await User.find(filter)
      .select('-password -verificationToken')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    res.status(200).json({ users, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ message: 'Search failed.', error: err.message });
  }
});

/* ==================== MODULE 12: VERIFICATION ==================== */

router.post('/request-verification', verifyToken, async (req, res) => {
  try {
    const token = require('crypto').randomBytes(32).toString('hex');
    await User.findByIdAndUpdate(req.user._id, { verificationToken: token });
    // In production: send email with token link
    res.status(200).json({ message: 'Verification requested. Check your email.', token });
  } catch (err) {
    res.status(500).json({ message: 'Verification request failed.', error: err.message });
  }
});

router.post('/verify/:token', async (req, res) => {
  try {
    const user = await User.findOne({ verificationToken: req.params.token });
    if (!user) return res.status(404).json({ message: 'Invalid verification token.' });

    user.isVerified = true;
    user.verificationToken = '';
    await user.save();

    res.status(200).json({ message: 'Account verified successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Verification failed.', error: err.message });
  }
});

// Legacy endpoints for backward compatibility
router.get('/getall', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/getbyid/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;