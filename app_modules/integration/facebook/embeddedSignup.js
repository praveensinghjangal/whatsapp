const q = require('q')
const HttpService = require('../service/httpService')
const __config = require('../../../config')
const __constants = require('../../../config/constants')
const AuthService = require('./authService')
// const __logger = require('../../../lib/logger')
// const qalllib = require('qalllib')
// const _ = require('lodash')

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
        apiCall.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return apiCall.promise
  }

  getBSPsSystemUserIds (wabaNumber) {
    const apiCall = q.defer()
    const http = new HttpService(60000)
    getAuthorizationToken(this.userId, this.authorizationToken, wabaNumber)
      .then(token => {
        let url = `${__constants.FACEBOOK_ENDPOINTS.getBSPsSystemUserIds}`
        url = url.split('{{Business-ID}}').join(__config.businessId)
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

  getBussinessIdLineOfCredit () {
    const apiCall = q.defer()
    const http = new HttpService(60000)
    const wabaNumber = 'wabaNumber'
    getAuthorizationToken(this.userId, this.authorizationToken, wabaNumber)
      .then(token => {
        let url = `${__constants.FACEBOOK_ENDPOINTS.getBussinessIdLineOfCredit}`
        url = url.split('{{Business-ID}}').join(__config.businessId)
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

  attachCreditLineClientWaba () {
    const apiCall = q.defer()
    const http = new HttpService(60000)
    const wabaNumber = 'wabaNumber'
    getAuthorizationToken(this.userId, this.authorizationToken, wabaNumber)
      .then(token => {
        let url = `${__constants.FACEBOOK_ENDPOINTS.attachCreditLineClientWaba}`
        url = url.split('{{Credit-Line-ID}}').join(__config.creditLineIdBSP)
        url = url.split('{{Assigned-WABA-ID}}').join(__config.assignedWabaId)
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

  verifyLineOfCredit () {
    const apiCall = q.defer()
    const http = new HttpService(60000)
    const wabaNumber = 'wabaNumber'
    getAuthorizationToken(this.userId, this.authorizationToken, wabaNumber)
      .then(token => {
        let url = `${__constants.FACEBOOK_ENDPOINTS.verifyLineOfCredit}`
        url = url.split('{{Allocation-Config-ID}}').join(__config.allocationConfigId)
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
}
module.exports = EmbeddedSignup
