const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const CommentNotification = require('../model/comment_notification');
const LikeNotification = require('../model/like_notification');

const EARLIEST_NOTIFICATION_MONTH_BEFORE = 1;

router.get('/commentNotifications', auth, async (req, res) => {
    try {
        const commentNotification = await CommentNotification
            .find({toUser: req.user._id})
            .sort({_id: -1})
            .populate('comment')
            .populate({path: 'comment', populate: {path: 'sendFrom'}})
            .exec();

        res.status(200).send(commentNotification);

    } catch (e) {
        const errorMessage = 'Failed to get comment notifications for req ' + JSON.stringify(req.body);
        console.log(errorMessage, e);
        res.status(500).send(errorMessage);
    }
})

router.get('/likeNotifications', auth, async (req, res) => {
    try {
        const likeNotifications = await LikeNotification
            .find({toUser: req.user._id})
            .sort({_id: -1})
            .populate('fromUser')
            .exec();

        res.status(200).send(likeNotifications);

    } catch (e) {
        const errorMessage = 'Failed to get like notifications for req ' + JSON.stringify(req.body);
        console.log(errorMessage, e);
        res.status(500).send(errorMessage);
    }
})

router.get('/allNotifications', auth, async (req, res) => {
    try {
        let earliestFetchDate = new Date();
        earliestFetchDate.setMonth(earliestFetchDate.getMonth() - EARLIEST_NOTIFICATION_MONTH_BEFORE);

        let commentNotifications = await CommentNotification
            .find({toUser: req.user._id, createdAt: {$gte: earliestFetchDate}})
            .sort({_id: -1})
            .populate('comment')
            .populate({path: 'comment', populate: {path: 'sendFrom'}})
            .exec();


        commentNotifications = commentNotifications.map((e) => {
            const notificationObject = e.toObject();
            notificationObject.type = 'comment'
            return notificationObject
        })

        let likeNotifications = await LikeNotification
            .find({toUser: req.user._id, createdAt: {$gte: earliestFetchDate}})
            .sort({_id: -1})
            .populate('fromUser')
            .exec();


        likeNotifications = likeNotifications.map((e) => {
            const notificationObject = e.toObject();
            notificationObject.type = 'like'
            return notificationObject
        })

        const compareByCreatedAt = (a, b) => {
            const createdAtA = new Date(a.createdAt);
            const createdAtB = new Date(b.createdAt);

            if (createdAtA.getTime() < createdAtB.getTime()) {
                return 1;
            }
            else if (createdAtA.getTime() > createdAtB.getTime()) {
                return -1;
            }
            else {
                return 0;
            }
        }

        let notifications = [...commentNotifications, ...likeNotifications];
        notifications = notifications.sort(compareByCreatedAt);

        res.status(200).send(notifications);

    } catch (e) {
        const errorMessage = 'Failed to get notifications for req ' + JSON.stringify(req.body);
        console.log(errorMessage, e);
        res.status(500).send(errorMessage);
    }
})

router.post('/markNotificationNotified', auth, async (req, res) => {

    try {
        const commentNotificationIds = req.body.commentNotificationIds;
        const likeNotificationIds = req.body.likeNotificationIds;

        if (commentNotificationIds && commentNotificationIds.length > 0) {
            await CommentNotification.updateMany({_id: {$in: commentNotificationIds}}, {notified: true});
        }

        if (likeNotificationIds && likeNotificationIds.length > 0) {
            await LikeNotification.updateMany({_id: {$in: likeNotificationIds}}, {notified: true});
        }

        res.status(200).send();
    }
    catch (e) {
        const errorMessage = 'Failed to mark notifications as notified for req ' + JSON.stringify(req.body);
        console.log(errorMessage, e);
        res.status(500).send(errorMessage);
    }
})

module.exports = router