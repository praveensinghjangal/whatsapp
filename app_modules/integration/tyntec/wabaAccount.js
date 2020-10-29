const q = require('q')
const HttpService = require('../service/httpService')
const __config = require('../../../config')
const tyntectConfig = __config.integration.tyntec
const __constants = require('../../../config/constants')
// const saveApiLog = require('../service/saveApiLog')
const RedisService = require('../../../lib/redis_service/redisService')
const __logger = require('../../../lib/logger')
const DataMapper = require('./dataMapper')

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
          url = tyntectConfig.baseUrl + __constants.TYNTEC_ENDPOINTS.updateProfile
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
