const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth')
const PostLikes = require('../model/post_likes')
const Post = require('../model/post')
const LikeNotification = require('../model/like_notification')

/**
 * Like or dislike the post
 */
router.post('/likePost', auth, async (req, res) => {

    try {
        PostLikes.findOneAndUpdate(
            {fromUser: req.user._id, post: req.body.postId },
            {like: req.body.like}, { upsert: true }).exec()

        res.status(200).send();

        // record notification
        try {
            const post = await Post.findById(req.body.postId).exec();
            if (req.user._id.toString() === post.owner.toString()) {
                return;
            }

            const notification = new LikeNotification({
                toUser: post.owner,
                fromUser: req.user._id,
                post: post._id,
                notified: false
            })

            notification.save();

        } catch (e) {
            // log exception
        }
    }
    catch (e) {
        res.status(500).send('Failed to like the post');
    }

})

module.exports = router