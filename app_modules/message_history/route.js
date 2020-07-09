const express = require('express')
const router = express.Router()
const authMiddleware = require('../../middlewares/authentication')
const authstrategy = require('../../config').authentication.strategy

// Controller require section

const addMessageHistoryController = require('./controllers/addMessageHistory')
const fetchMessageHistoryController = require('./controllers/fetchMessageHistory')

// Routes

// Message History
router.post('/', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), addMessageHistoryController.addMessageHistoryData)

// Fetch Message History Data
router.get('/:messageId', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), fetchMessageHistoryController.getMessageHistoryRecordById)

module.exports = router
