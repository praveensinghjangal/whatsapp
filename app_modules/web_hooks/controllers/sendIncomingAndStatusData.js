const __logger = require('../../../lib/logger')
const __util = require('../../../lib/util')
const __db = require('../../../lib/db')
const __constants = require('../../../config/constants')
const q = require('q')

const sendToQueue = (data, wabaNumber) => {
  __logger.info('sendIncomingAndStatusData: sendToQueue(' + wabaNumber + '): Fb incoming data:', data)
  const messageRouted = q.defer()
  data.wabaNumber = wabaNumber || 0
  __logger.info('sendIncomingAndStatusData: sendToQueue(' + wabaNumber + '): Msg-from-fb: sending to:', data && data.contacts && data.messages ? __constants.MQ.fbIncoming.q_name : __constants.MQ.fbMessageStatus.q_name)
  __db.rabbitmqHeloWhatsapp.sendToQueue(data && data.contacts && data.messages ? __constants.MQ.fbIncoming : __constants.MQ.fbMessageStatus, JSON.stringify(data)) // todo : add check for status and if not status data then push to 3rd arbitrary queue
    .then(queueResponse => {
      __logger.info('sendIncomingAndStatusData: sendToQueue(' + wabaNumber + '): Pushed data to queue: ', data && data.contacts && data.messages ? __constants.MQ.fbIncoming : __constants.MQ.fbMessageStatus)
      messageRouted.resolve(true)
    })
    .catch(err => {
      __logger.error('sendIncomingAndStatusData: sendToQueue(' + wabaNumber + '): Error while sendToQueue()', err.stack ? err.stack : err)
      messageRouted.reject(err)
    })

  return messageRouted.promise
}

module.exports = (req, res) => {
  sendToQueue(req.body, req.params.wabanumber)
    .then(data => __util.send(res, { type: __constants.RESPONSE_MESSAGES.ACCEPTED, data: {} }))
    .catch(err => __util.send(res, { type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err }))
}
