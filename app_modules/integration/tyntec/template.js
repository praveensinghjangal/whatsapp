const q = require('q')
const HttpService = require('../service/httpService')
const __config = require('../../../config')
const tyntectConfig = __config.integration.tyntec
const __constants = require('../../../config/constants')
// const saveApiLog = require('../service/saveApiLog')
// const __constants = require('../../../config/constants')
const RedisService = require('../../../lib/redis_service/redisService')

class Message {
  constructor () {
    this.http = new HttpService(60000)
  }

  // when this service will be called we will call waba to get phone number to use here in redis
  addTemplate (templateData, wabaNumber) {
    const deferred = q.defer()
    let url = tyntectConfig.baseUrl + __constants.TYNTEC_ENDPOINTS.addTemplate
    const redisService = new RedisService()
    redisService.getWabaDataByPhoneNumber(wabaNumber)
      .then(data => {
        console.log('dataatatatat', data, typeof data)
        url = url.split(':accountId').join(data.userAccountIdByProvider || '')
        deferred.resolve({ url, templateData })
      })
      .catch(err => deferred.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err }))
    return deferred.promise
  }
}

module.exports = Message
