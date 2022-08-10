const express = require('express')
const router = express.Router()
const authMiddleware = require('../../../middlewares/auth/authentication')
const masterData = require('../facebook/controllers/masterDataOperation')
const authstrategy = require('../../../config').authentication.strategy
const apiHitsAllowedMiddleware = require('../../../middlewares/apiHitsAllowed')

router.post('/addUpdate', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, masterData.addUpdateMasterData)
router.get('/getFacebookMasterData', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), apiHitsAllowedMiddleware, masterData.getMasterDataById)
module.exports = router
