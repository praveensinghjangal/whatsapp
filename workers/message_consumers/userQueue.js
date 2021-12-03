const q = require('q')
const __logger = require('../../lib/logger')
const __constants = require('../../config/constants')
const __db = require('../../lib/db')
const HttpService = require('../../lib/http_service')

const sendDlr = (message, queueObj, queue, mqData) => {
  __logger.info('inside ~function=sendDlr.', message)
  const messageRouted = q.defer()
  const http = new HttpService(60000)
  http.Post(message, 'body', message.webhookPostUrl)
    .then(function (response) {
      __logger.info('sent ~function=sendDlr', response)
      queueObj.channel[queue].ack(mqData)
    })
    .catch(function (error) {
      __logger.info('error', {}, { error: error.toString() }, 'error while sending dlr ~function=sendDlr.')
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
    __logger.info('inside ~function=startServer. Starting WORKER=userQueue')
    __db.init()
      .then(result => {
        const queueObj = __constants.MQ.user_queue
        if (queueObj && queueObj.q_name) {
          const rmqObject = __db.rabbitmqHeloWhatsapp.fetchFromQueue()
          const queue = queueObj.q_name
          __logger.info('user_queue::Waiting for message...')
          rmqObject.channel[queue].consume(queue, mqData => {
            try {
              const messageData = JSON.parse(mqData.content.toString())
              __logger.info('inside ~function=startServer. Calling sendDlr')
              return sendDlr(messageData, rmqObject, queue, mqData)
            } catch (err) {
              __logger.error('~function=startServer. heloCampaign::error while parsing: ', err)
              rmqObject.channel[queue].ack(mqData)
            }
          }, {
            noAck: false
          })
        } else {
          __logger.error('~function=startServer. heloCampaign::error: no such queue object exists')
          process.exit(1)
        }
      })
      .catch(err => {
        __logger.error('user_queue::error: ', err && err !== 'object' ? err.toString() : '', err)
        process.exit(1)
      })

    this.stop_gracefully = function () {
      __logger.info('info', {}, {}, 'inside ~function=stop_gracefully. stopping all resources gracefully')
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
    __logger.info((new Date()).toLocaleString() + '   >> Worker PID:', process.pid)
    super.startServer()
  }
}

module.exports.worker = new Worker()