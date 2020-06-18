const q = require('q')
const ValidatonService = require('../services/validation')
const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const rabbitmqHeloWhatsapp = require('../../../lib/db').rabbitmqHeloWhatsapp
const UniqueId = require('../../../lib/util/uniqueIdGenerator')

const sendToQueue = data => {
  const messageSent = q.defer()
  const uniqueId = new UniqueId()
  data.messageId = uniqueId.uuid()
  rabbitmqHeloWhatsapp.sendToQueue(__constants.MQ.process_message, JSON.stringify(data))
    .then(queueResponse => messageSent.resolve({ messageId: data.messageId, acceptedAt: new Date() }))
    .catch(err => messageSent.reject(err))
  return messageSent.promise
}

const sendToQueueBulk = data => {
  let p = q()
  const thePromises = []
  data.forEach(singleObject => {
    p = p.then(() => sendToQueue(singleObject))
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
  req.jwtToken = { providerId: 111 } // todo: replace with actual jwt data
  validate.sendMessageToQueue(req.body)
    .then(valRes => ruleCheck(req.body))
    .then(isValid => sendToQueueBulk(req.body))
    .then(sendToQueueRes => __util.send(res, { type: __constants.RESPONSE_MESSAGES.ACCEPTED, data: sendToQueueRes }))
    .catch(err => __util.send(res, { type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err }))
}

module.exports = controller
// todo : store req res selected data, logs, integrate session auth
