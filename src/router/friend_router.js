const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const auth = require('../middleware/auth')
const Friend = require('../model/friend')
const AddFriendRequest = require('../model/add_friend_request')

router.get('/friends', auth, async (req, res) => {
    try {
        const friends = await Friend.find({userId: req.user._id, status: 'active'})
            .select({friendUserId: 1})
            .populate('friendUserId')
            .sort({name: 1})
            .exec();

        res.status(200).send(friends);
    }
    catch (e) {
        res.status(400).send('Failed to fetch friends info');
    }
})

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

router.get('/unnotifiedRequests', auth, async (req, res) => {
    try {
        const unnotifiedRequests = await AddFriendRequest.find({toUser: req.user._id, status: 'pending', notified: false})
            .sort({_id: -1})
            .populate('fromUser')
            .exec();

        res.status(200).send(unnotifiedRequests);
    }
    catch (e) {
        res.status(400).send();
    }
})



router.post('/handleFriendRequest', auth, async (req, res) => {

    try {
        const requestId = req.body.requestId;
        const session = mongoose.startSession();
        session.startTransaction();

        const friendRequest = await AddFriendRequest.findByIdAndUpdate({_id: requestId}, {status: req.body.status,}, {session: session, new: true}).exec()
        if (friendRequest.toUser !== req.user._id) {
            await session.abortTransaction();
            session.endSession();
            res.status(400).send('Add friend request does not belong to this user');
            return
        }

        const existingFriendship1 = await Friend.findOne({userId: req.user._id, friendUserId: friendRequest.fromUser }).exec();
        const existingFriendship2 = await Friend.findOne({userId: friendRequest.fromUser, friendUserId: req.user._id }).exec();

        if (!isValidFriendship(existingFriendship1, existingFriendship2)) {
            await session.abortTransaction();
            session.endSession();
            res.status(400).send('Invalid existing friendship'); // todo fix data?
            return
        }



        Friend.replaceOne({
            userId: req.user._id,
            friendUserId: friendRequest.fromUser,
        }, {
            userId: req.user._id,
            friendUserId: friendRequest.fromUser,
            status: friendRequest.status === 'accepted' ? 'active' : 'cancelled'
        }, {upsert: true});

        Friend.replaceOne({
            userId: friendRequest.fromUser,
            friendUserId: req.user._id,
        }, {
            userId: friendRequest.fromUser,
            friendUserId: req.user._id,
            status: friendRequest.status === 'accepted' ? 'active' : 'cancelled'
        }, {upsert: true});

        await session.commitTransaction();
        session.endSession();

        res.status(200).send();
    }
    catch (e) {
        res.status(500).send('Failed to post comment');
    }
})

const isValidFriendship = (friendship1, friendship2) => {
    if (!friendship1 && !!friendship2 || !!friendship1 && !friendship2) {
        return false;
    }

    if (!friendship1 && ! friendship2) {
        return true;
    }

    return friendship1.status === friendship2.status;
}

module.exports = router