const mongoose = require('mongoose');

const chatThreadSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
}, {
  timestamps: true,
});

const ChatThread = mongoose.model('ChatThread', chatThreadSchema);

module.exports = ChatThread;
