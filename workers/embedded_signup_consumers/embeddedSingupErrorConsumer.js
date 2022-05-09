const __logger = require('../../lib/logger')
const __constants = require('../../config/constants')
const __db = require('../../lib/db')
// const UserService = require('../../app_modules/user/services/dbData')
// const UserService = require('../../user/services/dbData')
// const q = require('q')

// const sendToDemo10secQueue = (message, queueObj) => {
//   const messageRouted = q.defer()
//   queueObj.sendToQueue(__constants.MQ.demo_queue_10_sec, JSON.stringify(message))
//     .then(queueResponse => messageRouted.resolve('done!'))
//     .catch(err => messageRouted.reject(err))
//   return messageRouted.promise
// }

class embeddedSingupErrorConsumer {
  startServer () {
    const queue = __constants.MQ.embeddedSingupErrorConsumerQueue.q_name
    __db.init()
      .then(result => {
        const rmqObject = __db.rabbitmqHeloWhatsapp.fetchFromQueue()
        // const userService = new UserService()
        rmqObject.channel[queue].consume(queue, mqData => {
          try {
            const messageData = JSON.parse(mqData.content.toString())
            console.log('messageData===========', messageData)
            const retryCount = messageData.retryCount || 0
            console.log('retry count: ', retryCount)
            getData()
              .then(response => rmqObject.channel[queue].ack(mqData))
              .catch(err => {
                console.log('err', err)
                // if (err && err.type === __constants.RESPONSE_MESSAGES.NOT_REDIRECTED) {
                if (retryCount < 2) {
                  const oldObj = JSON.parse(mqData.content.toString())
                  oldObj.retryCount = retryCount + 1
                  // __logger.info('requeing --->', oldObj)
                  // sendToDemo10secQueue(oldObj, rmqObject)
                } else {
                  console.log('send to error queue')
                }
                // }
                rmqObject.channel[queue].ack(mqData)
              })
          } catch (err) {
            // const telegramErrorMessage = 'FacebookConsumer ~ startServer function ~ error in try/catch function'
            // errorToTelegram.send(err, telegramErrorMessage)
            // __logger.error('facebook incoming message QueueConsumer::error while parsing: ', err.toString())
            rmqObject.channel[queue].ack(mqData)
          }
        }, { noAck: false })
      })
      .catch(err => {
        // const telegramErrorMessage = 'FacebookConsumer ~ fetchFromQueue function ~ facebook incoming message QueueConsumer::error'
        // errorToTelegram.send(err, telegramErrorMessage)
        __logger.error('facebook incoming message QueueConsumer::error: ', err)
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

function getData () {
  return new Promise((resolve, reject) => {
    resolve(true)
  })
}

class Worker extends embeddedSingupErrorConsumer {
  start () {
    __logger.info((new Date()).toLocaleString() + '   >> Worker PID:', process.pid)
    super.startServer()
  }
}

module.exports.worker = new Worker()
