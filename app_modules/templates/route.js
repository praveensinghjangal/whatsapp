const express = require('express')
const router = express.Router()
const authMiddleware = require('../../middlewares/auth/authentication')
const authstrategy = require('../../config').authentication.strategy

// Controller require section
const fetchTemplatesController = require('./controllers/fetchTemplates')
const templatesLibraryController = require('./controllers/templateLibrary')
const templatesCategoryController = require('./controllers/category')
const templatesLanguageController = require('./controllers/language')
const templatesCountController = require('./controllers/count')
const addUpdateTemplateController = require('./controllers/addUpdateTemplates')
const deleteTemplateController = require('./controllers/deleteTemplate')

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
router.get('/sample/:id', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), templatesLibraryController.getSampleTemplateInfo)
router.get('/sample', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), templatesLibraryController.getSampleTemplateList)

// Fetch Templates
router.get('/inttest', (req, res) => {
  const integrationService = require('../../app_modules/integration')
  const templateService = new integrationService.Template('f1d44200-4b9d-4901-ae49-5035e0b14a5d')
  templateService.addTemplate(req.body, req.headers.wabanumber)
  // const RuleEngine = require('./services/ruleEngine')
  // const ruleEngine = new RuleEngine()
  // ruleEngine.addTemplate(req.body)
  // const DataMapper = require('../integration/tyntec/dataMapper')
  // const dataMapper = new DataMapper()
  // dataMapper.addTemplate(req.body)
    .then(data => res.send(data))
    .catch(err => res.send(err))
})
router.post('/', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), addUpdateTemplateController.addUpdateTemplates)
router.get('/headerType', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), fetchTemplatesController.getTemplateHeaderTypes)
router.get('/buttonType', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), fetchTemplatesController.getTemplateButtonTypes)
router.get('/:templateId', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), fetchTemplatesController.getTemplateInfo)
router.patch('/:templateId/status', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), require('./controllers/status').updateTemplateStatus)
router.delete('/:templateId', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), deleteTemplateController.deleteTemplate)
router.get('/', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), fetchTemplatesController.getTemplateList)

module.exports = router
