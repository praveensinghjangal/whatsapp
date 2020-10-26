const __logger = require('../../lib/logger')
const __constants = require('../../config/constants')
const __db = require('../../lib/db')
const RedirectService = require('../../app_modules/integration/service/redirectService')

class MessageConsumer {
  startServer () {
    const queue = __constants.MQ.retry_failed_to_redirect_payload.q_name
    let messageData
    __db.init()
      .then(result => {
        const rmqObject = __db.rabbitmqHeloWhatsapp.fetchFromQueue()
        // __logger.info('mock queue consumeeeeeeeer::Waiting for message...')
        rmqObject.channel[queue].consume(queue, mqData => {
          try {
            const redirectService = new RedirectService()
            const mqDataReceived = mqData
            messageData = JSON.parse(mqData.content.toString())
            // __logger.debug('retry sending payload queue consumeeeeeeeer::received:', { mqData })
            __logger.debug('retry sending payload queue consumeeeeeeeer:: messageData received:', messageData)
            redirectService.webhookPost(messageData.wabaNumber, messageData)
            rmqObject.channel[queue].ack(mqDataReceived)
            // process.exit(1)
          } catch (err) {
            __logger.error('retry sending payload consumeeeeeeeer::error while parsing: ', err)
            rmqObject.channel[queue].ack(mqData)
          }
        }, { noAck: false })
      })
      .catch(err => {
        __logger.error('retry sending payload queue consumeeeeeeeer::error: ', err)
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
