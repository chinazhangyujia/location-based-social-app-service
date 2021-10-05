require('./prepare_db_connection');

const UserPostBlock = require('../model/user_post_block');

const sampleData = [
  {
    _id: '000000000000000000000000',
    fromUser: '000000000000000000000000',
    blockedUser: '000000000000000000000001',
  },
];

module.exports = async () => {
  await UserPostBlock.collection.drop();
  await UserPostBlock.insertMany(sampleData);
};
