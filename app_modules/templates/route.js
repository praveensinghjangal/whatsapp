const express = require('express')
const router = express.Router()
const authMiddleware = require('../../middlewares/authentication')
const authstrategy = require('../../config').authentication.strategy
// const userConfiMiddleware = require('../../middlewares/setUserConfig')

// Controller require section
const fetchTemplatesController = require('./controllers/fetchTemplates')
const templatesCategoryController = require('./controllers/category')
const templatesLanguageController = require('./controllers/language')
const templatesCountController = require('./controllers/count')

// Routes
// Template Type
router.get('/types', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), fetchTemplatesController.getTemplateTypes)

// Template Category
router.get('/categories', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), templatesCategoryController.getTemplateCategories)

// Template Language
router.get('/languages', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), templatesLanguageController.getTemplateLanguages)

// Template Count
router.get('/count', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), templatesCountController.getTemplateCount)

// Fetch Templates
router.get('/', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), fetchTemplatesController.getTemplateList)
router.get('/:templateId', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), fetchTemplatesController.getTemplateInfo)

module.exports = router
