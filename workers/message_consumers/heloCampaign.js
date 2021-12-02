const q = require('q')
const __logger = require('../../lib/logger')
const __constants = require('../../config/constants')
const __db = require('../../lib/db')
const HttpService = require('../../lib/http_service')

const sendToHeloCampaign = (message, queueObj, queue, mqData) => {
  __logger.info('inside ~function=sendToHeloCampaign.', message)
  const messageRouted = q.defer()
  const http = new HttpService(60000)
  http.Post(message, 'body', message.webhookPostUrl)
    .then(function (response) {
      __logger.info('info', {}, { response: response.body }, 'sent ~function=sendToHeloCampaign')
      queueObj.channel[queue].ack(mqData)
    })
    .catch(function (error) {
      __logger.info('error', {}, { error: error.toString() }, 'error while sending dlr ~function=sendToHeloCampaign.')
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

class HeloCampaign {
  constructor () {
    this.http = new HttpService(60000)
  }

  startServer () {
    __logger.info('inside ~function=startServer. Starting WORKER=heloCampaign')
    __db.init()
      .then(result => {
        const queueObj = __constants.MQ.helo_campaign
        if (queueObj && queueObj.q_name) {
          const rmqObject = __db.rabbitmqHeloWhatsapp.fetchFromQueue()
          const queue = queueObj.q_name
          __logger.info('heloCampaign::Waiting for message...')
          rmqObject.channel[queue].consume(queue, mqData => {
            try {
              const messageData = JSON.parse(mqData.content.toString())
              return sendToHeloCampaign(messageData, rmqObject, queue, mqData)
            } catch (err) {
              __logger.info('~function=startServer. heloCampaign::error while parsing: ', err)
              rmqObject.channel[queue].ack(mqData)
            }
          }, {
            noAck: false
          })
        } else {
          __logger.info('~function=startServer. heloCampaign::error: no such queue object exists with name', queueObj)
          process.exit(1)
        }
      })
      .catch(err => {
        __logger.info('sendToHeloCampaign::error: ', err)
        process.exit(1)
      })

    this.stop_gracefully = function () {
      __logger.info('inside ~function=stop_gracefully. stopping all resources gracefully')
      __db.close(function () {
        process.exit(0)
      })
    }
    process.on('SIGINT', this.stop_gracefully)
    process.on('SIGTERM', this.stop_gracefully)
  }
}

class Worker extends HeloCampaign {
  start () {
    __logger.info((new Date()).toLocaleString() + '   >> Worker PID:', process.pid)
    super.startServer()
  }
}

module.exports.worker = new Worker()
