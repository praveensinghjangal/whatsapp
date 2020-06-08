const express = require('express')
const router = express.Router()
const authMiddleware = require('../../middlewares/authentication')
const authstrategy = require('../../config').authentication.strategy

// Controller require section
const fetchTemplatesController = require('./controllers/fetchTemplates')
const templatesCategoryController = require('./controllers/category')
const templatesLanguageController = require('./controllers/language')
const templatesCountController = require('./controllers/count')
const addUpdateTemplateController = require('./controllers/addUpdateTemplates')
const setMasterInRedis = require('./services/setmaster')

// Routes
// Template Type
router.get('/types', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), fetchTemplatesController.getTemplateTypes)

// Template Category
router.get('/categories', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), templatesCategoryController.getTemplateCategories)

// Template Language
router.get('/languages', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), templatesLanguageController.getTemplateLanguages)

// Template Count
router.get('/count', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), templatesCountController.getTemplateCount)

// setMasterConfigInRedis
router.get('/refreshMasterInredis', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), setMasterInRedis)

// Fetch Templates
router.post('/', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), addUpdateTemplateController.addUpdateTemplates)
router.get('/', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), fetchTemplatesController.getTemplateList)
router.get('/:templateId', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), fetchTemplatesController.getTemplateInfo)

module.exports = router
