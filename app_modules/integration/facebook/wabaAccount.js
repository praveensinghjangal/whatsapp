const q = require('q')
const HttpService = require('../service/httpService')
const __config = require('../../../config')
// const tyntectConfig = __config.integration.tyntec
const __constants = require('../../../config/constants')
// const saveApiLog = require('../service/saveApiLog')
// const RedisService = require('../../../lib/redis_service/redisService')
const __logger = require('../../../lib/logger')
const DataMapper = require('./dataMapper')
// const urlValidator = require('../../../lib/util/url')

const IntegrationService = require('../index')

class WabaAccount {
  constructor (userId) {
    this.http = new HttpService(60000)
    this.dataMapper = new DataMapper()
  }

  updateProfile (wabaNumber, wabaData) {
    __logger.info('inside update profile', wabaNumber, wabaData)
    const deferred = q.defer()
    if (wabaNumber && wabaData) {
      let headers = {}
      let url
      let baseUrl
      let apiKey
      //   let spId = ''
      //   let url = tyntectConfig.baseUrl + __constants.TYNTEC_ENDPOINTS.updateProfile
      const authService = new IntegrationService.Authentication(__config.service_provider_id.facebook, this.userId)
      authService.getFaceBookTokensByWabaNumber(wabaNumber)
        .then(data => {
          console.log('test', data)
          baseUrl = data.baseUrl
          apiKey = data.apiKey
          url = `${baseUrl}${__constants.FACEBOOK_ENDPOINTS.updateAboutProfile}`
          __logger.info('dataatatatat', data, typeof data)
          __logger.info('URL====', url)
          headers = {
            'Content-Type': 'application/json',
            Accept: '*/*',
            Authorization: `Bearer ${apiKey}`
          }
          return this.http.Patch({ text: wabaData.whatsappStatus }, url, headers)
        })

        .then(reqBody => {
          return this.dataMapper.updateBusinessProfileDetails(wabaData)
        })
        .then(data => {
          url = `${baseUrl}${__constants.FACEBOOK_ENDPOINTS.updateBusinessProfile}`
          headers = {
            'Content-Type': 'application/json',
            Accept: '*/*',
            Authorization: `Bearer ${apiKey}`
          }
          return this.http.Post(data, url, headers)
        })
        .then(accountData => {
          if (accountData) {
            return deferred.resolve({ ...__constants.RESPONSE_MESSAGES.SUCCESS, data: {} })
          } else {
            return deferred.reject({ ...__constants.RESPONSE_MESSAGES.ERROR_CALLING_PROVIDER, err: accountData.statusCode, data: {} })
          }
        })
        .catch(err => deferred.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err }))
      return deferred.promise
    } else {
      deferred.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Missing WabaNumber' })
      return deferred.promise
    }
  }
}

module.exports = WabaAccount
