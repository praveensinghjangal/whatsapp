const express = require('express')
const router = express.Router()
const apiHitsAllowedMiddleware = require('../../middlewares/apiHitsAllowed')
const internalSessionOrTokenAuth = require('../../middlewares/auth/internalSessionOrTokenAuth')

router.get('/campaignsummaryreport', internalSessionOrTokenAuth, apiHitsAllowedMiddleware, require('./controllers/messageReports').campaignSummaryReport)
router.get('/deliveryreport', internalSessionOrTokenAuth, apiHitsAllowedMiddleware, require('./controllers/messageReports').deliveryReport)
router.get('/templatesummaryreport', internalSessionOrTokenAuth, apiHitsAllowedMiddleware, require('./controllers/messageReports').templateSummaryReport)
router.get('/userSummaryReport', internalSessionOrTokenAuth, apiHitsAllowedMiddleware, require('./controllers/messageReports').usserWiseSummaryReport)
module.exports = router
