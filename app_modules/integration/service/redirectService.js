const q = require('q')
const HttpService = require('./httpService')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const RedisService = require('../../../lib/redis_service/redisService')

class RedirectService {
  webhookPost (wabaNumber, payload) {
    __logger.info('inside webhook post service', payload)
    __logger.info('inside webhook post service', wabaNumber)
    const redirected = q.defer()
    const http = new HttpService(3000)
    const redisService = new RedisService()
    redisService.getWabaDataByPhoneNumber(wabaNumber)
      .then(data => {
        console.log('dataatatatat', data, typeof data)
        const headers = {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }
        return http.Post(payload, 'body', data.webhookPostUrl, headers)
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
