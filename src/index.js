require('dotenv').config();
const express = require('express');
require('./db/mongoose');
const postRouter = require('./router/post_router');
const userRouter = require('./router/user_router');
const fileUploadRouter = require('./router/file_upload_router');
const commentRouter = require('./router/comment_router');
const friendRouter = require('./router/friend_router');
const postLikesRouter = require('./router/post_likes_router');

const app = express();
const port = process.env.PORT;

app.listen(port, () => {
    console.log('listening port ' + port)
})

app.use(express.json());
app.use(postRouter);
app.use(userRouter);
app.use(fileUploadRouter);
app.use(commentRouter);
app.use(friendRouter);
app.use(postLikesRouter);
