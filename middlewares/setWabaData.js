const HttpService = require('../lib/http_service')
const __config = require('../config')
const __constants = require('../config/constants')
const __util = require('../lib/util')
const __logger = require('../lib/logger')

module.exports = (req, res, next) => {
  if (req.user && req.user.providerId && req.user.wabaPhoneNumber && req.user.maxTpsToProvider) return next()
  const http = new HttpService(60000)
  http.Get(__config.base_url + __constants.INTERNAL_END_POINTS.getServiceProviderDetailsByUserId + '?userId=' + req.user.user_id, { authorization: __config.authTokens[0] })
    .then(apiRes => {
      if (apiRes && apiRes.code && apiRes.code !== __constants.RESPONSE_MESSAGES.SUCCESS.code) return next()
      req.user.providerId = apiRes.data && apiRes.data.serviceProviderId ? apiRes.data.serviceProviderId : req.user.providerId
      req.user.wabaPhoneNumber = apiRes.data && apiRes.data.phoneNumber ? apiRes.data.phoneCode + apiRes.data.phoneNumber : req.user.wabaPhoneNumber
      req.user.maxTpsToProvider = apiRes.data && apiRes.data.maxTpsToProvider ? apiRes.data.maxTpsToProvider : req.user.maxTpsToProvider
      next()
    })
    .catch(err => {
      __logger.error('middleware for waba data err', err)
      return __util.send(res, { type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
    })
}
