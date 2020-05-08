// todo : delete file
const express = require('express')
const router = express.Router()
const controller = require('./index')

router.get('/token', (req, res) => {
  controller.authToken.setToken()
    .then(data => res.send({ token: controller.authToken.getAuthToken() }))
    .catch(err => res.send(err))
})

router.get('/sendMessage', (req, res) => {
  const message = new controller.Messaage()
  message.sendMessage('4915792470000', '917666545750', { text: 'This is an example response' })
    .then(data => res.send(data))
    .catch(err => res.send(err))
})

module.exports = router
