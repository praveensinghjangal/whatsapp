const express = require('express')
const router = express.Router()

router.post('/login', require('./controllers/login'))
router.post('/signUp', require('./controllers/signUp'))

module.exports = router
