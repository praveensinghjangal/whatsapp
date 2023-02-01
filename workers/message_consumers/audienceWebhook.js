// const q = require('q')
const __logger = require('../../lib/logger')
const __constants = require('../../config/constants')
const __db = require('../../lib/db')
const HttpService = require('../../lib/http_service')
const errorToTelegram = require('../../lib/errorHandlingMechanism/sendToTelegram')

class AudienceWebookConsumer {
  startServer () {
    const queue = __constants.MQ.audience_webhook.q_name
    __db.init()
      .then(result => {
        const rmqObject = __db.rabbitmqHeloWhatsapp.fetchFromQueue()
        __logger.info('Audience webhook worker QueueConsumer :: Waiting for message...')
        rmqObject.channel[queue].consume(queue, mqData => {
          try {
            const dataConsumedFromQueue = JSON.parse(mqData.content.toString())
            const http = new HttpService(180000)
            const headers = {
              'Content-Type': 'application/json'
            }
            delete (dataConsumedFromQueue.userId)
            __logger.info('calling post flow api of chat api')
            const postObj = {
              phoneNumber: dataConsumedFromQueue.phoneNumber,
              optin: !!(dataConsumedFromQueue.optin === 1 || dataConsumedFromQueue.optin === true)
            }

            http.Post(postObj, 'body', dataConsumedFromQueue.audienceWebhookUrl, headers)
              .then(data => {
                console.log('data.body', data.body)
                if (data && data.statusCode >= 200 && data.statusCode <= 299) {
                  return data.body
                } else {
                  return ''
                }
              })
              .then(response => {
                return rmqObject.channel[queue].ack(mqData)
              })
              .catch(err => {
                __logger.error('audienceWebhook: HTTP POST error:', err)
                const telegramErrorMessage = 'audienceWebhook: HTTP POST error:'
                errorToTelegram.send(err, telegramErrorMessage)
              })
          } catch (err) {
            __logger.error('audienceWebhook: try/catch:', err)
            const telegramErrorMessage = 'audienceWebhook: fetchFromQueue(): error while parsing: try/catch'
            errorToTelegram.send(err, telegramErrorMessage)
            rmqObject.channel[queue].ack(mqData)
          }
        }, { noAck: false })
      })
      .catch(err => {
        __logger.error('audienceWebhook: db.init: catch: ', err)
        const telegramErrorMessage = 'audienceWebhook: db.init: catch: '
        errorToTelegram.send(err, telegramErrorMessage)
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

class Worker extends AudienceWebookConsumer {
  start () {
    __logger.info('audienceWebhook:' + (new Date()).toLocaleString() + '   >> Worker PID:', process.pid)
    super.startServer()
  }
}

module.exports.worker = new Worker()
