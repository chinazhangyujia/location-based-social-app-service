/**
 * overwrite data into dev db
 */
const createTestUser = require('./create_test_user');
const createTestPost = require('./create_test_post');
const createTestFriend = require('./create_test_friend');
const createTestComment = require('./create_test_comment');
const createTestNotification = require('./create_test_notification');

const prepareDevData = async () => {
  await createTestUser();
  await createTestPost();
  await createTestFriend();
  await createTestComment();
  await createTestNotification();
};

prepareDevData().then(() => {
  process.exit(0);
});
