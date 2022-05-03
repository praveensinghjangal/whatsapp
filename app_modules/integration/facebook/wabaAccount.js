const q = require('q')
const _ = require('lodash')
const HttpService = require('../service/httpService')
const __config = require('../../../config')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const DataMapper = require('./dataMapper')
const urlValidator = require('../../../lib/util/url')
const AuthService = require('../facebook/authService').Authentication
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

  getProfilePic (wabaNumber) {
    const deferred = q.defer()
    const authService = new AuthService(this.userId)
    authService.getFaceBookTokensByWabaNumber(wabaNumber)
      .then((data) => {
        const url = data.baseUrl + __constants.FACEBOOK_ENDPOINTS.getProfilePic
        const headers = {
          'Content-Type': '[{"key":"Content-Type","value":"application/json"}]',
          Authorization: `Bearer ${data.apiKey}`
        }
        return this.http.Get(url, headers, __config.service_provider_id.facebook)
      }).then(resp => {
        deferred.resolve(resp)
      }).catch(err => deferred.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err }))
    return deferred.promise
  }

  updateProfilePic (wabaNumber, profilePicFile, contentType) {
    __logger.info('wabaNumber & profilePic--', wabaNumber)
    const deferred = q.defer()
    const authService = new AuthService(this.userId)
    authService.getFaceBookTokensByWabaNumber(wabaNumber)
      .then((data) => {
        let url = data.baseUrl + __constants.FACEBOOK_ENDPOINTS.profilePicUpdate
        url = url.split(':phoneNumber').join(data.id || '')
        __logger.info('URL====', url)
        const headers = {
          'Content-Type': contentType,
          Accept: 'application/problem+json',
          Authorization: `Bearer ${data.apiKey}`
        }
        return this.http.Post(profilePicFile, 'body', url, headers, __config.service_provider_id.facebook, false)
      })
      .then((accountData) => {
        __logger.info('Dataaaaa then 2', { accountData })
        if (accountData && accountData.statusCode === 201) {
          deferred.resolve({ type: __constants.RESPONSE_MESSAGES.SUCCESS, data: {} })
        } else if (accountData && accountData.statusCode === 400) {
          return deferred.resolve({ type: __constants.RESPONSE_MESSAGES.INVALID_FILE_SIZE, err: {} })
        } else {
          return deferred.reject({ type: __constants.RESPONSE_MESSAGES.ERROR_CALLING_PROVIDER, err: {} })
        }
      })
      .catch(err => {
        deferred.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
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

  updateProfile (wabaNumber, wabaData) {
    // __logger.info('inside update profile', wabaNumber, wabaData)
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

    const authService = new AuthService(this.userId)
    authService.getFaceBookTokensByWabaNumber(wabaNumber)
      .then((data) => {
        const url = data.baseUrl + __constants.FACEBOOK_ENDPOINTS.updateWebhook
        __logger.info('URL====', url)
        const headers = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${data.apiKey}`
        }

        return this.http.Patch({ webhooks: { url: incomingMessageUrl } }, url, headers, __config.service_provider_id.facebook)
      })
      .then(defaultAccountUpdated => {
        if (defaultAccountUpdated && defaultAccountUpdated.statusCode === 201) {
          return deferred.resolve({ ...__constants.RESPONSE_MESSAGES.SUCCESS, data: {} })
        } else if (defaultAccountUpdated && defaultAccountUpdated.statusCode === 404) {
          return deferred.resolve({ ...__constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, data: {} })
        } else if (defaultAccountUpdated && defaultAccountUpdated.body.status === 400) {
          return deferred.resolve({ ...__constants.RESPONSE_MESSAGES.INVALID_REQUEST, data: {} })
        } else {
          return deferred.reject({ ...__constants.RESPONSE_MESSAGES.ERROR_CALLING_PROVIDER, err: defaultAccountUpdated.statusCode, data: {} })
        }
      })
      .catch(err => {
        return deferred.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return deferred.promise
  }

  getAccountPhoneNoList (wabaNumber) {
    __logger.info('wabaNumber----', wabaNumber)
    const deferred = q.defer()
    if (wabaNumber) {
      const authService = new AuthService(this.userId)
      authService.getFaceBookTokensByWabaNumber(wabaNumber)
        .then(data => {
          __logger.info('dataatatatat', data, typeof data)
          let url = __constants.FACEBOOK_GRAPHURL + __constants.FACEBOOK_ENDPOINTS.getPhoneNumbersByWabaid + data.graphApiKey
          url = url.split(':userAccountIdByProvider').join(data.userAccountIdByProvider || '')
          __logger.info('URL====', url)
          const headers = {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            apikey: data.apiKey
          }
          return this.http.Get(url, headers, __config.service_provider_id.facebook)
        })
        .then((phoneNumbersData) => {
          if (phoneNumbersData && phoneNumbersData.data && phoneNumbersData.data.constructor.name.toLowerCase() === 'array' && phoneNumbersData.data.length > 0) {
            const specificNumberData = _.find(phoneNumbersData.data, singleData => singleData.display_phone_number && singleData.display_phone_number.split(' ').join('').split('-').join('').substring(1) === wabaNumber)
            if (specificNumberData) return deferred.resolve({ ...__constants.RESPONSE_MESSAGES.SUCCESS, data: specificNumberData })
            return deferred.resolve({ ...__constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, data: {} })
          } else if (phoneNumbersData && phoneNumbersData.status === 404) {
            return deferred.resolve({ ...__constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, data: {} })
          } else {
            return deferred.reject({ ...__constants.RESPONSE_MESSAGES.ERROR_CALLING_PROVIDER, err: phoneNumbersData.phoneNumber || phoneNumbersData, data: {} })
          }
        })
        .catch(err => {
          __logger.error('getAccountPhoneNoList error', err.toString())
          console.log('getAccountPhoneNoList error', err)
          deferred.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err.toString() })
        })
      return deferred.promise
    } else {
      deferred.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Missing WabaNumber' })
      return deferred.promise
    }
  }
}

module.exports = WabaAccount
