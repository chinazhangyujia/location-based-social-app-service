/* eslint-disable no-underscore-dangle */
const jwt = require('jsonwebtoken');
const url = require('url');
const WebSocket = require('ws');
const redis = require('redis');
const { User, privateKey } = require('../model/user');
const ChatThread = require('../model/chat_thread');
const ChatMessage = require('../model/chat_message');
const logger = require('../util/logger');

const redisSubscriber = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
});

const redisPublisher = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
});

const chatRooms = {};

const getOrCreateChatThread = async (sendFrom, sendTo) => {
  try {
    let thread = await ChatThread.findOne({ participants: { $all: [sendFrom, sendTo] } })
      .exec();

    // create a thread
    if (!thread) {
      thread = await ChatThread.create({ participants: [sendFrom, sendTo] });
    }

    thread = await thread.populate('participants').execPopulate();

    return thread;
  } catch (e) {
    return null;
  }
};

const storeChatMessage = async (thread, sendTo, sendFrom, content) => {
  let message = await ChatMessage.create({
    chatThread: thread,
    sendTo,
    sendFrom,
    content,
  });

  message = await message.populate('sendTo').populate('sendFrom').execPopulate();

  return message;
};

const cleanClosedWebsocket = (room) => {
  if (room && Array.isArray(room)) {
    for (let i = 0; i < room.length; i += 1) {
      if (room[i].readyState === WebSocket.CLOSED) {
        room.splice(i, 1);
      }
    }
  }
};

const validateChatMessage = async (thread, sendTo, sendFrom, content) => {
  if (!thread || !sendTo || !sendFrom || !content) {
    return false;
  }

  const threadObject = await ChatThread.findById(thread).exec();
  if (threadObject == null) {
    logger.error('thead not found');
    return false;
  }

  return true;
};

const findWSInRoom = (thread) => chatRooms[thread];

const addToChatRoom = (thread, ws) => {
  let room = chatRooms[thread];

  cleanClosedWebsocket(room);

  if (!room) {
    room = [ws];
    chatRooms[thread] = room;
    redisSubscriber.subscribe(thread.toString());
  } else if (!room.includes(ws)) {
    room.push(ws);
    redisSubscriber.subscribe(thread.toString());
  }
};

const leaveChatRoom = (thread, ws) => {
  const room = chatRooms[thread];
  if (!room) {
    return;
  }

  if (room.includes(ws)) {
    const index = room.indexOf(ws);
    if (index >= 0) {
      room.splice(index, 1);
    }
  }

  if (room.length === 0) {
    delete chatRooms[thread];
    redisSubscriber.unsubscribe(thread);
  }
};

const broadcastMessage = (message, thread, wss) => {
  const wsInRoom = findWSInRoom(thread);
  if (!wsInRoom || wsInRoom.length === 0) {
    return;
  }

  wss.clients.forEach((client) => {
    if (wsInRoom.includes(client) && client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};

const chatWebsocket = (wss) => {
  redisSubscriber.on('message', (channel, message) => {
    if (!message) {
      logger.error('message is null');
      return;
    }

    broadcastMessage(message, channel, wss);
  });

  wss.on('connection', async (ws, req) => {
    logger.info('start websocket auth');

    ws.on('close', () => {
      logger.info(`connection closed ${ws}`);
    });

    let thread;
    try {
      // the keys in header are lowercase
      // todo remove condition check for webclient
      const token = !req.headers.authorization ? null : req.headers.authorization.replace('Bearer ', '');

      const decoded = !req.headers.authorization ? null : jwt.verify(token, privateKey);
      const user = await User.findOne({ _id: !decoded ? '5f892e22bf85fb1701ad8261' : decoded._id, token: !token ? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1Zjg5MmUyMmJmODVmYjE3MDFhZDgyNjEiLCJpYXQiOjE2MDg2MTI1NTN9.NXrt1mZ_2QGsnLCyOkxH9qo3o0DfSguupgEZzXrvgWU' : token });

      if (!user) {
        throw new Error('Authentication failed');
      }

      const queryParams = url.parse(req.url, true).query;
      const chatWith = await User.findById(queryParams.chatWith).exec();

      if (!chatWith) {
        throw new Error('Not able to find user to chat with');
      }

      thread = await getOrCreateChatThread(user._id, chatWith._id);
      if (!thread) {
        throw new Error('Failed to get or create chat thread');
      }
    } catch (e) {
      logger.error('websocket auth failed', e);
      ws.close();
      return;
    }

    logger.info('One user connected');

    addToChatRoom(thread._id, ws);

    ws.send(JSON.stringify({
      type: 'thread',
      thread,
    }));

    ws.on('message', async (message) => {
      logger.info('on message triggered');
      try {
        const messageObject = JSON.parse(message);

        const { event } = messageObject;

        if (!event) {
          logger.error('Event must be specified');
          return;
        }

        if (event === 'message') {
          const { thread: currentThread } = messageObject;
          const { sendTo } = messageObject;
          const { sendFrom } = messageObject;
          const { content } = messageObject;

          // eslint-disable-next-line max-len
          const isMessageValid = await validateChatMessage(currentThread, sendTo, sendFrom, content);
          if (!isMessageValid) {
            logger.error('message data is not valid');
            return;
          }

          const storedMessage = await storeChatMessage(currentThread, sendTo, sendFrom, content);
          const storedMessageObject = storedMessage.toObject();
          storedMessageObject.type = 'message';

          redisPublisher.publish(currentThread.toString(), JSON.stringify(storedMessageObject));
          // broadcastMessage(JSON.stringify(storedMessageObject), thread, wss, ws);
        } else if (event === 'leave') {
          if (!messageObject.thread) {
            return;
          }

          leaveChatRoom(messageObject.thread, ws);

          logger.info('leave');
        }
      } catch (e) {
        logger.error(`Failed to handle coming message ${message}`, e);
      }
    });
  });
};

module.exports = chatWebsocket;
