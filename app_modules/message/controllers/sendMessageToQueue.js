const q = require('q')
const ValidatonService = require('../services/validation')
const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const config = require('../../../config')
const rabbitmqHeloWhatsapp = require('../../../lib/db').rabbitmqHeloWhatsapp
const UniqueId = require('../../../lib/util/uniqueIdGenerator')

const sendToQueue = (data, providerId) => {
  const messageSent = q.defer()
  const uniqueId = new UniqueId()
  data.messageId = uniqueId.uuid()
  const queueData = {
    config: config.provider_config[providerId],
    payload: data
  }
  rabbitmqHeloWhatsapp.sendToQueue(__constants.MQ.process_message, JSON.stringify(queueData))
    .then(queueResponse => messageSent.resolve({ messageId: data.messageId, acceptedAt: new Date() }))
    .catch(err => messageSent.reject(err))
  return messageSent.promise
}

const sendToQueueBulk = (data, providerId) => {
  let p = q()
  const thePromises = []
  data.forEach(singleObject => {
    p = p.then(() => sendToQueue(singleObject, providerId))
      .catch(err => err)
    thePromises.push(p)
  })
  return q.all(thePromises)
}

const ruleCheck = data => {
  const isValid = q.defer()
  isValid.resolve(true)
  // does from number  belongs to waba
  return isValid.promise
}

const controller = (req, res) => {
  const validate = new ValidatonService()
  if (!req.user.providerId) return __util.send(res, { type: __constants.RESPONSE_MESSAGES.NOT_AUTHORIZED, data: {} })
  validate.sendMessageToQueue(req.body)
    .then(valRes => ruleCheck(req.body))
    .then(isValid => sendToQueueBulk(req.body, req.user.providerId))
    .then(sendToQueueRes => __util.send(res, { type: __constants.RESPONSE_MESSAGES.ACCEPTED, data: sendToQueueRes }))
    .catch(err => __util.send(res, { type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err }))
}

module.exports = controller
// todo : store req res selected data, logs, integrate session auth
