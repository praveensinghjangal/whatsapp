const q = require('q')
const HttpService = require('./httpService')
const __db = require('../../../lib/db')
const rejectionHandler = require('../../../lib/util/rejectionHandler')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')

class RedirectService {
  webhookPost (wabaNumber, payload) {
    const redirected = q.defer()
    const http = new HttpService(2000)
    __db.redis.get(wabaNumber)
      .then(data => {
        console.log('dataatatatat', data, typeof data)
        if (data) {
          data = JSON.parse(data)
          const headers = {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          }
          return http.Post(payload, 'body', data.webhookPostUrl, headers)
        } else {
          return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.WABA_ID_NOT_EXISTS, err: {}, data: {} })
        }
      })
      .then(apiRes => {
        __logger.info('api ressssssssssssssssss', apiRes.statusCode, apiRes.body)
        if (apiRes.statusCode >= 200 && apiRes.statusCode < 300) {
          redirected.resolve({ type: __constants.RESPONSE_MESSAGES.SUCCESS, data: apiRes.body })
        } else {
          redirected.reject({ type: __constants.RESPONSE_MESSAGES.NOT_REDIRECTED, err: apiRes.body })
        }
      })
      .catch(err => redirected.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err }))
    return redirected.promise
  }
}

module.exports = RedirectService
