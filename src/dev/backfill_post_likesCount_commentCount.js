/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-underscore-dangle */
const Post = require('../model/post');
const PostLikes = require('../model/post_likes');
const Comment = require('../model/comment');

require('./prepare_db_connection')('DEV');

const backfill = async () => {
  const allPosts = await Post.find().exec();

  for (const post of allPosts) {
    const postId = post._id;
    const postLikes = await PostLikes.find({ post: postId, like: true }).exec();
    const likesCount = postLikes.length;
    const commentCount = await Comment.countDocuments({ post: postId }).exec();

    await Post.findByIdAndUpdate(postId, { likesCount, commentCount });
  }
};

backfill().then(() => {
  process.exit(0);
});
