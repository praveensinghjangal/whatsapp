const ValidatonService = require('../services/validation')
const UserService = require('../services/dbData')
const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const saveHistoryData = require('../../../lib/util/saveDataHistory')
const rejectionHandler = require('../../../lib/util/rejectionHandler')

/**
 * @namespace -Account-Config-Controller-
 * @description In this Conroller profile account config related API are build
 * such as getAcountProfileConfig,updateAcountProfileConfig,
 */

/**
 * @memberof -Account-Config-Controller-
 * @name GetAccountConfig
 * @path {GET} /users/config
 * @description Bussiness Logic :- This API returns Profile account configurations
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
 *<br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/account/getAccountConfig|GetAccountConfig}
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=Success  - Response got successfully.
 * @response {object} metadata.data - Returns the object with tps
 * @code {200} if the msg is success than returns account info tps.
 * @author Arjun Bhole 24th February, 2021
 * *** Last-Updated :- Arjun Bhole 24th February, 2021 ***
 */

// Get Account Config
const getAccountConfig = (req, res) => {
  __logger.info('Inside Get Account Config', req.params.userId)
  const userService = new UserService()
  const userId = req.params && req.params.userId ? req.params.userId : 0
  userService.checkUserIdExistsForAccountProfile(userId)
    .then(result => {
      __logger.info('Get Account Config Result', result)
      if (result && result.exists) {
        return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: { tps: result && result.rows && result.rows[0] && result.rows[0].tps ? result.rows[0].tps : 0 } })
      } else {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {}, data: {} })
      }
    })
    .catch(err => {
      __logger.error('get Account Config error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

/**
 * @memberof -Account-Config-Controller-
 * @name UpdateAccountConfig
 * @path {PATCH} /users/config
 * @description Bussiness Logic :- This API updates Profile account configurations
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
 *<br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/account/updateAccountConfig|UpdateAccountConfig}
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=Success  - Response got successfully.
 * @response {object} metadata.data - Returns success
 * @code {200} if the msg is success than returns success.
 * @author Arjun Bhole 24th February, 2021
 * *** Last-Updated :- Arjun Bhole 24th February, 2021 ***
 */
const updateAccountConfig = (req, res) => {
  __logger.info('Inside Update Account Config', req.body.userId)
  const userService = new UserService()
  const validate = new ValidatonService()
  const userId = req.body && req.body.userId ? req.body.userId : '0'
  const callerUserId = req.user && req.user.user_id ? req.user.user_id : '0'
  validate.checkAccountConfigService(req.body)
    .then(() => userService.checkUserIdExistsForAccountProfile(userId))
    .then(result => {
      __logger.info('Update Account Config Result', result)
      if (result && result.exists) {
        saveHistoryData(result.rows[0], __constants.ENTITY_NAME.USER_ACCOUNT_PROFILE, userId, callerUserId)
        return userService.updateAccountConfig(req.body, result.rows[0], userId, callerUserId)
      } else {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {}, data: {} })
      }
    })
    .then(() => __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: { } }))
    .catch(err => {
      __logger.error('update Account Config error: ', err)
      return __util.send(res, { type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err })
    })
}

module.exports = {
  getAccountConfig,
  updateAccountConfig
}
