const http = require('http');
require('dotenv').config();
const express = require('express');
require('./db/mongoose');
const socketio = require('socket.io');
const postRouter = require('./router/post_router');
const userRouter = require('./router/user_router');
const fileUploadRouter = require('./router/file_upload_router');
const commentRouter = require('./router/comment_router');
const friendRouter = require('./router/friend_router');
const postLikesRouter = require('./router/post_likes_router');
const notificationRouter = require('./router/notification_router');
const chatWebsocket = require('./router/chat_websocket');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

io.on('connection', (socket) => {
    socket.emit('cnm', 1);
    console.log('asdasdasd')
})

const port = process.env.PORT;

server.listen(port, () => {
    console.log('listening port ' + port)
})

app.get('/test', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.use(express.json());
app.use(postRouter);
app.use(userRouter);
app.use(fileUploadRouter);
app.use(commentRouter);
app.use(friendRouter);
app.use(postLikesRouter);
app.use(notificationRouter);
