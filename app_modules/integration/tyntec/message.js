const q = require('q')
const HttpService = require('../service/httpService')
const __db = require('../../../lib/db')
const rejectionHandler = require('../../../lib/util/rejectionHandler')
const __config = require('../../../config')
const tyntectConfig = __config.integration.tyntec

class Message {
  constructor () {
    this.http = new HttpService(60000)
  }

  sendMessage (payload) {
    const deferred = q.defer()
    // add validation service same as send msg api
    __db.redis.get(payload.whatsapp.from)
      .then(data => {
        const reqObj = {}
        console.log('dataatatatat', data, typeof data)
        if (data) {
          data = JSON.parse(data)
          const headers = {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            apikey: data.apiKey
          }
          reqObj = { headers, payload }
          return this.http.Post(payload, 'body', tyntectConfig.baseUrl + tyntectConfig.endpoint.sendMessage, headers)
        } else {
          return rejectionHandler('waba not configured for this number')
        }
      })
      .then(apiRes => {
        if (apiRes.messageId) {
          console.log('success ---> store into db', apiRes)
        } else {
          deferred.reject(apiRes)
        }
      })
      .catch(err => deferred.reject(err))
    return deferred.promise
  }
}

module.exports = Message
