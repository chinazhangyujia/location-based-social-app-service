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

module.exports = { auth }