const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  chatThread: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'ChatThread',
    index: true,
  },
  content: {
    type: String,
    trim: true,
    required: true,
  },
  sendFrom: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  sendTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

module.exports = ChatMessage;
