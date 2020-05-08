// todo : delete file
const express = require('express')
const router = express.Router()
const controller = require('./index')

router.get('/sendMessage', (req, res) => {
  const messageClass = new controller.Messaage(req.query.providerId)
  console.log('hey')
  messageClass.sendMessage('4915792470000', '917666545750', { text: 'This is an example response' })
    .then(data => res.send(data))
    .catch(err => res.send(err))
})

module.exports = router
