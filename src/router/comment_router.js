const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth')
const Comment = require('../model/comment')

router.get('/comment/:postId', async (req, res) => {
    try {
        const postId = req.params.postId
        const comments = await Comment.find({postId: postId}).sort({_id: -1})
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
})

module.exports = router