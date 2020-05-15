const express = require('express')
const router = express.Router()

// const authMiddleware = require('../../middlewares/authentication')
// const authstrategy = require('../../config').authentication.strategy

router.post('/sinch/queue/5ebe781115b0fbc7bd5db58c', require('../web_hooks/controllers/sendSinchDatatoQueue'))

module.exports = router
