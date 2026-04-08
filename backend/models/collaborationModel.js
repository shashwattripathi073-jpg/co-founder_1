const { Schema, model, Types } = require('../connection');

const collaborationSchema = new Schema({
  senderId: { type: Types.ObjectId, ref: 'users', required: true },
  receiverId: { type: Types.ObjectId, ref: 'users', required: true },
  startupId: { type: Types.ObjectId, ref: 'startups' },
  roleTitle: { type: String, default: '' }, // which role they're applying for
  message: { type: String, default: '', maxlength: 500 },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
    default: 'pending'
  },
  respondedAt: { type: Date },
  responseMessage: { type: String, default: '' },
}, { timestamps: true });

collaborationSchema.index({ senderId: 1, status: 1 });
collaborationSchema.index({ receiverId: 1, status: 1 });
collaborationSchema.index({ senderId: 1, receiverId: 1, startupId: 1 }, { unique: true });

module.exports = model('collaborations', collaborationSchema);
