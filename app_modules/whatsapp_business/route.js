const express = require('express')
const authMiddleware = require('../../middlewares/auth/authentication')
const authstrategy = require('../../config').authentication.strategy
const tokenBasedAuth = require('../../middlewares/auth/tokenBasedAuth')
const router = express.Router()
const apiHitsAllowedMiddleware = require('../../middlewares/apiHitsAllowed')

// Controller require section
const businessCategoryController = require('./controllers/category')
const businessProfileController = require('./controllers/profile')
const businessVerificationController = require('./controllers/verification')
const businessApprovalController = require('./controllers/senForApproval')
const businessStatusUpdateController = require('./controllers/updateWabaAccessInfoStatus')

// Routes
// Business Category
router.get('/categories', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, businessCategoryController.getBusinessCategory)

// Service Provider
router.get('/serviceprovider', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, businessProfileController.getServiceProviderDetails)

// Business Profile
router.get('/profile', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, businessProfileController.getBusinessProfile)
router.post('/profile', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, businessProfileController.addUpdateBusinessProfile)
// router.post('/profile/phoneNumber', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options),apiHitsAllowedMiddleware, businessProfileController.updateWabaPhoneNumber)
router.post('/profile/accessInformation', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, businessProfileController.addupdateBusinessAccountInfo)
router.post('/profile/markManagerVerified', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, businessProfileController.markManagerVerified)
router.patch('/profile/serviceProvider', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, businessProfileController.updateServiceProviderDetails)
router.post('/profile/optinmessage', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, businessProfileController.addUpdateOptinMessage)
router.put('/profile/logo', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, businessProfileController.updateProfilePic)
// router.put('/profile/logo/url', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options),apiHitsAllowedMiddleware, businessProfileController.updateProfilePicByUrl)
router.put('/profile/submit', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, businessApprovalController.sendWabaAccessInfoForApproval)
router.put('/profile/status', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, businessStatusUpdateController.updateWabaAccessInfoStatus)
router.get('/profile/status', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, businessProfileController.getWabaProfileStatus)
router.get('/profile/template/allocate/:userId', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, businessProfileController.getCountTemplateAllocated)
router.patch('/profile/configure', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, businessProfileController.addUpdateWabaConfiguration)
router.get('/profile/info/:wabaId', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, businessProfileController.getProfileByWabaId)
router.get('/profile/list', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, businessProfileController.getProfileListByStatusId)
router.post('/verification/phoneNumber', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, businessVerificationController.generateBusinessNumberVerificationCode)
router.patch('/verification/phoneNumber', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, businessVerificationController.validateBusinessNumberVerificationCode)
router.get('/internal/wabaPhoneNumber', tokenBasedAuth, require('./controllers/internalAPI').getWabaNumberFromUserId)
router.get('/internal/getUserIdAndApiKeyFromWabaNumber', tokenBasedAuth, require('./controllers/internalAPI').getUserIdAndApiKeyFromWabaNumber)
router.get('/internal/getServiceProviderDetailsByUserId', tokenBasedAuth, require('./controllers/internalAPI').getServiceProviderDetailsByUserId)
router.patch('/profile/chatbot', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, businessProfileController.toggleChatbot)
// router.get('/internal/wabaDataByPhoneNumber', tokenBasedAuth, require('./controllers/internalAPI').getWabaDataFromDb)
router.get('/activity/status/count', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, require('./controllers/count').getWabaAccountActiveInactiveCount)
router.get('/status/count', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, require('./controllers/count').getWabaStatusCount)

module.exports = router
