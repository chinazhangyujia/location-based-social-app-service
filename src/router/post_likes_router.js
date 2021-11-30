/* eslint-disable max-len */
/* eslint-disable no-underscore-dangle */
const express = require('express');

const router = express.Router();
const auth = require('../middleware/auth');
const PostLikes = require('../model/post_likes');
const Post = require('../model/post');
const LikeNotification = require('../model/like_notification');
const logger = require('../util/logger');

/**
 * Like or dislike the post
 */
router.post('/likePost', auth, async (req, res) => {
  try {
    await PostLikes.findOneAndUpdate(
      { fromUser: req.user._id, post: req.body.postId }, { like: req.body.like }, { upsert: true },
    ).exec();

    const post = await Post.findByIdAndUpdate(req.body.postId, { $inc: { likesCount: req.body.like ? 1 : -1 } }).exec();

    res.status(200).send();

    // record notification
    try {
      if (req.user._id.toString() === post.owner.toString()) {
        return;
      }

      const notification = new LikeNotification({
        toUser: post.owner,
        fromUser: req.user._id,
        post: post._id,
        notified: false,
      });

      LikeNotification.create(notification);
    } catch (e) {
      const errorMessage = `Failed to record like notification for req ${JSON.stringify(req.body)}`;
      logger.error(errorMessage, e);
    }
  } catch (e) {
    const errorMessage = `Failed to like or dislike post for req ${JSON.stringify(req.body)}`;
    logger.error(errorMessage, e);
    res.status(500).send(errorMessage);
  }
});

module.exports = router;
