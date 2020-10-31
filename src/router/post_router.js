const express = require('express');
const router = express.Router();
const Post = require('../model/post');
const Friend = require('../model/friend');
const Comment = require('../model/comment');
const CommentNotification = require('../model/comment_notification');
const auth = require('../middleware/auth');

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

router.get('/allPosts', auth, async (req, res) => {
    try {
        const longitude = parseFloat(req.query.long);
        const latitude = parseFloat(req.query.lat);

        const posts = await Post.find({
            location: { $nearSphere: { $geometry: { type: "Point", coordinates: [ longitude, latitude ] }, $maxDistance: METERS_PER_MILE } }
        }).sort({_id: -1}).populate('owner').exec();

        res.status(200).send(await addLikesDataToPosts(posts, req.user._id));

    }
    catch (e) {
        res.status(500).send('Failed to get posts');
    }
})

router.get('/friendPosts', auth, async (req, res) => {
    try {
        const friends = await Friend.find({user: req.user._id, status: 'active'}, 'friendUser').distinct('friendUser').exec();
        friends.push(req.user._id);

        const friendPosts = await Post.find({
            owner: {$in: friends}
        }).sort({_id: -1}).populate('owner').exec();

        const commentedPosts = await Comment.find({sendFrom: req.user._id}, 'post').distinct('post').populate('post').exec();

        const compare = (a, b) => {
            if ((a._id.toString()) < (b._id.toString())) {
                return 1;
            }
            else if ((a._id.toString()) > (b._id.toString())) {
                return -1;
            }
            else {
                return 0;
            }
        }

        let posts = [...friendPosts, ...commentedPosts];
        posts = posts.sort(compare).filter((item, index, array) => {
            if (index === 0) {
                return true;
            }

            return (item._id.toString()) !== array[index - 1]._id.toString()
        })

        res.status(200).send(await addLikesDataToPosts(posts, req.user._id));
    }
    catch (e) {
        res.status(500).send("Failed to get friends' posts");
    }
})

router.get('/postWithUnnotifiedComment', auth, async (req, res) => {
    try {
        const postIds = await CommentNotification
            .find({toUser: req.user._id, notified: false}, 'post')
            .distinct('post')
            .exec();

        const posts = await Post
            .find({_id: {$in: postIds}})
            .populate('owner')
            .sort({_id: -1})
            .exec();

        res.status(200).send(await addLikesDataToPosts(posts, req.user._id));

    } catch (e) {
        res.status(400).send('Failed to get posts with unnotified comment');
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

const addLikesDataToPosts = async (posts, userId) => {
    const postsWithLikesData = [];
    for (post of posts) {
        const postWithLikesData = await post.addLikesData(userId);
        postsWithLikesData.push(postWithLikesData);
    }

    return postsWithLikesData;
}

module.exports = router