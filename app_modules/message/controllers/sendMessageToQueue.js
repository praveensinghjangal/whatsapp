const q = require('q')
const _ = require('lodash')
const ValidatonService = require('../services/validation')
const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const config = require('../../../config')
const rabbitmqHeloWhatsapp = require('../../../lib/db').rabbitmqHeloWhatsapp
const UniqueId = require('../../../lib/util/uniqueIdGenerator')
const TemplateParamValidationService = require('../../templates/services/paramValidation')
const rejectionHandler = require('../../../lib/util/rejectionHandler')
const __db = require('../../../lib/db')
const __logger = require('../../../lib/logger')
const templateParamValidationService = new TemplateParamValidationService()

const checkIfNoExists = number => {
  const exists = q.defer()
  __db.redis.get(number)
    .then(data => {
      console.log('datatat', data)
      if (data) {
        return exists.resolve({ type: __constants.RESPONSE_MESSAGES.WABA_NO_VALID, data: {} })
      } else {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.WABA_NO_INVALID, err: {}, data: {} })
      }
    })
    .catch(err => exists.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err }))
  return exists.promise
}

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

const singleRuleCheck = (data, index) => {
  const isValid = q.defer()
  if (data && data.whatsapp) {
    checkIfNoExists(data.whatsapp.from)
      .then(noValRes => templateParamValidationService.checkIfParamsEqual(data.whatsapp.template, data.whatsapp.from))
      .then(tempValRes => isValid.resolve({ valid: true, data: {} }))
      .catch(err => {
        err = err || {}
        err.position = index
        isValid.reject({ valid: false, err })
      })
  } else {
    isValid.resolve({ valid: false, err: { type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: {}, position: index } })
  }
  return isValid.promise
}

const ruleCheck = data => {
  let p = q()
  const thePromises = []
  data.forEach((singleObject, index) => {
    p = p.then(() => singleRuleCheck(singleObject, index))
      .catch(err => err)
    thePromises.push(p)
  })
  return q.all(thePromises)
}

const controller = (req, res) => {
  __logger.info('sendMessageToQueue :: API to send message called')
  const validate = new ValidatonService()
  if (!req.user.providerId) return __util.send(res, { type: __constants.RESPONSE_MESSAGES.NOT_AUTHORIZED, data: {} })
  validate.sendMessageToQueue(req.body)
    .then(valRes => ruleCheck(req.body))
    .then(isValid => {
      __logger.info('sendMessageToQueue :: Rules checked', isValid, req.body.length)
      const invalidReq = _.filter(isValid, { valid: false })
      if (invalidReq.length > 0) {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: _.map(invalidReq, 'err') })
      } else {
        return sendToQueueBulk(req.body, req.user.providerId)
      }
    })
    .then(sendToQueueRes => {
      __logger.info('sendMessageToQueue :: message sentt to queue', sendToQueueRes)
      __util.send(res, { type: __constants.RESPONSE_MESSAGES.ACCEPTED, data: sendToQueueRes })
    })
    .catch(err => {
      __logger.error('sendMessageToQueue :: error', err)
      __util.send(res, { type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
    })
}

module.exports = controller
