const express = require('express')
const router = express.Router()
const authMiddleware = require('../../middlewares/auth/authentication')
const authstrategy = require('../../config').authentication.strategy

router.post('/addUpdateOptinMessageAndTemplate', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), require('./controllers/optinAndTemplate').post)
router.get('/addUpdateOptinMessageAndTemplate', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), require('./controllers/optinAndTemplate').get)

// api wrapper
router.get('/flow/templates', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), require('./wrapper/chatAppWrapper').getMenuBasedTemplateList)
router.get('/flow/:flowTopicId', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), require('./wrapper/chatAppWrapper').getFlow)
router.get('/flow/:flowTopicId/:identifierText', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), require('./wrapper/chatAppWrapper').getIdentifier)
router.get('/flow/categories', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), require('./wrapper/chatAppWrapper').getCategory)
router.post('/flow', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), require('./wrapper/chatAppWrapper').flow)
router.delete('/flow/:flowTopicId', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), require('./wrapper/chatAppWrapper').deleteEntireFlow)
router.delete('/flow/:flowTopicId/:identifierText', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), require('./wrapper/chatAppWrapper').deleteIdentifier)

module.exports = router
