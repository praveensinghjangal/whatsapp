const __logger = require('../../lib/logger')
const __constants = require('../../config/constants')
const __db = require('../../lib/db')
const WebHooks = require('../../app_modules/integration').WebHooks
const webhooks = new WebHooks()

class TyntecConsumer {
  startServer () {
    const queue = __constants.MQ.tyntec.q_name
    let messageData
    __db.init()
      .then(result => {
        const rmqObject = __db.rabbitmqHeloWhatsapp.fetchFromQueue()
        __logger.info('tyntecQueueConsumer::Waiting for message...')
        rmqObject.channel[queue].consume(queue, mqData => {
          try {
            const mqDataReceived = mqData
            messageData = JSON.parse(mqData.content.toString())
            // __logger.debug('tyntecQueueConsumer::received:', { mqData })
            __logger.debug('tyntecQueueConsumer:: messageData received:', messageData)

            webhooks.storePayloadInDb(messageData)
            // .then(data => __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: {} }))
            // .catch(err => res.status(500).send(err))
            rmqObject.channel[queue].ack(mqData)
          } catch (err) {
            __logger.error('tyntecQueueConsumer::error while parsing: ', err)
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
