const q = require('q')
const HttpService = require('../service/httpService')
const __config = require('../../../config')
const __constants = require('../../../config/constants')
// const __logger = require('../../../lib/logger')
// const qalllib = require('qalllib')
// const _ = require('lodash')
class EmbeddedSignup {
  constructor (providerId, authorizationToken) {
    this.providerId = providerId
    this.authorizationToken = authorizationToken
  }

  getWabaOfClient (params) {
    const apiCall = q.defer()
    const http = new HttpService(60000)
    http.Get(__constants.FACEBOOK.getWabaOfCleint, { Authorization: __config.authorization }, this.providerId)
      .then(data => {
        if (data) {
          console.log('33333333333333333333333333333333333333333333333333333333333333333333', data)
          apiCall.resolve(data)
        } else {
          console.log('errrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr')
        }
      })
      .catch(err => {
        apiCall.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return apiCall.promise
  }
}
module.exports = EmbeddedSignup
