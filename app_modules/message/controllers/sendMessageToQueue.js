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
// const rejectionHandler = require('../../../lib/util/rejectionHandler')
const __logger = require('../../../lib/logger')
const templateParamValidationService = new TemplateParamValidationService()
const MessageHistoryService = require('../services/dbData')
const RedirectService = require('../../integration/service/redirectService')
const RedisService = require('../../../lib/redis_service/redisService')
const qalllib = require('qalllib')
const __db = require('../../../lib/db')
const queryProvider = require('../queryProvider')
const errorToTelegram = require('./../../../lib/errorHandlingMechanism/sendToTelegram')
const phoneCodeAndPhoneSeprator = require('../../../lib/util/phoneCodeAndPhoneSeprator')
/**
 * @namespace -WhatsApp-Message-Controller-SendMessage-
 * @description API’s related to whatsapp message.
 */

// function to get bulk templates from redis and if not in redis then from DB
const getBulkTemplates = async (messages, wabaPhoneNumber) => {
  const bulkTemplateCheck = q.defer()
  const templateIdArr = []
  const map = new Map()
  for (const item of messages) { // loop to pluck unique template id from message aaray to serch
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
  const uniqueTemplateIdAndNotInGlobal = [] // not in redis arr so that it can be queryed in db
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
    console.log('only redissssssssssssssss')
    bulkTemplateCheck.resolve(templateDataObj)
    return bulkTemplateCheck.promise
  }
  const onlyTemplateId = uniqueTemplateIdAndNotInGlobal.map(templateIdArr => templateIdArr.templateId)
  __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.setTemplatesInRedisForWabaPhoneNumber(), [phoneCodeAndPhoneSeprator(wabaPhoneNumber).phoneNumber, onlyTemplateId])
    .then(dbData => {
      _.each(dbData, singleObj => {
        if (singleObj && singleObj.message_template_id) { // block to push template data in templateDataObj and redis
          const dataObject = {
            templateId: singleObj.message_template_id,
            headerParamCount: singleObj.header_text ? (singleObj.header_text.match(/{{\d{1,2}}}/g) || []).length : 0,
            bodyParamCount: singleObj.body_text ? (singleObj.body_text.match(/{{\d{1,2}}}/g) || []).length : 0,
            footerParamCount: singleObj.footer_text ? (singleObj.footer_text.match(/{{\d{1,2}}}/g) || []).length : 0,
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
      const telegramErrorMessage = 'sendMessageToQueue ~ getBulkTemplates function ~ error in getBulkTemplates while sending message'
      errorToTelegram.send(err, telegramErrorMessage)
      return bulkTemplateCheck.reject(err)
    })
  return bulkTemplateCheck.promise
}

// function to send webhook to user for message status
const saveAndSendMessageStatus = (payload) => {
  const statusSent = q.defer()
  const redirectService = new RedirectService()
  const statusData = {
    messageId: payload.messageId,
    deliveryChannel: __constants.DELIVERY_CHANNEL.whatsapp,
    statusTime: moment.utc().format('YYYY-MM-DDTHH:mm:ss'),
    state: __constants.MESSAGE_STATUS.preProcess,
    from: payload.to,
    to: payload.whatsapp.from,
    customOne: payload.whatsapp.customOne || null,
    customTwo: payload.whatsapp.customTwo || null,
    customThree: payload.whatsapp.customThree || null,
    customFour: payload.whatsapp.customFour || null
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
    .catch(err => {
      exists.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
    })
  return exists.promise
}

const sendToQueue = (data, providerId, userId, maxTpsToProvider, headers) => {
  const messageSent = q.defer()
  data.authToken = headers.authorization
  data.vivaReqId = headers.vivaReqId
  const queueData = {
    config: config.provider_config[providerId],
    payload: data
  }
  queueData.config.userId = userId
  queueData.config.maxTpsToProvider = maxTpsToProvider
  // const planPriority = data && data.redisData && data.redisData.planPriority ? data.redisData.planPriority : null
  // let queueObj = __constants.MQ.process_message
  // if (data && data.isCampaign) {
  //   queueObj = __constants.MQ.process_message_campaign
  // }
  // rabbitmqHeloWhatsapp.sendToQueue(queueObj, JSON.stringify(queueData), planPriority)
  //   .then(queueResponse =>
  saveAndSendMessageStatus(data)
    .then(messagStatusResponse => messageSent.resolve({ messageId: data.messageId, to: data.to, acceptedAt: new Date(), apiReqId: headers.vivaReqId, customOne: data.whatsapp.customOne, customTwo: data.whatsapp.customTwo, customThree: data.whatsapp.customThree, customFour: data.whatsapp.customFour, queueData }))
    .catch(err => {
      const telegramErrorMessage = 'sendMessageToQueue ~ sendToQueue function ~ error in sendToQueue and saveAndSendMessageStatus '
      errorToTelegram.send(err, telegramErrorMessage)
      messageSent.reject(err)
    })
  return messageSent.promise
}

const sendToQueueBulk = (data, providerId, userId, maxTpsToProvider, headers) => { // function to push to queue in bulk
  const sendSingleMessage = q.defer()
  qalllib.qASyncWithBatch(sendToQueue, data, __constants.BATCH_SIZE_FOR_SEND_TO_QUEUE, providerId, userId, maxTpsToProvider, headers)
    .then(data => sendSingleMessage.resolve([...data.resolve, ...data.reject]))
    .catch(function (error) {
      const telegramErrorMessage = 'sendMessageToQueue ~ sendToQueueBulk function ~ error in sendToQueueBulk'
      errorToTelegram.send(error, telegramErrorMessage)
      return sendSingleMessage.reject(error)
    })
    .done()
  return sendSingleMessage.promise
}

const singleRuleCheck = (data, wabaPhoneNumber, redisData, userRedisData) => {
  const processSingleMessage = q.defer()
  __logger.info('Inside singleRuleCheck :: sendMessageToQueue :: API to send message called')
  if (data.whatsapp.from !== wabaPhoneNumber) { // comparing api req number(data.whatsapp.from) with number fetched from jwt token(wabaPhoneNumber)
    const modifiedRejectPromise = { ...__constants.RESPONSE_MESSAGES.WABA_PHONE_NUM_NOT_EXISTS }

    delete modifiedRejectPromise.status_code
    modifiedRejectPromise.message = modifiedRejectPromise.message + ' from :- ' + data.whatsapp.from + ' wabaNumber :- ' + wabaPhoneNumber
    processSingleMessage.reject(modifiedRejectPromise)
    return processSingleMessage.promise
  }
  templateParamValidationService.checkIfParamsEqual(data.whatsapp.template, data.whatsapp.from, redisData)
    .then(tempValRes => {
      const uniqueId = new UniqueId()
      data.redisData = userRedisData.data.redisData || null
      data.messageId = `${uniqueId.uuid()}-${Buffer.from(`${moment().utc().format('YYMMDD')}`).toString('base64') || ''}`
      data.date = moment().utc().format('YYMMDD')
      return processSingleMessage.resolve(data)
    })
    .catch(err => {
      if (err && err.type) {
        if (err.type.status_code) delete err.type.status_code
        return processSingleMessage.reject(err.type)
      }
      const telegramErrorMessage = 'sendMessageToQueue ~ singleRuleCheck function ~ error in checkIfParamsEqual function'
      errorToTelegram.send(err, telegramErrorMessage)
      return processSingleMessage.reject(err)
    }
    )
  return processSingleMessage.promise
}

// function to check various rules like waba num and template variable params etc
const ruleCheck = (body, wabaPhoneNumber, redisData, userRedisData) => {
  const sendSingleMessage = q.defer()

  qalllib.qASyncWithBatch(singleRuleCheck, body, __constants.BATCH_SIZE_FOR_SEND_TO_QUEUE, wabaPhoneNumber, redisData, userRedisData)
    .then(data => sendSingleMessage.resolve(data))
    .catch(function (error) {
      const telegramErrorMessage = 'sendMessageToQueue ~ ruleCheck function ~ error in qASyncWithBatch function'
      errorToTelegram.send(error, telegramErrorMessage)
      return sendSingleMessage.reject(error)
    })
    .done()
  return sendSingleMessage.promise
}

const getTemplateCategory = (wabaPhoneNumber, templateId) => {
  const messageSent = q.defer()
  __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getTemplateCategoryId(), [phoneCodeAndPhoneSeprator(wabaPhoneNumber).phoneNumber, templateId])
    .then((data) => {
      console.log('insisisisisisdeeeee data', data)
      if (data.length > 0) {
        messageSent.resolve({ categoryId: data[0].message_template_category_id })
      } else {
        messageSent.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: ['Invalid template id'] })
      }
    })
    .catch((err) => {
      console.log('errorrrrr', err)
      messageSent.reject(err)
    })

  return messageSent.promise
}

/**
 * @memberof -WhatsApp-Message-Controller-SendMessage-
 * @name SendMessageInQueue
 * @path {POST} /chat/v1/messages
 * @description Bussiness Logic :- This API is used to send mesages on whatsapp. This API can send single as well as bulk messsages. There are total 3 routes in top of this controller - one for single message which has tps of 500 another for bulk message max 500 messages per call with tps of 1 and one for internal call with same input as bulk but without tps for internal use among helo products and platforms. tps is managed on router layer
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
  __logger.info('sendMessageToQueue :: API to send message called', req.body)
  const validate = new ValidatonService()
  const messageHistoryService = new MessageHistoryService()
  const rejected = []
  let sendToQueueRes
  let finalObjToBeSent
  let userRedisData
  let templateCategory = ''
  // block where we check if req is coming from /single url then data type should be json obj & not arr
  if (req.userConfig.routeUrl[req.userConfig.routeUrl.length - 1] === __constants.SINGLE) {
    if (Array.isArray(req.body)) {
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, data: {}, err: ['instance is not of a type(s) object'] })
    } else if (typeof req.body === 'object' && !Array.isArray(req.body) && req.body !== null) {
      req.body = [req.body]
    }
  }
  if (!req.user.providerId || !req.user.wabaPhoneNumber) return __util.send(res, { type: __constants.RESPONSE_MESSAGES.NOT_AUTHORIZED, data: {} })
  validate.sendMessageToQueue(req.body)
    .then(data => {
      if (data && data[0] && !data[0].isCampaign && !data[0].isChatBot && data[0].whatsapp && data[0].whatsapp.contentType === 'template') {
        // all templates have same templateId => already validated above
        // it shoud neither be isCampaign nor isChatBot
        // check the category of the template
        return getTemplateCategory(data[0].whatsapp.from, data[0].whatsapp.template.templateId)
      }
      return true
    })
    .then(data => {
      if (data && data.categoryId) {
        // data.categoryId = '37f8ac07-a370-4163-b713-854db656cd1b' // promotional
        // message is a template
        switch (data.categoryId) {
          case __constants.FB_CATEGORY_TO_VIVA_CATEGORY.OTP:
            templateCategory = 'category_otp'
            break
          case __constants.FB_CATEGORY_TO_VIVA_CATEGORY.TRANSACTIONAL:
            templateCategory = 'category_transactional'
            break
          case __constants.FB_CATEGORY_TO_VIVA_CATEGORY.PROMOTIONAL:
            templateCategory = 'category_promotional'
            break
          default:
            templateCategory = 'general'
        }
      }
      return checkIfNoExists(req.body[0].whatsapp.from, req.user.wabaPhoneNumber || null)
    })
    .then(data => {
      userRedisData = data
      return getBulkTemplates(req.body, req.user.wabaPhoneNumber)
    })
    .then(redisData => ruleCheck(req.body, req.user.wabaPhoneNumber, redisData, userRedisData))
    .then(processedMessages => {
      if (processedMessages && processedMessages.reject && processedMessages.reject.length > 0) {
        rejected.push(...processedMessages.reject)
      }
      if (processedMessages && processedMessages.resolve && processedMessages.resolve.length === 0) {
        return null
      } else { // when message is not rejected in rule check
        const uniqueId = new UniqueId()
        const msgInsertData = []
        const mongoBulkObject = []
        _.each(processedMessages.resolve, (singleMessage, i) => { // creating status arr for bulk insert
          msgInsertData.push([singleMessage.messageId, null, req.user.providerId, __constants.DELIVERY_CHANNEL.whatsapp, moment.utc().format('YYYY-MM-DDTHH:mm:ss'), __constants.MESSAGE_STATUS.preProcess, singleMessage.to, singleMessage.whatsapp.from, '[]', singleMessage.whatsapp.customOne || null, singleMessage.whatsapp.customTwo || null, singleMessage.whatsapp.customThree || null, singleMessage.whatsapp.customFour || null])
          mongoBulkObject.push({
            messageId: singleMessage.messageId,
            serviceProviderMessageId: null,
            serviceProviderId: req.user.providerId,
            deliveryChannel: __constants.DELIVERY_CHANNEL.whatsapp,
            senderPhoneNumber: singleMessage.to,
            wabaPhoneNumber: singleMessage.whatsapp.from,
            customOne: singleMessage.whatsapp.customOne || null,
            customTwo: singleMessage.whatsapp.customTwo || null,
            customThree: singleMessage.whatsapp.customThree || null,
            customFour: singleMessage.whatsapp.customFour || null,
            currentStatus: __constants.MESSAGE_STATUS.preProcess,
            currentStatusTime: new Date(),
            createdOn: new Date(),
            status: [
              {
                senderPhoneNumber: singleMessage.to,
                eventType: __constants.MESSAGE_STATUS.preProcess,
                eventId: uniqueId.uuid(),
                messageId: singleMessage.messageId,
                sendTime: new Date()
              }
            ]
          })
        })
        return messageHistoryService.addMessageHistoryDataInBulk(msgInsertData, processedMessages.resolve, false, mongoBulkObject)
      }
    })
    .then(msgAdded => {
      if (!msgAdded) return []
      return sendToQueueBulk(msgAdded, req.user.providerId, req.user.user_id, req.user.maxTpsToProvider, req.headers)
    })
    .then(res => {
      sendToQueueRes = res
      console.log('=================== final final LAst final')
      __logger.info('sendMessageToQueue :: message sentt to queue then 3', { sendToQueueRes })
      if (rejected && rejected.length > 0 && (!sendToQueueRes || sendToQueueRes.length === 0)) {
        return false
      } else {
        finalObjToBeSent = {
          config: sendToQueueRes[0].queueData.config
        }
        const payloadArray = []
        sendToQueueRes = sendToQueueRes.map(resData => {
          payloadArray.push(resData.queueData.payload)
          delete resData.queueData
          return resData
        })
        finalObjToBeSent.payload = payloadArray
        const planPriority = payloadArray && payloadArray[0] && payloadArray[0].redisData.planPriority ? payloadArray[0].redisData.planPriority : null
        // let queueObj = __constants.MQ.pre_process_message
        let queueObj = __constants.MQ.pre_process_message_general
        if (payloadArray[0] && payloadArray[0].isCampaign) {
          queueObj = __constants.MQ.pre_process_message_campaign
        } else if (payloadArray[0] && payloadArray[0].isChatBot) {
          queueObj = __constants.MQ.pre_process_message_chatbot
        } else {
          if (!templateCategory) {
            templateCategory = 'general'
          }
          queueObj = __constants.MQ[`pre_process_message_${templateCategory}`]
        }
        return rabbitmqHeloWhatsapp.sendToQueue(queueObj, JSON.stringify(finalObjToBeSent), planPriority)
      }
    })
    .then(data => {
      if (data === false) {
        // data is false
        __util.send(res, { type: __constants.RESPONSE_MESSAGES.FAILED, data: [...rejected] })
      } else {
        // success
        __util.send(res, { type: __constants.RESPONSE_MESSAGES.ACCEPTED, data: [...sendToQueueRes, ...rejected] })
      }
    })
    .catch(err => {
      console.log('send message ctrl error : ', err)
      const telegramErrorMessage = 'sendMessageToQueue ~ controller function ~ error in main function'
      errorToTelegram.send(err, telegramErrorMessage)
      if (err && err.type && err.type.code && err.type.code === 3021) {
        delete err.type.status_code
        __util.send(res, { type: __constants.RESPONSE_MESSAGES.FAILED, data: [err.type] })
      } else {
        __util.send(res, { type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      }
    })
}

module.exports = controller
