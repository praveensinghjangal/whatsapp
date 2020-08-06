const express = require('express')
const router = express.Router()

router.post('/flow', require('./controllers/flowManager'))

module.exports = router
