const __logger = require('../../../lib/logger')
const __util = require('../../../lib/util')
const __db = require('../../../lib/db')
const __constants = require('../../../config/constants')
const q = require('q')

module.exports = (req, res) => {
  sendToQueue(req.body, req.params)
    .then(data => __util.send(res, { type: __constants.RESPONSE_MESSAGES.ACCEPTED, data: {} }))
    .catch(err => __util.send(res, { type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err }))
}

const sendToQueue = (data, wabaNumber) => {
  __logger.info('sendToTyntecQueue', Object.keys(data))
  const messageRouted = q.defer()
  const statusCheck = Object.keys(data)
  if (statusCheck.indexOf('contacts') !== -1) {
    data.contacts.push(wabaNumber)
    __db.rabbitmqHeloWhatsapp.sendToQueue(__constants.MQ.fbIncoming, JSON.stringify(data))
      .then(queueResponse => {
        messageRouted.resolve(true)
      })
      .catch(err => messageRouted.reject(err))
  } else {
    data.statuses.push(wabaNumber)
    __db.rabbitmqHeloWhatsapp.sendToQueue(__constants.MQ.fbMessageStatus, JSON.stringify(data))
      .then(queueResponse => messageRouted.resolve(true))
      .catch(err => messageRouted.reject(err))
  }
  return messageRouted.promise
}
