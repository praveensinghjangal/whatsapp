const express = require('express')
const router = express.Router()
const apiHitsAllowedMiddleware = require('../../middlewares/apiHitsAllowed')
const internalSessionOrTokenAuth = require('../../middlewares/auth/internalSessionOrTokenAuth')
router.get('/campaignsummaryreport', internalSessionOrTokenAuth, apiHitsAllowedMiddleware, require('./controllers/messageReports').campaignSummaryReport)
router.get('/deliveryreport', internalSessionOrTokenAuth, apiHitsAllowedMiddleware, require('./controllers/messageReports').deliveryReport)
router.get('/templatesummaryreport', internalSessionOrTokenAuth, apiHitsAllowedMiddleware, require('./controllers/messageReports').templateSummaryReport)
router.post('/userConversationReport', internalSessionOrTokenAuth, apiHitsAllowedMiddleware, require('./controllers/messageReports').userConversationReport)
router.get('/campaignsummary/download', internalSessionOrTokenAuth, apiHitsAllowedMiddleware, require('./controllers/messageReports').downloadCampaignSummary)
router.get('/templatesummary/download', internalSessionOrTokenAuth, apiHitsAllowedMiddleware, require('./controllers/messageReports').downloadTemplateSummary)
router.get('/userConversationReport/download', internalSessionOrTokenAuth, apiHitsAllowedMiddleware, require('./controllers/messageReports').downloadUserConversationReport)
router.get('/downloadDlrRequest', internalSessionOrTokenAuth, apiHitsAllowedMiddleware, require('./controllers/messageReports').downloadDlrRequest)
router.get('/getdownloadlist', internalSessionOrTokenAuth, apiHitsAllowedMiddleware, require('./controllers/messageReports').getdownloadlist)
router.get('/downloadDlr', internalSessionOrTokenAuth, apiHitsAllowedMiddleware, require('./controllers/messageReports').downloadDlr)
module.exports = router
