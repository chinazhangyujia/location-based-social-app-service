const express = require('express')
const { User } = require('../model/user')
const auth = require('../middleware/auth')
const router = express.Router()

router.post('/user/signup', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        const token = await user.generateAuthToken()
        res.status(200).send({ user, token })
    } catch (e) {
        let error = {};
        if (e.keyPattern?.uniqueName) {
            error.message = 'Duplicated unique name';
        }
        else if (e.keyPattern?.email) {
            error.message = 'Duplicated email';
        }
        else {
            error.message = 'Sign up failed';
        }
        res.status(400).send(error);
    }
})

router.post('/user/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.status(200).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/user/logout', auth, async (req, res) => {
    try {
        req.user.token = undefined
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/user/me', auth, async (req, res) => {
    res.status(200).send(req.user);
})

router.patch('/user/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})

module.exports = router