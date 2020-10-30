const mongoose = require('mongoose');

const commentNotificationSchema = new mongoose.Schema({
    toUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Post',
    },
    notified: {
        type: Boolean,
        required: true,
        index: true
    }
}, {
    timestamps: true
})

commentNotificationSchema.index({ toUser: 1, post: 1}, { unique: true });

const CommentNotification = mongoose.model('CommentNotification', commentNotificationSchema)

module.exports = CommentNotification