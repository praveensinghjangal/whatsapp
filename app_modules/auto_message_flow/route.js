const express = require('express')
const router = express.Router()
const tokenBasedAuth = require('../../middlewares/tokenBasedAuth')

router.post('/flow', tokenBasedAuth, require('./controllers/flowManager'))

module.exports = router
