/**
 * overwrite data into dev db
 */
const createTestUser = require('./create_test_user');
const createTestPost = require('./create_test_post');
const createTestFriend = require('./create_test_friend');

const prepareDevData = async () => {
  await createTestUser();
  await createTestPost();
  await createTestFriend();
};

prepareDevData().then(() => {
  process.exit(0);
});
