const mongoose = require('mongoose')

/**
 * each friends pair will be stored as two documents
 */
const friendSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
        index: true
    },
    friendUser: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    status: {
        type: String,
        enum: ['active', 'cancelled'],
        required: true
    },
}, {
    timestamps: true
})

friendSchema.index({ user: 1, friendUser: 1}, { unique: true });

const Friend = mongoose.model('Friend', friendSchema)

module.exports = Friend