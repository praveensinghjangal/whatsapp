const express = require('express')
const authMiddleware = require('../../middlewares/auth/authentication')
const authstrategy = require('../../config').authentication.strategy
const router = express.Router()

// Controller require section

const plansController = require('./controllers/fetchPlan')

// Routes

// Plans
router.get('/', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), plansController.getAllPlans)

module.exports = router
