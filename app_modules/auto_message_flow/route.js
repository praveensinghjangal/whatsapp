const express = require('express')
const router = express.Router()
const tokenBasedAuth = require('../../middlewares/tokenBasedAuth')
const authMiddleware = require('../../middlewares/authentication')
const authstrategy = require('../../config').authentication.strategy

router.post('/chat', tokenBasedAuth, require('./controllers/flowManager'))
router.post('/flow', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), require('./controllers/addUpdateFlow'))
router.get('/flow/types', authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options), require('./controllers/getEventTypes'))

module.exports = router
