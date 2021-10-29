const moment = require('moment')
const __logger = require('../../lib/logger')
const __constants = require('../../config/constants')
const __config = require('../../config')
const __db = require('../../lib/db')
const q = require('q')
const MessageHistoryService = require('../../app_modules/message/services/dbData')
const RedirectService = require('../../app_modules/integration/service/redirectService')
const HttpService = require('../../lib/http_service')

const saveAndSendMessageStatus = (payload, serviceProviderId, isSyncstatus) => {
  const statusSent = q.defer()
  const messageHistoryService = new MessageHistoryService()
  const redirectService = new RedirectService()
  const statusData = {
    messageId:      payload.messageId,
    serviceProviderId: serviceProviderId,
    deliveryChannel: __constants.DELIVERY_CHANNEL.whatsapp,
    statusTime: moment.utc().format('YYYY-MM-DDTHH:mm:ss'),
    state: (isSyncstatus) ? __constants.MESSAGE_STATUS.pending : __constants.MESSAGE_STATUS.resourceAllocated,
    endConsumerNumber: payload.to,
    businessNumber: payload.whatsapp.from
  }
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

const callApiAndSendToQueue = (messageData, rmqObject, queue, mqData) => {
  const messageRouted = q.defer()
  const http = new HttpService(60000)
  const headers = {
    Authorization: __config.authTokens[0]
  }
  let url = __config.base_url + __constants.INTERNAL_END_POINTS.getMessageHistory
  url = url.split(':messageId').join(messageData.payload.sendAfterMessageId || '')
  let contiuneToProcessMsg = true
  http.Get(url, headers)
    .then(data => {
      if (data && data.data && data.data.length > 0) {
        contiuneToProcessMsg = data.data.filter(i => __constants.CONTINUE_SENDING_MESSAGE_STATUS.indexOf(i.state) >= 0).length
        if (!contiuneToProcessMsg) {
          return __db.redis.setex(messageData.payload.sendAfterMessageId, JSON.stringify(messageData), __constants.REDIS_TTL.childMessage)
        } else {
          return sendToRespectiveProviderQueue(messageData, rmqObject, queue, mqData)
        }
      } else {
        return sendToRespectiveProviderQueue(messageData, rmqObject, queue, mqData)
      }
    })
    .then(response => {
      if (!contiuneToProcessMsg) return saveAndSendMessageStatus(messageData.payload, messageData.config.servicProviderId, true)
      return true
    })
    .then(statusRes => {
      if (!contiuneToProcessMsg) return rmqObject.channel[queue].ack(mqData)
      return true
    })
    .then(ackRes => messageRouted.resolve('done!'))
    .catch(err => {
      rmqObject.channel[queue].ack(mqData)
      __logger.error('callApiAndSendToQueue Async::error: ', err)
    })
  return messageRouted.promise
}

const sendToRespectiveProviderQueue = (message, queueObj, queue, mqData) => {
  const messageRouted = q.defer()
  queueObj.sendToQueue(__constants.MQ[message.config.queueName], JSON.stringify(message))
    .then(queueResponse => saveAndSendMessageStatus(message.payload, message.config.servicProviderId))
    .then(statusResponse => queueObj.channel[queue].ack(mqData))
    .then(statusResponse => messageRouted.resolve('done!'))
    .catch(err => {
      __logger.error('sendToRespectiveProviderQueue ::error: ', err)
      queueObj.channel[queue].ack(mqData)
    })
  return messageRouted.promise
}

class ProcessQueueConsumer {
  startServer () {
    const queueObj = __constants.MQ[__config.mqObjectKey]
    if (queueObj && queueObj.q_name) {
      __db.init()
        .then(result => {
          const rmqObject = __db.rabbitmqHeloWhatsapp.fetchFromQueue()
          const queue = queueObj.q_name
          __logger.info('processQueueConsumer::Waiting for message...')
          rmqObject.channel[queue].consume(queue, mqData => {
            try {
              const messageData = JSON.parse(mqData.content.toString())
              if (messageData && messageData.payload && messageData.payload && messageData.payload.sendAfterMessageId) {
                return callApiAndSendToQueue(messageData, rmqObject, queue, mqData)
              } else {
                return sendToRespectiveProviderQueue(messageData, rmqObject, queue, mqData)
              }
            } catch (err) {
              __logger.error('processQueueConsumer::error while parsing: ', err)
              rmqObject.channel[queue].ack(mqData)
            }
          }, {
            noAck: false
          })
        })
        .catch(err => {
          __logger.error('processQueueConsumer::error: ', err)
          process.exit(1)
        })
    } else {
      __logger.error('processQueueConsumer::error: no such queue object exists with name', __config.mqObjectKey)
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

class Worker extends ProcessQueueConsumer {
  start () {
    __logger.info((new Date()).toLocaleString() + '   >> Worker PID:', process.pid)
    super.startServer()
  }
}

module.exports.worker = new Worker()
