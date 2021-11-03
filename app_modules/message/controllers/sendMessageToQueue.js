const q = require('q')
const _ = require('lodash')
const moment = require('moment')
const ValidatonService = require('../services/validation')
const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const config = require('../../../config')
const rabbitmqHeloWhatsapp = require('../../../lib/db').rabbitmqHeloWhatsapp
const UniqueId = require('../../../lib/util/uniqueIdGenerator')
const TemplateParamValidationService = require('../../templates/services/paramValidation')
const rejectionHandler = require('../../../lib/util/rejectionHandler')
const __logger = require('../../../lib/logger')
const templateParamValidationService = new TemplateParamValidationService()
const MessageHistoryService = require('../services/dbData')
const RedirectService = require('../../integration/service/redirectService')
const RedisService = require('../../../lib/redis_service/redisService')
const qalllib = require('qalllib')
const __db = require('../../../lib/db')
const queryProvider = require('../queryProvider')

/**
 * @namespace -WhatsApp-Message-Controller-SendMessage-
 * @description API’s related to whatsapp message.
 */

const getBulkTemplates = async (messages, wabaPhoneNumber) => {
  const bulkTemplateCheck = q.defer()
  const templateIdArr = []
  const map = new Map()
  for (const item of messages) {
    if (item.whatsapp && item.whatsapp.template && item.whatsapp.template.templateId) {
      if (!map.has(item.whatsapp.template.templateId)) {
        map.set(item.whatsapp.template.templateId, true)
        templateIdArr.push({
          from: item.whatsapp.from,
          templateId: item.whatsapp.template.templateId
        })
      }
    }
  }
  const uniqueTemplateIdAndNotInGlobal = []
  const templateDataObj = {}
  for (let i = 0; i < templateIdArr.length; i++) {
    const templateData = await __db.redis.get(templateIdArr[i].templateId + '___' + templateIdArr[i].from)
    if (!templateData) {
      uniqueTemplateIdAndNotInGlobal.push(templateIdArr[i])
    } else {
      templateDataObj[templateIdArr[i].templateId] = JSON.parse(templateData)
    }
  }
  if (uniqueTemplateIdAndNotInGlobal.length === 0) {
    bulkTemplateCheck.resolve(templateDataObj)
    return bulkTemplateCheck.promise
  }
  const onlyTemplateId = uniqueTemplateIdAndNotInGlobal.map(templateIdArr => templateIdArr.templateId)
  __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.setTemplatesInRedisForWabaPhoneNumber(), [wabaPhoneNumber.substring(2), onlyTemplateId])
    .then(result => {
      if (result && result.length === 0) {
        const returnObj = JSON.parse(JSON.stringify(__constants.RESPONSE_MESSAGES.TEMPLATE_NOT_FOUND))
        return rejectionHandler({ type: returnObj, err: {} })
      } else {
        return result
      }
    })
    .then(dbData => {
      _.each(dbData, singleObj => {
        if (singleObj.message_template_id) {
          const dataObject = {
            templateId: singleObj.message_template_id,
            headerParamCount: singleObj.header_text ? (singleObj.header_text.match(/{{\d}}/g) || []).length : 0,
            bodyParamCount: singleObj.body_text ? (singleObj.body_text.match(/{{\d}}/g) || []).length : 0,
            footerParamCount: singleObj.footer_text ? (singleObj.footer_text.match(/{{\d}}/g) || []).length : 0,
            phoneNumber: singleObj.phone_number
          }
          dataObject.approvedLanguages = []
          if (singleObj.first_localization_status === __constants.TEMPLATE_APPROVE_STATUS) dataObject.approvedLanguages.push(singleObj.first_language_code)
          if (singleObj.second_localization_status === __constants.TEMPLATE_APPROVE_STATUS) dataObject.approvedLanguages.push(singleObj.second_language_code)
          if (singleObj.header_type && singleObj.header_type !== 'text') dataObject.headerParamCount = dataObject.headerParamCount + 1
          templateDataObj[dataObject.templateId] = dataObject
          __db.redis.setex(dataObject.templateId + '___' + dataObject.phoneNumber, JSON.stringify(dataObject), __constants.REDIS_TTL.templateData)
        }
      })
      return bulkTemplateCheck.resolve(templateDataObj)
    })
    .catch(err => {
      if (err && err.type) {
        if (err.type.status_code) delete err.type.status_code
        return bulkTemplateCheck.resolve(err.type)
      }
      return bulkTemplateCheck.reject(err)
    })
  return bulkTemplateCheck.promise
}

const saveAndSendMessageStatus = (payload) => {
  const statusSent = q.defer()
  const redirectService = new RedirectService()
  const statusData = {
    messageId: payload.messageId,
    deliveryChannel: __constants.DELIVERY_CHANNEL.whatsapp,
    statusTime: moment.utc().format('YYYY-MM-DDTHH:mm:ss'),
    state: __constants.MESSAGE_STATUS.inProcess,
    from: payload.to,
    to: payload.whatsapp.from
  }
  redirectService.webhookPost(statusData.to, statusData)
    .then(data => statusSent.resolve(data))
    .catch(err => statusSent.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err }))
  return statusSent.promise
}

const checkIfNoExists = (number) => {
  const exists = q.defer()
  const redisService = new RedisService()
  redisService.getWabaDataByPhoneNumber(number)
    .then(data => {
      __logger.info('datatat', { data })
      exists.resolve({ type: __constants.RESPONSE_MESSAGES.WABA_NO_VALID, data: { redisData: data } })
    })
    .catch(err => exists.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err }))
  return exists.promise
}

const sendToQueue = (data, providerId, userId, maxTpsToProvider, headers) => {
  const messageSent = q.defer()
  __logger.info('inside sendToQueue')
  data.authToken = headers.authorization
  const queueData = {
    config: config.provider_config[providerId],
    payload: data
  }
  queueData.config.userId = userId
  queueData.config.maxTpsToProvider = maxTpsToProvider
  const planPriority = data && data.redisData && data.redisData.planPriority ? data.redisData.planPriority : null
  delete data.redisData
  rabbitmqHeloWhatsapp.sendToQueue(__constants.MQ.process_message, JSON.stringify(queueData), planPriority)
    .then(queueResponse => saveAndSendMessageStatus(data))
    .then(messagStatusResponse => messageSent.resolve({ messageId: data.messageId, to: data.to, acceptedAt: new Date(), apiReqId: headers.vivaReqId }))
    .catch(err => messageSent.reject(err))
  return messageSent.promise
}

const sendToQueueBulk = (data, providerId, userId, maxTpsToProvider, headers) => {
  const sendSingleMessage = q.defer()
  qalllib.qASyncWithBatch(sendToQueue, data, 250, providerId, userId, maxTpsToProvider, headers)
    .then(data => sendSingleMessage.resolve([...data.resolve, ...data.reject]))
    .catch(function (error) {
      return sendSingleMessage.reject(error)
    })
    .done()
  return sendSingleMessage.promise
}

const singleRuleCheck = (data, wabaPhoneNumber, redisData, userRedisData) => {
  const processSingleMessage = q.defer()
  __logger.info('Inside singleRuleCheck :: sendMessageToQueue :: API to send message called')
  if (data.whatsapp.from !== wabaPhoneNumber) {
    processSingleMessage.reject({ type: __constants.RESPONSE_MESSAGES.WABA_PHONE_NUM_NOT_EXISTS, err: {} })
    return processSingleMessage.promise
  }
  templateParamValidationService.checkIfParamsEqual(data.whatsapp.template, data.whatsapp.from, redisData)
    .then(tempValRes => {
      const uniqueId = new UniqueId()
      data.messageId = uniqueId.uuid()
      processSingleMessage.resolve(data)
    })
    .catch(err => {
      if (err && err.type) {
        if (err.type.status_code) delete err.type.status_code
        return processSingleMessage.reject(err.type)
      }
      return processSingleMessage.reject(err)
    }
    )
  return processSingleMessage.promise
}

const ruleCheck = (body, wabaPhoneNumber, redisData, userRedisData) => {
  const sendSingleMessage = q.defer()
  console.log('bodybodybodybodybody', body)
  console.log('redisDataredisDataredisData', redisData)

  qalllib.qASyncWithBatch(singleRuleCheck, body, 250, wabaPhoneNumber, redisData, userRedisData)
    .then(data => sendSingleMessage.resolve(data))
    .catch(function (error) {
      return sendSingleMessage.reject(error)
    })
    .done()
  return sendSingleMessage.promise
}

/**
 * @memberof -WhatsApp-Message-Controller-SendMessage-
 * @name SendMessageInQueue
 * @path {POST} /chat/v1/messages
 * @description Bussiness Logic :- This API is used to send mesages using a channel. This API can send single as well as bulk messsages.
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
 <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/message/send|SendMessageInQueue}
 * @body {Array}  Array0fJson - This below Object is a sample Object for request body <br/>[ { "to": "9112345", "channels": [ "whatsapp" ], "whatsapp": { "from": "9167890", "contentType": "location", "location": { "longitude": 7.4954884, "latitude": 51.5005765 } } }, { "to": "9112345", "channels": [ "whatsapp" ], "whatsapp": { "from": "9167890", "contentType": "template", "template": { "templateId": "welcome", "language": { "policy": "deterministic", "code": "en" }, "components": [ { "type": "header", "parameters": [ { "type": "text", "text": "Hi!" }, { "type": "media", "media": { "type": "document", "url": "http://www.africau.edu/images/default/sample.pdf" } } ] }, { "type": "body", "parameters": [ { "type": "text", "text": "Hi!" }, { "type": "media", "media": { "type": "document", "url": "http://www.africau.edu/images/default/sample.pdf" } } ] }, { "type": "footer", "parameters": [ { "type": "text", "text": "Hi!" }, { "type": "media", "media": { "type": "document", "url": "http://www.africau.edu/images/default/sample.pdf" } } ] } ] } } }, { "to": "9112345", "channels": [ "whatsapp" ], "whatsapp": { "from": "9167890", "contentType": "media", "media": { "type": "image", "url": "https://i.ibb.co/kXgjphY/925869358s.png", "caption": "viva connect" } } }, { "to": "9112345", "channels": [ "whatsapp" ], "whatsapp": { "from": "9167890", "contentType": "text", "text": "hello" } } ]
 * @response {string} ContentType=application/json - Response content type.
 * @response {array} metadata.data - It will return the object containing messageId and acceptedAt.
 * @code {200} if the msg is success than it Returns message ID.
 * @author Danish Galiyara 18th june, 2020
 * *** Last-Updated :- Arjun Bhole 23th October, 2020 ***
 */

const controller = (req, res) => {
  __logger.info('sendMessageToQueue :: API to send message called')
  const validate = new ValidatonService()
  const messageHistoryService = new MessageHistoryService()
  const rejected = []
  let redisData
  if (!req.user.providerId || !req.user.wabaPhoneNumber) return __util.send(res, { type: __constants.RESPONSE_MESSAGES.NOT_AUTHORIZED, data: {} })
  validate.sendMessageToQueue(req.body)
    .then(data => checkIfNoExists(req.body[0].whatsapp.from, req.user.wabaPhoneNumber || null))
    .then(data => {
      redisData = data
      getBulkTemplates(req.body, req.user.wabaPhoneNumber)
    })
    .then(valRes => ruleCheck(req.body, req.user.wabaPhoneNumber, valRes, redisData))
    .then(processedMessages => {
      if (processedMessages && processedMessages.reject && processedMessages.reject.length > 0) {
        rejected.push(...processedMessages.reject)
      }
      if (processedMessages && processedMessages.resolve && processedMessages.resolve.length === 0) {
        return null
      } else {
        return messageHistoryService.addMessageHistoryDataInBulk(processedMessages.resolve, req.user.providerId, req.body.userId, { vivaReqId: req.headers.vivaReqId })
      }
    })
    .then(msgAdded => {
      if (!msgAdded) return []
      return sendToQueueBulk(req.body, req.user.providerId, req.user.user_id, req.user.maxTpsToProvider, req.headers)
    })
    .then(sendToQueueRes => {
      __logger.info('sendMessageToQueue :: message sentt to queue then 3', { sendToQueueRes })
      __util.send(res, { type: __constants.RESPONSE_MESSAGES.ACCEPTED, data: [...sendToQueueRes, ...rejected] })
    })
    .catch(err => {
      console.log('send message ctrl error : ', err)
      __util.send(res, { type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
    })
}

module.exports = controller
