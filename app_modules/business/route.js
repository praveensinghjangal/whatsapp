const express = require('express')
const authMiddleware = require('../../middlewares/authentication')
const authstrategy = require('../../config').authentication.strategy
const router = express.Router()

// Controller require section

const businessCategoryController = require('./controllers/businessCategory')

// Routes

// Business Category
router.get('/categories', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), businessCategoryController.getBusinessCategory)

module.exports = router
