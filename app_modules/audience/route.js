const express = require('express')
const router = express.Router()
const authMiddleware = require('../../middlewares/auth/authentication')
const authstrategy = require('../../config').authentication.strategy
const tokenBasedAuth = require('../../middlewares/auth/tokenBasedAuth')
const apiHitsAllowedMiddleware = require('../../middlewares/apiHitsAllowed')

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

// Waba Controller
const addUpdateWabaNoMapping = require('./controllers/addUpdateWabaNoMapping')

// Routes

// Audience
router.post('/', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, addUpdateAudienceController.addUpdateAudienceData)
router.post('/optin', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, addUpdateAudienceController.markOptinByPhoneNumberAndAddOptinSource)
router.patch('/optout', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, addUpdateAudienceController.markOptOutByPhoneNumber)

// Fetch Audience Data
router.get('/:audienceId', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, fetchAudienceDataController.getAudienceRecordById)
router.get('/', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, fetchAudienceDataController.getAudienceRecordList)

// Segment
router.post('/optin/segment', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, addUpdateSegmentController.addUpdateSegmentData)
router.get('/optin/segment', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, fetchSegmentController.getSegmentData)

// Optin
router.post('/optin/source', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, addUpdateOptinController.addUpdateOptinSourceData)
router.get('/optin/source', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, fetchOptinController.getOptinSourceData)
router.patch('/optin/excel', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, bulkAudienceDataUploadController.uploadAudienceData)
router.patch('/optin/excel/streams', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, bulkAudienceDataUploadController.uploadAudienceDataUsingStreams)
router.get('/optin/url', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, fetchOptinUrlController.getOptinUrl)
router.get('/optin/url/redirect/:wabaNumber', redirectToOptinUrlController.redirectToOptinUrl)

// Waba
router.post('/internal/waba', tokenBasedAuth, addUpdateWabaNoMapping.addUpdateWabaNoMapping)

module.exports = router
