const q = require('q')
const __db = require('../../../lib/db')
const url = require('../../../lib/util/url')
const HttpService = require('../../../lib/http_service')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const __config = require('../../../config')
const RedisService = require('../../../lib/redis_service/redisService')
const rabbitmqHeloWhatsapp = require('../../../lib/db').rabbitmqHeloWhatsapp

const initial = () => {
  const defer = q.defer()
  defer.resolve(true)
  return defer.promise
}

const sendToHeloCampaign = (payload) => {
  const userId = payload.userId || null
  delete payload.userId
  if (payload.heloCampaign && __config.heloCampaignStatus.includes(payload.state)) {
    return __db.rabbitmqHeloWhatsapp.sendToQueue(__constants.MQ['webhookHeloCampaign_' + userId + '_' + payload.wabaNumber], JSON.stringify({ ...payload, url: __config.heloCampaignWebhookUrl }))
  } else {
    const defer = q.defer()
    defer.resolve(true)
    return defer.promise
  }
}

const sendToUser = (payload) => {
  const userId = payload.userId || null
  delete payload.userId
  if (payload && payload.webhookPostUrl && __constants.SEND_WEBHOOK_ON.includes(payload.state)) {
    if (!url.isValid(payload.webhookPostUrl)) {
      __logger.info('sendToUser ~ invalid webhook URL', payload)
      return true
    } else {
      return __db.rabbitmqHeloWhatsapp.sendToQueue(__constants.MQ['webhookQueue_' + userId + '_' + payload.wabaNumber], JSON.stringify({ ...payload, url: payload.webhookPostUrl }))
    }
  } else {
    const defer = q.defer()
    defer.resolve(true)
    return defer.promise
  }
}

const queueCall = (payload, userId) => {
  const defer = q.defer()
  __logger.info('~ inside redirectservice', payload)
  initial()
    .then(() => {
      return [sendToHeloCampaign({ ...payload, userId }), sendToUser({ ...payload, userId })]
    })
    .spread((responseData1, responseData2) => {
      defer.resolve(true)
    })
    .then(responseData => defer.resolve(responseData))
    .catch(err => {
      defer.reject(err)
    })
  return defer.promise
}
class RedirectService {
  webhookPost (wabaNumber, payload) {
    __logger.info('inside webhook post service', payload)
    const redirected = q.defer()
    const redisService = new RedisService()
    const validPayload = {
      ...payload
    }

    if (payload.retryCount) {
      delete validPayload.retryCount
      delete validPayload.wabaNumber
    } else {
      payload.retryCount = 0
      payload.wabaNumber = wabaNumber
    }
    redisService.getWabaDataByPhoneNumber(wabaNumber)
      .then(data => {
        __logger.info('~ Got redis data,', data)
        if (payload && payload.content && payload.retryCount === 0) {
          this.callMessageFlow(data, payload)
        }
        if (payload && payload.whatsapp && payload.whatsapp.text && payload.retryCount === 0) {
          payload.content = { text: payload.whatsapp.text, contentType: 'text' }
          this.callMessageFlow(data, payload)
        }
        payload.heloCampaign = data.isHeloCampaign
        payload.webhookPostUrl = data.webhookPostUrl
        __logger.info('~ data and webhook before sending queue', data, payload)
        return queueCall(payload, data.userId)
      })
      .then(result => {
        __logger.info('~ response after the queue functionality in redirect Service ', result)
        if (result.notRedirected) {
          return redirected.reject({ type: __constants.RESPONSE_MESSAGES.SUCCESS, data: 'invalid url or no url found' })
        } else {
          return redirected.resolve({ type: __constants.RESPONSE_MESSAGES.SUCCESS, data: result })
        }
      })
      .catch(err => redirected.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err }))
    return redirected.promise
  }

  callMessageFlow (redisData, payload) {
    // if bot flag true then hit or else do nothing
    __logger.info('Inside callMessageFlow', redisData, payload)
    if (payload && payload.content && payload.content.text) {
      payload.content.text = payload.content.text.trim()
      __logger.info('payload text', payload.content.text, payload.content.text.length === redisData.optinText.length && payload.content.text.toLowerCase() === redisData.optinText)
      if (payload.content.text.length === redisData.optinText.length && payload.content.text.toLowerCase() === redisData.optinText.toLowerCase()) {
        // TODO:
        payload.isVavaOptin = true
      }
    }
    __logger.info('2nd check ', payload)
    if ((redisData && redisData.chatbotActivated) || payload.isVavaOptin === true) {
      __logger.info('Inside to send req to chatbot')
      const http = new HttpService(3000)
      const apiUrl = __config.chatAppUrl + __constants.CHAT_APP_ENDPOINTS.chatFlow
      const headers = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: __config.chatAppToken
      }
      http.Post(payload, 'body', apiUrl, headers, redisData.serviceProviderId)
        .then(apiRes => {
          // __logger.info('webhookPost api ressssssssssssssssss', apiRes.statusCode, apiRes.body)
          if (apiRes.statusCode >= 200 && apiRes.statusCode < 300) {
            __logger.info(' Redirected', __constants.RESPONSE_MESSAGES.SUCCESS, apiRes.body)
          } else {
            __logger.info('Not Redirected', __constants.RESPONSE_MESSAGES.NOT_REDIRECTED, apiRes.body)
          }
        })
    } else {
      // __logger.info('Nothing to do')
    }
  }

  // todo: to move from here
  sendToRetryMessageSendQueue (message, retryCount) {
    // __logger.info('sendToRetryMessageSendQueue Before', message)
    __logger.info('sendToRetryMessageSendQueue Before', retryCount)
    message.retryCount = retryCount.count === 0 ? 1 : ++retryCount.count
    const delayQueue = __constants.MQ[`delay_failed_to_redirect_${message.retryCount * 10}_sec`]
    __logger.info('Delay Queue Status', delayQueue)
    const messageRouted = q.defer()
    if (message.retryCount && message.retryCount >= 1 && message.retryCount < 6) {
      rabbitmqHeloWhatsapp.sendToQueue(delayQueue, JSON.stringify(message), 0)
        .then(() => messageRouted.resolve(true))
        .catch(err => messageRouted.reject(err))
    } else {
      messageRouted.resolve({ type: __constants.RESPONSE_MESSAGES.LIMIT_EXCEEDED, data: {}, err: {} })
    }
    return messageRouted.promise
  }
}

module.exports = RedirectService
