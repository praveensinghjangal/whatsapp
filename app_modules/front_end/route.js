const express = require('express')
const router = express.Router()
const authMiddleware = require('../../middlewares/auth/authentication')
const authstrategy = require('../../config').authentication.strategy
const apiHitsAllowedMiddleware = require('../../middlewares/apiHitsAllowed')

// logical wrappers
router.post('/addUpdateOptinMessageAndTemplate', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, require('./controllers/optinAndTemplate').post)
router.get('/addUpdateOptinMessageAndTemplate', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, require('./controllers/optinAndTemplate').get)

// api wrappers
router.get('/flow', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, require('./wrapper/chatAppWrapper').getMenuBasedTemplateList)
router.post('/flow', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, require('./wrapper/chatAppWrapper').flow)
router.get('/flow/categories', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, require('./wrapper/chatAppWrapper').getCategory)
router.get('/flow/:flowTopicId', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, require('./wrapper/chatAppWrapper').getFlow)
router.delete('/flow/:flowTopicId', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, require('./wrapper/chatAppWrapper').deleteEntireFlow)
router.get('/flow/:flowTopicId/:identifierText', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, require('./wrapper/chatAppWrapper').getIdentifier)
router.patch('/flow/:flowTopicId/active/:active', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, require('./wrapper/chatAppWrapper').activeTemplate)
router.patch('/flow/:flowTopicId/evaluate/:evaluationResponse', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, require('./wrapper/chatAppWrapper').evaluationResult)
router.delete('/flow/:flowTopicId/:identifierText', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, require('./wrapper/chatAppWrapper').deleteIdentifier)
// router.post('/helo-oss/upload', authToken, require('./wrapper/heloOssWrapper').uploadFile)
router.get('/helo-oss/:action/:fileName', require('./wrapper/heloOssWrapper').downloadFile)
router.patch('/templateflow/:id/evaluate/:evaluation', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, require('./wrapper/chatAppWrapper').templateFlowApproval)
router.get('/templateflow/list', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, require('./wrapper/chatAppWrapper').templateFlowlist)
router.get('/templateflow/info', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, require('./wrapper/chatAppWrapper').templateFlowInfo)
router.get('/flows/status', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, require('./wrapper/chatAppWrapper').templateFlowStatus)

module.exports = router
