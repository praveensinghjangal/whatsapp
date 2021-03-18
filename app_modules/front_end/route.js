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
router.post('/helo-oss/upload', require('./wrapper/heloOssWrapper').uploadFile)
router.get('/helo-oss/:action/:fileName', require('./wrapper/heloOssWrapper').downloadFile)
router.patch('/templateflow/:id/evaluate/:evaluation', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, require('./wrapper/supportWrapper').templateFlowApproval)
router.get('/templateflow/list', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, require('./wrapper/supportWrapper').templateFlowlist)
router.get('/templateflow/info', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, require('./wrapper/supportWrapper').templateFlowInfo)
router.get('/flows/status', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, require('./wrapper/chatAppWrapper').templateFlowStatus)

// dlt wrappers
router.get('/dlt/panel/support/users', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, require('./wrapper/supportWrapper').dltListOfUsers)
router.get('/dlt/panel/support/users/peids', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, require('./wrapper/supportWrapper').dltListOfPeids)
router.post('/dlt/panel/support/users/peids', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, require('./wrapper/supportWrapper').dltUpdatePeids)
router.post('/dlt/panel/template/create', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, require('./wrapper/supportWrapper').dltCreateTemplate)
router.get('/dlt/panel/template', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, require('./wrapper/supportWrapper').dltListOfTemplates)
router.get('/dlt/panel/template/convertMessage', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, require('./wrapper/supportWrapper').dltConvertMessage)
router.post('/dlt/panel/template/changePeidStatus', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, require('./wrapper/supportWrapper').dltChangePeidStatus)
router.post('/dlt/panel/template/verifyMessage', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, require('./wrapper/supportWrapper').dltVerifyMessage)
router.get('/dlt/panel/template/download', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, require('./wrapper/supportWrapper').downloadDltTemplate)
router.post('/dlt/panel/template/upload', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, require('./wrapper/supportWrapper').bulkUploadTemplates)
router.get('/dlt/panel/support/users/peids/others', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, require('./wrapper/supportWrapper').dltListOfPeidsOtherThanUser)

module.exports = router
