const mongoose = require('mongoose');

const likeNotificationSchema = new mongoose.Schema({
  toUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
    required: true,
  },
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Post',
  },
  notified: {
    type: Boolean,
    required: true,
    index: true,
  },
}, {
  timestamps: true,
});

const LikeNotification = mongoose.model('LikeNotification', likeNotificationSchema);

module.exports = LikeNotification;
