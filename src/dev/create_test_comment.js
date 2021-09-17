require('./prepare_db_connection');

const Comment = require('../model/comment');

const sampleData = [
  {
    _id: '000000000000000000000000',
    content: 'comment 1',
    sendFrom: '000000000000000000000001',
    post: '000000000000000000000000',
  },
  {
    _id: '000000000000000000000001',
    content: 'comment 2',
    sendFrom: '000000000000000000000001',
    post: '000000000000000000000000',
  },
  {
    _id: '000000000000000000000002',
    content: 'comment 3',
    sendFrom: '000000000000000000000002',
    post: '000000000000000000000000',
  },
];

module.exports = async () => {
  await Comment.collection.drop();
  await Comment.insertMany(sampleData);
};
