const __logger = require('../../lib/logger')
const __constants = require('../../config/constants')
const __db = require('../../lib/db')
const q = require('q')

const sendToRespectiveProviderQueue = (message, queueObj) => {
  const messageRouted = q.defer()
  queueObj.sendToQueue(__constants.MQ[message.config.queueName], JSON.stringify(message.payload))
    .then(queueResponse => messageRouted.resolve('done!'))
    .catch(err => messageRouted.reject(err))
  return messageRouted.promise
}

class ProcessQueueConsumer {
  startServer () {
    __db.init()
      .then(result => {
        const rmqObject = __db.rabbitmqHeloWhatsapp.fetchFromQueue()
        const queue = __constants.MQ.process_message.q_name
        __logger.info('processQueueConsumer::Waiting for message...')
        rmqObject.channel[queue].consume(queue, mqData => {
          try {
            const messageData = JSON.parse(mqData.content.toString())
            __logger.debug('processQueueConsumer::received:', { mqData })
            sendToRespectiveProviderQueue(messageData, rmqObject)
              .then(data => rmqObject.channel[queue].ack(mqData))
              .catch(err => __logger.error('processQueueConsumer::error while routing to queue', err))
          } catch (err) {
            __logger.error('processQueueConsumer::error while parsing: ', err)
            rmqObject.channel[queue].ack(mqData)
          }
        }, { noAck: false })
      }).catch(err => {
        __logger.error('processQueueConsumer::error: ', err)
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

class Worker extends ProcessQueueConsumer {
  start () {
    console.log((new Date()).toLocaleString() + '   >> Worker PID:', process.pid)
    super.startServer()
  }
}

module.exports.worker = new Worker()
