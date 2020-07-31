const __logger = require('../../lib/logger')
const __constants = require('../../config/constants')
const __db = require('../../lib/db')
const UniqueId = require('../../lib/util/uniqueIdGenerator')
const saveIncomingMessagePayloadService = require('../../app_modules/integration/service/saveIncomingMessagePayload')
const RedirectService = require('../../app_modules/integration/service/redirectService')
const q = require('q')

const sendToTyntecIncomingQueue = (message, queueObj) => {
  const messageRouted = q.defer()
  queueObj.sendToQueue(__constants.MQ.tyntecIncoming, JSON.stringify(message))
    .then(queueResponse => messageRouted.resolve('done!'))
    .catch(err => messageRouted.reject(err))
  return messageRouted.promise
}

class TyntecConsumer {
  startServer () {
    const queue = __constants.MQ.tyntecIncoming.q_name
    __db.init()
      .then(result => {
        const rmqObject = __db.rabbitmqHeloWhatsapp.fetchFromQueue()
        console.log('tyntec incoming message QueueConsumer::Waiting for message...')
        __logger.info('tyntec insoming queue consumer started')
        rmqObject.channel[queue].consume(queue, mqData => {
          try {
            const messageData = JSON.parse(mqData.content.toString())
            // console.log('incoming!!!!!!!!!!!!!!!!!!', messageData)
            const uniqueId = new UniqueId()
            const redirectService = new RedirectService()
            messageData.vivaMessageId = uniqueId.uuid()
            const retryCount = messageData.retryCount || 0
            // console.log('Alteredddddddddddddddddddddddd------', messageData, retryCount)
            __logger.info('tyntec incoming message QueueConsumer:: messageData received:', messageData)
            saveIncomingMessagePayloadService(messageData.vivaMessageId, messageData.messageId, messageData, messageData.from)
              .then(payloadSaved => {
                messageData.messageId = messageData.vivaMessageId
                delete messageData.vivaMessageId
                delete messageData.retryCount
                return redirectService.webhookPost(messageData.to, messageData)
              })
              .then(response => rmqObject.channel[queue].ack(mqData))
              .catch(err => {
                __logger.error('ppperrrrrrrrrr', err, retryCount)
                // console.log('condition --->', err.type, __constants.RESPONSE_MESSAGES.NOT_REDIRECTED, err.type === __constants.RESPONSE_MESSAGES.NOT_REDIRECTED)
                if (err && err.type === __constants.RESPONSE_MESSAGES.NOT_REDIRECTED) {
                  // console.log('time to check retry count', retryCount, __constants.INCOMING_MESSAGE_RETRY.tyntec, retryCount < __constants.INCOMING_MESSAGE_RETRY.tyntec)
                  if (retryCount < __constants.INCOMING_MESSAGE_RETRY.tyntec) {
                    const oldObj = JSON.parse(mqData.content.toString())
                    oldObj.retryCount = retryCount + 1
                    // console.log('requeing --->', oldObj)
                    sendToTyntecIncomingQueue(oldObj, rmqObject)
                  }
                }
                rmqObject.channel[queue].ack(mqData)
              })
          } catch (err) {
            __logger.error('tyntec incoming message QueueConsumer::error while parsing: ', err)
            rmqObject.channel[queue].ack(mqData)
          }
        }, { noAck: false })
      })
      .catch(err => {
        __logger.error('tyntec incoming message QueueConsumer::error: ', err)
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

class Worker extends TyntecConsumer {
  start () {
    console.log((new Date()).toLocaleString() + '   >> Worker PID:', process.pid)
    super.startServer()
  }
}

module.exports.worker = new Worker()
