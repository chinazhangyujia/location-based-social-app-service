const express = require('express');
const router = express.Router();
const Post = require('../model/post');
const auth = require('../middleware/auth')

router.get('/post', auth, async (req, res) => {
    try {
        const posts = await Post.find({owner: req.user._id}).exec();
        res.status(200).send(posts);
    }
    catch (e) {
        res.status(400).send('Failed to get posts for user ' + req.user.uniqueName);
    }
})

router.post('/post', auth, async (req, res) => {
    const post = new Post({
        ...req.body,
        owner: req.user._id
    })

    try {
        await post.save();
        res.status(200).send(post);
    }
    catch (e) {
        res.status(500).send(e);
    }
})

module.exports = router