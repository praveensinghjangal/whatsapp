const q = require('q')
const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const authMiddleware = require('../../../middlewares/authentication')
const UniqueId = require('../../../lib/util/uniqueIdGenerator')
const rejectionHandler = require('../../../lib/util/rejectionHandler')
// Services
const UserService = require('../services/dbData')
const ValidatonService = require('../services/validation')
const BusinessAccountService = require('../../whatsapp_business/services/businesAccount')

const createAuthTokenByUserId = userId => {
  const authToken = q.defer()
  const businessAccountService = new BusinessAccountService()
  if (!userId || typeof userId !== 'string') {
    authToken.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Please provide userId of type string' })
    return authToken.promise
  }
  businessAccountService.checkUserIdExist(userId)
    .then(businessData => {
      if (businessData.exists && businessData.record && businessData.record.serviceProviderId && businessData.record.phoneCode && businessData.record.phoneNumber) {
        const payload = {
          user_id: userId,
          providerId: businessData.record.serviceProviderId,
          wabaPhoneNumber: businessData.record.phoneCode.split('+').join('') + businessData.record.phoneNumber,
          signature: new UniqueId().uuid()
        }
        const token = authMiddleware.setToken(payload, __constants.CUSTOM_CONSTANT.AUTH_TOKEN_30_MINS)
        return authToken.resolve(token)
      } else {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.WABA_ID_NOT_EXISTS, err: {}, data: {} })
      }
    })
    .catch(err => {
      __logger.error('authToken error: ', err)
      authToken.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
    })
  return authToken.promise
}

const authorize = (req, res) => {
  const validate = new ValidatonService()
  const userService = new UserService()
  validate.authorize(req.body)
    .then(data => userService.checkIfApiKeyExists(req.body.apiKey))
    .then(userData => createAuthTokenByUserId(userData.userId))
    .then(authToken => __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: { apiToken: authToken } }))
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

module.exports = { authorize, createAuthTokenByUserId }
