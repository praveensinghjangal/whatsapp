const q = require('q')
const HttpService = require('../service/httpService')
const __config = require('../../../config')
const tyntectConfig = __config.integration.tyntec
const __constants = require('../../../config/constants')
// const saveApiLog = require('../service/saveApiLog')
const RedisService = require('../../../lib/redis_service/redisService')
const __logger = require('../../../lib/logger')

class WabaAccount {
  constructor () {
    this.http = new HttpService(60000)
  }

  getAccountInfo (wabaNumber) {
    __logger.info('wabaNumber', wabaNumber)
    const deferred = q.defer()
    if (wabaNumber) {
      const redisService = new RedisService()
      redisService.getWabaDataByPhoneNumber(wabaNumber)
        .then(data => {
          __logger.info('dataatatatat', data, typeof data)
          let url = tyntectConfig.baseUrl + __constants.TYNTEC_ENDPOINTS.getAccountInfo
          url = url.split(':accountId').join(data.userAccountIdByProvider || '')
          __logger.info('URL====', url)
          const headers = {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            apikey: data.apiKey
          }
          return this.http.Get(url, headers)
        })
        .then((accountData) => {
          if (accountData && accountData.constructor.name.toLowerCase() === 'object') {
            return deferred.resolve({ ...__constants.RESPONSE_MESSAGES.SUCCESS, data: accountData })
          } else if (accountData && accountData.status === 404) {
            return deferred.resolve({ ...__constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, data: {} })
          } else {
            return deferred.reject({ ...__constants.RESPONSE_MESSAGES.ERROR_CALLING_PROVIDER, err: accountData.whatsAppAccountId || accountData, data: {} })
          }
        })
        .catch(err => deferred.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err }))
      return deferred.promise
    } else {
      deferred.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Missing WabaNumber' })
      return deferred.promise
    }
  }

  updateProfilePic (wabaNumber, profilePicBuffer) {
    __logger.info('wabaNumber & profilePic--', wabaNumber, profilePicBuffer)
    const deferred = q.defer()
    const redisService = new RedisService()
    redisService.getWabaDataByPhoneNumber(wabaNumber)
      .then(data => {
        __logger.info('dataatatatat', data)
        let url = tyntectConfig.baseUrl + __constants.TYNTEC_ENDPOINTS.updateProfilePic
        url = url.split(':phoneNumber').join(data.id || '')
        __logger.info('URL====', url)
        const headers = {
          'Content-Type': 'image/png',
          Accept: 'application/problem+json',
          apikey: data.apiKey
        }
        return this.http.Put(profilePicBuffer, 'body', url, headers, false)
      })
      .then((accountData) => {
        __logger.info('Dataaaaa', accountData)
        if (accountData && accountData.statusCode === 204) {
          deferred.resolve({ type: __constants.RESPONSE_MESSAGES.SUCCESS, data: {} })
        } else {
          return deferred.reject({ type: __constants.RESPONSE_MESSAGES.ERROR_CALLING_PROVIDER, err: {} })
        }
      })
      .catch(err => deferred.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err }))
    return deferred.promise
  }
}

module.exports = WabaAccount
