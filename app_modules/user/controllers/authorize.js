const q = require('q')
const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const authMiddleware = require('../../../middlewares/auth/authentication')
const UniqueId = require('../../../lib/util/uniqueIdGenerator')
const rejectionHandler = require('../../../lib/util/rejectionHandler')
// Services
const UserService = require('../services/dbData')
const ValidatonService = require('../services/validation')
const BusinessAccountService = require('../../whatsapp_business/services/businesAccount')

/**
 * @namespace -Authorize-Controller-
 * @description API's related to authorization, creation of auth token etc are placed here.
 */

const createAuthTokenByUserId = userId => {
  __logger.info('createAuthTokenByUserId')
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

/**
 * @memberof -Authorize-Controller-
 * @name Authorize
 * @path {POST} /users/authorize
 * @description Bussiness Logic :- In Authorize API, use API key and generate auth token to be used in other supported API’s.
Token generated using this API have validity of 30 days.
 * @auth {string} Authorization - User needs to enter base64 encoded email and password, Email & Password needs to be encoded in the following manner : 'email:password’, format for header value : "Bearer[SPACE]base64EncodedTextOfEmailAndPassword", example for header value : "Bearer MTIxQGdtYWlsLmFiY2Q="
  <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/users/authorize|Authorize}
 * @body {string}  apiKey=hsdbhsvbsvbs-cbdahcbvdavcd-pojcbnjbc-cshcdvyaya -  Provide the valid API key for authorization purpose
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=Success  - Response got successfully.
 * @response {string} metadata.data.apiToken - It will return the token that will be used in other supported API for Helo whatsapp.
 * @code {200} if the msg is success Returns auth token if API key provided is correctly.
 * @author Danish Galiyara 30 July, 2020
 * *** Last-Updated :- Arjun Bhole 23 October,2020 ***
 */

const authorize = (req, res) => {
  __logger.info('authorize::')
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
