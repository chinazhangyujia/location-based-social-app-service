/**
 * overwrite data into dev db
 */
const createTestUser = require('./create_test_user');
const createTestPost = require('./create_test_post');
const createTestFriend = require('./create_test_friend');
const createTestComment = require('./create_test_comment');
const createTestNotification = require('./create_test_notification');
const createTestBlockUser = require('./create_test_block_user');
const createTestLikePost = require('./create_test_like_post');

const prepareDevData = async () => {
  await createTestUser();
  await createTestPost();
  await createTestFriend();
  await createTestComment();
  await createTestNotification();
  await createTestBlockUser();
  await createTestLikePost();
};

prepareDevData().then(() => {
  process.exit(0);
});
