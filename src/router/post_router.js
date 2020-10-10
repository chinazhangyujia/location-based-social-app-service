const express = require('express');
const router = express.Router();
const Post = require('../model/post');
const auth = require('../middleware/auth')

const METERS_PER_MILE = 1609.34;

router.get('/post', auth, async (req, res) => {
    try {
        const longitude = parseFloat(req.query.long);
        const latitude = parseFloat(req.query.lat);

        const posts = await Post.find({
            owner: req.user._id,
            location: { $nearSphere: { $geometry: { type: "Point", coordinates: [ longitude, latitude ] }, $maxDistance: METERS_PER_MILE } } })
            .exec();
        res.status(200).send(posts);
    }
    catch (e) {
        res.status(400).send('Failed to get posts for user ' + req.user.uniqueName);
    }
})

router.get('/allPosts', async (req, res) => {
    try {
        const longitude = parseFloat(req.query.long);
        const latitude = parseFloat(req.query.lat);

        const posts = await Post.find({
            location: { $nearSphere: { $geometry: { type: "Point", coordinates: [ longitude, latitude ] }, $maxDistance: METERS_PER_MILE } }
        }).sort({_id: -1}).populate('owner').exec();

        res.status(200).send(posts);
    }
    catch (e) {
        console.log(e)
        res.status(500).send('Failed to get posts');
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