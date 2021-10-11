const q = require('q')
const HttpService = require('../service/httpService')
const __config = require('../../../config')
const facebookConfig = __config.integration.facebook
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const qalllib = require('qalllib')
const _ = require('lodash')

const apiCallFn = (body, http, url, headers, facebookProvider, successStatusCode, stableDisplayName, validDisplayName, errorCallingProvider, serverError) => {
  const apiCall = q.defer()
  http.Post(body, 'body', url, headers, facebookProvider)
    .then(data => {
      if (data && data.statusCode === successStatusCode) {
        if (data.body && data.body.meta && data.body.meta.api_status && data.body.meta.api_status === stableDisplayName) {
          const invalidContacts = data.body.contacts.filter(contact => {
            if (contact.status !== validDisplayName) {
              contact.input = contact.input.substring(1)
              return true
            }
            return false
          })
          // returns the list of numbers which are not "valid"
          apiCall.resolve({ data: invalidContacts })
        }
      } else {
        return apiCall.reject({ type: errorCallingProvider, err: data.body })
      }
    })
    .catch(err => apiCall.reject({ type: err.type || serverError, err: err.err || err }))
  return apiCall.promise
}

class Audience {
  constructor (maxConcurrent, userId) {
    this.http = new HttpService(60000, maxConcurrent, userId)
  }

  saveOptin (wabaNumber, listOfPhoneNumbers) {
    __logger.info('Facebook saveOptin ::>>>>>>>>>>>>>>>>>>>>> ', listOfPhoneNumbers)
    const deferred = q.defer()
    // wabaNumber = '917666118833'
    const url = facebookConfig.baseUrl[wabaNumber] + __constants.FACEBOOK_ENDPOINTS.saveOptin
    const headers = {
      'Content-Type': 'application/json',
      Accept: '*/*',
      Authorization: `Bearer ${__config.adminAuthTokenHeloFb}`
    }
    const batchSize = 2
    const chunkSize = 2
    const batchesOfPhoneNumbersToBeVerified = _.chunk(listOfPhoneNumbers, chunkSize)
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

    qalllib.qASyncWithBatch(apiCallFn, listOfBodies, batchSize, this.http, url, headers, __config.service_provider_id.facebook, __constants.RESPONSE_MESSAGES.SUCCESS.status_code, __constants.FACEBOOK_RESPONSES.stable.displayName, __constants.FACEBOOK_RESPONSES.valid.displayName, __constants.RESPONSE_MESSAGES.ERROR_CALLING_PROVIDER, __constants.RESPONSE_MESSAGES.SERVER_ERROR).then(data => {
      if (data.reject.length) {
        return deferred.reject(data.reject[0])
      }
      let resolvedData = []
      data.resolve.map(res => {
        resolvedData = [...resolvedData, ...res.data]
      })
      return deferred.resolve(resolvedData)
    }).catch(err => {
      return deferred.reject(err)
    })
      .done()
    return deferred.promise
  }
}

module.exports = Audience
