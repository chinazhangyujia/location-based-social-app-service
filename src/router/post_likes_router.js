const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth')
const PostLikes = require('../model/post_likes')

/**
 * Like or dislike the post
 */
router.post('/likePost', auth, async (req, res) => {

    try {
        PostLikes.findOneAndUpdate(
            {fromUser: req.user._id, post: req.body.postId },
            {like: req.body.like}, { upsert: true }).exec()

        res.status(200).send();
    }
    catch (e) {
        res.status(500).send('Failed to like the post');
    }

})

module.exports = router