const __logger = require('../../lib/logger')
const __constants = require('../../config/constants')
const __db = require('../../lib/db')
const integrationService = require('../../app_modules/integration')
const q = require('q')

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
    let messageData
    __db.init()
      .then(result => {
        const rmqObject = __db.rabbitmqHeloWhatsapp.fetchFromQueue()
        __logger.info('processQueueConsumer::Waiting for message...')
        rmqObject.channel[queue].consume(queue, mqData => {
          try {
            const mqDataReceived = mqData
            messageData = JSON.parse(mqData.content.toString())
            __logger.debug('processQueueConsumer::received:', { mqData })
            __logger.debug('processQueueConsumer:: messageData received:', messageData)
            if (!messageData.payload.retryCount && messageData.payload.retryCount !== 0) {
              messageData.payload.retryCount = 5
            }

            const messageService = new integrationService.Messaage(messageData.config.servicProviderId)
            messageService.sendMessage(messageData.payload)
              .then(data => rmqObject.channel[queue].ack(mqDataReceived))
              .catch(err => {
                console.log('Error------------------------------->', err)
                rmqObject.channel[queue].ack(mqDataReceived)

                if (messageData.payload.retryCount && messageData.payload.retryCount >= 1) {
                  messageData.payload.retryCount--

                  sendToMockProviderQueue(messageData, rmqObject)
                } else {
                  messageData.err = err
                  sendToErrorQueue(messageData, rmqObject)
                }
                __logger.error('processQueueConsumer::error: ', err)
                // process.exit(1)
              })
          } catch (err) {
            __logger.error('processQueueConsumer::error while parsing: ', err)
            rmqObject.channel[queue].ack(mqData)
          }
        }, { noAck: false })
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
    console.log((new Date()).toLocaleString() + '   >> Worker PID:', process.pid)
    super.startServer()
  }
}

module.exports.worker = new Worker()
