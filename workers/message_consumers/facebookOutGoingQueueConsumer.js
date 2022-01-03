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
  queueObj.sendToQueue(__constants.MQ.fbSendmessageError, JSON.stringify(message))
    .then(queueResponse => messageRouted.resolve('done!'))
    .catch(err => {
      const telegramErrorMessage = 'FaceBookOutGoingQueue ~ saveAndSendMessageStatus function'
      errorToTelegram.send(err, telegramErrorMessage)
      messageRouted.reject(err)
    })
  return messageRouted.promise
}

const sendToFacebookOutgoingQueue = (message, queueObj) => {
  const messageRouted = q.defer()
  queueObj.sendToQueue(__constants.MQ.fbOutgoing, JSON.stringify(message))
    .then(queueResponse => messageRouted.resolve('done!'))
    .catch(err => {
      const telegramErrorMessage = 'sendToFacebookOutgoingQueue ~ sendToQueue function error while sending'
      errorToTelegram.send(err, telegramErrorMessage)
      messageRouted.reject(err)
    })
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
          __logger.info('facebook outgoing queue consumer::Waiting for message...')
          rmqObject.channel[queue].consume(queue, mqData => {
            try {
              const mqDataReceived = mqData
              const messageData = JSON.parse(mqData.content.toString())
              __logger.info('facebook outgoing queue consumer::received:', { mqData })
              __logger.info('facebook outgoing queue consumer:: messageData received:', messageData)
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
                  const telegramErrorMessage = 'sendToFacebookOutgoingQueue ~ facebook outgoing queue consumer::error:'
                  __logger.error('facebook outgoing queue consumer::error: ', err)
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
              const telegramErrorMessage = 'sendToFacebookOutgoingQueue ~ facebook queue::error while parsing: '
              errorToTelegram.send(err, telegramErrorMessage)
              __logger.error('facebook queue consumer::error while parsing: ', err)
              rmqObject.channel[queue].ack(mqData)
            }
          }, { noAck: false })
        })
        .catch(err => {
          const telegramErrorMessage = 'sendToFacebookOutgoingQueue ~ facebook queue::Main error in catch block'
          errorToTelegram.send(err, telegramErrorMessage)
          __logger.error('facebook outgoing queue consumer::error: ', err)
          process.exit(1)
        })
    } else {
      const telegramErrorMessage = 'sendToFacebookOutgoingQueue ~ facebook queue:: Main error in catch block without catch()'
      errorToTelegram.send({}, telegramErrorMessage)
      __logger.error('facebook outgoing queue consumer::error: no such queue object exists with name', __config.mqObjectKey)
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
