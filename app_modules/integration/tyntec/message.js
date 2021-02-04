const q = require('q')
const HttpService = require('../service/httpService')
const __config = require('../../../config')
const tyntectConfig = __config.integration.tyntec
const saveMessageApiLog = require('../service/saveMessageApiLog')
const __constants = require('../../../config/constants')
const RedisService = require('../../../lib/redis_service/redisService')
const __logger = require('../../../lib/logger')

class Message {
  constructor (maxConcurrent, userId) {
    this.http = new HttpService(60000, maxConcurrent, userId)
  }

  sendMessage (payload) {
    const deferred = q.defer()
    // add validation service same as send msg api
    let spId = ''
    let reqObj = {}
    const redisService = new RedisService()

    redisService.getWabaDataByPhoneNumber(payload.whatsapp.from)
      .then(data => {
        __logger.info('called to send message', payload)
        spId = data.serviceProviderId
        const headers = {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          apikey: data.apiKey
        }
        reqObj = { headers, payload }
        __logger.info('tyntec send message api request', reqObj)
        return this.http.Post(payload, 'body', tyntectConfig.baseUrl + __constants.TYNTEC_ENDPOINTS.sendMessage, headers, spId)
      })
      .then(apiRes => {
        apiRes = apiRes.body || apiRes
        __logger.info('tyntec send message api response', apiRes)
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

  getMedia (wabaNumber, mediaId) {
    __logger.info('wabaNumber', wabaNumber)
    __logger.info('mediaId', mediaId)
    const deferred = q.defer()
    if (wabaNumber && mediaId) {
      const redisService = new RedisService()
      redisService.getWabaDataByPhoneNumber(wabaNumber)
        .then(data => {
          __logger.info('getMedia then 1', data, typeof data)
          let url = tyntectConfig.baseUrl + __constants.TYNTEC_ENDPOINTS.getMedia
          url = url.split(':mediaId').join(mediaId || '')
          __logger.info('URL====', url)
          const headers = { apikey: data.apiKey }
          return this.http.getMedia(url, headers, data.serviceProviderId)
        })
        .then((mediaData) => {
          __logger.info('mediaData then 2')
          if (mediaData.statusCode === __constants.RESPONSE_MESSAGES.SUCCESS.status_code) {
            const prefix = 'data:' + mediaData.headers['content-type'] + ';base64,'
            const img = Buffer.from(mediaData.body, 'binary').toString('base64')//  var img = new Buffer.from(body.toString(), "binary").toString("base64");
            return deferred.resolve({ ...__constants.RESPONSE_MESSAGES.SUCCESS, data: prefix + img })
          } else if (mediaData && mediaData.statusCode === __constants.RESPONSE_MESSAGES.NOT_FOUND.status_code) {
            return deferred.resolve({ ...__constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, data: {} })
          } else {
            return deferred.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: {} })
          }
        })
        .catch(err => {
          __logger.error('Integration layer getMedia::error: ', err)
          deferred.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
        })
      return deferred.promise
    } else if (!mediaId) {
      deferred.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Missing MediaId' })
      return deferred.promise
    } else {
      deferred.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Missing WabaNumber' })
      return deferred.promise
    }
  }
}

module.exports = Message
