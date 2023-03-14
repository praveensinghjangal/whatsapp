const q = require('q')
const HttpService = require('../service/httpService')
const __config = require('../../../config')
const saveMessageApiLog = require('../service/saveMessageApiLog')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const AuthService = require('./authService').Authentication
const DataMapper = require('./dataMapper')
const RedisService = require('../../../lib/redis_service/redisService')
class Message {
  constructor (maxConcurrent, userId) {
    this.http = new HttpService(60000, maxConcurrent, userId)
    this.dataMapper = new DataMapper()
    this.userId = userId
    this.maxTpsToProvider = maxConcurrent
  }

  sendMessage (payload) {
    const deferred = q.defer()
    let reqObj = {}
    let baseUrl = ''
    let headers = {}
    const authService = new AuthService(this.userId)
    authService.getFaceBookTokensByWabaNumber(payload.whatsapp.from)
      .then(data => {
        __logger.info('fb: message: sendMessage(' + payload.whatsapp.from + '): Got FB Token By Waba Number ::::: ')
        headers = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${data.apiKey}`
        }
        baseUrl = data.baseUrl
        reqObj = { headers, payload: JSON.parse(JSON.stringify(payload)) }
        return this.dataMapper.sendMessage(payload, this.maxTpsToProvider)
      })
      .then((fbPayload) => {
        __logger.info('fb: message: sendMessage(' + payload.whatsapp.from + '): Payload before sending to Fb:', fbPayload)
        return this.http.Post(fbPayload, 'body', baseUrl + __constants.FACEBOOK_ENDPOINTS.sendMessage, headers, __config.service_provider_id.facebook)
      })
      .then(apiRes => {
        apiRes = apiRes.body || apiRes
        __logger.info('fb: message: sendMessage(' + payload.whatsapp.from + '): Fb response: Then 3:', { fbRes: apiRes.body })
        saveMessageApiLog(payload.messageId, (apiRes && apiRes.messages && apiRes.messages[0] && apiRes.messages[0].id) ? apiRes.messages[0].id : 'failed', __config.service_provider_id.facebook, 'sendMessage', reqObj, apiRes, payload.to, payload.whatsapp.from)
        if (apiRes && apiRes.messages && apiRes.messages[0] && apiRes.messages[0].id) {
          if (payload && payload.whatsapp && payload.whatsapp.template && payload.whatsapp.template.templateId && __constants.STATIC_TEMPLATE_ID === payload.whatsapp.template.templateId) {
            const redisService = new RedisService()
            redisService.setStaticTemplateForInternalUse(payload.whatsapp.from, payload.to, payload.messageId)
          }
          deferred.resolve({ type: __constants.RESPONSE_MESSAGES.SUCCESS, data: apiRes })
        } else {
          __logger.error('fb: message: sendMessage(' + payload.whatsapp.from + '): Fb response: Then 3 :: Reject :: Response Not Available')
          deferred.reject({ type: __constants.RESPONSE_MESSAGES.ERROR_SENDING_MESSAGE, err: apiRes, data: {} })
        }
      })
      .catch(err => {
        __logger.error('fb: message: sendMessage(' + payload.whatsapp.from + '): Fb response: catch: Error while getting fb token', err.stack ? err.stack : err)
        deferred.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return deferred.promise
  }

  getMedia (wabaNumber, mediaId) {
    __logger.info('fb: message: getMedia(' + wabaNumber + '): ', mediaId)
    const deferred = q.defer()
    if (wabaNumber && mediaId) {
      const authService = new AuthService(this.userId)
      authService.getFaceBookTokensByWabaNumber(wabaNumber)
        .then(data => {
          __logger.info('fb: message: getMedia(' + wabaNumber + '): Got FB Token By Waba Number ::::: ')
          let url = data.baseUrl + __constants.FACEBOOK_ENDPOINTS.getMedia
          url = url.split(':MediaId').join(mediaId || '')
          __logger.info('URL====', url)
          const headers = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${data.apiKey}`
          }
          return this.http.getMedia(url, headers, __config.service_provider_id.facebook)
        })
        .then((mediaData) => {
          if (mediaData.statusCode === __constants.RESPONSE_MESSAGES.SUCCESS.status_code) {
            const prefix = 'data:' + mediaData.headers['content-type'] + ';base64,'
            const img = Buffer.from(mediaData.body, 'binary').toString('base64')//  var img = new Buffer.from(body.toString(), "binary").toString("base64");
            return deferred.resolve({ ...__constants.RESPONSE_MESSAGES.SUCCESS, data: prefix + img })
          } else if (mediaData && mediaData.statusCode === __constants.RESPONSE_MESSAGES.NOT_FOUND.status_code) {
            return deferred.resolve({ ...__constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, data: {} })
          } else {
            __logger.error('fb: message: getMedia(' + wabaNumber + '): then 2: else :: Reject :: ', mediaData)
            return deferred.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: {} })
          }
        })
        .catch(err => {
          __logger.error('fb: message: getMedia(' + wabaNumber + '): catch:', err)
          deferred.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
        })
      return deferred.promise
    } else if (!mediaId) {
      __logger.error('fb: message: getMedia(' + wabaNumber + '): ::::: Missing MediaId :::::')
      deferred.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Missing MediaId' })
      return deferred.promise
    } else {
      __logger.error('fb: message: getMedia(' + wabaNumber + '): ::::: Missing WabaNumber & MediaId :::::')
      deferred.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Missing WabaNumber' })
      return deferred.promise
    }
  }
}

module.exports = Message
