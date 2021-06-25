const http = require('http');
require('dotenv').config();
const express = require('express');
require('./db/mongoose');
const WebSocket = require('ws');
const postRouter = require('./router/post_router');
const userRouter = require('./router/user_router');
const fileUploadRouter = require('./router/file_upload_router');
const commentRouter = require('./router/comment_router');
const friendRouter = require('./router/friend_router');
const postLikesRouter = require('./router/post_likes_router');
const notificationRouter = require('./router/notification_router');
const chatRouter = require('./router/chat_router');
const chatWebsocket = require('./router/chat_websocket');
const logger = require('./util/logger');

const app = express();
const server = http.createServer(app);

const wss = new WebSocket.Server({ server, path: '/chat' });
chatWebsocket(wss);

const port = process.env.PORT;

server.listen(port, () => {
  logger.info(`listening port ${port}`);
});

app.use(express.json());
app.use(postRouter);
app.use(userRouter);
app.use(fileUploadRouter);
app.use(commentRouter);
app.use(friendRouter);
app.use(postLikesRouter);
app.use(notificationRouter);
app.use(chatRouter);
