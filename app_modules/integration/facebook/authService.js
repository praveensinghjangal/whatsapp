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
  WabaLoginApi (username, password, newPassword, url, graphApiKey, userAccountIdByProvider, wabaNumber, userId, saveInRedisAndDb) {
    const apiCalled = q.defer()
    const http = new HttpService(60000)
    const headers = { Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString('base64') || ''}` }
    const resolveObj = { graphApiKey: graphApiKey, baseUrl: url, userAccountIdByProvider }
    const body = {}
    if (newPassword) {
      body.new_password = newPassword
    }
    http.Post(body, 'body', url + __constants.FACEBOOK_ENDPOINTS.login, headers, __config.service_provider_id.facebook)
      .then(data => {
        __logger.info('fb: AuthService: WabaLoginApi(' + wabaNumber + '):', { data })
        data = data.body || data
        if (data && data.users && data.users.length > 0 && data.users[0].token) {
          resolveObj.apiKey = data.users[0].token
          resolveObj.timeLeftToExpire = +moment(data.users[0].expires_after).format('x') - new Date().getTime()
          if (saveInRedisAndDb) {
            const wabaService = new WabaService()
            return wabaService.updateWabizApiKeyAndExpireyTime(wabaNumber, data.users[0].token, data.users[0].expires_after, userId)
          } else {
            return resolveObj
          }
        } else {
          return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.ACCESS_DENIED, err: data.errors })
        }
      })
      .then(updateRes => {
        apiCalled.resolve(resolveObj)
      })
      .catch(err => {
        __logger.error('fb: AuthService: WabaLoginApi(' + wabaNumber + '): catch: ', err)
        apiCalled.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return apiCalled.promise
  }
}

class Authentication {
  constructor (userId) {
    this.userId = userId
  }

  setFaceBookTokensByWabaNumber (wabaNumber) {
    const dataFetched = q.defer()
    const redisService = new RedisService()
    redisService.getWabaDataByPhoneNumber(wabaNumber)
      .then(wabaData => {
        __logger.info('fb: authService: checking FB token expiry .....')
        __logger.info('wabaData----> ', wabaData, new Date().getTime())
        // wabaData.wabizBaseUrl = 'https://10.40.13.240:9090'
        const timeLeftToExpire = wabaData.wabizApiKeyExpiresOn ? +moment(wabaData.wabizApiKeyExpiresOn).format('x') - new Date().getTime() : 0
        __logger.info('fb: authService: setFBTokenByWabaNumber(): timeLeftToExpire:', timeLeftToExpire)
        if (__constants.FB_REDIS_KEY_BUFFER_TIME) {
          const internalFunctions = new InternalFunctions()
          return internalFunctions.WabaLoginApi(wabaData.wabizUsername, wabaData.wabizPassword, null, wabaData.wabizBaseUrl, wabaData.graphApiKey, wabaData.userAccountIdByProvider, wabaNumber, this.userId, true)
        } else {
          return { baseUrl: wabaData.wabizBaseUrl, apiKey: wabaData.apiKey, graphApiKey: wabaData.graphApiKey, userAccountIdByProvider: wabaData.userAccountIdByProvider, timeLeftToExpire }
        }
      })
      .then(tokenData => redisService.setFacebookAuthKeysInRedis(tokenData, wabaNumber, __config.service_provider_id.facebook, this.userId))
      .then(data => dataFetched.resolve(data))
      .catch(err => {
        __logger.error('fb: AuthService: setFaceBookTokensByWabaNumber(' + wabaNumber + '): catch:', err)
        dataFetched.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return dataFetched.promise
  }

  getFaceBookTokensByWabaNumber (wabaNumber) {
    __logger.info('fb: authService: getFaceBookTokensByWabaNumber(' + wabaNumber + '):')
    const dataFetched = q.defer()
    const redisService = new RedisService()
    redisService.getFacebookAuthKeys(wabaNumber)
      .then(data => {
        if (!data) {
          __logger.info('fb: authService: getFaceBookTokensByWabaNumber(' + wabaNumber + '): Setting new data')
          return this.setFaceBookTokensByWabaNumber(wabaNumber, this.userId)
        } else {
          return data
        }
      })
      .then(data => dataFetched.resolve(data))
      .catch(err => {
        __logger.error('fb: authService: getFaceBookTokensByWabaNumber(' + wabaNumber + '): catch: while getting Fb Auth Key', err)
        dataFetched.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return dataFetched.promise
  }
}

module.exports = { InternalFunctions, Authentication }
