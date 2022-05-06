const __logger = require('../../lib/logger')
const __constants = require('../../config/constants')
const __db = require('../../lib/db')
const q = require('q')
const integrationService = require('../../app_modules/integration')
const UserService = require('../../app_modules/user/services/dbData')

const sendTotwoFaConsumer10secQueue = (message, queueObj) => {
  const messageRouted = q.defer()
  queueObj.sendToQueue(__constants.MQ.twoFaConsumer_queue_10_sec, JSON.stringify(message))
    .then(queueResponse => messageRouted.resolve('done!'))
    .catch(err => messageRouted.reject(err))
  return messageRouted.promise
}
class twoFaConsumer {
  startServer () {
    const queue = __constants.MQ.wabaContainerBindingConsumerQueue.q_name
    __db.init()
      .then(result => {
        const rmqObject = __db.rabbitmqHeloWhatsapp.fetchFromQueue()
        let embeddedSignupService
        rmqObject.channel[queue].consume(queue, mqData => {
          try {
            const twoFaConsumerData = JSON.parse(mqData.content.toString())
            const { userId, wabizurl, apiKey, providerId, systemUserToken, phoneCode, phoneNumber } = twoFaConsumerData
            const tfaPin = Math.floor(100000 + Math.random() * 900000)
            const userService = new UserService()
            const retryCount = twoFaConsumerData.retryCount || 0
            console.log('retry count: ', retryCount)
            embeddedSignupService = new integrationService.EmbeddedSignup(providerId, userId, systemUserToken)
            embeddedSignupService.enableTwoStepVerification(wabizurl, apiKey, tfaPin)
              .then(response => {
                return userService.updateTfaPinInformation(phoneCode, phoneNumber, tfaPin)
              })
              .then(response => {
                rmqObject.channel[queue].ack(mqData)
              })
              .catch(err => {
                console.log('err', err)
                // if (err && err.type === __constants.RESPONSE_MESSAGES.NOT_REDIRECTED) {
                if (retryCount < 2) {
                  const oldObj = JSON.parse(mqData.content.toString())
                  oldObj.retryCount = retryCount + 1
                  // __logger.info('requeing --->', oldObj)
                  sendTotwoFaConsumer10secQueue(oldObj, rmqObject)
                } else {
                  console.log('send to error queue')
                }
                // }
                rmqObject.channel[queue].ack(mqData)
              })
          } catch (err) {
            // const telegramErrorMessage = 'WabaContainerBindingConsumer ~ startServer function ~ error in try/catch function'
            // errorToTelegram.send(err, telegramErrorMessage)
            // __logger.error('facebook incoming message QueueConsumer::error while parsing: ', err.toString())
            rmqObject.channel[queue].ack(mqData)
          }
        }, { noAck: false })
      })
      .catch(err => {
        // const telegramErrorMessage = 'WabaContainerBindingConsumer ~ fetchFromQueue function ~ facebook incoming message QueueConsumer::error'
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

// function getData () {
//   return new Promise((resolve, reject) => {
//     resolve(true)
//   })
// }

class Worker extends twoFaConsumer {
  start () {
    __logger.info((new Date()).toLocaleString() + '   >> Worker PID:', process.pid)
    super.startServer()
  }
}

module.exports.worker = new Worker()
