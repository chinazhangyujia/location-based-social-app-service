const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { auth } = require('../middleware/auth')
const Friend = require('../model/friend')
const AddFriendRequest = require('../model/add_friend_request')

/**
 * Friend
 */
router.get('/friends', auth, async (req, res) => {
    try {
        const friends = await Friend.find({user: req.user._id, status: 'active'})
            .select({friendUser: 1})
            .populate('friendUser')
            .sort({name: 1})
            .exec();

        res.status(200).send(friends);
    }
    catch (e) {
        res.status(400).send('Failed to fetch friends info');
    }
})

router.get('/friendStatus', auth, async (req, res) => {
    try {
        const targetUser = req.query.user;
        if (!targetUser) {
            res.status(400).send('No target user Id passed in');
            return;
        }

        if (targetUser.toString() === req.user._id.toString()) {
            res.status(200).send('N/A');
            return;
        }

        const friendship = await Friend.findOne({user: req.user._id, friendUser: targetUser, status: 'active'});
        const pendingRequest = await AddFriendRequest.findOne({toUser: targetUser, fromUser: req.user._id, status: 'pending'});

        let friendStatus;
        if (!friendship && !pendingRequest) {
            friendStatus = 'NOT_FRIEND';
        }
        else if (!friendship && !!pendingRequest) {
            friendStatus = 'PENDING';
        }
        else if (!!friendship && !pendingRequest) {
            friendStatus = 'IS_FRIEND';
        }
        else {
            friendStatus = 'UNKNOWN';
        }

        res.status(200).send(friendStatus);
    }
    catch (e) {
        res.status(500).send('Failed to get friend status');
    }
})

router.post('/cancelFriendship', auth, async (req, res) => {
    try {
        const friendUserId = req.body.friendUser;
        await Friend.findOneAndUpdate({user: req.user._id, friendUser: friendUserId}, {status: 'cancelled'});
        await Friend.findOneAndUpdate({user: friendUserId, friendUser: req.user._id}, {status: 'cancelled'});
        res.status(200).send({friendUser: friendUserId});
    } catch (e) {
        res.status(400).send('Failed to delete friend');
    }
})


/**
 * Friend request
 */
router.post('/addFriendRequest', auth, async (req, res) => {
    try {
        const friendRequest = new AddFriendRequest({
            toUser: req.body.toUser,
            fromUser: req.user._id,
            status: 'pending',
            notified: false
        })


        await friendRequest.save();
        res.status(200).send();
    }
    catch (e) {
        res.status(500).send('Failed to post comment');
    }
})

router.post('/markRequestAsNotified', auth, async (req, res) => {
    try {
        const requestIds = req.body.requestIds;

        await AddFriendRequest.updateMany({_id: {$in: requestIds}}, {notified: true}).exec();
        res.status(200).send();
    }
    catch (e) {
        res.status(500).send('Failed to post comment');
    }
})

router.get('/pendingRequests', auth, async (req, res) => {
    try {
        const pendingRequests = await AddFriendRequest.find({toUser: req.user._id, status: 'pending'})
            .sort({_id: -1})
            .populate('fromUser')
            .exec();

        res.status(200).send(pendingRequests);
    }
    catch (e) {
        res.status(400).send();
    }
})

router.post('/handleFriendRequest', auth, async (req, res) => {

    try {
        const requestId = req.body.requestId;
        const session = await mongoose.startSession();
        session.startTransaction();

        const friendRequest = await AddFriendRequest.findByIdAndUpdate({_id: requestId}, {status: req.body.status,}, {session: session, new: true}).exec()
        if (friendRequest.toUser.toString() !== req.user._id.toString()) {
            await session.abortTransaction();
            session.endSession();
            res.status(400).send('Add friend request does not belong to this user');
            return
        }

        if (friendRequest.status === 'accepted') {
            await Friend.findOneAndUpdate({user: req.user._id, friendUser: friendRequest.fromUser }, {status: 'active'}, { upsert: true }).exec();
            await Friend.findOneAndUpdate({user: friendRequest.fromUser, friendUser: req.user._id }, {status: 'active'}, { upsert: true }).exec();
        }

        await session.commitTransaction();
        session.endSession();

        res.status(200).send();
    }
    catch (e) {
        res.status(500).send('Failed to post comment');
    }
})

module.exports = router