const __logger = require('../../lib/logger')
const __constants = require('../../config/constants')
const __db = require('../../lib/db')
const errorToTelegram = require('../../lib/errorHandlingMechanism/sendToTelegram')
const q = require('q')
const moment = require('moment')
// const __config = require('../../config')
const MessageHistoryService = require('../../app_modules/message/services/dbData')
const RedirectService = require('../../app_modules/integration/service/redirectService')
const phoneCodeAndPhoneSeprator = require('../../lib/util/phoneCodeAndPhoneSeprator')
// const qalllib = require('qalllib')
const saveAndSendMessageStatusForNotVerfiedNumber = (payload, serviceProviderId) => {
  const statusSent = q.defer()
  const messageHistoryService = new MessageHistoryService()
  const redirectService = new RedirectService()
  const statusData = {
    messageId: payload.messageId,
    serviceProviderId: serviceProviderId,
    deliveryChannel: __constants.DELIVERY_CHANNEL.whatsapp,
    statusTime: moment.utc().format('YYYY-MM-DDTHH:mm:ss'),
    state: __constants.MESSAGE_STATUS.rejected,
    endConsumerNumber: payload.to,
    countryName: phoneCodeAndPhoneSeprator(payload.to).countryName,
    businessNumber: payload.whatsapp.from,
    customOne: payload.whatsapp.customOne || null,
    customTwo: payload.whatsapp.customTwo || null,
    customThree: payload.whatsapp.customThree || null,
    customFour: payload.whatsapp.customFour || null,
    date: payload.date,
    campName: payload.whatsapp.campName || null
  }
  // const mappingData = [payload.messageId, payload.to, payload.whatsapp.from, statusData.customOne, statusData.customTwo, statusData.customThree, statusData.customFour, statusData.date]
  messageHistoryService.addMessageHistoryDataService(statusData)
    .then(statusDataAdded => {
      statusData.to = statusData.businessNumber
      statusData.from = statusData.endConsumerNumber
      delete statusData.serviceProviderId
      delete statusData.businessNumber
      delete statusData.endConsumerNumber
      return redirectService.webhookPost(statusData.to, statusData)
    })
    .then(data => statusSent.resolve(data))
    .catch(err => statusSent.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err }))
  return statusSent.promise
}

const saveAndSendMessageStatusformFacebookerrorQueue = (payload, servicProviderId) => {
  const saveAndSendMessageStatusformFacebookerrorQueue = q.defer()
  // qalllib.qASyncWithBatch(saveAndSendMessageStatusForNotVerfiedNumber, [payload], __constants.BATCH_SIZE_FOR_SEND_TO_QUEUE, servicProviderId)
  saveAndSendMessageStatusForNotVerfiedNumber(payload, servicProviderId)
    .then(data => {
      return saveAndSendMessageStatusformFacebookerrorQueue.resolve(data)
    })
    .catch(function (error) {
      const telegramErrorMessage = 'facebookErrorConsumer ~ saveAndSendMessageStatusformFacebookerrorQueue function ~ error in saveAndSendMessageStatusformFacebookerrorQueue'
      errorToTelegram.send(error, telegramErrorMessage)
      console.log('errror', error)
      return saveAndSendMessageStatusformFacebookerrorQueue.reject(error)
    })
    .done()
  return saveAndSendMessageStatusformFacebookerrorQueue.promise
}
class facebookErrorConsumer {
  startServer () {
    const queue = __constants.MQ.facebookErrorConsumer.q_name
    __db.init()
      .then(result => {
        const rmqObject = __db.rabbitmqHeloWhatsapp.fetchFromQueue()
        rmqObject.channel[queue].consume(queue, mqData => {
          try {
            const mqDataReceived = mqData
            const messageData = JSON.parse(mqData.content.toString())
            __logger.info('facebook error queue consumer::received:', { mqData })
            __logger.info('facebook error queue consumer:: messageData received:', messageData)
            saveAndSendMessageStatusformFacebookerrorQueue(messageData.payload, messageData.config.servicProviderId)
              .then(sendMessageRespose => {
                __logger.info('facebook error queue consumer::error: ', sendMessageRespose)
                rmqObject.channel[queue].ack(mqDataReceived)
              })
              .catch(err => {
                const telegramErrorMessage = 'sendAfterToFacebookerrorQueue ~ facebook error queue consumer::error:'
                __logger.error('facebook error queue consumer::error: ', err)
                errorToTelegram.send(err, telegramErrorMessage)
                rmqObject.channel[queue].ack(mqDataReceived)
              })
          } catch (err) {
            const telegramErrorMessage = 'sendToFacebookerrorQueue ~ facebook queue::error while parsing: '
            errorToTelegram.send(err, telegramErrorMessage)
            __logger.error('facebook queue consumer::error while parsing: ', err)
            rmqObject.channel[queue].ack(mqData)
          }
        }, { noAck: false })
      })
      .catch(err => {
        const telegramErrorMessage = 'sendToFacebookerrorQueue ~ facebook queue::Main error in catch block'
        errorToTelegram.send(err, telegramErrorMessage)
        __logger.error('facebook error queue consumer::error: ', err)
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

class Worker extends facebookErrorConsumer {
  start () {
    __logger.info((new Date()).toLocaleString() + '   >> Worker PID:', process.pid)
    super.startServer()
  }
}

module.exports.worker = new Worker()
