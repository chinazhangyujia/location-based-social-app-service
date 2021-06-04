/* eslint-disable no-underscore-dangle */
const express = require('express');
const { User } = require('../model/user');
const auth = require('../middleware/auth');

const router = express.Router();
const Friend = require('../model/friend');
const AddFriendRequest = require('../model/add_friend_request');

router.post('/user/signup', async (req, res) => {
  try {
    const nickName = req.body.name;
    const uniqueNumber = await User.countDocuments({ name: nickName }).exec();
    const uniqueName = `${nickName}_${uniqueNumber}`;
    const exitingUniqueName = await User.find({ uniqueName }).exec();

    if (exitingUniqueName.length !== 0) {
      console.log(`unique name ${exitingUniqueName} already exist`);
      res.status(400).send({ message: 'Please choose a different user name' });
      return;
    }

    const user = new User({
      ...req.body,
      uniqueName,
    });
    await User.create(user);
    const token = await user.generateAuthToken();
    res.status(200).send({ user, token });
  } catch (e) {
    const error = {};
    if (e.keyPattern?.email) {
      error.message = 'Duplicated email';
    } else {
      error.message = 'Sign up failed';
    }
    res.status(400).send(error);
  }
});

router.post('/user/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password);
    const token = await user.generateAuthToken();
    res.status(200).send({ user, token });
  } catch (e) {
    const errorMessage = `User failed to login ${JSON.stringify(req.body)}`;
    console.log(errorMessage, e);
    res.status(500).send(errorMessage);
  }
});

router.post('/user/logout', auth, async (req, res) => {
  try {
    req.user.token = undefined;
    await req.user.save();

    res.send();
  } catch (e) {
    const errorMessage = `User failed to logout ${JSON.stringify(req.body)}`;
    console.log(errorMessage, e);
    res.status(500).send(errorMessage);
  }
});

router.get('/userById/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).exec();
    res.status(200).send(user);
  } catch (e) {
    const errorMessage = `Failed to find user info for userId ${req.params.id}`;
    console.log(errorMessage, e);
    res.status(400).send(errorMessage);
  }
});

router.get('/userByUniqueName/:uniqueName', auth, async (req, res) => {
  try {
    const { uniqueName } = req.params;
    const user = await User.findOne({ uniqueName }).exec();

    let userObject = null;

    if (user) {
      const friendship = await Friend.findOne({ user: req.user._id, friendUser: user._id, status: 'active' });
      const pendingRequest = await AddFriendRequest.findOne({ toUser: user._id, fromUser: req.user._id, status: 'pending' });

      userObject = user.toObject();

      delete userObject.password;
      delete userObject.token;

      if (user._id.toString() === req.user._id.toString()) {
        userObject.friendStatus = 'N/A';
      } else if (!friendship && !pendingRequest) {
        userObject.friendStatus = 'NOT_FRIEND';
      } else if (!friendship && !!pendingRequest) {
        userObject.friendStatus = 'PENDING';
      } else if (!!friendship && !pendingRequest) {
        userObject.friendStatus = 'IS_FRIEND';
      } else {
        userObject.friendStatus = 'UNKNOWN';
      }
    }

    res.status(200).send(userObject);
  } catch (e) {
    const errorMessage = `Failed to find user info for unique name ${req.params.uniqueName}`;
    console.log(errorMessage, e);
    res.status(400).send(errorMessage);
  }
});

router.get('/user/me', auth, async (req, res) => {
  res.status(200).send(req.user);
});

router.post('/user/updateUserInfo', auth, async (req, res) => {
  try {
    const introduction = req.body.intro;
    const { avatarUrl } = req.body;

    const infoToUpdate = {};
    infoToUpdate.introduction = introduction;

    if (avatarUrl) {
      infoToUpdate.avatarUrl = avatarUrl;
    }

    const updatedInfo = await User.updateOne({ _id: req.user._id }, infoToUpdate);
    res.status(200).send(updatedInfo);
  } catch (e) {
    const errorMessage = `Failed to update user info ${JSON.stringify(req.body)}`;
    console.log(errorMessage, e);
    res.status(500).send(errorMessage);
  }
});

module.exports = router;
