const q = require('q')
const HttpService = require('./httpService')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const __config = require('../../../config')
const RedisService = require('../../../lib/redis_service/redisService')
const url = require('../../../lib/util/url')
const rejectionHandler = require('../../../lib/util/rejectionHandler')

class RedirectService {
  webhookPost (wabaNumber, payload) {
    __logger.info('inside webhook post service', payload, wabaNumber)
    const redirected = q.defer()
    const http = new HttpService(3000)
    const redisService = new RedisService()
    redisService.getWabaDataByPhoneNumber(wabaNumber)
      .then(data => {
        this.callMessageFlow(data, payload)
        const headers = {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }
        if (data && data.webhookPostUrl && url.isValid(data.webhookPostUrl)) {
          return http.Post(payload, 'body', data.webhookPostUrl, headers)
        } else {
          return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.INVALID_URL, err: null })
        }
      })
      .then(apiRes => {
        // __logger.info('webhookPost api ressssssssssssssssss', apiRes.statusCode, apiRes.body)
        if (apiRes.statusCode >= 200 && apiRes.statusCode < 300) {
          redirected.resolve({ type: __constants.RESPONSE_MESSAGES.SUCCESS, data: apiRes.body })
        } else {
          redirected.reject({ type: __constants.RESPONSE_MESSAGES.NOT_REDIRECTED, err: apiRes.body })
        }
      })
      .catch(err => redirected.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err }))
    return redirected.promise
  }

  callMessageFlow (redisData, payload) {
    // if bot flag true then hit or else do nothing
    console.log('Inside callMessageFlow')

    if (redisData && redisData.chatbotActivated) {
      console.log('Inside if')
      const http = new HttpService(3000)
      const apiUrl = __config.base_url + __constants.INTERNAL_END_POINTS.chatFlow
      const headers = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: __config.authTokens[0]
      }
      http.Post(payload, 'body', apiUrl, headers)
        .then(apiRes => {
          // __logger.info('webhookPost api ressssssssssssssssss', apiRes.statusCode, apiRes.body)
          if (apiRes.statusCode >= 200 && apiRes.statusCode < 300) {
            __logger.info(' Redirected', __constants.RESPONSE_MESSAGES.SUCCESS, apiRes.body)
          } else {
            __logger.info('Not Redirected', __constants.RESPONSE_MESSAGES.NOT_REDIRECTED, apiRes.body)
          }
        })
    } else {
      __logger.info('Nothing to do')
    }
  }
}

module.exports = RedirectService
