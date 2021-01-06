const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const StatusEngine = require('../services/status')
const getTemplateStatusName = require('./templateApproval').getTemplateStatusName

const updateTemplateStatus = (req, res) => {
  __logger.info('Inside updateTemplateStatus', req.body, req.params.templateId)
  const userId = req.user && req.user.user_id ? req.user.user_id : '0'
  const statusEngine = new StatusEngine()
  statusEngine.validateAndUpdateStatus(req.params.templateId, req.body.firstLocalizationNewStatusId, req.body.firstLocalizationOldStatusId, req.body.firstLocalizationRejectionReason, req.body.secondLocalizationNewStatusId, req.body.secondLocalizationOldStatusId, req.body.secondLocalizationRejectionReason, userId)
    .then(validateAndUpdateStatusRes => {
      __logger.info('updateTemplateStatus :: service response', validateAndUpdateStatusRes)
      __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: { messageTemplateStatusId: validateAndUpdateStatusRes.templateStatus, statusName: getTemplateStatusName(validateAndUpdateStatusRes.templateStatus) } })
    })
    .catch(err => {
      __logger.error('updateTemplateStatus :: error', err)
      __util.send(res, { type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
    })
}

module.exports = { updateTemplateStatus }
