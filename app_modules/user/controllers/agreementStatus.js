const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const AgreementStatusEngine = require('../services/status')
const UserService = require('../services/dbData')
const ValidatonService = require('../services/validation')

const updateAgreementStatus = (req, res) => {
  __logger.info('updateAgreementStatus called', req.body)
  const callerUserId = req.user && req.user.user_id ? req.user.user_id : '0'
  const userId = (req.body && req.body.userId) ? req.body.userId : '0'
  const agreementStatusEngine = new AgreementStatusEngine()
  const userService = new UserService()
  const validate = new ValidatonService()

  validate.validateAgreementStatus(req.body)
    .then(() => userService.getAgreementInfoByUserId(userId))
    .then(data => {
      if (data) {
        return userService.updateAgreement(req.body, data, userId, callerUserId)
      } else {
        return userService.insertAgreement(req.body, userId, callerUserId)
      }
    })
    .then(validateAgreementStatusRes => {
      __logger.info('validateAgreementStatusRes :: service response', validateAgreementStatusRes)
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: { agreementStatusId: validateAgreementStatusRes.agreementStatusId, statusName: agreementStatusEngine.getAgreementStatusName(validateAgreementStatusRes.agreementStatusId) } })
    })
    .catch(err => {
      __logger.error('updateAgreementStatus :: error', err)
      return __util.send(res, { type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err })
    })
}

module.exports = { updateAgreementStatus }
