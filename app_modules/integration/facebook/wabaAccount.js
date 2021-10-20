const q = require('q')
const HttpService = require('../service/httpService')
const __config = require('../../../config')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const DataMapper = require('./dataMapper')
const AuthService = require('../facebook/authService')

class WabaAccount {
  constructor (maxConcurrent, userId) {
    this.userId = userId
    this.http = new HttpService(60000, maxConcurrent, userId)
    this.dataMapper = new DataMapper()
  }

  callFacebookApi (baseUrl, apiKey, wabaData) {
    const deferred = q.defer()
    if (wabaData && wabaData.whatsappStatus) {
      const url = `${baseUrl}${__constants.FACEBOOK_ENDPOINTS.updateAboutProfile}`
      __logger.info('URL====', url)
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      }
      deferred.resolve(this.http.Patch({ text: wabaData.whatsappStatus }, url, headers, __config.service_provider_id.facebook))
    } else {
      deferred.resolve(true)
    }
    return deferred.promise
  }

  updateProfileOnly (baseUrl, apiKey, wabaData) {
    const deferred = q.defer()
    this.callFacebookApi(baseUrl, apiKey, wabaData)
      .then(reqBody => {
        return this.dataMapper.updateBusinessProfileDetails(wabaData)
      })
      .then(data => {
        const url = `${baseUrl}${__constants.FACEBOOK_ENDPOINTS.updateBusinessProfile}`
        const headers = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        }
        return this.http.Post(data, 'body', url, headers, __config.service_provider_id.facebook)
      }).then(resp => {
        deferred.resolve(resp)
      }).catch(err => {
        deferred.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return deferred.promise
  }

  // updateWebhookUrl (baseUrl, apiKey, wabaData) {
  //   const url = `${baseUrl}${__constants.FACEBOOK_ENDPOINTS.updateWebhook}`
  //   const headers = {
  //     'Content-Type': 'application/json',
  //     Authorization: `Bearer ${apiKey}`
  //   }
  //   return this.http.Patch({
  //     webhooks: {
  //       url: wabaData.webhookPostUrl
  //     }
  //   }, url, headers)
  // }

  updateProfile (wabaNumber, wabaData) {
    __logger.info('inside update profile', wabaNumber, wabaData)
    const deferred = q.defer()
    if (wabaNumber && wabaData) {
      const authService = new AuthService(this.userId)
      authService.getFaceBookTokensByWabaNumber(wabaNumber)
        .then(data => {
          return this.updateProfileOnly(data.baseUrl, data.apiKey, wabaData)
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
      deferred.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Missing WabaNumber and wabaData' })
    }
    return deferred.promise
  }
}

module.exports = WabaAccount
