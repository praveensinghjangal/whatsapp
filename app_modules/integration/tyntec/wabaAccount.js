const q = require('q')
const HttpService = require('../service/httpService')
const __config = require('../../../config')
const tyntectConfig = __config.integration.tyntec
const __constants = require('../../../config/constants')
// const saveApiLog = require('../service/saveApiLog')
const RedisService = require('../../../lib/redis_service/redisService')
const __logger = require('../../../lib/logger')
const DataMapper = require('./dataMapper')
const urlValidator = require('../../../lib/util/url')

class WabaAccount {
  constructor () {
    this.http = new HttpService(60000)
    this.dataMapper = new DataMapper()
  }

  getAccountInfo (wabaNumber) {
    __logger.info('wabaNumber', wabaNumber)
    const deferred = q.defer()
    if (wabaNumber) {
      const redisService = new RedisService()
      redisService.getWabaDataByPhoneNumber(wabaNumber)
        .then(data => {
          __logger.info('dataatatatat then 1', data, typeof data)
          let url = tyntectConfig.baseUrl + __constants.TYNTEC_ENDPOINTS.getAccountInfo
          url = url.split(':accountId').join(data.userAccountIdByProvider || '')
          __logger.info('URL====', url)
          const headers = {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            apikey: data.apiKey
          }
          return this.http.Get(url, headers, data.serviceProviderId)
        })
        .then((accountData) => {
          __logger.info('accountData then 2', { accountData })
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
    __logger.info('wabaNumber & profilePic--', wabaNumber)
    const deferred = q.defer()
    const redisService = new RedisService()
    redisService.getWabaDataByPhoneNumber(wabaNumber)
      .then(data => {
        __logger.info('dataatatatat then 1', { data })
        let url = tyntectConfig.baseUrl + __constants.TYNTEC_ENDPOINTS.updateProfilePic
        url = url.split(':phoneNumber').join(data.id || '')
        __logger.info('URL====', url)
        const headers = {
          'Content-Type': 'image/png',
          Accept: 'application/problem+json',
          apikey: data.apiKey
        }
        return this.http.Put(profilePicBuffer, 'body', url, headers, false, data.serviceProviderId)
      })
      .then((accountData) => {
        __logger.info('Dataaaaa then 2', { accountData })
        if (accountData && accountData.statusCode === 204) {
          deferred.resolve({ type: __constants.RESPONSE_MESSAGES.SUCCESS, data: {} })
        } else if (accountData && accountData.statusCode === 400) {
          return deferred.resolve({ type: __constants.RESPONSE_MESSAGES.INVALID_FILE_SIZE, err: {} })
        } else {
          return deferred.reject({ type: __constants.RESPONSE_MESSAGES.ERROR_CALLING_PROVIDER, err: {} })
        }
      })
      .catch(err => deferred.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err }))
    return deferred.promise
  }

  getAccountPhoneNoList (wabaNumber) {
    __logger.info('wabaNumber----', wabaNumber)
    const deferred = q.defer()
    if (wabaNumber) {
      const redisService = new RedisService()
      redisService.getWabaDataByPhoneNumber(wabaNumber)
        .then(data => {
          __logger.info('dataatatatat', data, typeof data)
          let url = tyntectConfig.baseUrl + __constants.TYNTEC_ENDPOINTS.getAccountPhoneNumberList
          url = url.split(':accountId').join(data.userAccountIdByProvider || '')
          __logger.info('URL====', url)
          const headers = {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            apikey: data.apiKey
          }
          return this.http.Get(url, headers, data.serviceProviderId)
        })
        .then((accountData) => {
          if (accountData && accountData.constructor.name.toLowerCase() === 'array' && accountData.length > 0) {
            return deferred.resolve({ ...__constants.RESPONSE_MESSAGES.SUCCESS, data: accountData })
          } else if (accountData && accountData.status === 404) {
            return deferred.resolve({ ...__constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, data: {} })
          } else {
            return deferred.reject({ ...__constants.RESPONSE_MESSAGES.ERROR_CALLING_PROVIDER, err: accountData.phoneNumber || accountData, data: {} })
          }
        })
        .catch(err => deferred.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err }))
      return deferred.promise
    } else {
      deferred.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Missing WabaNumber' })
      return deferred.promise
    }
  }

  getCurrentProfile (wabaNumber) {
    __logger.info('wabaNumber----', wabaNumber)
    const deferred = q.defer()
    if (wabaNumber) {
      const redisService = new RedisService()
      redisService.getWabaDataByPhoneNumber(wabaNumber)
        .then(data => {
          __logger.info('dataatatatat', data, typeof data)
          let url = tyntectConfig.baseUrl + __constants.TYNTEC_ENDPOINTS.getCurrentProfile
          url = url.split(':phoneNumber').join(data.id || '')
          __logger.info('URL====', url)
          const headers = {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            apikey: data.apiKey
          }
          return this.http.Get(url, headers, data.serviceProviderId)
        })
        .then((accountData) => {
          if (accountData && accountData.constructor.name.toLowerCase() === 'object' && accountData !== {}) {
            return deferred.resolve({ ...__constants.RESPONSE_MESSAGES.SUCCESS, data: accountData })
          } else if (accountData && accountData.status === 404) {
            return deferred.resolve({ ...__constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, data: {} })
          } else {
            return deferred.reject({ ...__constants.RESPONSE_MESSAGES.ERROR_CALLING_PROVIDER, err: accountData, data: {} })
          }
        })
        .catch(err => deferred.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err }))
      return deferred.promise
    } else {
      deferred.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Missing WabaNumber' })
      return deferred.promise
    }
  }

  updateProfile (wabaNumber, wabaData) {
    __logger.info('inside update profile', wabaNumber, wabaData)
    const deferred = q.defer()
    if (wabaNumber && wabaData) {
      let headers = {}
      let spId = ''
      let url = tyntectConfig.baseUrl + __constants.TYNTEC_ENDPOINTS.updateProfile
      const redisService = new RedisService()
      redisService.getWabaDataByPhoneNumber(wabaNumber)
        .then(data => {
          __logger.info('dataatatatat', data, typeof data)
          url = url.split(':phoneNumber').join(data.id || '')
          __logger.info('URL====', url)
          headers = {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            apikey: data.apiKey
          }
          spId = data.serviceProviderId
          return this.dataMapper.updateProfileDetails(wabaData)
        })
        .then(reqBody => this.http.Patch(reqBody, url, headers, spId))
        .then(accountData => {
          if (accountData && accountData.statusCode === 204) {
            return deferred.resolve({ ...__constants.RESPONSE_MESSAGES.SUCCESS, data: {} })
          } else if (accountData && accountData.statusCode === 404) {
            return deferred.resolve({ ...__constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, data: {} })
          } else if (accountData && accountData.body.status === 400) {
            return deferred.resolve({ ...__constants.RESPONSE_MESSAGES.INVALID_REQUEST, data: {} })
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

  setWebhook (wabaNumber, incomingMessageUrl, statusUrl) {
    __logger.info('inside setWebhook -->', wabaNumber, incomingMessageUrl, statusUrl)
    const deferred = q.defer()
    if (!wabaNumber || (!incomingMessageUrl && !statusUrl)) {
      deferred.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Please provide either incomingMessageUrl or statusUrl along with wabaNumber.' })
      return deferred.promise
    }
    if (incomingMessageUrl && !urlValidator.isValidHttp(incomingMessageUrl)) {
      deferred.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Please provide valid https URL for incomingMessageUrl.' })
      return deferred.promise
    }
    if (statusUrl && !urlValidator.isValidHttp(statusUrl)) {
      deferred.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Please provide valid https URL for statusUrl.' })
      return deferred.promise
    }
    let headers = {}
    let spId = ''
    const url = tyntectConfig.baseUrl + __constants.TYNTEC_ENDPOINTS.updateDefaultApp
    const redisService = new RedisService()
    redisService.getWabaDataByPhoneNumber(wabaNumber)
      .then(data => {
        __logger.info('dataatatatat', data, typeof data, 'API URL -->', url)
        headers = {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          apikey: data.apiKey
        }
        spId = data.serviceProviderId
        const reqBody = { webhooks: [] }
        if (incomingMessageUrl) {
          reqBody.webhooks.push({
            events: [__constants.TYNTEC_MESSAGE_EVENTS.moMessage],
            callbackUrl: incomingMessageUrl
          })
        }
        if (statusUrl) {
          reqBody.webhooks.push({
            events: [
              __constants.TYNTEC_MESSAGE_EVENTS.accepted,
              __constants.TYNTEC_MESSAGE_EVENTS.delivered,
              __constants.TYNTEC_MESSAGE_EVENTS.seen,
              __constants.TYNTEC_MESSAGE_EVENTS.failed,
              __constants.TYNTEC_MESSAGE_EVENTS.channelFailed,
              __constants.TYNTEC_MESSAGE_EVENTS.unknown,
              __constants.TYNTEC_MESSAGE_EVENTS.deleted
            ],
            callbackUrl: statusUrl
          })
        }
        __logger.info('request body -------->', reqBody)
        return this.http.Patch(reqBody, url, headers, spId)
      })
      .then(defaultAccountUpdated => {
        if (defaultAccountUpdated && defaultAccountUpdated.statusCode === 204) {
          return deferred.resolve({ ...__constants.RESPONSE_MESSAGES.SUCCESS, data: {} })
        } else if (defaultAccountUpdated && defaultAccountUpdated.statusCode === 404) {
          return deferred.resolve({ ...__constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, data: {} })
        } else if (defaultAccountUpdated && defaultAccountUpdated.body.status === 400) {
          return deferred.resolve({ ...__constants.RESPONSE_MESSAGES.INVALID_REQUEST, data: {} })
        } else {
          return deferred.reject({ ...__constants.RESPONSE_MESSAGES.ERROR_CALLING_PROVIDER, err: defaultAccountUpdated.statusCode, data: {} })
        }
      })
      .catch(err => deferred.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err }))
    return deferred.promise
  }
}

module.exports = WabaAccount
