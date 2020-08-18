const q = require('q')
const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const ValidatonService = require('../services/validation')
const MessageHandler = require('../services/messageHandler')
const EventHandler = require('../services/eventHandler')
const TransactionHandler = require('../services/transactionHandler')
const sendMessage = require('../services/sendMessage')

const nonTranactionalFlow = (reqBody) => {
  const messageData = q.defer()
  const messageHandler = new MessageHandler()
  const eventHandler = new EventHandler()
  messageHandler.getMessageEventAndEventData(reqBody)
    .then(eventDetails => {
      const func = __constants.FLOW_MESSAGE_DB_EVENTS_TO_CODE_EVENTS[eventDetails.eventName] || 'noEvent'
      return eventHandler[func](eventDetails.eventData)
    })
    .then(msgdat => messageData.resolve(msgdat))
    .catch(err => messageData.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err }))
  return messageData.promise
}

const flowManager = (req, res) => {
  __logger.info('Flow Manager API called', req.body)
  const validate = new ValidatonService()

  const transactionHandler = new TransactionHandler()
  validate.flowManager(req.body)
    .then(data => transactionHandler.handle(req.body))
    .then(transDat => {
      if (transDat.nonTransactionalFlow) {
        return nonTranactionalFlow(req.body)
      } else {
        return transDat
      }
    })
    .then(messageData => sendMessage(req.body.to, req.body.from, messageData))
    .then(data => __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: data }))
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

module.exports = flowManager
