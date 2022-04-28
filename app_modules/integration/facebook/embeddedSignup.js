const q = require('q')
const HttpService = require('../service/httpService')
const __config = require('../../../config')
const __constants = require('../../../config/constants')
const AuthService = require('./authService').Authentication
// const __logger = require('../../../lib/logger')
// const qalllib = require('qalllib')
// const _ = require('lodash')
const UserService = require('../../user/services/dbData')

const getAuthorizationToken = (userId, authorizationToken, wabaNumber) => {
  const getToken = q.defer()
  if (authorizationToken) {
    getToken.resolve(authorizationToken)
  } else {
    const authService = new AuthService(userId)
    authService.getFaceBookTokensByWabaNumber(wabaNumber)
      .then(data => {
        getToken.resolve(data.graphApiKeyToken) // return the graphApiKeyToken. Will be used in Authorization with Bearer
      })
      .catch(err => {
        getToken.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
  }
  return getToken.promise
}
class EmbeddedSignup {
  constructor (providerId, userId, authorizationToken) {
    this.providerId = providerId
    this.userId = userId
    this.authorizationToken = authorizationToken
  }

  getWabaOfClient (inputToken, wabaNumber) {
    const apiCall = q.defer()
    const http = new HttpService(60000)
    const userService = new UserService()
    getAuthorizationToken(this.userId, this.authorizationToken, wabaNumber)
      .then(token => {
        const url = `${__constants.FACEBOOK_GRAPHURL}${__constants.FACEBOOK_GRAPHURL_VERSION}${__constants.FACEBOOK_ENDPOINTS.debugToken}${inputToken}`
        const headers = {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`
        }
        return http.Get(url, headers, this.providerId)
      })
      .then(data => {
        if (data && data.data && data.data.is_valid) {
          apiCall.resolve(data.data)
        } else {
          apiCall.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: [data.error || data.data.error] })
        }
      })
      .catch(err => {
        userService.sendMessageToSupport(err)
        apiCall.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return apiCall.promise
  }

  getBSPsSystemUserIds (wabaNumber, businessId) {
    const apiCall = q.defer()
    const http = new HttpService(60000)
    getAuthorizationToken(this.userId, this.authorizationToken, wabaNumber)
      .then(token => {
        let url = `${__constants.FACEBOOK_ENDPOINTS.getBSPsSystemUserIds}`
        url = url.split('{{Business-ID}}').join(businessId)
        return http.Get(url, { Authorization: `Bearer ${token}` }, this.providerId)
      })
      .then(data => {
        if (data && data.data) {
          // if (data && data.data && data.data.is_valid) {
          apiCall.resolve(data.data)
        } else {
          apiCall.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: [data.error || data.data.error] })
        }
      })
      .catch(err => {
        apiCall.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return apiCall.promise
  }

  getWabaDetailsByWabaId (wabaId, wabaNumber) {
    const apiCall = q.defer()
    const http = new HttpService(60000)
    getAuthorizationToken(this.userId, this.authorizationToken, wabaNumber)
      .then(token => {
        let url = `${__constants.FACEBOOK_GRAPHURL}${__constants.FACEBOOK_GRAPHURL_VERSION}${__constants.FACEBOOK_ENDPOINTS.getWabaDetails}`
        url = url.split(':wabaId').join(wabaId || '')
        url += '?fields=account_review_status,id,name,message_template_namespace,currency,on_behalf_of_business_info,primary_funding_id,purchase_order_number,timezone_id,owner_business_info'
        const headers = {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`
        }
        return http.Get(url, headers, this.providerId)
      })
      .then(data => {
        if (data && !data.error) {
          apiCall.resolve(data)
        } else {
          apiCall.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: [data.error] })
        }
      })
      .catch(err => {
        apiCall.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return apiCall.promise
  }

  addSystemUserToWabaOfClient (systemUserId, wabaId, wabaNumber) {
    const apiCall = q.defer()
    const http = new HttpService(60000)
    getAuthorizationToken(this.userId, this.authorizationToken, wabaNumber)
      .then(token => {
        let url = `${__constants.FACEBOOK_GRAPHURL}${__constants.FACEBOOK_GRAPHURL_VERSION}${__constants.FACEBOOK_ENDPOINTS.addSystemUser}`
        url = url.split(':wabaId').join(wabaId || '')
        url = url.split('{{User-ID}}').join(systemUserId || '')
        const headers = {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`
        }
        return http.Post({}, 'body', url, headers, this.providerId)
      })
      .then(data => {
        if (data && !data.error) {
          apiCall.resolve(data.body)
        } else {
          apiCall.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: [data.error] })
        }
      })
      .catch(err => {
        apiCall.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return apiCall.promise
  }

  getBussinessIdLineOfCredit (businessId) {
    const apiCall = q.defer()
    const http = new HttpService(60000)
    const wabaNumber = 'wabaNumber'
    getAuthorizationToken(this.userId, this.authorizationToken, wabaNumber)
      .then(token => {
        let url = `${__constants.FACEBOOK_GRAPHURL}${__constants.FACEBOOK_GRAPHURL_VERSION}${__constants.FACEBOOK_ENDPOINTS.getBussinessIdLineOfCredit}`
        url = url.split('{{Business-ID}}').join(businessId)
        return http.Get(url, { Authorization: `Bearer ${token}` }, this.providerId)
      })
      .then(data => {
        if (data && data.data) {
          apiCall.resolve(data.data)
        } else {
          apiCall.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: [data.error] })
        }
      })
      .catch(err => {
        apiCall.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return apiCall.promise
  }

  //
  subscribeAppToWaba (wabaId, wabaNumber) {
    const apiCall = q.defer()
    const http = new HttpService(60000)
    getAuthorizationToken(this.userId, this.authorizationToken, wabaNumber)
      .then(token => {
        let url = `${__constants.FACEBOOK_GRAPHURL}${__constants.FACEBOOK_GRAPHURL_VERSION}${__constants.FACEBOOK_ENDPOINTS.subscribeAppToWaba}`
        url = url.split(':wabaId').join(wabaId || '')
        // url = url.split('{{User-ID}}').join(systemUserId || '')
        const headers = {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`
        }
        return http.Post({}, 'body', url, headers, this.providerId)
      })
      .then(data => {
        if (data && !data.error) {
          apiCall.resolve(data.body)
        } else {
          apiCall.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: [data.error] })
        }
      })
      .catch(err => {
        apiCall.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return apiCall.promise
  }

  attachCreditLineClientWaba (assignedWabaId, creditLineId) {
    const apiCall = q.defer()
    const http = new HttpService(60000)
    const wabaNumber = 'wabaNumber'
    getAuthorizationToken(this.userId, this.authorizationToken, wabaNumber)
      .then(token => {
        let url = `${__constants.FACEBOOK_GRAPHURL}${__constants.FACEBOOK_GRAPHURL_VERSION}${__constants.FACEBOOK_ENDPOINTS.attachCreditLineClientWaba}`
        url = url.split('{{Credit-Line-ID}}').join(creditLineId)
        url = url.split('{{Assigned-WABA-ID}}').join(assignedWabaId)
        url = url.split('{{WABA-Currency}}').join(__config.wabaCurrency)
        const headers = {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`
        }
        return http.Post({}, 'body', url, headers, this.providerId)
      })
      .then(data => {
        if (data && !data.error) {
          apiCall.resolve(data.body)
        } else {
          apiCall.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: [data.error] })
        }
      })
      .catch(err => {
        apiCall.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return apiCall.promise
  }

  //
  fetchAssignedUsersOfWaba (wabaId, businessId, wabaNumber) {
    const apiCall = q.defer()
    const http = new HttpService(60000)
    getAuthorizationToken(this.userId, this.authorizationToken, wabaNumber)
      .then(token => {
        let url = `${__constants.FACEBOOK_GRAPHURL}${__constants.FACEBOOK_GRAPHURL_VERSION}${__constants.FACEBOOK_ENDPOINTS.fetchAssignedUsersOfWaba}${businessId}`
        url = url.split(':wabaId').join(wabaId || '')
        const headers = {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`
        }
        return http.Get(url, headers, this.providerId)
      })
      .then(data => {
        if (data && data.data) {
          apiCall.resolve(data.data)
        } else {
          apiCall.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: [data.error || data.data.error] })
        }
      })
      .catch(err => {
        apiCall.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return apiCall.promise
  }

  verifyLineOfCredit (allocationConfigId) {
    const apiCall = q.defer()
    const http = new HttpService(60000)
    const wabaNumber = 'wabaNumber'
    getAuthorizationToken(this.userId, this.authorizationToken, wabaNumber)
      .then(token => {
        let url = `${__constants.FACEBOOK_GRAPHURL}${__constants.FACEBOOK_GRAPHURL_VERSION}${__constants.FACEBOOK_ENDPOINTS.verifyLineOfCredit}`
        url = url.split('{{Allocation-Config-ID}}').join(allocationConfigId)
        return http.Get(url, { Authorization: `Bearer ${token}` }, this.providerId)
      })
      .then(data => {
        if (data) {
          apiCall.resolve(data)
        } else {
          apiCall.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: [data.error] })
        }
      })
      .catch(err => {
        apiCall.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return apiCall.promise
  }

  //
  getPhoneNumberOfWabaId (wabaId, wabaNumber) {
    const apiCall = q.defer()
    const http = new HttpService(60000)
    getAuthorizationToken(this.userId, this.authorizationToken, wabaNumber)
      .then(token => {
        let url = `${__constants.FACEBOOK_GRAPHURL}${__constants.FACEBOOK_GRAPHURL_VERSION}${__constants.FACEBOOK_ENDPOINTS.getPhoneNumberOfWabaId}`
        url = url.split(':wabaId').join(wabaId || '')
        const headers = {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`
        }
        return http.Get(url, headers, this.providerId)
      })
      .then(data => {
        if (data && data.data) {
          apiCall.resolve(data.data)
        } else {
          apiCall.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: [data.error || data.data.error] })
        }
      })
      .catch(err => {
        apiCall.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return apiCall.promise
  }

  requestCode (wabizUrl, token, phoneCode, phoneNumber, phoneCertificate) {
    const apiCall = q.defer()
    const http = new HttpService(60000)
    const url = `${wabizUrl}${__constants.FACEBOOK_ENDPOINTS.requestCode}`
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`
    }
    const body = {
      cc: phoneCode,
      phone_number: phoneNumber,
      method: 'voice',
      cert: phoneCertificate
      // "pin": "<Two-Step Verification PIN"
    }
    http.Post(body, 'body', url, headers, this.providerId)
      .then(data => {
        if (data && !(data.body.errors && data.body.errors.length)) {
          apiCall.resolve(data.body)
        } else {
          apiCall.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: [data.body.errors] })
        }
      })
      .catch(err => {
        apiCall.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return apiCall.promise
  }

  getSettings (wabizUrl, token) {
    const apiCall = q.defer()
    const http = new HttpService(60000)
    const url = `${wabizUrl}${__constants.FACEBOOK_ENDPOINTS.getSettings}`
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`
    }
    http.Get(url, headers, this.providerId)
      .then(data => {
        if (data && !data.errors) {
          apiCall.resolve(data.settings)
        } else {
          apiCall.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: data.errors })
        }
      })
      .catch(err => {
        apiCall.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return apiCall.promise
  }

  enableTwoStepVerification (wabizUrl, token, tfaPin) {
    const apiCall = q.defer()
    const http = new HttpService(60000)
    const url = `${wabizUrl}${__constants.FACEBOOK_ENDPOINTS.enableTFA}`
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`
    }
    const body = {
      pin: tfaPin
    }
    http.Post(body, 'body', url, headers, this.providerId)
      .then(data => {
        if (data && !(data.body.errors && data.body.errors.length)) {
          apiCall.resolve(data.body)
        } else {
          apiCall.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: [data.body.errors] })
        }
      })
      .catch(err => {
        apiCall.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return apiCall.promise
  }
}
module.exports = EmbeddedSignup
