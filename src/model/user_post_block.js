const mongoose = require('mongoose');

/**
 * Table to block posts from particular user
 */
const userPostBlockSchema = new mongoose.Schema({
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    require: true,
    index: true,
  },
  blockedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    require: true,
  },
}, {
  timestamps: true,
});

const UserPostBlock = mongoose.model('UserPostBlock', userPostBlockSchema);

module.exports = UserPostBlock;
