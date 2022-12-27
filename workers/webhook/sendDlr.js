const q = require('q')
const __logger = require('../../lib/logger')
const __constants = require('../../config/constants')
const __config = require('../../config')
const __db = require('../../lib/db')
const HttpService = require('../../lib/http_service')

const sendDlr = (message, queueObj, queue, mqData) => {
  __logger.info('sendDlr: sendDlr(): ', message.content.toString(), queueObj, queue, mqData)
  const messageRouted = q.defer()
  const http = new HttpService(60000)
  let webhookPayload = {}
  if (message && message.content) {
    // incoming message
    webhookPayload = {
      messageId: message.messageId || null,
      channel: message.channel || null,
      from: message.from || null,
      to: message.to || null,
      receivedAt: message.receivedAt || null,
      content: message.content || null,
      event: message.event || null,
      whatsapp: message.whatsapp || null
    }
  } else {
    // message status
    webhookPayload = {
      messageId: message.messageId || null,
      deliveryChannel: message.deliveryChannel || null,
      statusTime: message.statusTime || null,
      state: message.state || null,
      from: message.from || null,
      to: message.to || null,
      customOne: message.customOne,
      customTwo: message.customTwo,
      customThree: message.customThree,
      customFour: message.customFour,
      campName: message.campName || null,
      conversationId: message.conversationId || null,
      conversationType: message.conversationType || null,
      errors: message.errors || []
    }
  }
  http.Post(webhookPayload, 'body', message.url)
    .then(function (response) {
      __logger.info('sendDlr: POST req res: ', response)
      queueObj.channel[queue].ack(mqData)
    })
    .catch(function (error) {
      __logger.info('sendDlr: catch error', {}, { error: error.toString() }, 'error while sending dlr request ~function=sendDlr.')
      if (!message.retry) message.retry = 1
      if (message.retry <= __constants.WEBHOOK_MAX_RETRY_COUNT) {
        message.retry++
        queueObj.sendToQueue(__constants.MQ['delay_failed_to_redirect_' + (message.retry - 1) + '0_sec'], JSON.stringify(message))
          .then(data => queueObj.channel[queue].ack(mqData))
          .catch(err => {
            __logger.error('error', {}, { error: err.toString() }, 'error in redirect retry')
            queueObj.channel[queue].ack(mqData)
          })
      } else {
        queueObj.channel[queue].ack(mqData)
      }
    })
  return messageRouted.promise
}

class UserQueue {
  constructor () {
    this.http = new HttpService(60000)
  }

  startServer () {
    __logger.info('sendDlr: startServer(): ', __config.mqObjectKey)
    __db.init()
      .then(result => {
        const queueObj = __constants.MQ[__config.mqObjectKey]
        if (queueObj && queueObj.q_name) {
          const rmqObject = __db.rabbitmqHeloWhatsapp.fetchFromQueue()
          const queue = queueObj.q_name
          __logger.info('sendDlr: startServer(): user_queue :: Waiting for message ...')
          rmqObject.channel[queue].consume(queue, mqData => {
            try {
              __logger.info('sendDlr: startServer(): mqData:', { types: typeof (mqData), m: mqData, c: mqData.content })
              const messageData = JSON.parse(mqData.content.toString())
              return sendDlr(messageData, rmqObject, queue, mqData)
            } catch (err) {
              __logger.error('sendDlr: startServer(): error while parsing:', err.stack ? err.stack : err)
              rmqObject.channel[queue].ack(mqData)
            }
          }, {
            noAck: false
          })
        } else {
          __logger.error('sendDlr: startServer(): Error: No such queue object exists')
          process.exit(1)
        }
      })
      .catch(err => {
        __logger.error('sendDlr: startServer(): user_queue :: error: ', err && err !== 'object' ? err.toString() : '', err)
        process.exit(1)
      })

    this.stop_gracefully = function () {
      __logger.info('sendDlr: stopGracefully(): info', {}, {}, ' stopping all resources gracefully')
      __db.close(function () {
        process.exit(0)
      })
    }
    process.on('SIGINT', this.stop_gracefully)
    process.on('SIGTERM', this.stop_gracefully)
  }
}

class Worker extends UserQueue {
  start () {
    __logger.info('sendDlr: start(): ' + (new Date()).toLocaleString() + '   >> Worker PID:', process.pid)
    super.startServer()
  }
}

module.exports.worker = new Worker()
