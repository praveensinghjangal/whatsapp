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

// Service Provider
router.get('/serviceprovider', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), businessProfileController.getServiceProviderDetails)

// Business Profile
router.get('/profile', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), businessProfileController.getBusinessProfile)
router.post('/profile', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), businessProfileController.addUpdateBusinessProfile)
// router.post('/profile/phoneNumber', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), businessProfileController.updateWabaPhoneNumber)
router.post('/profile/accessInformation', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), businessProfileController.addupdateBusinessAccountInfo)
router.post('/profile/markManagerVerified', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), businessProfileController.markManagerVerified)
router.patch('/profile/serviceProvider', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), businessProfileController.updateServiceProviderDetails)
router.post('/profile/optinmessage', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), businessProfileController.addUpdateOptinMessage)
router.put('/profile/logo', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), businessProfileController.updateProfilePic)
// router.put('/profile/logo/url', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), businessProfileController.updateProfilePicByUrl)
router.put('/profile/submit', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), businessApprovalController.sendWabaAccessInfoForApproval)
router.put('/profile/status', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), businessStatusUpdateController.updateWabaAccessInfoStatus)
router.get('/profile/status', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), businessProfileController.getWabaProfileStatus)
router.get('/profile/template/allocate/:userId', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), businessProfileController.getCountTemplateAllocated)
router.patch('/profile/template/allocate', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), businessProfileController.allocateTemplatesToWaba)
router.get('/profile/info/:wabaId', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), businessProfileController.getProfileByWabaId)
router.get('/profile/:statusId', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), businessProfileController.getProfileListByStatusId)
router.post('/verification/phoneNumber', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), businessVerificationController.generateBusinessNumberVerificationCode)
router.patch('/verification/phoneNumber', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), businessVerificationController.validateBusinessNumberVerificationCode)
router.get('/internal/wabaPhoneNumber', tokenBasedAuth, require('./controllers/internalAPI').getWabaNumberFromUserId)
router.get('/internal/getUserIdAndApiKeyFromWabaNumber', tokenBasedAuth, require('./controllers/internalAPI').getUserIdAndApiKeyFromWabaNumber)
router.get('/internal/getServiceProviderDetailsByUserId', tokenBasedAuth, require('./controllers/internalAPI').getServiceProviderDetailsByUserId)
// router.get('/internal/wabaDataByPhoneNumber', tokenBasedAuth, require('./controllers/internalAPI').getWabaDataFromDb)

// router.get('/inttest', (req, res) => {
//   const Http = require('../integration/service/httpService')
//   const http = new Http(600, 5, 'vvvvvvv')
//   let token = ''
//   const headers = {
//     Authorization: 'Bearer Z2FsaXlhcmFkYW5pc2hAZ21haWwuY29tOlBhc3NAMTIz',
//     'Content-Type': 'application/json'
//   }
//   //   const wabaService = new integrationService.WabaAccount('f1d44200-4b9d-4901-ae49-5035e0b14a5d')
//   http.Post({ apiKey: '2c368a44-b214-410f-a66f-38cf634beb18' }, 'body', 'http://localhost:3000/helowhatsapp/api/users/authorize', headers, 'test')
//     .then(data => {
//       token = data.body.data.apiToken
//       const h2 = { Authorization: token }
//       return http.Get('http://localhost:3000/helowhatsapp/api/users/account', h2, 'test')
//     })
//     .then(data => res.send(data))
//     .catch(err => res.send(err))
// })

module.exports = router
