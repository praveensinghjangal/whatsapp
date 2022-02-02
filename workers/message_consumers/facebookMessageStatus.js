const q = require('q')
const __logger = require('../../lib/logger')
const __constants = require('../../config/constants')
const __db = require('../../lib/db')
const RedirectService = require('../../app_modules/integration/service/redirectService')
const MessageHistoryService = require('../../app_modules/message/services/dbData')
const moment = require('moment')
const errorToTelegram = require('../../lib/errorHandlingMechanism/sendToTelegram')
const LogConversation = require('../../app_modules/message/services/logConversation')

const sendToFacebookMessageStatusQueue = (message, queueObj) => {
  const messageRouted = q.defer()
  __logger.info('inside sendToFacebookMessageStatusQueue', { message })
  queueObj.sendToQueue(__constants.MQ.fbMessageStatus, JSON.stringify(message))
    .then(queueResponse => messageRouted.resolve('done!'))
    .catch(err => messageRouted.reject(err))
  return messageRouted.promise
}

const pendingMessageToSendMechanism = (queueDataobject, queueObj) => {
  const messageHistoryService = new MessageHistoryService()
  __logger.info('inside pendingMessageToSendMechanism')
  let messageId
  messageHistoryService.getVivaMsgIdByserviceProviderMsgId(queueDataobject)
    .then(messageData => {
      if (messageData && messageData.messageId) {
        messageId = messageData.messageId
        return __db.redis.get(messageId)
      }
    })
    .then(data => {
      if (data && data.length > 0) {
        data = JSON.parse(data)
        __db.redis.key_delete(messageId)
        queueObj.sendToQueue(require('./../../lib/util/rabbitmqHelper')('fbOutgoingSync', data.config.userId, data.payload.whatsapp.from), JSON.stringify(data))
      }
    })
    .catch(err => {
      __logger.error('error in pendingMessageMechanism of async data:', err)
    })
}

const setTheMappingOfMessageData = (messageDataFromFacebook) => {
  return {
    messageId: messageDataFromFacebook.statuses[0].id || null,
    channel: __constants.DELIVERY_CHANNEL.whatsapp,
    event: `${__constants.TYNTEC_TO_FB_EVENT_KEY}${messageDataFromFacebook.statuses[0].status}`,
    deliveryChannel: __constants.DELIVERY_CHANNEL.whatsapp,
    status: __constants.INCOMING_MESSAGE_STATUS_MAPPING_FROM_FB_TO_TYNTEC[messageDataFromFacebook.statuses[0].status] ? __constants.INCOMING_MESSAGE_STATUS_MAPPING_FROM_FB_TO_TYNTEC[messageDataFromFacebook.statuses[0].status] : messageDataFromFacebook.statuses[0].status,
    timestamp: moment.utc(+(messageDataFromFacebook.statuses[0].timestamp + '000')).format('YYYY-MM-DDTHH:mm:ss'),
    details: { from: messageDataFromFacebook.statuses[0].recipient_id },
    from: messageDataFromFacebook.statuses[0].recipient_id,
    errors: messageDataFromFacebook.statuses[0].errors ? messageDataFromFacebook.statuses[0].errors : [],
    businessNumber: messageDataFromFacebook.wabaNumber,
    retryCount: messageDataFromFacebook.retryCount ? messageDataFromFacebook.retryCount : 0
  }
}
class FacebookConsumer {
  startServer () {
    const queue = __constants.MQ.fbMessageStatus.q_name
    __db.init()
      .then(result => {
        const rmqObject = __db.rabbitmqHeloWhatsapp.fetchFromQueue()
        __logger.info('facebook message status QueueConsumer::Waiting for message...')
        __logger.info('facebook message status queue consumer started')
        rmqObject.channel[queue].consume(queue, mqData => {
          try {
            const messageDataFromFacebook = JSON.parse(mqData.content.toString())
            // console.log('Facebook message status incoming object', messageDataFromFacebook)
            // change the mapping
            const messageData = setTheMappingOfMessageData(messageDataFromFacebook)
            if (__constants.CONTINUE_SENDING_MESSAGE_STATUS_FB.includes(messageData.status.toLowerCase())) {
              pendingMessageToSendMechanism(messageData, rmqObject)
            }
            let statusData = {}
            // __logger.info('incoming!!!!!!!!!!!!!!!!!!', messageData)
            const redirectService = new RedirectService()
            const retryCount = messageData.retryCount || 0
            const messageHistoryService = new MessageHistoryService()
            // __logger.info('Alteredddddddddddddddddddddddd------', messageData, retryCount)
            __logger.info('facebook message status QueueConsumer:: messageData received:', messageData)
            statusData = {
              serviceProviderMessageId: messageData.messageId,
              deliveryChannel: messageData.deliveryChannel,
              statusTime: messageData.timestamp,
              state: messageData.status,
              errors: messageData.errors,
              endConsumerNumber: messageData.from,
              businessNumber: messageData.businessNumber,
              conversationId: null
            }
            // todo : error handling to retry adding convo log by pushing to a q, add time check after feature is live by fb
            if (__constants.LOG_CONVERSATION_ON_STATUS.includes(messageData.status) && messageDataFromFacebook.statuses && messageDataFromFacebook.statuses[0] && messageDataFromFacebook.statuses[0].conversation && messageDataFromFacebook.statuses[0].conversation.id) {
              statusData.conversationId = messageDataFromFacebook.statuses[0].conversation.id
              const logConversation = new LogConversation()
              const conversationExpireyTime = messageDataFromFacebook.statuses[0].conversation.expiration_timestamp ? moment.unix(messageDataFromFacebook.statuses[0].conversation.expiration_timestamp).utc().format('YYYY-MM-DD hh:mm:ss') : '2000-01-01 00:00:01'
              const conversationType = messageDataFromFacebook.statuses[0].conversation.origin && messageDataFromFacebook.statuses[0].conversation.origin.type ? __constants.LOG_CONVERSATION_ON_TYPE_MAPPING[messageDataFromFacebook.statuses[0].conversation.origin.type.toLowerCase()] : 'na'
              logConversation.add(messageDataFromFacebook.statuses[0].conversation.id, messageData.businessNumber, messageData.from, conversationExpireyTime, conversationType)
                .then(logAdded => __logger.info('facebook message status QueueConsumer:: conversation log added'))
                .catch(err => __logger.error('facebook message status QueueConsumer:: error while adding conversation log', err, err ? err.toString() : '', messageDataFromFacebook))
            }
            messageHistoryService.addMessageHistoryDataService(statusData)
              .then(statusDataAdded => {
                statusData.messageId = statusDataAdded.messageId
                statusData.to = statusDataAdded.businessNumber
                statusData.from = statusDataAdded.endConsumerNumber
                statusData.customOne = statusDataAdded.custom.customOne
                statusData.customTwo = statusDataAdded.custom.customTwo
                statusData.customThree = statusDataAdded.custom.customThree
                statusData.customFour = statusDataAdded.custom.customFour
                delete messageData.retryCount
                delete statusData.serviceProviderMessageId
                delete statusData.businessNumber
                delete statusData.endConsumerNumber
                delete statusData.conversationId
                return redirectService.webhookPost(statusData.to, statusData)
              })
              .then(response => rmqObject.channel[queue].ack(mqData))
              .catch(err => {
                const telegramErrorMessage = 'FacebookMessageStatus ~ fetchFromQueue function ~ facebook incoming status QueueConsumer::error'
                errorToTelegram.send(err, telegramErrorMessage)
                __logger.error('ppperrrrrrrrrr', err, retryCount)
                // __logger.info('condition --->', err.type, __constants.RESPONSE_MESSAGES.NOT_REDIRECTED, err.type === __constants.RESPONSE_MESSAGES.NOT_REDIRECTED)
                if (err && err.type === __constants.RESPONSE_MESSAGES.NOT_REDIRECTED) {
                  // __logger.info('time to check retry count', retryCount, __constants.INCOMING_MESSAGE_RETRY.tyntec, retryCount < __constants.INCOMING_MESSAGE_RETRY.tyntec)
                  if (retryCount < __constants.INCOMING_MESSAGE_RETRY.facebook) {
                    const oldObj = JSON.parse(mqData.content.toString())
                    oldObj.retryCount = retryCount + 1
                    // __logger.info('requeing --->', oldObj)
                    sendToFacebookMessageStatusQueue(oldObj, rmqObject)
                  }
                }
                rmqObject.channel[queue].ack(mqData)
              })
          } catch (err) {
            const telegramErrorMessage = 'FacebookMessageStatus ~ fetchFromQueue function ~ facebook message status QueueConsumer::error while parsing: try/catch'
            errorToTelegram.send(err, telegramErrorMessage)
            __logger.error('facebook message status QueueConsumer::error while parsing: ', err.toString())
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

class Worker extends FacebookConsumer {
  start () {
    __logger.info((new Date()).toLocaleString() + '   >> Worker PID:', process.pid)
    super.startServer()
  }
}

module.exports.worker = new Worker()
