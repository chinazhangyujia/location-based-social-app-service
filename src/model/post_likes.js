const mongoose = require('mongoose')

const postLikesSchema = new mongoose.Schema({
    fromUser: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Post',
        index: true
    },
    like: {
        type: Boolean,
        required: true
    },
}, {
    timestamps: true
})

postLikesSchema.index({ fromUser: 1, post: 1}, { unique: true });

const PostLikes = mongoose.model('PostLikes', postLikesSchema)

module.exports = PostLikes