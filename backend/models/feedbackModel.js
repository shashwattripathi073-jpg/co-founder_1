const { Schema, model, Types } = require('../connection');

const feedbackSchema = new Schema({
  fromUserId: { type: Types.ObjectId, ref: 'users', required: true },
  toUserId: { type: Types.ObjectId, ref: 'users', required: true },
  startupId: { type: Types.ObjectId, ref: 'startups' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: '', maxlength: 500 },
  categories: {
    communication: { type: Number, min: 1, max: 5, default: 3 },
    skills: { type: Number, min: 1, max: 5, default: 3 },
    reliability: { type: Number, min: 1, max: 5, default: 3 },
    teamwork: { type: Number, min: 1, max: 5, default: 3 },
  },
}, { timestamps: true });

feedbackSchema.index({ toUserId: 1 });
feedbackSchema.index({ fromUserId: 1, toUserId: 1 }, { unique: true });

module.exports = model('feedbacks', feedbackSchema);
