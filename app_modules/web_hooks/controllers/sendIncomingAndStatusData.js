const __logger = require('../../../lib/logger')
const __util = require('../../../lib/util')
const __db = require('../../../lib/db')
const __constants = require('../../../config/constants')
const q = require('q')

const sendToQueue = (data, wabaNumber) => {
  __logger.info('sendToTyntecQueue', data,wabaNumber)
  const messageRouted = q.defer()
  data.wabaNumber = wabaNumber || 0
    __db.rabbitmqHeloWhatsapp.sendToQueue(data && data.contacts && data.messages ? __constants.MQ.fbIncoming : __constants.MQ.fbMessageStatus, JSON.stringify(data)) //todo : add check for status and if not status data then push to 3rd arbitrary queue
      .then(queueResponse => messageRouted.resolve(true))
      .catch(err => messageRouted.reject(err))
  
  return messageRouted.promise
}

module.exports = (req, res) => {
  sendToQueue(req.body, req.params.wabanumber)
    .then(data => __util.send(res, { type: __constants.RESPONSE_MESSAGES.ACCEPTED, data: {} }))
    .catch(err => __util.send(res, { type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err }))
}

