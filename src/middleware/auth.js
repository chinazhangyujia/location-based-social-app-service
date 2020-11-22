const jwt = require('jsonwebtoken')
const { User, privateKey } = require('../model/user')

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, privateKey)
        const user = await User.findOne({ _id: decoded._id, token: token })

        if (!user) {
            throw new Error()
        }

        req.token = token
        req.user = user
        next()
    } catch (e) {
        res.status(401).send({ error: 'Please authenticate.' })
    }
}

const websocket_auth = async (socket, next) => {
    try {

        console.log('websocket_auth')
        const token = socket.handshake.headers['Authorization'].replace('Bearer ', '')
        const decoded = jwt.verify(token, privateKey)
        const user = await User.findOne({ _id: decoded._id, token: token })

        if (!user) {
            console.log('websocket_auth_failed')

            throw new Error()
        }

        socket.token = token
        socket.user = user
        next()
    } catch (e) {
        throw e;
    }
}

module.exports = { auth, websocket_auth }