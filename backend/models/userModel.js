const { Schema, model } = require('../connection');
const bcrypt = require('bcrypt');

const userSchema = new Schema({
  // Basic Info
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['founder', 'candidate'], default: 'candidate' },

  // Profile Info
  university: { type: String, trim: true, default: '' },
  bio: { type: String, default: '', maxlength: 500 },
  avatar: { type: String, default: '' }, // base64 or URL
  headline: { type: String, default: '', maxlength: 120 },

  // Skills & Interests
  skills: [{ type: String, trim: true }],
  interests: [{ type: String, trim: true }],
  domains: [{ type: String, trim: true }], // e.g. FinTech, EdTech, HealthTech

  // Professional
  experience: [{
    title: String,
    company: String,
    duration: String,
    description: String
  }],
  education: [{
    institution: String,
    degree: String,
    year: String
  }],
  portfolio: { type: String, default: '' },
  linkedIn: { type: String, default: '' },
  github: { type: String, default: '' },

  // Availability & Preferences
  location: { type: String, default: '' },
  availability: { type: String, enum: ['immediate', 'part-time', 'weekends', 'flexible', ''], default: '' },
  commitment: { type: String, enum: ['full-time', 'part-time', 'weekends', 'flexible', ''], default: '' },
  goals: { type: String, default: '', maxlength: 300 },
  workStyle: { type: String, default: '', maxlength: 300 },

  // Trust & Verification
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String, default: '' },
  profileCompleteness: { type: Number, default: 0, min: 0, max: 100 },

  // Admin
  isAdmin: { type: Boolean, default: false },
  isBanned: { type: Boolean, default: false },
  banReason: { type: String, default: '' },

  // Stats
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  totalRatings: { type: Number, default: 0 },

}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (err) {
    throw err;
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Calculate profile completeness
userSchema.methods.calcCompleteness = function () {
  let score = 0;
  const fields = ['name', 'email', 'university', 'bio', 'headline', 'location', 'availability'];
  fields.forEach(f => { if (this[f] && this[f].length > 0) score += 10; });
  if (this.skills.length > 0) score += 10;
  if (this.interests.length > 0) score += 10;
  if (this.avatar) score += 10;
  return Math.min(score, 100);
};

// Index for search
userSchema.index({ skills: 1 });
userSchema.index({ domains: 1 });
userSchema.index({ location: 1 });
userSchema.index({ name: 'text', bio: 'text', headline: 'text' });

module.exports = model('users', userSchema);