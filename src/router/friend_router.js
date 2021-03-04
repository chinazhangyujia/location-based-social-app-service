const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const auth = require('../middleware/auth')
const Friend = require('../model/friend')
const AddFriendRequest = require('../model/add_friend_request')

/**
 * This class includes endpoints for both friendship and friend request
 */

 /**
  * Friendship endpoints
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
        const errorMessage = 'Failed to fetch friends info for req ' + JSON.stringify(req.body);
        console.log(errorMessage, e)
        res.status(400).send(errorMessage);
    }
})

router.get('/friendStatus', auth, async (req, res) => {
    try {
        const targetUser = req.query.user;
        if (!targetUser) {
            console.log('No target user Id passed in for req ' + JSON.stringify(req.body));
            res.status(400).send('No target user Id passed in');
            return;
        }

        if (targetUser.toString() === req.user._id.toString()) {
            res.status(200).send('N/A');
            return;
        }

        const friendship = await Friend.findOne({user: req.user._id, friendUser: targetUser, status: 'active'});
        const pendingRequest = await AddFriendRequest.findOne({$or: [
            {toUser: targetUser, fromUser: req.user._id, status: 'pending'},
            {toUser: req.user._id, fromUser: targetUser, status: 'pending'},
        ]});

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
        const errorMessage = 'Failed to get friend status for req ' + JSON.stringify(req.body);
        console.log(errorMessage, e);
        res.status(500).send(errorMessage);
    }
})

router.post('/cancelFriendship', auth, async (req, res) => {
    try {
        const friendUserId = req.body.friendUser;
        await Friend.findOneAndUpdate({user: req.user._id, friendUser: friendUserId}, {status: 'cancelled'});
        await Friend.findOneAndUpdate({user: friendUserId, friendUser: req.user._id}, {status: 'cancelled'});
        res.status(200).send({friendUser: friendUserId});
    } catch (e) {
        const errorMessage = 'Failed to delete friend for req ' + JSON.stringify(req.body);
        console.log(errorMessage, e);
        res.status(500).send(errorMessage);
    }
})


/**
 * Friend request endpoints
 */
router.post('/addFriendRequest', auth, async (req, res) => {
    try {
        const friendRequest = new AddFriendRequest({
            toUser: req.body.toUser,
            fromUser: req.user._id,
            status: 'pending',
            notified: false
        })

        await AddFriendRequest.create(friendRequest);
        res.status(200).send();
    }
    catch (e) {
        const errorMessage = 'Failed to record add friend request for req ' + JSON.stringify(req.body);
        console.log(errorMessage, e);
        res.status(500).send(errorMessage);
    }
})

router.post('/markRequestAsNotified', auth, async (req, res) => {
    try {
        const requestIds = req.body.requestIds;

        await AddFriendRequest.updateMany({_id: {$in: requestIds}}, {notified: true}).exec();
        res.status(200).send();
    }
    catch (e) {
        const errorMessage = 'Failed to mark add friend request as notified for req ' + JSON.stringify(req.body);
        console.log(errorMessage, e);
        res.status(500).send(errorMessage);
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
        const errorMessage = 'Failed to get pending add friend request for req ' + JSON.stringify(req.body);
        console.log(errorMessage, e);
        res.status(500).send(errorMessage);
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
            console.log('Add friend request does not belong to this user, req: ' + JSON.stringify(req.body));
            res.status(400).send('Add friend request does not belong to this user');
            return
        }

        if (friendRequest.status === 'accepted') {
            await Friend.findOneAndUpdate({user: req.user._id, friendUser: friendRequest.fromUser }, {status: 'active'}, { upsert: true, session: session }).exec();
            await Friend.findOneAndUpdate({user: friendRequest.fromUser, friendUser: req.user._id }, {status: 'active'}, { upsert: true, session: session }).exec();
        }

        await session.commitTransaction();
        session.endSession();

        res.status(200).send();
    }
    catch (e) {
        const errorMessage = 'Failed to handle friend request for req ' + JSON.stringify(req.body);
        console.log(errorMessage, e);
        res.status(500).send(errorMessage);
    }
})

module.exports = router