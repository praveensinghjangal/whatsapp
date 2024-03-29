const moment = require('moment')
const q = require('q')
const __logger = require('../../lib/logger')
const __constants = require('../../config/constants')
const __db = require('../../lib/db')
const integrationService = require('../../app_modules/integration')
const MessageHistoryService = require('../../app_modules/message/services/dbData')
const phoneCodeAndPhoneSeprator = require('../../lib/util/phoneCodeAndPhoneSeprator')
const sendToErrorQueue = (message, queueObj) => {
  const messageRouted = q.defer()
  queueObj.sendToQueue(__constants.MQ.mockSendmessageError, JSON.stringify(message))
    .then(queueResponse => messageRouted.resolve('done!'))
    .catch(err => messageRouted.reject(err))
  return messageRouted.promise
}

const sendToMockProviderQueue = (message, queueObj) => {
  const messageRouted = q.defer()
  queueObj.sendToQueue(__constants.MQ.mock, JSON.stringify(message))
    .then(queueResponse => messageRouted.resolve('done!'))
    .catch(err => messageRouted.reject(err))
  return messageRouted.promise
}

class MessageConsumer {
  startServer () {
    const queue = __constants.MQ.mock.q_name
    __db.init()
      .then(result => {
        const rmqObject = __db.rabbitmqHeloWhatsapp.fetchFromQueue()
        __logger.info('mock queue consumeeeeeeeer::Waiting for message...')
        rmqObject.channel[queue].consume(queue, mqData => {
          try {
            const mqDataReceived = mqData
            const messageData = JSON.parse(mqData.content.toString())
            __logger.info('mock queue consumeeeeeeeer::received:', { mqData })
            __logger.info('mock queue consumeeeeeeeer:: messageData received:', messageData)
            if (!messageData.payload.retryCount && messageData.payload.retryCount !== 0) {
              messageData.payload.retryCount = 5
            }
            const messageService = new integrationService.Messaage(messageData.config.servicProviderId, messageData.config.maxTpsToProvider, messageData.config.userId)
            messageService.sendMessage(messageData.payload)
              .then(data => {
                const messageHistoryService = new MessageHistoryService()
                const statusData = {
                  messageId: messageData.payload.messageId,
                  serviceProviderId: messageData.config.servicProviderId,
                  deliveryChannel: __constants.DELIVERY_CHANNEL.whatsapp,
                  statusTime: moment.utc().format('YYYY-MM-DDTHH:mm:ss'),
                  state: __constants.MESSAGE_STATUS.seen,
                  endConsumerNumber: messageData.payload.to,
                  countryName: phoneCodeAndPhoneSeprator(messageData.payload.to).countryName,
                  businessNumber: messageData.payload.whatsapp.from
                }
                return messageHistoryService.addMessageHistoryDataService(statusData)
              })
              .then(data => rmqObject.channel[queue].ack(mqDataReceived))
              .catch(err => {
                __logger.info('Error------------------------------->', err)
                if (messageData.payload.retryCount && messageData.payload.retryCount >= 1) {
                  messageData.payload.retryCount--
                  sendToMockProviderQueue(messageData, rmqObject)
                } else {
                  messageData.err = err
                  sendToErrorQueue(messageData, rmqObject)
                }
                rmqObject.channel[queue].ack(mqDataReceived)
                __logger.error('mock queue consumeeeeeeeer::error: ', err)
                // process.exit(1)
              })
          } catch (err) {
            __logger.error('mock queue consumeeeeeeeer::error while parsing: ', err)
            rmqObject.channel[queue].ack(mqData)
          }
        }, { noAck: false })
      })
      .catch(err => {
        __logger.error('mock queue consumeeeeeeeer::error: ', err)
        process.exit(1)
      })

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
