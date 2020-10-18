const mongoose = require('mongoose')

const friendSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
        index: true
    },
    friendUserId: {
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

friendSchema.index({ userId: 1, friendUserId: 1}, { unique: true });

const Friend = mongoose.model('Friend', friendSchema)

module.exports = Friend