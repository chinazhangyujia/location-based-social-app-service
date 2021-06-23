/* eslint-disable no-underscore-dangle */
const express = require('express');

const router = express.Router();
const auth = require('../middleware/auth');
const ChatMessage = require('../model/chat_message');
const ChatThread = require('../model/chat_thread');

// get all chat messages in one thread
router.get('/chatMessage', auth, async (req, res) => {
  try {
    const threadId = req.query.thread;

    const { fromId } = req.query;
    const limit = req.query.fetchSize; // nonnull

    const chatMessageQuery = fromId ? ChatMessage.find({
      _id: { $lt: fromId },
      chatThread: threadId,
    }) : ChatMessage.find({
      chatThread: threadId,
    });

    const messages = await chatMessageQuery
      .sort({ _id: -1 })
      .limit(parseInt(limit, 10))
      .populate('sendFrom')
      .populate('sendTo')
      .exec();

    res.status(200).send(messages);
  } catch (e) {
    const errorMessage = `Failed to get chat message for request ${JSON.stringify(req)}`;
    console.log(errorMessage);
    res.status(400).send(errorMessage);
  }
});

// get summary information of one thread e.g last message, from user...
router.get('/chatThreadSummaries', auth, async (req, res) => {
  try {
    const threads = await ChatThread.find({
      participants: req.user._id,
    }).populate('participants')
      .exec();

    const lastMessages = await ChatMessage.aggregate([
      { $match: { chatThread: { $in: threads.map((t) => t._id) } } },
      { $sort: { _id: 1 } },
      {
        $group: {
          _id: '$chatThread',
          lastMessage: { $last: '$content' },
          createdAt: { $last: '$createdAt' },
        },
      },
      { $sort: { createdAt: -1 } },
    ]).exec();

    const threadSummaries = [];
    const threadById = threads.reduce((map, t) => {
      // eslint-disable-next-line no-param-reassign
      map[t._id] = t;
      return map;
    }, {});

    // eslint-disable-next-line no-restricted-syntax
    for (const message of lastMessages) {
      const participants = threadById[message._id]?.participants;

      if (!participants) {
        // eslint-disable-next-line no-continue
        continue;
      }

      const chatWith = participants.find((p) => p._id.toString() !== req.user._id.toString());
      if (!chatWith) {
        // eslint-disable-next-line no-continue
        continue;
      }

      const summary = {
        ...message,
        chatWith,
      };

      threadSummaries.push(summary);
    }

    res.status(200).send(threadSummaries);
  } catch (e) {
    const errorMessage = `Failed to get all chat thread summaries for request ${JSON.stringify(req.body)}`;
    console.log(errorMessage, e);
    res.status(400).send(errorMessage);
  }
});

module.exports = router;
