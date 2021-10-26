const q = require('q')
const HttpService = require('../service/httpService')
const __config = require('../../../config')
const saveMessageApiLog = require('../service/saveMessageApiLog')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const AuthService = require('./authService')
const DataMapper = require('./dataMapper')

class Message {
  constructor (maxConcurrent, userId) {
    this.http = new HttpService(60000, maxConcurrent, userId)
    this.dataMapper = new DataMapper()
    this.userId = userId
  }

  sendMessage (payload) {
    const deferred = q.defer()
    let reqObj = {}
    const authService = new AuthService(this.userId)
    authService.getFaceBookTokensByWabaNumber(payload.whatsapp.from)
      .then(data => {
        __logger.info('called to send message', payload)
        const headers = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${data.apiKey}`
        }
        reqObj = { headers, payload: JSON.parse(JSON.stringify(payload)) }
        const fbPayload = this.dataMapper.sendMessage(payload)
        return this.http.Post(fbPayload, 'body', data.baseUrl + __constants.FACEBOOK_ENDPOINTS.sendMessage, headers, __config.service_provider_id.facebook)
      })
      .then(apiRes => {
        apiRes = apiRes.body || apiRes
        __logger.info('facebook send message api response', apiRes)
        saveMessageApiLog(payload.messageId, (apiRes && apiRes.messages && apiRes.messages[0] && apiRes.messages[0].id) ? apiRes.messages[0].id : 'failed', __config.service_provider_id.facebook, 'sendMessage', reqObj, apiRes, payload.to)
        if (apiRes && apiRes.messages && apiRes.messages[0] && apiRes.messages[0].id) {
          deferred.resolve({ type: __constants.RESPONSE_MESSAGES.SUCCESS, data: apiRes })
        } else {
          deferred.reject({ type: __constants.RESPONSE_MESSAGES.ERROR_SENDING_MESSAGE, err: apiRes, data: {} })
        }
      })
      .catch(err => {
        deferred.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return deferred.promise
  }

  getMedia (wabaNumber, mediaId) {
    __logger.info('wabaNumber', wabaNumber)
    __logger.info('mediaId', mediaId)
    const deferred = q.defer()
    if (wabaNumber && mediaId) {
      const authService = new AuthService(this.userId)
      authService.getFaceBookTokensByWabaNumber(wabaNumber)
        .then(data => {
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
