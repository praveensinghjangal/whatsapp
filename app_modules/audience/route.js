const express = require('express')
const router = express.Router()
const authMiddleware = require('../../middlewares/authentication')
const authstrategy = require('../../config').authentication.strategy

// Controller require section

const addUpdateAudienceController = require('./controllers/addUpdateAudience')
const bulkAudienceDataUploadController = require('./controllers/uploadAudienceInBulk')
const fetchAudienceDataController = require('./controllers/fetchAudienceData')
const fetchOptinUrlController = require('./controllers/fetchOptinUrl')
const redirectToOptinUrlController = require('./controllers/redirectToOptinUrl')

// Segment Controller

const fetchSegmentController = require('./controllers/fetchSegment')
const addUpdateSegmentController = require('./controllers/addUpdateSegment')

// Optin Controller

const fetchOptinController = require('./controllers/fetchOptinSourceMaster')
const addUpdateOptinController = require('./controllers/addUpdateOptinSourceMaster')

// Routes

// Audience
router.post('/', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), addUpdateAudienceController.addUpdateAudienceData)
router.post('/optin', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), addUpdateAudienceController.markOptinByPhoneNumberAndAddOptinSource)
router.patch('/optout', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), addUpdateAudienceController.markOptOutByPhoneNumber)

// Fetch Audience Data
router.get('/:audienceId', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), fetchAudienceDataController.getAudienceRecordById)
router.get('/', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), fetchAudienceDataController.getAudienceRecordList)

// Segment
router.post('/optin/segment', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), addUpdateSegmentController.addUpdateSegmentData)
router.get('/optin/segment', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), fetchSegmentController.getSegmentData)

// Optin
router.post('/optin/source', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), addUpdateOptinController.addUpdateOptinSourceData)
router.get('/optin/source', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), fetchOptinController.getOptinSourceData)
router.patch('/optin/excel', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), bulkAudienceDataUploadController.uploadAudienceData)
router.get('/optin/url', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), fetchOptinUrlController.getOptinUrl)
router.get('/optin/url/redirect/:wabaNumber', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), redirectToOptinUrlController.redirectToOptinUrl)

module.exports = router
