const __logger = require('../../lib/logger')
const __constants = require('../../config/constants')
const __db = require('../../lib/db')
const integrationService = require('../../app_modules/integration')
const q = require('q')
const moment = require('moment')
const __config = require('../../config')
const MessageHistoryService = require('../../app_modules/message/services/dbData')
const RedirectService = require('../../app_modules/integration/service/redirectService')
const errorToTelegram = require('../../lib/errorHandlingMechanism/sendToTelegram')
const phoneCodeAndPhoneSeprator = require('../../lib/util/phoneCodeAndPhoneSeprator')
const saveAndSendMessageStatus = (payload, serviceProviderId, serviceProviderMessageId) => {
  const statusSent = q.defer()
  const messageHistoryService = new MessageHistoryService()
  const redirectService = new RedirectService()
  const statusData = {
    messageId: payload.messageId,
    serviceProviderId: serviceProviderId,
    serviceProviderMessageId: serviceProviderMessageId,
    deliveryChannel: __constants.DELIVERY_CHANNEL.whatsapp,
    statusTime: moment.utc().format('YYYY-MM-DDTHH:mm:ss'),
    state: __constants.MESSAGE_STATUS.forwarded,
    endConsumerNumber: payload.to,
    countryName: phoneCodeAndPhoneSeprator(payload.to).countryName,
    businessNumber: payload.whatsapp.from,
    customOne: payload.whatsapp.customOne || null,
    customTwo: payload.whatsapp.customTwo || null,
    customThree: payload.whatsapp.customThree || null,
    customFour: payload.whatsapp.customFour || null,
    date: payload.date || null,
    campName: payload.whatsapp.campName || null
  }
  const mappingData = [payload.messageId, serviceProviderMessageId, payload.to, phoneCodeAndPhoneSeprator(payload.to).countryName, payload.whatsapp.from, statusData.customOne, statusData.customTwo, statusData.customThree, statusData.customFour, statusData.date]
  messageHistoryService.addMessageIdMappingData(mappingData)
    .then(statusDataAdded => {
      return messageHistoryService.addMessageHistoryDataService(statusData)
    })
    .then(statusDataAdded => {
      statusData.to = statusData.businessNumber
      statusData.from = statusData.endConsumerNumber
      delete statusData.serviceProviderMessageId
      delete statusData.serviceProviderId
      delete statusData.businessNumber
      delete statusData.endConsumerNumber
      return redirectService.webhookPost(statusData.to, statusData)
    })
    .then(data => statusSent.resolve(data))
    .catch(err => {
      __logger.error('fbOutgoing: saveAndSendMessageStatus(): addMessageIdMappingData(): catch: ', err)
      statusSent.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
    })
  return statusSent.promise
}

const sendToErrorQueue = (message, queueObj) => {
  const messageRouted = q.defer()
  queueObj.sendToQueue(__constants.MQ.fbSendmessageError, JSON.stringify(message))
    .then(queueResponse => messageRouted.resolve('done!'))
    .catch(err => {
      __logger.error('fbOutgoing: sendToErrorQueue(): catch: ', err)
      const telegramErrorMessage = 'FaceBookOutGoingQueue: saveAndSendMessageStatus():'
      errorToTelegram.send(err, telegramErrorMessage)
      messageRouted.reject(err)
    })
  return messageRouted.promise
}

const sendToFacebookOutgoingQueue = (message, queueObj) => {
  const messageRouted = q.defer()
  queueObj.sendToQueue(require('./../../lib/util/rabbitmqHelper')('fbOutgoing', message.config.userId, message.payload.whatsapp.from), JSON.stringify(message))
    .then(queueResponse => messageRouted.resolve('done!'))
    .catch(err => {
      __logger.error('fbOutgoing: sendToFacebookOutgoingQueue(): catch: ', err)
      const telegramErrorMessage = 'sendToFacebookOutgoingQueue: sendToQueue(' + message.payload.whatsapp.from + '): error while sending'
      errorToTelegram.send(err, telegramErrorMessage)
      messageRouted.reject(err)
    })
  return messageRouted.promise
}

class MessageConsumer {
  startServer () {
    __db.init()
      .then(result => {
        const queueObj = __constants.MQ[__config.mqObjectKey]
        const queue = queueObj.q_name
        const rmqObject = __db.rabbitmqHeloWhatsapp.fetchFromQueue()
        __logger.info('facebook outgoing queue consumer :: Waiting for message...')
        rmqObject.channel[queue].consume(queue, mqData => {
          try {
            const mqDataReceived = mqData
            const messageData = JSON.parse(mqData.content.toString())
            __logger.info('fbOutgoing: sendToFacebookOutgoingQueue(' + queue + '): Data Received', { mqData: mqData.content.toString() })
            if (!messageData.payload.retryCount && messageData.payload.retryCount !== 0) {
              messageData.payload.retryCount = __constants.OUTGOING_MESSAGE_RETRY.facebook
            }

            const messageService = new integrationService.Messaage(messageData.config.servicProviderId, messageData.config.maxTpsToProvider, messageData.config.userId)
            messageService.sendMessage(messageData.payload)
              .then(sendMessageRespose => {
                return saveAndSendMessageStatus(messageData.payload, messageData.config.servicProviderId, sendMessageRespose.data.messages[0].id)
              })
              .then(data => rmqObject.channel[queue].ack(mqDataReceived))
              .catch(err => {
                __logger.error('fbOutgoing: sendMessage(' + queue + '): catch:', { mqData: mqData.content.toString() })
                const telegramErrorMessage = 'sendToFacebookOutgoingQueue: sendMessage(' + queue + '):: catch:'
                errorToTelegram.send(err, telegramErrorMessage)
                if (messageData.payload.retryCount && messageData.payload.retryCount >= 1) {
                  messageData.payload.retryCount--
                  sendToFacebookOutgoingQueue(messageData, rmqObject)
                } else {
                  messageData.err = err
                  sendToErrorQueue(messageData, rmqObject)
                }
                rmqObject.channel[queue].ack(mqDataReceived)
              })
          } catch (err) {
            __logger.error('fbOutgoing: sendMessage(' + queue + '): try/catch:', err)
            const telegramErrorMessage = 'fbOutgoing: sendMessage(' + queue + '): try/catch:'
            errorToTelegram.send(err, telegramErrorMessage)
            rmqObject.channel[queue].ack(mqData)
          }
        }, { noAck: false })
      })
      .catch(err => {
        __logger.error('fbOutgoing: main catch:', err)
        const telegramErrorMessage = 'fbOutgoing: Main error in catch():'
        errorToTelegram.send(err, telegramErrorMessage)
        process.exit(1)
      })
    this.stop_gracefully = function () {
      __logger.warn('stopping all resources gracefully')
      __db.close(function () {
        process.exit(0)
      })
    }
    process.on('SIGINT', this.stop_gracefully)
    process.on('SIGTERM', this.stop_gracefully)
  }
}

class Worker extends MessageConsumer {
  start () {
    __logger.info('fbOutgoing' + (new Date()).toLocaleString() + '   >> Worker PID:', process.pid)
    super.startServer()
  }
}

module.exports.worker = new Worker()
