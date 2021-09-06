require('./prepare_db_connection');

const LikeNotification = require('../model/like_notification');
const CommentNotification = require('../model/comment_notification');

const likeNotificationSampleData = [
  {
    _id: '000000000000000000000000',
    toUser: '000000000000000000000000',
    fromUser: '000000000000000000000001',
    post: '000000000000000000000000',
    notified: true,
  },
  {
    _id: '000000000000000000000001',
    toUser: '000000000000000000000000',
    fromUser: '000000000000000000000002',
    post: '000000000000000000000000',
    notified: true,
  },
  {
    _id: '000000000000000000000002',
    toUser: '000000000000000000000000',
    fromUser: '000000000000000000000003',
    post: '000000000000000000000001',
    notified: true,
  },
];

const commentNotificationSampleData = [
  {
    _id: '000000000000000000000000',
    toUser: '000000000000000000000000',
    post: '000000000000000000000000',
    comment: '000000000000000000000000',
    notified: true,
  },
  {
    _id: '000000000000000000000001',
    toUser: '000000000000000000000000',
    post: '000000000000000000000000',
    comment: '000000000000000000000001',
    notified: true,
  },
  {
    _id: '000000000000000000000002',
    toUser: '000000000000000000000000',
    post: '000000000000000000000000',
    comment: '000000000000000000000002',
    notified: true,
  },
];

module.exports = async () => {
  await LikeNotification.collection.drop();
  await LikeNotification.insertMany(likeNotificationSampleData);

  await CommentNotification.collection.drop();
  await CommentNotification.insertMany(commentNotificationSampleData);
};
