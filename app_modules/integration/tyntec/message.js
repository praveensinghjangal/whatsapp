const q = require('q')
const HttpService = require('../service/httpService')
const __config = require('../../../config')
const tyntectConfig = __config.integration.tyntec
const saveMessageApiLog = require('../service/saveMessageApiLog')
const __constants = require('../../../config/constants')
const RedisService = require('../../../lib/redis_service/redisService')
const logger = require('../../../lib/logger')

class Message {
  constructor () {
    this.http = new HttpService(60000)
  }

  sendMessage (payload) {
    const deferred = q.defer()
    // add validation service same as send msg api
    let spId = ''
    let reqObj = {}
    const redisService = new RedisService()

    redisService.getWabaDataByPhoneNumber(payload.whatsapp.from)
      .then(data => {
        logger.info('called to send message', reqObj)
        spId = data.serviceProviderId
        const headers = {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          apikey: data.apiKey
        }
        reqObj = { headers, payload }
        logger.info('tyntec send message api request', reqObj)
        return this.http.Post(payload, 'body', tyntectConfig.baseUrl + __constants.TYNTEC_ENDPOINTS.sendMessage, headers)
      })
      .then(apiRes => {
        apiRes = apiRes.body || apiRes
        logger.info('tyntec send message api response', apiRes)
        saveMessageApiLog(payload.messageId, apiRes.messageId, spId, 'sendMessage', reqObj, apiRes, payload.to)
        if (apiRes.messageId) {
          deferred.resolve({ type: __constants.RESPONSE_MESSAGES.SUCCESS, data: apiRes })
        } else {
          deferred.reject({ type: __constants.RESPONSE_MESSAGES.ERROR_SENDING_MESSAGE, err: apiRes, data: {} })
        }
      })
      .catch(err => deferred.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err }))
    return deferred.promise
  }
}

module.exports = Message
