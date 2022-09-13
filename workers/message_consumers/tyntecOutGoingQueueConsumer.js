const __logger = require('../../lib/logger')
const __constants = require('../../config/constants')
const __db = require('../../lib/db')
const integrationService = require('../../app_modules/integration')
const q = require('q')
const moment = require('moment')
const __config = require('../../config')
const MessageHistoryService = require('../../app_modules/message/services/dbData')
const RedirectService = require('../../app_modules/integration/service/redirectService')
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
    customFour: payload.whatsapp.customFour || null
  }
  messageHistoryService.addMessageHistoryDataService(statusData)
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
    .catch(err => statusSent.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err }))
  return statusSent.promise
}

const sendToErrorQueue = (message, queueObj) => {
  const messageRouted = q.defer()
  queueObj.sendToQueue(__constants.MQ.tyntecSendmessageError, JSON.stringify(message))
    .then(queueResponse => messageRouted.resolve('done!'))
    .catch(err => messageRouted.reject(err))
  return messageRouted.promise
}

const sendToTyntecOutgoingQueue = (message, queueObj) => {
  const messageRouted = q.defer()
  queueObj.sendToQueue(__constants.MQ.tyntecOutgoing, JSON.stringify(message))
    .then(queueResponse => messageRouted.resolve('done!'))
    .catch(err => messageRouted.reject(err))
  return messageRouted.promise
}

class MessageConsumer {
  startServer () {
    const queueObj = __constants.MQ[__config.mqObjectKey]
    if (queueObj && queueObj.q_name) {
      const queue = queueObj.q_name
      __db.init()
        .then(result => {
          const rmqObject = __db.rabbitmqHeloWhatsapp.fetchFromQueue()
          __logger.info('tynte outgoing queue consumer::Waiting for message...')
          rmqObject.channel[queue].consume(queue, mqData => {
            try {
              const mqDataReceived = mqData
              const messageData = JSON.parse(mqData.content.toString())
              __logger.info('tynte outgoing queue consumer::received:', { mqData })
              __logger.info('tynte outgoing queue consumer:: messageData received:', messageData)
              if (!messageData.payload.retryCount && messageData.payload.retryCount !== 0) {
                messageData.payload.retryCount = __constants.OUTGOING_MESSAGE_RETRY.tyntec
              }

              const messageService = new integrationService.Messaage(messageData.config.servicProviderId, messageData.config.maxTpsToProvider, messageData.config.userId)
              messageService.sendMessage(messageData.payload)
                .then(sendMessageRespose => saveAndSendMessageStatus(messageData.payload, messageData.config.servicProviderId, sendMessageRespose.data.messageId))
                .then(data => rmqObject.channel[queue].ack(mqDataReceived))
                .catch(err => {
                  __logger.error('tynte outgoing queue consumer::error: ', err)
                  if (messageData.payload.retryCount && messageData.payload.retryCount >= 1) {
                    messageData.payload.retryCount--
                    sendToTyntecOutgoingQueue(messageData, rmqObject)
                  } else {
                    messageData.err = err
                    sendToErrorQueue(messageData, rmqObject)
                  }
                  rmqObject.channel[queue].ack(mqDataReceived)
                })
            } catch (err) {
              __logger.error('tynte outgoing queue consumer::error while parsing: ', err)
              rmqObject.channel[queue].ack(mqData)
            }
          }, { noAck: false })
        })
        .catch(err => {
          __logger.error('tynte outgoing queue consumer::error: ', err)
          process.exit(1)
        })
    } else {
      __logger.error('tynte outgoing queue consumer::error: no such queue object exists with name', __config.mqObjectKey)
      process.exit(1)
    }

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

class Worker extends MessageConsumer {
  start () {
    __logger.info((new Date()).toLocaleString() + '   >> Worker PID:', process.pid)
    super.startServer()
  }
}

module.exports.worker = new Worker()
