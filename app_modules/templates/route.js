const express = require('express')
const router = express.Router()
const authMiddleware = require('../../middlewares/auth/authentication')
const authstrategy = require('../../config').authentication.strategy
const apiHitsAllowedMiddleware = require('../../middlewares/apiHitsAllowed')
const endUserConfigMiddleware = require('../../middlewares/setUserConfig').setEndUserConfig

// Controller require section
const fetchTemplatesController = require('./controllers/fetchTemplates')
const templatesLibraryController = require('./controllers/templateLibrary')
const templatesCategoryController = require('./controllers/category')
const templatesLanguageController = require('./controllers/language')
const templatesCountController = require('./controllers/count')
const addUpdateTemplateController = require('./controllers/addUpdateTemplates')
const templateApprovalController = require('./controllers/templateApproval')
const deleteTemplateController = require('./controllers/deleteTemplate')
const templateStatusController = require('./controllers/templateStatus')

// Routes
// Template Type
router.get('/types', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, fetchTemplatesController.getTemplateTypes)

// Template Category
router.get('/categories', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, templatesCategoryController.getTemplateCategories)

// Template Language
router.get('/languages', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, templatesLanguageController.getTemplateLanguages)

// Template Count
router.get('/count', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, templatesCountController.getTemplateCount)
router.get('/support/count', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, templatesCountController.getTemplateCountForSupport)

// Template Library
router.get('/sample/:id', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, templatesLibraryController.getSampleTemplateInfo)
router.get('/sample', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, templatesLibraryController.getSampleTemplateList)

// Template list by statusId & status list
router.get('/status', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, templateStatusController.getTemplateStatusList)
router.get('/list', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, templateStatusController.getAllTemplateWithStatus)

router.post('/', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, addUpdateTemplateController.addUpdateTemplates)
router.get('/headerType', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, fetchTemplatesController.getTemplateHeaderTypes)
router.get('/buttonType', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, fetchTemplatesController.getTemplateButtonTypes)
router.get('/:templateId', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, fetchTemplatesController.getTemplateInfo)
router.get('/:userId/:templateId', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, fetchTemplatesController.getTemplateInfoByUserIdAndTemplateId)
router.get('/:templateId/validate', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, require('./controllers/checkTemplateRulesByTemplateId'))
router.post('/:templateId/submit', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, templateApprovalController.sendTemplateForApproval)
router.patch('/:templateId/submit/:evaluationResponse', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, endUserConfigMiddleware, templateApprovalController.sendTemplateForEvaluaion)
router.patch('/:templateId/status', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, require('./controllers/status').updateTemplateStatus)
router.delete('/:templateId', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, deleteTemplateController.deleteTemplate)
router.get('/', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, fetchTemplatesController.getTemplateList)

module.exports = router
