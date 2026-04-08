const { Schema, model, Types } = require('../connection');

const reportSchema = new Schema({
  reporterId: { type: Types.ObjectId, ref: 'users', required: true },
  reportedUserId: { type: Types.ObjectId, ref: 'users', required: true },
  reason: {
    type: String,
    enum: ['spam', 'harassment', 'fake-profile', 'inappropriate', 'other'],
    required: true
  },
  description: { type: String, required: true, maxlength: 1000 },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
    default: 'pending'
  },
  adminNote: { type: String, default: '' },
  resolvedAt: { type: Date },
}, { timestamps: true });

reportSchema.index({ status: 1 });
reportSchema.index({ reportedUserId: 1 });

module.exports = model('reports', reportSchema);
