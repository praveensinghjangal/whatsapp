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
const templateApprovalController = require('./controllers/templateApproval')
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
  // templateService.getTemplateList(req.headers.wabanumber)
  templateService.getTemplateInfo(req.headers.wabanumber, req.body.templateId)
    .then(data => res.send(data))
    .catch(err => res.send(err))
})
router.post('/', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), addUpdateTemplateController.addUpdateTemplates)
router.get('/headerType', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), fetchTemplatesController.getTemplateHeaderTypes)
router.get('/buttonType', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), fetchTemplatesController.getTemplateButtonTypes)
router.get('/:templateId', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), fetchTemplatesController.getTemplateInfo)
router.post('/:templateId/submit', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), templateApprovalController.sendTemplateForApproval)
router.patch('/:templateId/submit/:evaluationResponse', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), templateApprovalController.sendTemplateForEvaluaion)
router.patch('/:templateId/status', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), require('./controllers/status').updateTemplateStatus)
router.delete('/:templateId', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), deleteTemplateController.deleteTemplate)
router.get('/', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), fetchTemplatesController.getTemplateList)

router.delete('/:templateId', (req, res) => {
  console.log('Delete Template Called', req.headers)
  console.log('Delete Template Called', req.headers.wabaphonenumber)
  console.log('Delete Template Called', req.headers.templateid)
  const integrationService = require('../../app_modules/integration')
  const templateService = new integrationService.Template('f1d44200-4b9d-4901-ae49-5035e0b14a5d')
  templateService.deleteTemplate(req.headers.wabaphonenumber, req.headers.templateid)
    .then(data => res.send(data))
    .catch(err => res.send(err))
})

module.exports = router
