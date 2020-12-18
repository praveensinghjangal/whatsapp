const express = require('express')
const authMiddleware = require('../../middlewares/auth/authentication')
const authstrategy = require('../../config').authentication.strategy
const tokenBasedAuth = require('../../middlewares/auth/tokenBasedAuth')
const router = express.Router()
// const userConfiMiddleware = require('../../middlewares/setUserConfig')

// Controller require section
const businessCategoryController = require('./controllers/category')
const businessProfileController = require('./controllers/profile')
const businessVerificationController = require('./controllers/verification')
const businessApprovalController = require('./controllers/senForApproval')
const businessStatusUpdateController = require('./controllers/updateWabaAccessInfoStatus')

// Routes
// Business Category
router.get('/categories', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), businessCategoryController.getBusinessCategory)

// Business Profile
router.get('/profile', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), businessProfileController.getBusinessProfile)
router.post('/profile', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), businessProfileController.addUpdateBusinessProfile)
// router.post('/profile/phoneNumber', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), businessProfileController.updateWabaPhoneNumber)
router.post('/profile/accessInformation', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), businessProfileController.addupdateBusinessAccountInfo)
router.post('/profile/markManagerVerified', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), businessProfileController.markManagerVerified)
router.put('/profile/serviceProvider', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), businessProfileController.updateServiceProviderId)
router.post('/profile/optinmessage', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), businessProfileController.addUpdateOptinMessage)
router.put('/profile/logo', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), businessProfileController.updateProfilePic)
// router.put('/profile/logo/url', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), businessProfileController.updateProfilePicByUrl)
router.put('/profile/submit', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), businessApprovalController.sendWabaAccessInfoForApproval)
router.put('/profile/status', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), businessStatusUpdateController.updateWabaAccessInfoStatus)
router.patch('/profile/template/allocate', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), businessProfileController.allocateTemplatesToWaba)
router.post('/verification/phoneNumber', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), businessVerificationController.generateBusinessNumberVerificationCode)
router.patch('/verification/phoneNumber', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), businessVerificationController.validateBusinessNumberVerificationCode)
router.get('/internal/wabaPhoneNumber', tokenBasedAuth, require('./controllers/internalAPI').getWabaNumberFromUserId)
router.get('/internal/getUserIdAndApiKeyFromWabaNumber', tokenBasedAuth, require('./controllers/internalAPI').getUserIdAndApiKeyFromWabaNumber)
// router.get('/internal/wabaDataByPhoneNumber', tokenBasedAuth, require('./controllers/internalAPI').getWabaDataFromDb)

// router.get('/inttest', (req, res) => {
//   const integrationService = require('../../app_modules/integration')
//   const wabaService = new integrationService.WabaAccount('f1d44200-4b9d-4901-ae49-5035e0b14a5d')
//   wabaService.setWebhook(req.body.wabaNumber, req.body.incomingMessageUrl, req.body.statusUrl)
//     .then(data => res.send(data))
//     .catch(err => res.send(err))
// })

module.exports = router
