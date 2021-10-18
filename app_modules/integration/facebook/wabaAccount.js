const q = require('q')
const HttpService = require('../service/httpService')
// const __config = require('../../../config')
// const tyntectConfig = __config.integration.tyntec
const __constants = require('../../../config/constants')
// const saveApiLog = require('../service/saveApiLog')
// const RedisService = require('../../../lib/redis_service/redisService')
const __logger = require('../../../lib/logger')
const DataMapper = require('./dataMapper')
// const urlValidator = require('../../../lib/util/url')

const AuthService = require('../facebook/authService')

class WabaAccount {
  constructor (maxConcurrent, userId) {
    this.userId = userId
    this.http = new HttpService(60000)
    this.dataMapper = new DataMapper()
  }

  updateProfileOnly (baseUrl, apiKey, wabaData) {
    const deferred = q.defer()
    const url = `${baseUrl}${__constants.FACEBOOK_ENDPOINTS.updateAboutProfile}`
    __logger.info('URL====', url)
    const headers = {
      'Content-Type': 'application/json',
      Accept: '*/*',
      Authorization: `Bearer ${apiKey}`
    }
    this.http.Patch({ text: wabaData.whatsappStatus }, url, headers)
      .then(reqBody => {
        return this.dataMapper.updateBusinessProfileDetails(wabaData)
      })
      .then(data => {
        const url = `${baseUrl}${__constants.FACEBOOK_ENDPOINTS.updateBusinessProfile}`
        const headers = {
          'Content-Type': 'application/json',
          Accept: '*/*',
          Authorization: `Bearer ${apiKey}`
        }
        return this.http.Post(data, 'body', url, headers)
      }).then(resp => {
        deferred.resolve(resp)
      }).catch(err => {
        deferred.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return deferred.promise
  }

  updateWebhookUrl (baseUrl, apiKey, wabaData) {
    const url = `${baseUrl}${__constants.FACEBOOK_ENDPOINTS.updateWebhook}`
    __logger.info('URL====', url)
    const headers = {
      'Content-Type': 'application/json',
      Accept: '*/*',
      Authorization: `Bearer ${apiKey}`
    }
    return this.http.Patch({
      webhooks: {
        url: wabaData.webhookPostUrl
      }
    }, url, headers)
  }

  updateProfile (wabaNumber, wabaData) {
    __logger.info('inside update profile', wabaNumber, wabaData)
    const deferred = q.defer()
    if (wabaNumber && wabaData) {
      let baseUrl
      let apiKey
      //   let spId = ''
      //   let url = tyntectConfig.baseUrl + __constants.TYNTEC_ENDPOINTS.updateProfile
      const authService = new AuthService(this.userId)
      authService.getFaceBookTokensByWabaNumber(wabaNumber)
        .then(data => {
          console.log('test', data)
          baseUrl = data.baseUrl
          apiKey = data.apiKey
          if (wabaData.webhookPostUrl) {
            return this.updateWebhookUrl(baseUrl, apiKey, wabaData)
          } else {
            return this.updateProfileOnly(baseUrl, apiKey, wabaData)
          }
        })
        .then(accountData => {
          if (accountData) {
            return deferred.resolve({ ...__constants.RESPONSE_MESSAGES.SUCCESS, data: {} })
          } else {
            return deferred.reject({ ...__constants.RESPONSE_MESSAGES.ERROR_CALLING_PROVIDER, err: accountData.statusCode, data: {} })
          }
        })
        .catch(err => deferred.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err }))
    } else {
      deferred.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Missing WabaNumber' })
    }
    return deferred.promise
  }
}

module.exports = WabaAccount
