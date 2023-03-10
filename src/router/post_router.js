/* eslint-disable no-param-reassign */
/* eslint-disable no-return-assign */
/* eslint-disable max-len */
/* eslint-disable arrow-body-style */
/* eslint-disable no-underscore-dangle */
const express = require('express');

const router = express.Router();
const Post = require('../model/post');
const Friend = require('../model/friend');
const Comment = require('../model/comment');
const CommentNotification = require('../model/comment_notification');
const PostLikes = require('../model/post_likes');
const auth = require('../middleware/auth');
const logger = require('../util/logger');
const UserPostBlock = require('../model/user_post_block');

const METERS_PER_MILE = 1609.34;
const DEFAULT_FETCH_SIZE = 5;

/**
 * Add meta data e.g likes count, comment count to post
 */
const addMetaDataToPosts = async (posts, userId) => {
  const postLikedByUser = await PostLikes.find({ post: { $in: posts.map((p) => p._id) }, fromUser: userId, like: true }, { post: 1 }).exec();
  const postIdsLikedByUser = postLikedByUser.map((p) => p.post.toString());

  const postsWithMetaData = posts.map((p) => p.toObject());
  postsWithMetaData.forEach((p) => p.userLiked = postIdsLikedByUser.includes(p._id.toString()));
  return postsWithMetaData;
};

const findBlockedUser = async (loginUserId) => {
  const usersToBlock = await UserPostBlock.find({ fromUser: loginUserId }).exec();
  return usersToBlock.map((utb) => utb.blockedUser);
};

/**
 * @deprecated
 */
router.get('/post', auth, async (req, res) => {
  try {
    const longitude = parseFloat(req.query.long);
    const latitude = parseFloat(req.query.lat);

    const posts = await Post.find({
      owner: req.user._id,
      location: { $nearSphere: { $geometry: { type: 'Point', coordinates: [longitude, latitude] }, $maxDistance: METERS_PER_MILE } },
    })
      .exec();
    res.status(200).send(posts);
  } catch (e) {
    const errorMessage = `Failed to get posts for req ${JSON.stringify(req.body)}`;
    logger.error(errorMessage, e);
    res.status(500).send(errorMessage);
  }
});

router.get('/allPosts', auth, async (req, res) => {
  try {
    const longitude = parseFloat(req.query.long);
    const latitude = parseFloat(req.query.lat);

    const usersToBlock = await findBlockedUser(req.user._id);
    const query = req.query.fromId
      ? Post.find({
        _id: { $lt: req.query.fromId },
        owner: { $nin: usersToBlock },
        location: { $nearSphere: { $geometry: { type: 'Point', coordinates: [longitude, latitude] }, $maxDistance: METERS_PER_MILE } },
      })
      : Post.find({
        owner: { $nin: usersToBlock },
        location: { $nearSphere: { $geometry: { type: 'Point', coordinates: [longitude, latitude] }, $maxDistance: METERS_PER_MILE } },
      });

    const posts = (req.query.fetchSize)
      ? await query
        .sort({ _id: -1 })
        .limit(parseInt(req.query.fetchSize, 10))
        .populate('owner')
        .exec()
      : await query
        .sort({ _id: -1 })
        .limit(DEFAULT_FETCH_SIZE)
        .populate('owner')
        .exec();

    res.status(200).send(await addMetaDataToPosts(posts, req.user._id));
  } catch (e) {
    const errorMessage = `Failed to get posts for req ${JSON.stringify(req.body)}`;
    logger.error(errorMessage, e);
    res.status(500).send(errorMessage);
  }
});

/**
 * @deprecated
 * Fetch my posts, friends' posts and commented posts
 */
router.get('/relevantPosts', auth, async (req, res) => {
  try {
    const friends = await Friend.find({ user: req.user._id, status: 'active' }, 'friendUser').distinct('friendUser').exec();
    friends.push(req.user._id);

    const { fromId } = req.query;
    const limit = req.query.fetchSize; // nonnull

    const friendPostsQuery = fromId ? Post.find({
      _id: { $lt: fromId },
      owner: { $in: friends },
    }) : Post.find({
      owner: { $in: friends },
    });

    const friendPosts = await friendPostsQuery
      .sort({ _id: -1 })
      .limit(parseInt(limit, 10))
      .populate('owner')
      .exec();

    const commentedPostsIds = fromId ? await Comment
      .aggregate(
        [
          {
            $match: {
              post: { $lt: fromId },
              sendFrom: req.user._id,
            },
          },
          { $group: { _id: '$post' } },
          { $sort: { _id: -1 } },
          { $limit: parseInt(limit, 10) },
        ],
      ).exec()
      : await Comment
        .aggregate(
          [
            {
              $match: { sendFrom: req.user._id },
            },
            { $group: { _id: '$post' } },
            { $sort: { _id: -1 } },
            { $limit: parseInt(limit, 10) },
          ],
        ).exec();

    const commentedPosts = await Post.find({ _id: { $in: commentedPostsIds.map((e) => e._id) } })
      .exec();

    const compare = (a, b) => {
      if ((a._id.toString()) < (b._id.toString())) {
        return 1;
      }
      if ((a._id.toString()) > (b._id.toString())) {
        return -1;
      }

      return 0;
    };

    let posts = [...friendPosts, ...commentedPosts];
    posts = posts.sort(compare).filter((item, index, array) => {
      if (index === 0) {
        return true;
      }

      return (item._id.toString()) !== array[index - 1]._id.toString();
    });

    posts = posts.slice(0, Math.min(limit, posts.length));

    res.status(200).send(await addMetaDataToPosts(posts, req.user._id));
  } catch (e) {
    res.status(500).send("Failed to get friends' posts");
  }
});

// get all posts from current user's friends
router.get('/friendPosts', auth, async (req, res) => {
  try {
    const friends = await Friend.find({ user: req.user._id, status: 'active' }, 'friendUser').distinct('friendUser').exec();

    const { fromId } = req.query;
    const limit = req.query.fetchSize || DEFAULT_FETCH_SIZE;

    const friendPostsQuery = fromId ? Post.find({
      _id: { $lt: fromId },
      owner: { $in: friends },
    }) : Post.find({
      owner: { $in: friends },
    });

    const friendPosts = await friendPostsQuery
      .sort({ _id: -1 })
      .limit(parseInt(limit, 10))
      .populate('owner')
      .exec();

    res.status(200).send(await addMetaDataToPosts(friendPosts, req.user._id));
  } catch (e) {
    const errorMessage = `Failed to get friends' posts for req ${JSON.stringify(req.body)}`;
    logger.error(errorMessage, e);
    res.status(500).send(errorMessage);
  }
});

router.get('/myPosts', auth, async (req, res) => {
  try {
    const { fromId } = req.query;
    const limit = req.query.fetchSize || DEFAULT_FETCH_SIZE;

    const myPostsQuery = fromId ? Post.find({
      _id: { $lt: fromId },
      owner: req.user._id,
    }) : Post.find({
      owner: req.user._id,
    });

    const myPosts = await myPostsQuery
      .sort({ _id: -1 })
      .limit(parseInt(limit, 10))
      .populate('owner')
      .exec();

    res.status(200).send(await addMetaDataToPosts(myPosts, req.user._id));
  } catch (e) {
    const errorMessage = `Failed to get login user's posts for req ${JSON.stringify(req.body)}`;
    logger.error(errorMessage, e);
    res.status(500).send(errorMessage);
  }
});

router.get('/likedPosts', auth, async (req, res) => {
  try {
    const { fromId } = req.query;
    const limit = req.query.fetchSize || DEFAULT_FETCH_SIZE;

    const query = fromId ? PostLikes.find({
      post: { $lt: fromId },
      fromUser: req.user._id,
      like: true,
    }) : PostLikes.find({
      fromUser: req.user._id,
      like: true,
    });

    const postIds = await query
      .select('post')
      .sort({ post: -1 })
      .limit(parseInt(limit, 10))
      .exec();

    const posts = await Post
      .find({ _id: { $in: postIds.map((e) => e.post) } })
      .populate('owner')
      .sort({ _id: -1 })
      .exec();

    res.status(200).send(await addMetaDataToPosts(posts, req.user._id));
  } catch (e) {
    const errorMessage = `Failed to get liked posts for req ${JSON.stringify(req.body)}`;
    logger.error(errorMessage, e);
    res.status(500).send(errorMessage);
  }
});

/**
 * @deprecated
 */
router.get('/postWithUnnotifiedComment', auth, async (req, res) => {
  try {
    const postIds = await CommentNotification
      .find({ toUser: req.user._id, notified: false }, 'post')
      .distinct('post')
      .exec();

    const posts = await Post
      .find({ _id: { $in: postIds } })
      .populate('owner')
      .sort({ _id: -1 })
      .exec();

    res.status(200).send(await addMetaDataToPosts(posts, req.user._id));
  } catch (e) {
    res.status(400).send('Failed to get posts with unnotified comment');
  }
});

router.post('/post', auth, async (req, res) => {
  const post = new Post({
    ...req.body,
    owner: req.user._id,
    commentCount: 0,
    likesCount: 0,
  });

  try {
    await Post.create(post);
    res.status(200).send(post);
  } catch (e) {
    const errorMessage = `Failed create a post for req ${JSON.stringify(req.body)}`;
    logger.error(errorMessage, e);
    res.status(500).send(errorMessage);
  }
});

router.get('/postById/:postId', auth, async (req, res) => {
  try {
    const post = await Post
      .find({ _id: req.params.postId })
      .populate('owner')
      .sort({ _id: -1 })
      .exec();

    res.status(200).send(await addMetaDataToPosts(post, req.user._id));
  } catch (e) {
    const errorMessage = `Failed to get post by id for req ${JSON.stringify(req.body)}`;
    logger.error(errorMessage, e);
    res.status(500).send(errorMessage);
  }
});

module.exports = router;
