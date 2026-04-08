const { Schema, model, Types } = require('../connection');

const startupSchema = new Schema({
  founderId: { type: Types.ObjectId, ref: 'users', required: true },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  tagline: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, required: true, maxlength: 2000 },
  domain: { type: String, required: true, trim: true }, // FinTech, EdTech, etc.
  stage: {
    type: String,
    enum: ['idea', 'pre-seed', 'mvp', 'seed', 'series-a'],
    default: 'idea'
  },
  vision: { type: String, default: '', maxlength: 1000 },

  // Co-founder requirements
  requiredRoles: [{
    title: { type: String, required: true }, // e.g. "CTO", "Growth Lead"
    description: { type: String, default: '' },
    skills: [String],
    filled: { type: Boolean, default: false }
  }],

  // Team
  teamSize: { type: Number, default: 1 },
  teamMembers: [{ type: Types.ObjectId, ref: 'users' }],

  // Meta
  isActive: { type: Boolean, default: true },
  applicantCount: { type: Number, default: 0 },

}, { timestamps: true });

startupSchema.index({ domain: 1 });
startupSchema.index({ stage: 1 });
startupSchema.index({ founderId: 1 });
startupSchema.index({ name: 'text', tagline: 'text', description: 'text' });

module.exports = model('startups', startupSchema);
