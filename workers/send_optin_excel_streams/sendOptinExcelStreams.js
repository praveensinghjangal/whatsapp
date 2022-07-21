
const __logger = require('../../lib/logger')
const __constants = require('../../config/constants')
const __config = require('../../config')
const __db = require('../../lib/db')
const q = require('q')
const request = require('request')
const errorToTelegram = require('../../lib/errorHandlingMechanism/sendToTelegram')

const callAddUpdateAudienceApi = (formattedBody, authToken) => {
  const apiCalled = q.defer()
  const url = __config.base_url + __constants.INTERNAL_END_POINTS.addupdateAudience
  __logger.info('callAddUpdateAudienceApi :: callAddUpdateAudienceApi formattedBody>>>>>>>>>>>>>>>>>>>>>>>>', formattedBody)
  const options = {
    url,
    body: formattedBody,
    headers: { Authorization: authToken, 'User-Agent': __constants.INTERNAL_CALL_USER_AGENT },
    json: true
  }
  // Calling another api for sending messages
  request.post(options, (err, httpResponse, body) => {
    if (err) {
      return apiCalled.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
    }
    return apiCalled.resolve(body)
  })
  return apiCalled.promise
}

class SendOptinExcelStreamsConsumer {
  startServer () {
    const queueObj = __constants.MQ[__config.mqObjectKey]
    if (queueObj && queueObj.q_name) {
      __db.init()
        .then(result => {
          const rmqObject = __db.rabbitmqHeloWhatsapp.fetchFromQueue()
          const queue = queueObj.q_name
          __logger.info('SendOptinExcelStreamsConsumer::Waiting for message...')
          rmqObject.channel[queue].consume(queue, mqData => {
            try {
              const messageData = JSON.parse(mqData.content.toString())
              const payload = messageData.data
              const authorization = messageData.authorization
              console.log('payload', payload)
              callAddUpdateAudienceApi(payload, authorization)
                .then(data => {
                  console.log('successfully called the callAddUpdateAudienceApi')
                })
                .catch(err => {
                  __logger.error('SendOptinExcelStreamsConsumer :: callAddUpdateAudienceApi error', err)
                  // send the payload to the same queue
                  rmqObject.sendToQueue(__constants.MQ.send_optin_excel_stream, JSON.stringify({ data: payload, authorization: authorization }))
                })
              setTimeout(function () {
                console.log(' [x] Done')
                rmqObject.channel[queue].ack(mqData)
              }, __constants.SEND_OPTIN_BATCH_ACK_IN_SECS * 1000)
            } catch (err) {
              console.log('err', err)
              const telegramErrorMessage = 'ProcessMessageConsumer ~ startServer function ~ SendOptinExcelStreamsConsumer::error while parsing:'
              errorToTelegram.send(err, telegramErrorMessage)

              __logger.error('SendOptinExcelStreamsConsumer::error while parsing: ', err)
              rmqObject.channel[queue].ack(mqData)
            }
          }, {
            noAck: false
          })
        })
        .catch(err => {
          const telegramErrorMessage = 'ProcessMessageConsumer ~ startServer function ~'
          errorToTelegram.send(err, telegramErrorMessage)
          __logger.error('SendOptinExcelStreamsConsumer::error: ', err)
          process.exit(1)
        })
    } else {
      errorToTelegram.send({}, 'ProcessMessageConsumer error: no such queue object exists with name')
      __logger.error('SendOptinExcelStreamsConsumer::error: no such queue object exists with name', __config.mqObjectKey)
      process.exit(1)
    }

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

class Worker extends SendOptinExcelStreamsConsumer {
  start () {
    __logger.info((new Date()).toLocaleString() + '   >> Worker PID:', process.pid)
    super.startServer()
  }
}

module.exports.worker = new Worker()
