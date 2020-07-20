const express = require('express')
const router = express.Router()
const authMiddleware = require('../../middlewares/authentication')
const authstrategy = require('../../config').authentication.strategy

// Controller require section

const addUpdateAudienceController = require('./controllers/addUpdateAudience')
const fetchAudienceDataController = require('./controllers/fetchAudienceData')

// Segment Controller

const fetchSegmentController = require('./controllers/fetchSegment')
const addUpdateSegmentController = require('./controllers/addUpdateSegment')

// Routes

// Audience
router.post('/', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), addUpdateAudienceController.addUpdateAudienceData)

// Fetch Audience Data
router.get('/:audienceId', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), fetchAudienceDataController.getAudienceRecordById)
router.get('/', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), fetchAudienceDataController.getAudienceRecordList)

// Optin
router.post('/optin/segment', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), addUpdateSegmentController.addUpdateSegmentData)
router.get('/optin/segment', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), fetchSegmentController.getSegmentData)

module.exports = router
