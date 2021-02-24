const express = require('express');
const router = express.Router();
const Post = require('../model/post');
const Friend = require('../model/friend');
const Comment = require('../model/comment');
const CommentNotification = require('../model/comment_notification');
const PostLikes = require('../model/post_likes');
const auth = require('../middleware/auth');

const METERS_PER_MILE = 1609.34;
const DEFAULT_FETCH_SIZE = 5;

/**
 * @deprecated
 */
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
        const errorMessage = 'Failed to get posts for req ' + JSON.parse(JSON.stringify(req));
        console.log(errorMessage, e);
        res.status(500).send(errorMessage);
    }
})

router.get('/allPosts', auth, async (req, res) => {
    try {
        const longitude = parseFloat(req.query.long);
        const latitude = parseFloat(req.query.lat);

        const query = !!req.query.fromId ?
            Post.find({
                _id: {$lt: req.query.fromId},
                location: { $nearSphere: { $geometry: { type: "Point", coordinates: [ longitude, latitude ] }, $maxDistance: METERS_PER_MILE } },
            }) :
            Post.find({
                location: { $nearSphere: { $geometry: { type: "Point", coordinates: [ longitude, latitude ] }, $maxDistance: METERS_PER_MILE } }
            });

        const posts = (!!req.query.fetchSize) ?
            await query
                .sort({_id: -1})
                .limit(parseInt(req.query.fetchSize))
                .populate('owner')
                .exec() :
            await query
                .sort({_id: -1})
                .limit(DEFAULT_FETCH_SIZE)
                .populate('owner')
                .exec();

        res.status(200).send(await addLikesDataToPosts(posts, req.user._id));

    }
    catch (e) {
        const errorMessage = 'Failed to get posts for req ' + JSON.parse(JSON.stringify(req));
        console.log(errorMessage, e);
        res.status(500).send(errorMessage);
    }
})

/**
 * @deprecated
 * Fetch my posts, friends' posts and commented posts
 */
router.get('/relevantPosts', auth, async (req, res) => {
    try {
        const friends = await Friend.find({user: req.user._id, status: 'active'}, 'friendUser').distinct('friendUser').exec();
        friends.push(req.user._id);

        const fromId = req.query.fromId;
        const limit = req.query.fetchSize; // nonnull

        const friendPostsQuery = fromId ? Post.find({
            _id: {$lt: fromId},
            owner: {$in: friends},
        }) : Post.find({
            owner: {$in: friends},
        });

        const friendPosts = await friendPostsQuery
            .sort({_id: -1})
            .limit(parseInt(limit))
            .populate('owner')
            .exec();

        const commentedPostsIds = fromId ? await Comment
            .aggregate(
            [
                { "$match": {
                        post: {$lt: fromId},
                        sendFrom: req.user._id} },
                { "$group": { _id: "$post" } },
                { "$sort":  { _id: -1 } },
                { "$limit": parseInt(limit) }
            ]
        ).exec() :
            await Comment
                .aggregate(
                    [
                        { "$match": {
                                sendFrom: req.user._id} },
                        { "$group": { _id: "$post" } },
                        { "$sort":  { _id: -1 } },
                        { "$limit": parseInt(limit) }
                    ]
                ).exec();

        const commentedPosts = await Post.find({_id: {$in: commentedPostsIds.map(e => e._id)}}).exec();

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

        posts = posts.slice(0, Math.min(limit, posts.length));

        res.status(200).send(await addLikesDataToPosts(posts, req.user._id));
    }
    catch (e) {
        res.status(500).send("Failed to get friends' posts");
    }
})

router.get('/friendPosts', auth, async (req, res) => {
    try {
        const friends = await Friend.find({user: req.user._id, status: 'active'}, 'friendUser').distinct('friendUser').exec();

        const fromId = req.query.fromId;
        const limit = req.query.fetchSize || DEFAULT_FETCH_SIZE;

        const friendPostsQuery = fromId ? Post.find({
            _id: {$lt: fromId},
            owner: {$in: friends},
        }) : Post.find({
            owner: {$in: friends},
        });

        const friendPosts = await friendPostsQuery
            .sort({_id: -1})
            .limit(parseInt(limit))
            .populate('owner')
            .exec();

        res.status(200).send(await addLikesDataToPosts(friendPosts, req.user._id));
    }
    catch (e) {
        const errorMessage = "Failed to get friends' posts for req " + JSON.parse(JSON.stringify(req));
        console.log(errorMessage, e);
        res.status(500).send(errorMessage);
    }
})

router.get('/myPosts', auth, async (req, res) => {
    try {
        const fromId = req.query.fromId;
        const limit = req.query.fetchSize || DEFAULT_FETCH_SIZE;

        const myPostsQuery = fromId ? Post.find({
            _id: {$lt: fromId},
            owner: req.user._id,
        }) : Post.find({
            owner: req.user._id,
        });

        const myPosts = await myPostsQuery
            .sort({_id: -1})
            .limit(parseInt(limit))
            .populate('owner')
            .exec();

        res.status(200).send(await addLikesDataToPosts(myPosts, req.user._id));

    } catch (e) {
        const errorMessage = "Failed to get login user's posts for req " + JSON.parse(JSON.stringify(req));
        console.log(errorMessage, e);
        res.status(500).send(errorMessage);
    }
})

router.get('/likedPosts', auth, async (req, res) => {
    try {
        const fromId = req.query.fromId;
        const limit = req.query.fetchSize || DEFAULT_FETCH_SIZE;

        const query = fromId ? PostLikes.find({
            post: {$lt: fromId},
            fromUser: req.user._id,
            like: true
        }) : PostLikes.find({
            fromUser: req.user._id,
            like: true
        });

        const postIds = await query
            .select('post')
            .sort({post: -1})
            .limit(parseInt(limit))
            .exec();

        const posts = await Post
            .find({_id: {$in: postIds.map(e => e.post)}})
            .populate('owner')
            .sort({_id: -1})
            .exec();

        res.status(200).send(await addLikesDataToPosts(posts, req.user._id));

    } catch (e) {
        const errorMessage = 'Failed to get liked posts for req ' + JSON.parse(JSON.stringify(req));
        console.log(errorMessage, e);
        res.status(500).send(errorMessage);
    }
})

/**
 * @deprecated
 */
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
        await Post.create(post);
        res.status(200).send(post);
    }
    catch (e) {
        const errorMessage = 'Failed create a post for req ' + JSON.parse(JSON.stringify(req));
        console.log(errorMessage, e);
        res.status(500).send(errorMessage);
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