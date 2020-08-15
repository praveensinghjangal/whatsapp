const q = require('q')
const _ = require('lodash')
const moment = require('moment')
const ValidatonService = require('../services/validation')
const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const __config = require('../../../config')
const config = require('../../../config')
const rabbitmqHeloWhatsapp = require('../../../lib/db').rabbitmqHeloWhatsapp
const UniqueId = require('../../../lib/util/uniqueIdGenerator')
const TemplateParamValidationService = require('../../templates/services/paramValidation')
const audienceFetchController = require('../../audience/controllers/fetchAudienceData')
const rejectionHandler = require('../../../lib/util/rejectionHandler')
const __logger = require('../../../lib/logger')
const templateParamValidationService = new TemplateParamValidationService()
const MessageHistoryService = require('../services/dbData')
const RedirectService = require('../../integration/service/redirectService')
const RedisService = require('../../../lib/redis_service/redisService')
const request = require('request')

const updateAudience = (audienceNumber, audOptin, wabaNumber) => {
  const audUpdated = q.defer()
  const url = __config.base_url + __constants.INTERNAL_END_POINTS.addupdateAudience
  const audienceDataToBePosted = [{
    phoneNumber: audienceNumber,
    channel: __constants.DELIVERY_CHANNEL.whatsapp,
    optinSourceId: __config.optinSource.direct,
    optin: audOptin,
    wabaPhoneNumber: wabaNumber
  }]
  const options = {
    url,
    body: audienceDataToBePosted,
    headers: { Authorization: __config.internalApiCallToken },
    json: true
  }
  // console.log('all options', options)
  request.post(options, (err, httpResponse, body) => {
    // console.log('aud update response', body)
    if (err) {
      audUpdated.reject(err)
    } else {
      audUpdated.resolve(true)
    }
  })
  return audUpdated.promise
}

const saveAndSendMessageStatus = (payload, serviceProviderId) => {
  const statusSent = q.defer()
  const messageHistoryService = new MessageHistoryService()
  const redirectService = new RedirectService()
  const statusData = {
    messageId: payload.messageId,
    serviceProviderId: serviceProviderId,
    deliveryChannel: __constants.DELIVERY_CHANNEL.whatsapp,
    statusTime: moment.utc().format('YYYY-MM-DDTHH:mm:ss'),
    state: __constants.MESSAGE_STATUS.inProcess,
    endConsumerNumber: payload.to,
    businessNumber: payload.whatsapp.from
  }
  messageHistoryService.addMessageHistoryDataService(statusData)
    .then(statusDataAdded => {
      statusData.to = statusData.businessNumber
      statusData.from = statusData.endConsumerNumber
      delete statusData.serviceProviderId
      delete statusData.businessNumber
      delete statusData.endConsumerNumber
      return redirectService.webhookPost(statusData.to, statusData)
    })
    .then(data => statusSent.resolve(data))
    .catch(err => statusSent.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err }))
  return statusSent.promise
}

const checkOptinStaus = (endUserPhoneNumber, templateObj, isOptin, wabaNumber) => {
  // console.log('hererereererrerere', endUserPhoneNumber, templateObj, isOptin)
  const canSendMessage = q.defer()
  if (isOptin && templateObj) {
    updateAudience(endUserPhoneNumber, true, wabaNumber)
    canSendMessage.resolve(true)
  } else {
    audienceFetchController.getOptinStatusByPhoneNumber(endUserPhoneNumber, wabaNumber)
      .then(data => {
        if (data.tempOptin) {
          canSendMessage.resolve(true)
        } else if (data.optin && templateObj) {
          canSendMessage.resolve(true)
        } else {
          canSendMessage.reject({ type: __constants.RESPONSE_MESSAGES.CANNOT_SEND_MESSAGE, err: {}, data: {} })
        }
      })
      .catch(err => canSendMessage.reject(err))
    return canSendMessage.promise
  }
}

const checkIfNoExists = number => {
  const exists = q.defer()
  const redisService = new RedisService()
  redisService.getWabaDataByPhoneNumber(number)
    .then(data => {
      // console.log('datatat', data)
      exists.resolve({ type: __constants.RESPONSE_MESSAGES.WABA_NO_VALID, data: { redisData: data } })
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
  const planPriority = data.redisData.planPriority
  delete data.redisData
  rabbitmqHeloWhatsapp.sendToQueue(__constants.MQ.process_message, JSON.stringify(queueData), planPriority)
    .then(queueResponse => saveAndSendMessageStatus(data, providerId))
    .then(messagStatusResponse => messageSent.resolve({ messageId: data.messageId, acceptedAt: new Date() }))
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

const singleRuleCheck = (data, wabaPhoneNumber, index) => {
  const isValid = q.defer()
  if (data && data.whatsapp) {
    if (data.whatsapp.from !== wabaPhoneNumber) {
      isValid.reject({ valid: false, err: { type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: {}, position: index } })
      return isValid.promise
    }
    checkIfNoExists(data.whatsapp.from)
      .then(noValRes => {
        data.redisData = noValRes.data.redisData || {}
        return checkOptinStaus(data.to, data.whatsapp.template, data.isOptin, data.whatsapp.from)
      })
      .then(canSendMessage => templateParamValidationService.checkIfParamsEqual(data.whatsapp.template, data.whatsapp.from))
      .then(tempValRes => isValid.resolve({ valid: true, data: {} }))
      .catch(err => {
        err = err || {}
        err.position = index
        err.code = err.type.code || 0
        err.message = err.type.message || ''
        delete err.err
        delete err.type
        isValid.reject({ valid: false, err })
      })
  } else {
    isValid.resolve({ valid: false, err: { type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: {}, position: index } })
  }
  return isValid.promise
}

const ruleCheck = (data, wabaPhoneNumber) => {
  let p = q()
  const thePromises = []
  data.forEach((singleObject, index) => {
    p = p.then(() => singleRuleCheck(singleObject, wabaPhoneNumber, index))
      .catch(err => err)
    thePromises.push(p)
  })
  return q.all(thePromises)
}

const controller = (req, res) => {
  __logger.info('sendMessageToQueue :: API to send message called')
  const validate = new ValidatonService()
  if (!req.user.providerId || !req.user.wabaPhoneNumber) return __util.send(res, { type: __constants.RESPONSE_MESSAGES.NOT_AUTHORIZED, data: {} })
  validate.sendMessageToQueue(req.body)
    .then(valRes => ruleCheck(req.body, req.user.wabaPhoneNumber))
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
      // __logger.info('sendMessageToQueue :: message sentt to queue', sendToQueueRes)
      __util.send(res, { type: __constants.RESPONSE_MESSAGES.ACCEPTED, data: sendToQueueRes })
    })
    .catch(err => {
      __logger.error('sendMessageToQueue :: error', err)
      __util.send(res, { type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
    })
}

module.exports = controller
