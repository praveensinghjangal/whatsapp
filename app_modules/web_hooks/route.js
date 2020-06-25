const express = require('express')
const router = express.Router()

// const authMiddleware = require('../../middlewares/authentication')
// const authstrategy = require('../../config').authentication.strategy

// router.post('/sinch/queue/5ebe781115b0fbc7bd5db58c', require('../web_hooks/controllers/sendSinchDatatoQueue'))
router.post('/tyntec/queue/incomingdata/e464e894-0ded-4122-86bc-4e215f9f8f5a', require('./controllers/sendTyntecIncomingDatatoQueue'))

module.exports = router
