const __logger = require('../../../lib/logger')
const __util = require('../../../lib/util')
// const ValidatonService = require('../services/validation')
const integrationService = require('../../../app_modules/integration')
const __constants = require('../../../config/constants')

// not required, delete after verifying
const getProfilePic = (req, res) => {
  __logger.info('Get Media API Called', req.params)
  const userId = req.user && req.user.user_id ? req.user.user_id : '0'
  const maxTpsToProvider = req.user && req.user.maxTpsToProvider ? req.user.maxTpsToProvider : 10
  const wabaAccountService = new integrationService.WabaAccount(req.user.providerId, maxTpsToProvider, userId)
  wabaAccountService.getProfilePic(req.user.wabaPhoneNumber)
    .then(mediaData => {
      __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: mediaData })
    })
    .catch(err => {
      __logger.error('save optin::error: ', err)
      return __util.send(res, { type: err.type, err: err.err || {} })
    })
}

module.exports = getProfilePic
