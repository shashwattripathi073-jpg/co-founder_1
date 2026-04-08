const express = require('express');
const User = require('../models/userModel');
const Startup = require('../models/startupModel');
const { verifyToken } = require('../middlewares/auth');

const router = express.Router();

/* ==================== MODULE 6 & 7: SKILL MATCHING & RECOMMENDATIONS ==================== */
/* ==================== MODULE 11: COMPATIBILITY ANALYSIS ==================== */

// Calculate match score between two users
function calculateMatchScore(user1, user2) {
  let score = 0;
  let maxScore = 0;

  // Skill complementarity (30 points)
  maxScore += 30;
  if (user1.skills && user2.skills) {
    const commonSkills = user1.skills.filter(s => user2.skills.includes(s));
    const uniqueSkills = new Set([...user1.skills, ...user2.skills]);
    // Some overlap is good, but too much means they're too similar
    const overlapRatio = commonSkills.length / Math.max(uniqueSkills.size, 1);
    // Sweet spot: 20-40% overlap
    if (overlapRatio >= 0.1 && overlapRatio <= 0.5) score += 30;
    else if (overlapRatio > 0.5) score += 15;
    else score += commonSkills.length * 5;
  }

  // Domain/Interest alignment (25 points)
  maxScore += 25;
  if (user1.interests && user2.interests) {
    const commonInterests = user1.interests.filter(i => user2.interests.includes(i));
    score += Math.min(commonInterests.length * 8, 25);
  }
  if (user1.domains && user2.domains) {
    const commonDomains = user1.domains.filter(d => user2.domains.includes(d));
    score += Math.min(commonDomains.length * 5, 10);
  }

  // Complementary roles (20 points)
  maxScore += 20;
  if (user1.role !== user2.role) score += 20;
  else score += 5;

  // Availability compatibility (10 points)
  maxScore += 10;
  if (user1.availability && user2.availability) {
    if (user1.availability === user2.availability) score += 10;
    else if (user1.availability === 'flexible' || user2.availability === 'flexible') score += 7;
    else score += 3;
  }

  // Location match (5 points)
  maxScore += 5;
  if (user1.location && user2.location && user1.location.toLowerCase() === user2.location.toLowerCase()) {
    score += 5;
  }

  // Profile completeness bonus (10 points)
  maxScore += 10;
  const completeness1 = user1.profileCompleteness || 0;
  const completeness2 = user2.profileCompleteness || 0;
  score += Math.round(((completeness1 + completeness2) / 200) * 10);

  return Math.min(Math.round((score / maxScore) * 100), 99);
}

// Get compatibility analysis between two users
function getCompatibilityBreakdown(user1, user2) {
  const breakdown = {
    overall: 0,
    categories: {}
  };

  // Skills
  let skillScore = 0;
  if (user1.skills && user2.skills) {
    const commonSkills = user1.skills.filter(s => user2.skills.includes(s));
    const allSkills = new Set([...user1.skills, ...user2.skills]);
    skillScore = Math.round((commonSkills.length / Math.max(allSkills.size, 1)) * 100);
  }
  breakdown.categories.skills = { score: skillScore, label: 'Skills Complementarity', common: user1.skills?.filter(s => user2.skills?.includes(s)) || [] };

  // Interests
  let interestScore = 0;
  if (user1.interests && user2.interests) {
    const common = user1.interests.filter(i => user2.interests.includes(i));
    interestScore = Math.round((common.length / Math.max(Math.min(user1.interests.length, user2.interests.length), 1)) * 100);
  }
  breakdown.categories.interests = { score: interestScore, label: 'Interest Alignment', common: user1.interests?.filter(i => user2.interests?.includes(i)) || [] };

  // Role compatibility
  const roleScore = user1.role !== user2.role ? 90 : 40;
  breakdown.categories.role = { score: roleScore, label: 'Role Compatibility' };

  // Availability
  let availScore = 0;
  if (user1.availability === user2.availability) availScore = 100;
  else if (user1.availability === 'flexible' || user2.availability === 'flexible') availScore = 70;
  else availScore = 30;
  breakdown.categories.availability = { score: availScore, label: 'Availability Match' };

  // Goals
  let goalsScore = 50; // default
  if (user1.goals && user2.goals) {
    // Simple word overlap analysis
    const words1 = user1.goals.toLowerCase().split(/\s+/);
    const words2 = user2.goals.toLowerCase().split(/\s+/);
    const common = words1.filter(w => words2.includes(w) && w.length > 3);
    goalsScore = Math.min(50 + common.length * 10, 100);
  }
  breakdown.categories.goals = { score: goalsScore, label: 'Goals Alignment' };

  breakdown.overall = calculateMatchScore(user1, user2);
  return breakdown;
}

// Get recommendations for current user
router.get('/recommendations', verifyToken, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    if (!currentUser) return res.status(404).json({ message: 'User not found.' });

    // Find potential matches (opposite role preferred, not banned, not self)
    const candidates = await User.find({
      _id: { $ne: req.user._id },
      isBanned: false,
    }).select('-password -verificationToken').limit(50);

    // Score and sort candidates
    const scored = candidates.map(candidate => ({
      user: candidate,
      matchScore: calculateMatchScore(currentUser, candidate),
    })).sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json(scored.slice(0, 20));
  } catch (err) {
    res.status(500).json({ message: 'Failed to get recommendations.', error: err.message });
  }
});

// Get compatibility breakdown between current user and another
router.get('/compatibility/:userId', verifyToken, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const otherUser = await User.findById(req.params.userId).select('-password -verificationToken');

    if (!currentUser || !otherUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const breakdown = getCompatibilityBreakdown(currentUser, otherUser);
    res.status(200).json({ user: otherUser, breakdown });
  } catch (err) {
    res.status(500).json({ message: 'Failed to analyze compatibility.', error: err.message });
  }
});

// Match startup requirements with candidates
router.get('/startup-matches/:startupId', verifyToken, async (req, res) => {
  try {
    const startup = await Startup.findById(req.params.startupId);
    if (!startup) return res.status(404).json({ message: 'Startup not found.' });

    // Get required skills from startup roles
    const requiredSkills = startup.requiredRoles.reduce((acc, role) => {
      return [...acc, ...role.skills];
    }, []);

    // Find candidates with matching skills
    const candidates = await User.find({
      _id: { $ne: startup.founderId },
      isBanned: false,
      skills: { $in: requiredSkills }
    }).select('-password -verificationToken').limit(30);

    const scored = candidates.map(candidate => {
      const matchedSkills = candidate.skills.filter(s => requiredSkills.includes(s));
      return {
        user: candidate,
        matchScore: Math.round((matchedSkills.length / Math.max(requiredSkills.length, 1)) * 100),
        matchedSkills,
      };
    }).sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json(scored);
  } catch (err) {
    res.status(500).json({ message: 'Failed to find matches.', error: err.message });
  }
});

module.exports = router;
