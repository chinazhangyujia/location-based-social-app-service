const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth')
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

        await CommentNotification.findOneAndUpdate(
            {toUser: post.owner, post: post._id },
            {notified: false}, { upsert: true }).exec();

        if (!req.body.sendTo || req.body.sendTo.toString() === post.owner.toString()) {
            return;
        }

        CommentNotification.findOneAndUpdate(
            {toUser: req.body.sendTo, post: post._id },
            {notified: false}, { upsert: true }).exec()

    } catch (e) {
        // log exception
    }
})

router.post('/markNotificationNotified', auth, async (req, res) => {

    try {
        const postIds = req.body.postIds;
        await CommentNotification.updateMany({post: {$in: (postIds)}, toUser: req.user._id}, {notified: true});

        res.status(200).send();
    }
    catch (e) {
        res.status(500).send('Failed to mark post as notified');
    }
})

module.exports = router