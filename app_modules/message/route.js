const express = require('express')
const router = express.Router()
const authMiddleware = require('../../middlewares/authentication')
const authstrategy = require('../../config').authentication.strategy
const RedisMasterService = require('../../lib/redis_master_service')
const __constants = require('../../config/constants')
const redisMasterService = new RedisMasterService()
redisMasterService.setDataInRedis(__constants.MASTER_TABLE.wabaPhoneNoToProviderInfo.name, __constants.MASTER_TABLE.wabaPhoneNoToProviderInfo.columns)
const userConfiMiddleware = require('../../middlewares/setUserConfig')

router.post('/send', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), require('./controllers/sendMessage'))
router.post('/', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), require('./controllers/sendMessageToQueue'))
router.post('/whatsapp/excel', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), userConfiMiddleware, require('./controllers/sendMessageToQueueExcel'))
router.post('/tracking', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), require('./controllers/addMessageHistory'))
router.get('/tracking/:messageId', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), require('./controllers/fetchMessageHistory'))

module.exports = router
