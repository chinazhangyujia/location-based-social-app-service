/* eslint-disable no-underscore-dangle */
const express = require('express');

const router = express.Router();
const auth = require('../middleware/auth');
const Comment = require('../model/comment');
const Post = require('../model/post');
const CommentNotification = require('../model/comment_notification');
const logger = require('../util/logger');

// get comments for a post
router.get('/comment/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const comments = await Comment.find({ post: postId }).sort({ _id: -1 })
      .populate('sendFrom')
      .populate('sendTo')
      .exec();

    res.status(200).send(comments);
  } catch (e) {
    const errorMessage = `Failed to get comments for request ${JSON.stringify(req.body)}`;
    logger.error(errorMessage, e);
    res.status(400).send(errorMessage);
  }
});

// write comment for a post
router.post('/comment', auth, async (req, res) => {
  const comment = new Comment({
    ...req.body,
    sendFrom: req.user._id,
  });

  try {
    await Comment.create(comment);
    // eslint-disable-next-line max-len
    const post = await Post.findByIdAndUpdate(req.body.post, { $inc: { commentCount: 1 } }).exec();

    res.status(200).send(comment);
    // if successfully created comment, we want to create notification then

    // record notification
    try {
      if (req.user._id.toString() === post.owner.toString()) {
        return; // if it is a comment by the poster, don't send notification
      }

      if (!req.body.sendTo) {
        const commentNotification = new CommentNotification({
          toUser: post.owner,
          comment: comment._id,
          post: post._id,
          notified: false,
        });

        CommentNotification.create(commentNotification);
        return;
      }

      const replyNotification = new CommentNotification({
        toUser: req.body.sendTo,
        comment: comment._id,
        post: post._id,
        notified: false,
      });

      CommentNotification.create(replyNotification);
    } catch (e) {
      logger.error(`Failed to create notification after inserted comment for request ${JSON.stringify(req.body)}`, e);
    }
  } catch (e) {
    const errorMessage = `Failed to post comment for request ${JSON.stringify(req.body)}`;
    logger.error(errorMessage, e);
    res.status(400).send(errorMessage);
  }
});

module.exports = router;
