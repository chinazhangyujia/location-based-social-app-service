const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth')
const Comment = require('../model/comment')
const Post = require('../model/post')
const CommentNotification = require('../model/comment_notification')

router.get('/comment/:postId', async (req, res) => {
    try {
        const postId = req.params.postId
        const comments = await Comment.find({post: postId}).sort({_id: -1})
            .populate('sendFrom')
            .populate('sendTo')
            .exec();

        res.status(200).send(comments);
    }
    catch (e) {
        res.status(400).send('Failed to get comments for post');
    }
})

router.post('/comment', auth, async (req, res) => {
    const comment = new Comment({
        ...req.body,
        sendFrom: req.user._id,
    })

    try {
        await comment.save();
        res.status(200).send(comment);
    }
    catch (e) {
        res.status(500).send('Failed to post comment');
    }

    // record notification
    try {
        const post = await Post.findById(req.body.post).exec();
        if (req.user._id.toString() === post.owner.toString()) {
            return;
        }

        if (!req.body.sendTo) {
            const commentNotification = new CommentNotification({
                toUser: post.owner,
                comment: comment._id,
                post: post._id,
                notified: false
            })

            commentNotification.save();
            return;
        }

        const replyNotification = new CommentNotification({
            toUser: req.body.sendTo,
            comment: comment._id,
            post: post._id,
            notified: false
        })

        replyNotification.save();

    } catch (e) {
        // log exception
    }
})

module.exports = router