const q = require('q')
const HttpService = require('../service/httpService')
const __db = require('../../../lib/db')
const rejectionHandler = require('../../../lib/util/rejectionHandler')
const __config = require('../../../config')
const tyntectConfig = __config.integration.tyntec
const saveApiLog = require('../service/saveApiLog')
const __constants = require('../../../config/constants')

class Message {
  constructor () {
    this.http = new HttpService(60000)
  }

  sendMessage (payload) {
    const deferred = q.defer()
    // add validation service same as send msg api
    let spId = ''
    let reqObj = {}
    __db.redis.get(payload.whatsapp.from)
      .then(data => {
        console.log('dataatatatat', data, typeof data)
        if (data) {
          data = JSON.parse(data)
          spId = data.serviceProviderId
          const headers = {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            apikey: data.apiKey
          }
          reqObj = { headers, payload }
          return this.http.Post(payload, 'body', tyntectConfig.baseUrl + tyntectConfig.endpoint.sendMessage, headers)
        } else {
          return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.WABA_ID_NOT_EXISTS, err: {}, data: {} })
        }
      })
      .then(apiRes => {
        apiRes = apiRes.body || apiRes
        saveApiLog(payload.messageId, apiRes.messageId, spId, 'sendMessage', reqObj, apiRes)
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
