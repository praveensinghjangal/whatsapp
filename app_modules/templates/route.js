const express = require('express')
const router = express.Router()
const authMiddleware = require('../../middlewares/authentication')
const authstrategy = require('../../config').authentication.strategy
// const userConfiMiddleware = require('../../middlewares/setUserConfig')

// Controller require section
const fetchTemplatesController = require('./controllers/fetchTemplates')

// Routes
// Fetch Templates
router.get('/', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), fetchTemplatesController.getTemplateList)
router.get('/:templateId', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), fetchTemplatesController.getTemplateInfo)

module.exports = router
