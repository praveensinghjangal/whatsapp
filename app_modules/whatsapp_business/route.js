const express = require('express')
const authMiddleware = require('../../middlewares/authentication')
const authstrategy = require('../../config').authentication.strategy
const tokenBasedAuth = require('../../middlewares/tokenBasedAuth')
const router = express.Router()

// Controller require section
const businessCategoryController = require('./controllers/category')
const businessProfileController = require('./controllers/profile')
const businessVerificationController = require('./controllers/verification')

// Routes
// Business Category
router.get('/categories', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), businessCategoryController.getBusinessCategory)

// Business Profile
router.get('/profile', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), businessProfileController.getBusinessProfile)
router.post('/profile', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), businessProfileController.addUpdateBusinessProfile)
router.post('/profile/accessInformation', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), businessProfileController.addupdateBusinessAccountInfo)
router.post('/profile/markManagerVerified', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), businessProfileController.markManagerVerified)
router.put('/profile/serviceProvider', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), businessProfileController.updateServiceProviderId)
router.post('/verification/phoneNumber', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), businessVerificationController.generateBusinessNumberVerificationCode)
router.patch('/verification/phoneNumber', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), businessVerificationController.validateBusinessNumberVerificationCode)
router.get('/internal/wabaPhoneNumber', tokenBasedAuth, require('./controllers/internalAPI').getWabaNumberFromUserId)

module.exports = router
