const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const auth = require('../middleware/auth')
const Friend = require('../model/friend')
const AddFriendRequest = require('../model/add_friend_request')

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

        const existingFriendship1 = await Friend.findOne({user: req.user._id, friendUser: friendRequest.fromUser }).exec();
        const existingFriendship2 = await Friend.findOne({user: friendRequest.fromUser, friendUser: req.user._id }).exec();

        if (!isValidFriendship(existingFriendship1, existingFriendship2)) {
            await session.abortTransaction();
            session.endSession();
            res.status(400).send('Invalid existing friendship'); // todo fix data?
            return
        }

        if (!existingFriendship1 && !existingFriendship2 && friendRequest.status === 'accepted') {
            const friendShip1 = new Friend({
                user: req.user._id,
                friendUser: friendRequest.fromUser,
                status: 'active'
            });
            const friendShip2 = new Friend({
                user: friendRequest.fromUser,
                friendUser: req.user._id,
                status: 'active'
            });

            friendShip1.save();
            friendShip2.save();
        }

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