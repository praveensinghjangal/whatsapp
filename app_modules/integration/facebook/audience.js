const q = require('q')
const HttpService = require('../service/httpService')
const __config = require('../../../config')
const facebookConfig = __config.integration.facebook
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')

class Audience {
  constructor (maxConcurrent, userId) {
    this.http = new HttpService(60000, maxConcurrent, userId)
  }

  saveOptin (wabaNumber, listOfPhoneNumbers) {
    __logger.info('Facebook saveOptin ::>>>>>>>>>>>>>>>>>>>>> ', listOfPhoneNumbers)
    const deferred = q.defer()
    const url = facebookConfig.baseUrl[wabaNumber] + __constants.FACEBOOK_ENDPOINTS.saveOptin
    const headers = {
      'Content-Type': 'application/json',
      Accept: '*/*',
      Authorization: `Bearer ${__config.adminAuthTokenHeloFb}`
    }
    const reqBody = {
      blocking: 'wait',
      contacts: [
        ...listOfPhoneNumbers
      ],
      force_check: false
    }
    this.http.Post(reqBody, 'body', url, headers, __config.service_provider_id.facebook)
      .then(data => {
        __logger.info('integration :: Save Optin', { data })
        if (data && data.statusCode === __constants.RESPONSE_MESSAGES.SUCCESS.status_code) {
          if (data.body && data.body.meta && data.body.meta.api_status && data.body.meta.api_status === __constants.FACEBOOK_RESPONSES.stable.displayName) {
            const invalidContacts = data.body.contacts.filter(contact => {
              if (contact.status !== __constants.FACEBOOK_RESPONSES.valid.displayName) {
                contact.input = contact.input.substring(1)
                return true
              }
              return false
            })
            // returns the list of numbers which are not "valid"
            deferred.resolve({ type: __constants.RESPONSE_MESSAGES.SUCCESS, data: invalidContacts })
          }
        } else {
          return deferred.reject({ type: __constants.RESPONSE_MESSAGES.ERROR_CALLING_PROVIDER, err: data.body })
        }
      })
      .catch(err => deferred.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err }))
    return deferred.promise
  }
}

module.exports = Audience
