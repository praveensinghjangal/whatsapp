const express = require('express')
const router = express.Router()
const authMiddleware = require('../../middlewares/authentication')
const authstrategy = require('../../config').authentication.strategy
const RedisMasterService = require('../../lib/redis_master_service')
const __constants = require('../../config/constants')
const redisMasterService = new RedisMasterService()
redisMasterService.setDataInRedis(__constants.MASTER_TABLE.wabaPhoneNoToProviderInfo.name, __constants.MASTER_TABLE.wabaPhoneNoToProviderInfo.columns)

router.post('/send', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), require('./controllers/sendMessage'))
router.post('/', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), require('./controllers/sendMessageToQueue'))

module.exports = router
