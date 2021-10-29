const q = require('q')
const moment = require('moment')
const __constants = require('../../../config/constants')
const __config = require('../../../config')
const __logger = require('../../../lib/logger')
const HttpService = require('../service/httpService')
const rejectionHandler = require('../../../lib/util/rejectionHandler')
const WabaService = require('../../whatsapp_business/services/businesAccount')
const RedisService = require('../../../lib/redis_service/redisService')

class InternalFunctions {
  WabaLoginApi (username, password, url, graphApiKey, userAccountIdByProvider, wabaNumber, userId) {
    const apiCalled = q.defer()
    const http = new HttpService(60000)
    const headers = { Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString('base64') || ''}` }
    const resolveObj = { graphApiKey: graphApiKey, baseUrl: url, userAccountIdByProvider }
    http.Post({}, 'body', url + __constants.FACEBOOK_ENDPOINTS.login, headers, __config.service_provider_id.facebook)
      .then(data => {
        __logger.info('post metadata api response', data)
        data = data.body || data
        if (data && data.users && data.users.length > 0 && data.users[0].token) {
          resolveObj.apiKey = data.users[0].token
          resolveObj.timeLeftToExpire = +moment(data.users[0].expires_after).format('x')
          const wabaService = new WabaService()
          return wabaService.updateWabizApiKeyAndExpireyTime(wabaNumber, data.users[0].token, data.users[0].expires_after, userId)
        } else {
          return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.ACCESS_DENIED, err: { } })
        }
      })
      .then(updateRes => apiCalled.resolve(resolveObj))
      .catch(err => apiCalled.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err }))
    return apiCalled.promise
  }

  setAuthDataInRedis (wabaNumber, userId) {
    const dataFetched = q.defer()
    const redisService = new RedisService()
    redisService.getWabaDataByPhoneNumber(wabaNumber)
      .then(wabaData => {
        const timeLeftToExpire = wabaData.wabizApiKeyExpiresOn ? +moment(wabaData.wabizApiKeyExpiresOn).format('x') - new Date().getTime() : 0
        if (timeLeftToExpire < __constants.FB_REDIS_KEY_BUFFER_TIME) {
          return this.WabaLoginApi(wabaData.wabizUsername, wabaData.wabizPassword, wabaData.wabizBaseUrl, wabaData.graphApiKey, wabaData.userAccountIdByProvider, wabaNumber, userId)
        } else {
          return { baseUrl: wabaData.wabizBaseUrl, apiKey: wabaData.apiKey, graphApiKey: wabaData.graphApiKey, userAccountIdByProvider: wabaData.userAccountIdByProvider, timeLeftToExpire }
        }
      })
      .then(tokenData => redisService.setFacebookAuthKeysInRedis(tokenData, wabaNumber, __config.service_provider_id.facebook, userId))
      .then(data => dataFetched.resolve(data))
      .catch(err => {
        __logger.error('error in auth', err)
        dataFetched.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return dataFetched.promise
  }
}

class Authentication {
  constructor (userId) {
    this.userId = userId
  }

  getFaceBookTokensByWabaNumber (wabaNumber) {
    __logger.info('inside getFaceBookTokensByWabaNumber', wabaNumber)
    const dataFetched = q.defer()
    const redisService = new RedisService()
    redisService.getFacebookAuthKeys(wabaNumber)
      .then(data => {
        if (!data) {
          const internalFunctions = new InternalFunctions()
          return internalFunctions.setAuthDataInRedis(wabaNumber, this.userId)
        } else {
          return data
        }
      })
      .then(data => dataFetched.resolve(data))
      .catch(err => {
        __logger.error('error in auth', err)
        dataFetched.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })

    return dataFetched.promise
  }
}

module.exports = Authentication