const q = require('q')
const __logger = require('../../lib/logger')
const __constants = require('../../config/constants')
const __db = require('../../lib/db')
const RedirectService = require('../../app_modules/integration/service/redirectService')
const MessageHistoryService = require('../../app_modules/message/services/dbData')

const sendToTyntecMessageStatusQueue = (message, queueObj) => {
  const messageRouted = q.defer()
  queueObj.sendToQueue(__constants.MQ.tyntecMessageStatus, JSON.stringify(message))
    .then(queueResponse => messageRouted.resolve('done!'))
    .catch(err => messageRouted.reject(err))
  return messageRouted.promise
}

class TyntecConsumer {
  startServer () {
    const queue = __constants.MQ.tyntecMessageStatus.q_name
    __db.init()
      .then(result => {
        const rmqObject = __db.rabbitmqHeloWhatsapp.fetchFromQueue()
        console.log('tyntec message status QueueConsumer::Waiting for message...')
        __logger.info('tyntec message status queue consumer started')
        rmqObject.channel[queue].consume(queue, mqData => {
          try {
            const messageData = JSON.parse(mqData.content.toString())
            let statusData = {}
            // console.log('incoming!!!!!!!!!!!!!!!!!!', messageData)
            const redirectService = new RedirectService()
            const retryCount = messageData.retryCount || 0
            const messageHistoryService = new MessageHistoryService()
            // console.log('Alteredddddddddddddddddddddddd------', messageData, retryCount)
            __logger.info('tyntec message status QueueConsumer:: messageData received:', messageData)
            statusData = {
              serviceProviderMessageId: messageData.messageId,
              deliveryChannel: messageData.deliveryChannel,
              statusTime: messageData.timestamp,
              state: messageData.status
            }
            messageHistoryService.addMessageHistoryDataService(statusData)
              .then(statusDataAdded => {
                statusData.messageId = statusDataAdded.messageId
                statusData.to = statusDataAdded.businessNumber
                statusData.from = statusDataAdded.endConsumerNumber
                delete messageData.retryCount
                delete statusData.serviceProviderMessageId
                delete statusData.businessNumber
                delete statusData.endConsumerNumber
                return redirectService.webhookPost(statusData.to, statusData)
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
                    sendToTyntecMessageStatusQueue(oldObj, rmqObject)
                  }
                }
                rmqObject.channel[queue].ack(mqData)
              })
          } catch (err) {
            __logger.error('tyntec message status QueueConsumer::error while parsing: ', err)
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

class Worker extends TyntecConsumer {
  start () {
    console.log((new Date()).toLocaleString() + '   >> Worker PID:', process.pid)
    super.startServer()
  }
}

module.exports.worker = new Worker()
