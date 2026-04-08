const { Schema, model, Types } = require('../connection');

const messageSchema = new Schema({
  senderId: { type: Types.ObjectId, ref: 'users', required: true },
  receiverId: { type: Types.ObjectId, ref: 'users', required: true },
  conversationId: { type: String, required: true }, // sorted concat of user ids
  content: { type: String, required: true, maxlength: 2000 },
  readAt: { type: Date, default: null },
}, { timestamps: true });

messageSchema.index({ conversationId: 1, createdAt: 1 });
messageSchema.index({ senderId: 1 });
messageSchema.index({ receiverId: 1 });

// Static helper to create conversationId
messageSchema.statics.getConversationId = function (userId1, userId2) {
  return [userId1.toString(), userId2.toString()].sort().join('_');
};

module.exports = model('messages', messageSchema);
