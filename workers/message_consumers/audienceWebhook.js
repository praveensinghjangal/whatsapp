// const q = require('q')
const __logger = require('../../lib/logger')
const __constants = require('../../config/constants')
const __db = require('../../lib/db')
const HttpService = require('../../lib/http_service')
const __util = require('../../lib/util')
const errorToTelegram = require('../../lib/errorHandlingMechanism/sendToTelegram')

class AudienceWebookConsumer {
  startServer () {
    const queue = __constants.MQ.audience_webhook.q_name
    __db.init()
      .then(result => {
        const rmqObject = __db.rabbitmqHeloWhatsapp.fetchFromQueue()
        __logger.info('Audience webhook worker QueueConsumer::Waiting for message...')
        __logger.info('Audience webhook worker QueueConsumerr started')
        rmqObject.channel[queue].consume(queue, mqData => {
          try {
            const dataConsumedFromQueue = JSON.parse(mqData.content.toString())
            const http = new HttpService(2000)
            const headers = {
              'Content-Type': 'application/json'
            }
            delete (dataConsumedFromQueue.userId)
            __logger.info('calling post flow api of chat api')
            const postObj = {
              phoneNumber: dataConsumedFromQueue.phoneNumber,
              optin: dataConsumedFromQueue.optin === true,
              optinSourceId: dataConsumedFromQueue.optinSourceId || ''
            }

            http.Post(postObj, 'body', dataConsumedFromQueue.audienceWebhookUrl, headers)
              .then(data => {
                if (data && data.statusCode === 200) {
                  return data.body
                } else {
                  return __util.send({
                    type: __constants.RESPONSE_MESSAGES.SERVER_ERROR
                  })
                }
              })
              .then(response => {
                return rmqObject.channel[queue].ack(mqData)
              })
              .catch(err => {
                const telegramErrorMessage = '~ Audience webhook  QueueConsumer::error while parsing: try/catch'
                errorToTelegram.send(err, telegramErrorMessage)
                __logger.error('Audience webhook QueueConsumer::error : ', err.toString())
              })
          } catch (err) {
            const telegramErrorMessage = 'Audience webhook ~ fetchFromQueue function ~ Audience webhook  QueueConsumer::error while parsing: try/catch'
            errorToTelegram.send(err, telegramErrorMessage)
            __logger.error('Audience webhook QueueConsumer::error while parsing: ', err.toString())
            rmqObject.channel[queue].ack(mqData)
          }
        }, { noAck: false })
      })
      .catch(err => {
        const telegramErrorMessage = 'FacebookMessageStatus ~ fetchFromQueue main function ~ facebook message status QueueConsumer::error:'
        errorToTelegram.send(err, telegramErrorMessage)
        __logger.error('facebook message status QueueConsumer::error: ', err)
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
    __logger.info((new Date()).toLocaleString() + '   >> Worker PID:', process.pid)
    super.startServer()
  }
}

module.exports.worker = new Worker()
