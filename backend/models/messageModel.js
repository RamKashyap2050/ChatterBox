const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, "Message content is required"],
    trim: true,
  },
  chatRoom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatRoom',
    required: [true, "Chat room reference is required"]
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: [true, "Sender reference is required"]
  },
  readBy: [{
    reader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  collection: 'Messages'
});

module.exports = mongoose.model('Message', messageSchema);
