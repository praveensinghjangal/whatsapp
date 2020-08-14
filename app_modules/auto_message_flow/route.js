const express = require('express')
const router = express.Router()
const chatBotMiddleware = require('../../middlewares/chatFlow')

router.post('/flow', chatBotMiddleware, require('./controllers/flowManager'))

module.exports = router
