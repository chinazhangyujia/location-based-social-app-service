/* eslint-disable no-underscore-dangle */
const mongoose = require('mongoose');
const pointSchema = require('./point');
const PostLikes = require('./post_likes');

const postSchema = new mongoose.Schema({
  content: {
    type: String,
    trim: true,
  },
  imageUrls: {
    type: [String],
    required: true,
  },
  location: {
    type: pointSchema,
    index: '2dsphere',
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    index: true,
  },
  topic: {
    type: String,
    enum: ['FOOD', 'WORK', 'STREET_VIEW', 'ENTERTAINMENT', 'SOCIAL', 'RELAXTION', 'FRIENDS', 'FAMILY'],
    required: true,
  },
}, {
  timestamps: true,
});

postSchema.methods.addLikesData = async function addLikesData(userId) {
  const post = this;
  const postObject = post.toObject();

  const postId = postObject._id;
  const postLikes = await PostLikes.find({ post: postId, like: true }).exec();
  const likesCount = postLikes.length;
  const userLike = await PostLikes.findOne({ post: postId, fromUser: userId, like: true }).exec();

  postObject.likesCount = likesCount;
  postObject.userLiked = !!userLike;

  return postObject;
};

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
