const mongoose = require('mongoose');

const commentNotificationSchema = new mongoose.Schema({
    toUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true,
        required: true
    },
    comment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
        required: true
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

const CommentNotification = mongoose.model('CommentNotification', commentNotificationSchema)

module.exports = CommentNotification