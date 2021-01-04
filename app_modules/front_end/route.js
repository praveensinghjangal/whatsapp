const express = require('express')
const router = express.Router()
const authMiddleware = require('../../middlewares/auth/authentication')
const authstrategy = require('../../config').authentication.strategy
// const authToken = require('../../middlewares/auth/tokenBasedAuth')

router.post('/addUpdateOptinMessageAndTemplate', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), require('./controllers/optinAndTemplate').post)
router.get('/addUpdateOptinMessageAndTemplate', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), require('./controllers/optinAndTemplate').get)

// api wrapper
router.get('/flow', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), require('./wrapper/chatAppWrapper').getMenuBasedTemplateList)
router.get('/flow/:flowTopicId', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), require('./wrapper/chatAppWrapper').getFlow)
router.get('/flow/categories', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), require('./wrapper/chatAppWrapper').getCategory)
router.delete('/flow/:flowTopicId', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), require('./wrapper/chatAppWrapper').deleteEntireFlow)
router.get('/flow/:flowTopicId/:identifierText', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), require('./wrapper/chatAppWrapper').getIdentifier)
router.post('/flow', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), require('./wrapper/chatAppWrapper').flow)
router.patch('/flow/:flowTopicId/active/:active', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), require('./wrapper/chatAppWrapper').activeTemplate)
router.patch('/flow/:flowTopicId/evaluate/:evaluationResponse', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), require('./wrapper/chatAppWrapper').evaluationResult)
router.delete('/flow/:flowTopicId/:identifierText', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), require('./wrapper/chatAppWrapper').deleteIdentifier)

// router.post('/helo-oss/upload', authToken, require('./wrapper/heloOssWrapper').uploadFile)
router.get('/helo-oss/:action/:fileName', require('./wrapper/heloOssWrapper').downloadFile)

module.exports = router
