const __logger = require('../../../lib/logger')
const __util = require('../../../lib/util')
const __db = require('../../../lib/db')
const __constants = require('../../../config/constants')
const q = require('q')

module.exports = (req, res) => {
  sendToTyntecQueue(req.body)
    .then(data => __util.send(res, { type: __constants.RESPONSE_MESSAGES.ACCEPTED, data: {} }))
    .catch(err => __util.send(res, { type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err }))
}

const sendToTyntecQueue = (message) => {
  __logger.info('sendToTyntecQueue', message)
  const messageRouted = q.defer()
  __db.rabbitmqHeloWhatsapp.sendToQueue(__constants.MQ.tyntecIncoming, JSON.stringify(message))
    .then(queueResponse => messageRouted.resolve(true))
    .catch(err => messageRouted.reject(err))
  return messageRouted.promise
}
