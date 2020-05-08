const express = require('express')
const router = express.Router()

router.post('/send', require('./controllers/sendMessage'))

module.exports = router
