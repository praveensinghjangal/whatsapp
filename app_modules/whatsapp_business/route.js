const express = require('express')
const authMiddleware = require('../../middlewares/authentication')
const authstrategy = require('../../config').authentication.strategy
const router = express.Router()

// Controller require section

const businessCategoryController = require('./controllers/category')
const businessProfileController = require('./controllers/profile')

// Routes

// Business Category
router.get('/categories', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), businessCategoryController.getBusinessCategory)

// Business Profile
router.get('/profile', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), businessProfileController.getBusinessProfile)
router.put('/profileVerification', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), businessProfileController.updateBusinessProfileVerificationStatus)

module.exports = router
