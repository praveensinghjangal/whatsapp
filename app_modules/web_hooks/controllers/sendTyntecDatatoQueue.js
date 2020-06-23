const WebHooks = require('../../integration').WebHooks
const webhooks = new WebHooks()
const __logger = require('../../../lib/logger')
const __util = require('../../../lib/util')
const __db = require('../../../lib/db')

const __constants = require('../../../config/constants')
const q = require('q')

module.exports = (req, res) => {
  webhooks.sendTyntecPayloadToQUeue(req.body)
    .then(data => sendToTyntecQueue(data))
    .then(data => __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: {} }))
    .catch(err => __util.send(res, { type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err }))
}

const sendToTyntecQueue = (message) => {
  __logger.info('sendToTyntecQueue', message)
  const messageRouted = q.defer()
  __db.init()
    .then(result => {
      const rmqObject = __db.rabbitmqHeloWhatsapp.fetchFromQueue()
      rmqObject.sendToQueue(__constants.MQ.tyntec, JSON.stringify(message))
    })
    .then(queueResponse => messageRouted.resolve('done!'))
    .catch(err => messageRouted.reject(err))
  return messageRouted.promise
}
