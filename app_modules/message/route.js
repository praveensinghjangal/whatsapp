const express = require('express')
const router = express.Router()
const authMiddleware = require('../../middlewares/authentication')
const authstrategy = require('../../config').authentication.strategy

router.post('/send', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), require('./controllers/sendMessage'))

module.exports = router
