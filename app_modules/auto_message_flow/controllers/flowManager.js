const q = require('q')
const request = require('request')
const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const __config = require('../../../config')
const ValidatonService = require('../services/validation')
const MessageHandler = require('../services/messageHandler')
const EventHandler = require('../services/eventHandler')

const sendMessage = (from, to, whatsappBody) => {
  const apiCalled = q.defer()
  const apiReqBody = {
    to: to,
    channels: [
      'whatsapp'
    ],
    whatsapp: whatsappBody
  }
  apiReqBody.whatsapp.from = from
  // console.log('apiiiiiiiiiiiiiiiiiiiiiiiiii', apiReqBody)
  const url = __config.base_url + __constants.INTERNAL_END_POINTS.sendMessageToQueue
  __logger.info('sendMessageToQueueExcel :: callSendToQueueApi formattedBody>>>>>>>>>>>>>>>>>>>>>>>>', apiReqBody)
  const options = {
    url,
    body: [apiReqBody],
    headers: { Authorization: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InVzZXJfaWQiOiIxNTg5ODg2ODA4MTQ5MTIiLCJwcm92aWRlcklkIjoiZjFkNDQyMDAtNGI5ZC00OTAxLWFlNDktNTAzNWUwYjE0YTVkIiwid2FiYVBob25lTnVtYmVyIjoiOTE4MDgwODAwODA4Iiwic2lnbmF0dXJlIjoiOGEyYTY5NTgtOTRjMC00NzNjLWIyNzktMGVhZTMyNTg5ZjVlIn0sImlhdCI6MTU5NjcyODA2MywiZXhwIjoxNTk5MzIwMDYzfQ.ida2FwQyZWJmdeW3VwbyPV7zy28khA1jgjOnekGCe0c' },
    json: true
  }
  // Calling another api for sending messages
  request.post(options, (err, httpResponse, body) => {
    if (err) {
      return apiCalled.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
    }
    return apiCalled.resolve(body)
  })
  return apiCalled.promise
}

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
    .then(messageData => sendMessage(req.body.to, req.body.from, messageData))
    .then(data => __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: data }))
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

module.exports = flowManager
