const express = require('express')
const router = express.Router()

// const authMiddleware = require('../../middlewares/authentication')
// const authstrategy = require('../../config').authentication.strategy

// router.post('/sinch/queue/5ebe781115b0fbc7bd5db58c', require('../web_hooks/controllers/sendSinchDatatoQueue'))
router.post('/tyntec/queue/incomingdata/e464e894-0ded-4122-86bc-4e215f9f8f5a', require('./controllers/sendTyntecIncomingDatatoQueue'))
router.post('/tyntec/queue/messageStatus/eaa82947-06f0-410a-bd2a-768ef0c4966e', require('./controllers/sendTyntecMessageStatusToQueue'))
router.post('/mock/b330e3f4-3732-4915-ae6d-0b3359ec28f1', require('./controllers/mockCallBack'))

module.exports = router
