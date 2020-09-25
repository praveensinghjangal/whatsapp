const express = require('express')
const authMiddleware = require('../../middlewares/auth/authentication')
const authstrategy = require('../../config').authentication.strategy
const router = express.Router()

// Controller require section

const placesController = require('./controllers/places')

// Routes

// Places
router.get('/countries', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), placesController.getAllCountries)
router.get('/countries/:countryId/states', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), placesController.getStatesOfCountry)
router.get('/states/:stateId/cities', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), placesController.getCitiesOfState)

module.exports = router
