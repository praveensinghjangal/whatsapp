const q = require('q')
const HttpService = require('../service/httpService')
const __config = require('../../../config')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const qalllib = require('qalllib')
const _ = require('lodash')
const AuthService = require('./authService')
const apiCallFn = (body, url, headers, http) => {
  const apiCall = q.defer()
  http.Post(body, 'body', url, headers, __config.service_provider_id.facebook)
    .then(data => {
      if (data && data.statusCode === __constants.RESPONSE_MESSAGES.SUCCESS.status_code) {
        if (data.body && data.body.meta && data.body.meta.api_status && data.body.meta.api_status === __constants.FACEBOOK_RESPONSES.stable.displayName && data.body.contacts) {
          // returns all the list of numbers (valid + all types of invalid)
          __logger.info('Facebook saveOptin Response ::>>>>>>>>>>>>>>>>>>>>> ', data.body)
          apiCall.resolve({ data: data.body.contacts })
        } else {
          return apiCall.reject({ type: __constants.RESPONSE_MESSAGES.ERROR_CALLING_PROVIDER, err: data.body })
        }
      } else {
        return apiCall.reject({ type: __constants.RESPONSE_MESSAGES.ERROR_CALLING_PROVIDER, err: data.body })
      }
    })
    .catch(err => apiCall.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err }))
  return apiCall.promise
}

class Audience {
  constructor (maxConcurrent, userId) {
    this.userId = userId
    this.http = new HttpService(60000, maxConcurrent, userId)
  }

  saveOptin (wabaNumber, listOfPhoneNumbers) {
    __logger.info('Facebook saveOptin ::>>>>>>>>>>>>>>>>>>>>> ', listOfPhoneNumbers)
    const deferred = q.defer()
    // wabaNumber = '917666118833'

    if (listOfPhoneNumbers.length === 0) {
      deferred.resolve([])
      return deferred.promise
    }

    const authService = new AuthService(this.userId)
    authService.getFaceBookTokensByWabaNumber(wabaNumber)
      .then(data => {
        const url = data.baseUrl + __constants.FACEBOOK_ENDPOINTS.saveOptin
        const headers = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${data.apiKey}`
        }
        const batchesOfPhoneNumbersToBeVerified = _.chunk(listOfPhoneNumbers, __constants.CHUNK_SIZE_FOR_SAVE_OPTIN)
        const listOfBodies = []
        // list of bodies
        batchesOfPhoneNumbersToBeVerified.map(numberArray => {
          listOfBodies.push({
            blocking: 'wait',
            contacts: [
              ...numberArray
            ],
            force_check: false
          })
        })
        return qalllib.qASyncWithBatch(apiCallFn, listOfBodies, __constants.BATCH_SIZE_FOR_SAVE_OPTIN, url, headers, this.http)
      })
      .then(data => {
        if (data && data.reject && data.reject.length) {
          return deferred.reject(data.reject[0])
        }
        let resolvedData = []
        if (data && data.resolve && data.resolve.length !== 0) {
          data.resolve.map(res => {
            resolvedData = [...resolvedData, ...res.data]
          })
        }
        return deferred.resolve(resolvedData)
      })
      .catch(err => {
        return deferred.reject(err)
      })
      .done()
    return deferred.promise
  }
}

module.exports = Audience
