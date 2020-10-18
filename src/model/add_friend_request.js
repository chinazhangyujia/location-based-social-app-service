const mongoose = require('mongoose')

const addFriendRequestSchema = new mongoose.Schema({
    toUser: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
        index: true
    },
    fromUser: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    status: {
        type: String,
        enum: ['pending', 'denied', 'accepted'],
        required: true
    },
    notified: {
        type: Boolean,
        required: true,
        index: true
    }
}, {
    timestamps: true
})

const AddFriendRequest = mongoose.model('AddFriendRequest', addFriendRequestSchema)

module.exports = AddFriendRequest