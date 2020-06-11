const express = require('express')
const router = express.Router()
const authMiddleware = require('../../middlewares/authentication')
const authstrategy = require('../../config').authentication.strategy

// Controller require section
const fetchTemplatesController = require('./controllers/fetchTemplates')
const templatesLibraryController = require('./controllers/templateLibrary')
const templatesCategoryController = require('./controllers/category')
const templatesLanguageController = require('./controllers/language')
const templatesCountController = require('./controllers/count')
const addUpdateTemplateController = require('./controllers/addUpdateTemplates')

// Routes
// Template Type
router.get('/types', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), fetchTemplatesController.getTemplateTypes)

// Template Category
router.get('/categories', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), templatesCategoryController.getTemplateCategories)

// Template Language
router.get('/languages', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), templatesLanguageController.getTemplateLanguages)

// Template Count
router.get('/count', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), templatesCountController.getTemplateCount)

// Template Library
router.get('/sample', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), templatesLibraryController.getSampleTemplateList)
router.get('/sample/:id', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), templatesLibraryController.getSampleTemplateInfo)

// Fetch Templates
router.post('/', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), addUpdateTemplateController.addUpdateTemplates)
router.get('/:templateId', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), fetchTemplatesController.getTemplateInfo)
router.get('/', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), fetchTemplatesController.getTemplateList)

module.exports = router
