const express = require('express')
const router = express.Router()
const authMiddleware = require('../../middlewares/auth/authentication')
const authstrategy = require('../../config').authentication.strategy
const apiHitsAllowedMiddleware = require('../../middlewares/apiHitsAllowed')
const internalSessionOrTokenAuth = require('../../middlewares/auth/internalSessionOrTokenAuth')
const tokenBasedInternalPrivateAuth = require('../../middlewares/auth/tokenBasedInternalPrivateAuth')
const messageConversationController = require('./controllers/messageConversation')

router.post('/', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, require('./controllers/sendMessageToQueue'))
router.post('/single', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, require('./controllers/sendMessageToQueue'))
router.post('/bulk', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, require('./controllers/sendMessageToQueue'))
router.post('/whatsapp/excel', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, require('./controllers/sendMessageToQueueExcel'))
router.post('/tracking', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, require('./controllers/addMessageHistory'))
router.get('/tracking/:messageId', internalSessionOrTokenAuth, apiHitsAllowedMiddleware, apiHitsAllowedMiddleware, require('./controllers/fetchMessageHistory'))
router.get('/status/count', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, require('./controllers/getMessageStatusCount'))
router.get('/status/:status/list', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, require('./controllers/getMessageStatusList'))
router.get('/transaction', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, require('./controllers/getMessageIncomingOutgoingCount'))
router.get('/transaction/list', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, require('./controllers/getMessageTransactionStatusList'))
router.get('/media/:mediaId', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, require('./controllers/getMedia'))
router.get('/media/:mediaId/:phoneNumber', tokenBasedInternalPrivateAuth, require('./controllers/getMediaByPhoneNumber'))
router.get('/conversation/count', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, messageConversationController.getBillingConversationDataOnBasisOfWabaNumber)
//! dummy api to check the working on whatsapp's check contact imtegration
router.get('/checkcontacts', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, require('./controllers/checkContacts'))
router.get('/getprofilepic', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, require('./controllers/getProfilePic'))
router.get('/transaction/outgoing/list', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, require('./controllers/getOutgoingTransactionListBySearchFilters'))

module.exports = router
