const express = require('express')
const router = express.Router()
const tokenBasedAuth = require('../../middlewares/tokenBasedAuth')

router.post('/chat', tokenBasedAuth, require('./controllers/flowManager'))
router.get('/flow', tokenBasedAuth, require('./controllers/fetchIdentifier'))

module.exports = router
