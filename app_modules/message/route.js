const express = require('express')
const router = express.Router()
const authMiddleware = require('../../middlewares/auth/authentication')
const authstrategy = require('../../config').authentication.strategy
const userConfiMiddleware = require('../../middlewares/setUserConfig')
const apiHitsAllowedMiddleware = require('../../middlewares/apiHitsAllowed')

router.post('/send', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), require('./controllers/sendMessage'))
router.post('/', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, require('./controllers/sendMessageToQueue'))
router.post('/whatsapp/excel', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), userConfiMiddleware, require('./controllers/sendMessageToQueueExcel'))
router.post('/tracking', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), require('./controllers/addMessageHistory'))
router.get('/tracking/:messageId', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), require('./controllers/fetchMessageHistory'))
router.get('/status/count', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), require('./controllers/getMessageStatusCount'))
router.get('/status/:status/list', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), require('./controllers/getMessageStatusList'))
router.get('/transaction', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), require('./controllers/getMessageIncomingOutgoingCount'))
router.get('/transaction/list', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), require('./controllers/getMessageTransactionStatusList'))
router.get('/media/:mediaId', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), require('./controllers/getMedia'))

module.exports = router
