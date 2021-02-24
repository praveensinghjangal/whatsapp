const express = require('express')
const router = express.Router()
const authMiddleware = require('../../middlewares/auth/authentication')
const endUserConfigMiddleware = require('../../middlewares/setUserConfig').setEndUserConfig
const authstrategy = require('../../config').authentication.strategy
const apiHitsAllowedMiddleware = require('../../middlewares/apiHitsAllowed')

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

// Template Library
router.get('/sample/:id', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, templatesLibraryController.getSampleTemplateInfo)
router.get('/sample', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, templatesLibraryController.getSampleTemplateList)

// Template list by statusId & status list
router.get('/status', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), templateStatusController.getTemplateStatusList)
router.get('/list/:templateStatusId', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), templateStatusController.getTemplateListByStatusId)

router.post('/', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), addUpdateTemplateController.addUpdateTemplates)
router.get('/headerType', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), fetchTemplatesController.getTemplateHeaderTypes)
router.get('/buttonType', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), fetchTemplatesController.getTemplateButtonTypes)
router.get('/:templateId', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), fetchTemplatesController.getTemplateInfo)
router.get('/:userId/:templateId', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), fetchTemplatesController.getTemplateInfoByUserIdAndTemplateId)
router.get('/:templateId/validate', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), require('./controllers/checkTemplateRulesByTemplateId'))
router.post('/:templateId/submit', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), templateApprovalController.sendTemplateForApproval)
router.patch('/:templateId/submit/:evaluationResponse', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), endUserConfigMiddleware, templateApprovalController.sendTemplateForEvaluaion)
router.patch('/:templateId/status', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), require('./controllers/status').updateTemplateStatus)
router.delete('/:templateId', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), deleteTemplateController.deleteTemplate)
router.get('/', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), fetchTemplatesController.getTemplateList)

// router.delete('/:templateId', (req, res) => {
//   __logger.info('Delete Template Called', req.headers)
//   __logger.info('Delete Template Called', req.headers.wabaphonenumber)
//   __logger.info('Delete Template Called', req.headers.templateid)
//   const integrationService = require('../../app_modules/integration')
//   const templateService = new integrationService.Template('f1d44200-4b9d-4901-ae49-5035e0b14a5d')
//   templateService.deleteTemplate(req.headers.wabaphonenumber, req.headers.templateid)
//     .then(data => res.send(data))
//     .catch(err => res.send(err))
// })
router.get('/status', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, templateStatusController.getTemplateStatusList)
router.get('/list/:templateStatusId', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, templateStatusController.getTemplateListByStatusId)

router.post('/', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, addUpdateTemplateController.addUpdateTemplates)
router.get('/headerType', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, fetchTemplatesController.getTemplateHeaderTypes)
router.get('/buttonType', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, fetchTemplatesController.getTemplateButtonTypes)
router.get('/:templateId', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, fetchTemplatesController.getTemplateInfo)
router.get('/:userId/:templateId', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, fetchTemplatesController.getTemplateInfoByUserIdAndTemplateId)
router.get('/:templateId/validate', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, require('./controllers/checkTemplateRulesByTemplateId'))
router.post('/:templateId/submit', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, templateApprovalController.sendTemplateForApproval)
router.patch('/:templateId/submit/:evaluationResponse', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, templateApprovalController.sendTemplateForEvaluaion)
router.patch('/:templateId/status', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, require('./controllers/status').updateTemplateStatus)
router.delete('/:templateId', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, deleteTemplateController.deleteTemplate)
router.get('/', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, fetchTemplatesController.getTemplateList)

module.exports = router
