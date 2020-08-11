const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const ValidatonService = require('../services/validation')
const MessageHandler = require('../services/messageHandler')
const EventHandler = require('../services/eventHandler')
const sendMessageToConsumer = require('../services/consumerMessageSender')

const flowManager = (req, res) => {
  __logger.info('Flow Manager API called', req.body)
  const validate = new ValidatonService()
  const messageHandler = new MessageHandler()
  const eventHandler = new EventHandler()
  validate.flowManager(req.body)
    .then(data => messageHandler.getMessageEventAndEventData(req.body))
    .then(eventDetails => {
      const func = __constants.FLOW_MESSAGE_DB_EVENTS_TO_CODE_EVENTS[eventDetails.eventName] || 'noEvent'
      return eventHandler[func](eventDetails.eventData)
    })
    .then(messageData => sendMessageToConsumer(req.body.to, req.body.from, messageData))
    .then(data => __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: data }))
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

module.exports = flowManager
