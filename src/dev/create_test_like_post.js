require('./prepare_db_connection')('DEV');

const PostLikes = require('../model/post_likes');

module.exports = async () => {
  await PostLikes.collection.drop();
};
