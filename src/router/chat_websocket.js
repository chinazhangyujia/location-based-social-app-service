const { websocket_auth } = require('../middleware/auth')

const setupChatWebsocket = (io) => {
    console.log('this line executed')
    io.use(websocket_auth);

    io.on('connection', () => {
        console.log('Web socket is connected');
    })
}

module.exports = setupChatWebsocket;