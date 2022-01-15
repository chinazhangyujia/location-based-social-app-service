/* eslint-disable no-underscore-dangle */
const mongoose = require('mongoose');
const pointSchema = require('./point');

const postSchema = new mongoose.Schema({
  content: {
    type: String,
    trim: true,
  },
  imageUrls: {
    type: [String],
    required: true,
  },
  mediaType: {
    type: String,
    enum: ['IMAGE', 'VIDEO'],
    required: true,
    default: 'IMAGE',
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
    enum: ['FOOD', 'WORK', 'STREET_VIEW', 'ENTERTAINMENT', 'SOCIAL', 'RELAXATION', 'FRIENDS', 'FAMILY'],
    required: true,
  },
  commentCount: {
    type: Number,
    required: true,
  },
  likesCount: {
    type: Number,
    required: true,
  },
}, {
  timestamps: true,
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
