const moment = require('moment')
const __logger = require('../../lib/logger')
const __constants = require('../../config/constants')
const __config = require('../../config')
const __db = require('../../lib/db')
const q = require('q')
const MessageHistoryService = require('../../app_modules/message/services/dbData')
const RedirectService = require('../../app_modules/integration/service/redirectService')
// const AudienceService = require('./../../app_modules/audience/services/dbData')
const HttpService = require('../../lib/http_service')
// const integrationService = require('./../../app_modules/integration')
const audienceFetchController = require('../../app_modules/audience/controllers/fetchAudienceData')
const errorToTelegram = require('../../lib/errorHandlingMechanism/sendToTelegram')
const phoneCodeAndPhoneSeprator = require('../../lib/util/phoneCodeAndPhoneSeprator')

const saveAndSendMessageStatus = (payload, serviceProviderId, isSyncstatus, statusName = null) => {
  const statusSent = q.defer()
  const messageHistoryService = new MessageHistoryService()
  const redirectService = new RedirectService()
  const statusData = {
    messageId: payload.messageId,
    serviceProviderId: serviceProviderId,
    deliveryChannel: __constants.DELIVERY_CHANNEL.whatsapp,
    statusTime: moment.utc().format('YYYY-MM-DDTHH:mm:ss'),
    state: (isSyncstatus) ? __constants.MESSAGE_STATUS.pending : (statusName ? __constants.MESSAGE_STATUS[statusName] : __constants.MESSAGE_STATUS.resourceAllocated),
    endConsumerNumber: payload.to,
    countryName: phoneCodeAndPhoneSeprator(payload.to).countryName,
    businessNumber: payload.whatsapp.from,
    customOne: payload.whatsapp.customOne || null,
    customTwo: payload.whatsapp.customTwo || null,
    customThree: payload.whatsapp.customThree || null,
    customFour: payload.whatsapp.customFour || null,
    date: payload.date,
    campName: payload.whatsapp.campName || null
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

const callApiAndSendToQueue = (messageData, rmqObject, queue, mqData) => {
  const messageRouted = q.defer()
  __logger.info('inside callApiAndSendToQueue', { messageData, queue })
  const http = new HttpService(60000)
  const headers = {
    Authorization: __config.authTokens[0],
    'User-Agent': __constants.INTERNAL_CALL_USER_AGENT
  }
  let url = __config.base_url + __constants.INTERNAL_END_POINTS.getMessageHistory
  url = url.split(':messageId').join(messageData.payload.sendAfterMessageId || '')
  let contiuneToProcessMsg = true
  http.Get(url, headers)
    .then(data => {
      if (data && data.data && data.data.length > 0) {
        contiuneToProcessMsg = data.data.filter(i => __constants.CONTINUE_SENDING_MESSAGE_STATUS.indexOf(i.state) >= 0).length
        if (!contiuneToProcessMsg) {
          return __db.redis.setex(messageData.payload.sendAfterMessageId, JSON.stringify(messageData), __constants.REDIS_TTL.childMessage)
        } else {
          return sendToRespectiveProviderQueue(messageData, rmqObject, queue, mqData)
        }
      } else {
        return sendToRespectiveProviderQueue(messageData, rmqObject, queue, mqData)
      }
    })
    .then(response => {
      if (!contiuneToProcessMsg) return saveAndSendMessageStatus(messageData.payload, messageData.config.servicProviderId, true)
      return true
    })
    .then(statusRes => {
      if (!contiuneToProcessMsg) return rmqObject.channel[queue].ack(mqData)
      return true
    })
    .then(ackRes => messageRouted.resolve('done!'))
    .catch(err => {
      const telegramErrorMessage = 'ProcessMessageConsumer ~ callApiAndSendToQueue function ~ eror while calling api and sending to queue'
      errorToTelegram.send(err, telegramErrorMessage)
      rmqObject.channel[queue].ack(mqData)
      __logger.error('callApiAndSendToQueue Async::error: ', err)
    })
  return messageRouted.promise
}

const sendToRespectiveProviderQueue = (message, queueObj, queue, mqData) => {
  const messageRouted = q.defer()
  __logger.info('inside sendToRespectiveProviderQueue', { message, queue })
  queueObj.sendToQueue(require('./../../lib/util/rabbitmqHelper')('fbOutgoing', message.config.userId, message.payload.whatsapp.from), JSON.stringify(message))
    .then(queueResponse => saveAndSendMessageStatus(message.payload, message.config.servicProviderId, false))
    .then(statusResponse => queueObj.channel[queue].ack(mqData))
    .then(statusResponse => messageRouted.resolve('done!'))
    .catch(err => {
      const telegramErrorMessage = 'ProcessMessageConsumer ~ sendToRespectiveProviderQueue function '
      errorToTelegram.send(err, telegramErrorMessage)
      __logger.error('sendToRespectiveProviderQueue ::error: ', err)
      queueObj.channel[queue].ack(mqData)
    })
  return messageRouted.promise
}

const updateAudience = (audienceNumber, audOptin, wabaNumber, authToken) => {
  const audUpdated = q.defer()
  const url = __config.base_url + __constants.INTERNAL_END_POINTS.addupdateAudience
  const audienceDataToBePosted = [{
    phoneNumber: audienceNumber,
    channel: __constants.DELIVERY_CHANNEL.whatsapp,
    optinSourceId: __config.optinSource.direct,
    optin: audOptin,
    wabaPhoneNumber: wabaNumber
  }]
  const http = new HttpService(60000)
  const headers = { Authorization: authToken, 'User-Agent': __constants.INTERNAL_CALL_USER_AGENT }
  http.Post(audienceDataToBePosted, 'body', url, headers)
    .then((data) => {
      if (data && data.body && data.body.code === 2000) {
        audUpdated.resolve(true)
      } else {
        __logger.info('aud update response error', '')
        audUpdated.reject(false)
      }
    })
    .catch(err => {
      const telegramErrorMessage = 'ProcessMessageConsumer ~ updateAudience function ~ error while calling the api'
      errorToTelegram.send(err, telegramErrorMessage)
      audUpdated.reject(err)
    })
  return audUpdated.promise
}

const checkOptinStaus = (endUserPhoneNumber, templateObj, isOptin, wabaNumber, authToken) => {
  __logger.info('checkOptinStaus::>>>>>>>>>>>', endUserPhoneNumber, templateObj, isOptin)
  const canSendMessage = q.defer()
  if (isOptin && templateObj) {
    updateAudience(endUserPhoneNumber, true, wabaNumber, authToken)
      .then(data => {
        if (data) {
          canSendMessage.resolve(true)
        } else {
          canSendMessage.resolve(false)
        }
      }).catch(err => {
        const telegramErrorMessage = 'ProcessMessageConsumer ~ checkOptinStaus function ~ error while updateAudience functionality'
        errorToTelegram.send(err, telegramErrorMessage)
        canSendMessage.reject(err)
      })
  } else {
    audienceFetchController.getOptinStatusByPhoneNumber(endUserPhoneNumber, wabaNumber)
      .then(data => {
        if (data.tempOptin) {
          canSendMessage.resolve(true)
        } else if (data.optin && templateObj && data.isFacebookVerified) {
          canSendMessage.resolve(true)
        } else {
          canSendMessage.resolve(false)
        }
      })
      .catch(err => canSendMessage.reject(err))
  }
  return canSendMessage.promise
}

const updateMessageStatusToRejected = (message, queueObj, queue, mqData) => {
  const messageStatus = q.defer()
  saveAndSendMessageStatus(message.payload, message.config.servicProviderId, false, __constants.MESSAGE_STATUS.rejected)
    .then(statusResponse => queueObj.channel[queue].ack(mqData))
    .then(statusResponse => messageStatus.resolve('done!'))
    .catch(err => {
      const telegramErrorMessage = 'ProcessMessageConsumer ~ updateMessageStatusToRejected function ~ error while updateAudience functionality'
      errorToTelegram.send(err, telegramErrorMessage)
      __logger.error('sendToRespectiveProviderQueue ::error: ', err)
      queueObj.channel[queue].ack(mqData)
    })
  return messageStatus.promise
}

// const getWabaPhoneNumberAndAdd = (payload, userId) => {
//   const messageStatus = q.defer()
//   const audienceService = new AudienceService()
//   audienceService.getWabaPhoneNumber(payload.whatsapp.from)
//     .then(data => {
//       if (data && data.audMappingId) {
//         return audienceService.addAudineceToDb(payload, data.audMappingId, userId)
//       } else {
//         messageStatus.resolve(true)
//       }
//     })
//     .then(rm => {
//       messageStatus.resolve(true)
//     })
//     .catch(err => {
//       const telegramErrorMessage = 'ProcessMessageConsumer ~ getWabaPhoneNumberAndAdd function ~ error while getWabaPhoneNumberAndAdd functionality'
//       errorToTelegram.send(err, telegramErrorMessage)
//       __logger.error('getWabaPhoneNumberAndAdd sendToRespectiveProviderQueue ::error: ', err)
//       messageStatus.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
//     })
//   return messageStatus.promise
// }

// const callFbApiAndAddUpdateInDb = (messageData, payload, data, rmqObject, queueObj) => {
//   const bool = !!(data && data[0] && data[0].phoneNumber && data[0].wabaPhoneNumberId)
//   const messageStatus = q.defer()
//   const audienceService = new integrationService.Audience(messageData.config.servicProviderId, messageData.config.maxTpsToProvider, messageData.config.userId)
//   audienceService.saveOptin(payload.whatsapp.from, ['+' + payload.to])
//     .then(response => {
//       if (bool) {
//         const audienceService = new AudienceService()
//         return audienceService.updateAsFaceBookVerified(data[0].wabaPhoneNumberId, data[0].phoneNumber, messageData.config.userId)
//       } else {
//         return getWabaPhoneNumberAndAdd(payload, messageData.config.userId)
//       }
//     })
//     .then(() => {
//       return messageStatus.resolve(true)
//     })
//     .catch(err => {
//       const telegramErrorMessage = 'ProcessMessageConsumer ~ callFbApiAndAddUpdateInDb function ~ error while callFbApiAndAddUpdateInDb functionality'
//       errorToTelegram.send(err, telegramErrorMessage)
//       __logger.error('callFbApiAndAddUpdateInDb sendToRespectiveProviderQueue ::error: ', err)
//       if (err && err.err && err.err.errors && err.err.errors.length && err.err.errors[0].code === 1015) {
//         // Rate limiting engaged - Too Many Requests.
//         rmqObject.sendToQueue(queueObj, JSON.stringify(messageData))
//       }
//       messageStatus.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
//     })
//   return messageStatus.promise
// }

// const checkIsVerifiedTrueOrFalse = (messageData, rmqObject, queue, mqData, payload, queueObj) => {
//   const messageStatus = q.defer()
//   const audienceService = new AudienceService()
//   audienceService.getAudienceVerified(payload.to, payload.whatsapp.from)
//     .then(data => {
//       if (data && data.length > 0 && data[0] && data[0].isFacebookVerified) {
//         messageStatus.resolve(true)
//       } else {
//         return callFbApiAndAddUpdateInDb(messageData, payload, data, rmqObject, queueObj)
//       }
//     })
//     .then(() => {
//       return messageStatus.resolve(true)
//     })
//     .catch(err => {
//       const telegramErrorMessage = 'ProcessMessageConsumer ~ checkIsVerifiedTrueOrFalse function ~ error while checkIsVerifiedTrueOrFalse functionality'
//       errorToTelegram.send(err, telegramErrorMessage)
//       __logger.error('checkIsVerifiedTrueOrFalse sendToRespectiveProviderQueue ::error: ', err)
//       messageStatus.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
//     })
//   return messageStatus.promise
// }

class ProcessQueueConsumer {
  startServer () {
    // if (queueObj && queueObj.q_name) {
    __db.init()
      .then(result => {
        const queueObj = __constants.MQ[__config.mqObjectKey]
        const rmqObject = __db.rabbitmqHeloWhatsapp.fetchFromQueue()
        const queue = queueObj.q_name
        __logger.info('processQueueConsumer::Waiting for message...')
        rmqObject.channel[queue].consume(queue, mqData => {
          try {
            const messageData = JSON.parse(mqData.content.toString())
            const payload = messageData.payload
            if (payload.isOptin) {
              // checkIsVerifiedTrueOrFalse(messageData, rmqObject, queue, mqData, payload, queueObj)
              //   .then(isOptin => {
              if (messageData && messageData.payload && messageData.payload && messageData.payload.sendAfterMessageId) {
                callApiAndSendToQueue(messageData, rmqObject, queue, mqData)
              } else {
                sendToRespectiveProviderQueue(messageData, rmqObject, queue, mqData)
              }
              // })
              // .catch(err => {
              //   const telegramErrorMessage = 'ProcessMessageConsumer ~ startServer function ~ error in process message main functionality'
              //   errorToTelegram.send(err, telegramErrorMessage)
              //   __logger.error('processQueueConsumer::error while parsing: ', err)
              //   rmqObject.channel[queue].ack(mqData)
              // })
            } else {
              checkOptinStaus(payload.to, payload.whatsapp.template, payload.isOptin, payload.whatsapp.from, payload.authToken)
                .then(isOptin => {
                  if (isOptin) {
                    if (messageData && messageData.payload && messageData.payload && messageData.payload.sendAfterMessageId) {
                      return callApiAndSendToQueue(messageData, rmqObject, queue, mqData)
                    } else {
                      return sendToRespectiveProviderQueue(messageData, rmqObject, queue, mqData)
                    }
                  } else {
                    return updateMessageStatusToRejected(messageData, rmqObject, queue, mqData)
                  }
                })
                .catch(err => {
                  const telegramErrorMessage = 'ProcessMessageConsumer ~ startServer function ~ error in process message main functionality'
                  errorToTelegram.send(err, telegramErrorMessage)
                  __logger.error('processQueueConsumer::error while parsing: ', err)
                  rmqObject.channel[queue].ack(mqData)
                })
            }
          } catch (err) {
            const telegramErrorMessage = 'ProcessMessageConsumer ~ startServer function ~ processQueueConsumer::error while parsing:'
            errorToTelegram.send(err, telegramErrorMessage)

            __logger.error('processQueueConsumer::error while parsing: ', err)
            rmqObject.channel[queue].ack(mqData)
          }
        }, {
          noAck: false
        })
      })
      .catch(err => {
        const telegramErrorMessage = 'ProcessMessageConsumer ~ startServer function ~'
        errorToTelegram.send(err, telegramErrorMessage)
        __logger.error('processQueueConsumer::error: ', err)
        process.exit(1)
      })
    // } else {
    //   errorToTelegram.send({}, 'ProcessMessageConsumer error: no such queue object exists with name')
    //   __logger.error('processQueueConsumer::error: no such queue object exists with name', __config.mqObjectKey)
    //   process.exit(1)
    // }

    this.stop_gracefully = function () {
      __logger.info('stopping all resources gracefully')
      __db.close(function () {
        process.exit(0)
      })
    }
    process.on('SIGINT', this.stop_gracefully)
    process.on('SIGTERM', this.stop_gracefully)
  }
}

class Worker extends ProcessQueueConsumer {
  start () {
    __logger.info((new Date()).toLocaleString() + '   >> Worker PID:', process.pid)
    super.startServer()
  }
}

module.exports.worker = new Worker()
