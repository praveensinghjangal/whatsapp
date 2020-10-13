const q = require('q')
const _ = require('lodash')
const __db = require('../../../lib/db')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const queryProvider = require('../queryProvider')
const rejectionHandler = require('../../../lib/util/rejectionHandler')
const ValidatonService = require('../services/validation')
const TemplateService = require('./dbData')

class StatusService {
  canUpdateStatus (newStatusId, oldStatusId) {
    __logger.info('canUpdateStatus::', { TEMPLATE_STATUS_MAPPING: __constants.TEMPLATE_STATUS_MAPPING[oldStatusId], newStatusId })
    if (__constants.TEMPLATE_STATUS_MAPPING[oldStatusId] && __constants.TEMPLATE_STATUS_MAPPING[oldStatusId].includes(newStatusId)) return true
    return false
  }

  validateAndUpdateStatus (templateId, firstLocalizationNewStatusId, firstLocalizationOldStatusId, firstLocalizationRejectionReason, secondLocalizationNewStatusId, secondLocalizationOldStatusId, secondLocalizationRejectionReason, userId) {
    const statusChanged = q.defer()
    const validate = new ValidatonService()
    const templateService = new TemplateService()
    validate.validateAndUpdateStatusService({ templateId, firstLocalizationNewStatusId, firstLocalizationOldStatusId, firstLocalizationRejectionReason, secondLocalizationNewStatusId, secondLocalizationOldStatusId, secondLocalizationRejectionReason })
      .then(data => {
        __logger.info('validateAndUpdateStatus::here to update sta  us', { templateId, newStatusId: firstLocalizationNewStatusId, oldStatusId: firstLocalizationOldStatusId, firstLocalizationRejectionReason })
        if (firstLocalizationNewStatusId && this.canUpdateStatus(firstLocalizationNewStatusId, firstLocalizationOldStatusId)) {
          return templateService.getTemplateTableDataAndWabaId(templateId, userId)
        } else if (secondLocalizationNewStatusId && this.canUpdateStatus(secondLocalizationNewStatusId, secondLocalizationOldStatusId)) {
          return templateService.getTemplateTableDataAndWabaId(templateId, userId)
        } else {
          return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.CANNOT_CHANGE_STATUS, err: { details: 'cannot change to a new requested status from this current status' } })
        }
      })
      .then(templateData => {
        __logger.info('validateAndUpdateStatus::dbData', { templateData })
        if (templateData.messageTemplateId) {
          let flrr = templateData.firstLocalizationRejectionReason
          let slrr = templateData.secondLocalizationRejectionReason
          if (firstLocalizationNewStatusId && firstLocalizationNewStatusId === __constants.TEMPLATE_STATUS.rejected.statusCode) flrr = firstLocalizationRejectionReason
          if (firstLocalizationNewStatusId && firstLocalizationNewStatusId !== __constants.TEMPLATE_STATUS.rejected.statusCode) flrr = null
          if (secondLocalizationNewStatusId && secondLocalizationNewStatusId === __constants.TEMPLATE_STATUS.rejected.statusCode) slrr = secondLocalizationRejectionReason
          if (secondLocalizationNewStatusId && secondLocalizationNewStatusId !== __constants.TEMPLATE_STATUS.rejected.statusCode) slrr = null
          const queryObj = {
            templateStatus: '',
            firstLocalizationStatus: firstLocalizationNewStatusId || templateData.firstLocalizationStatus,
            firstLocalizationRejectionReason: flrr,
            secondLocalizationStatus: secondLocalizationNewStatusId || templateData.secondLocalizationStatus,
            secondLocalizationRejectionReason: slrr,
            updatedBy: userId,
            messageTemplateId: templateId,
            wabaInformationId: templateData.wabaInformationId
          }
          queryObj.templateStatus = queryObj.firstLocalizationStatus
          if (queryObj.firstLocalizationStatus === __constants.TEMPLATE_STATUS.approved.statusCode || queryObj.secondLocalizationStatus === __constants.TEMPLATE_STATUS.approved.statusCode) queryObj.templateStatus = __constants.TEMPLATE_STATUS.partiallyApproved.statusCode
          if (queryObj.firstLocalizationStatus === __constants.TEMPLATE_STATUS.approved.statusCode && queryObj.secondLocalizationStatus === __constants.TEMPLATE_STATUS.approved.statusCode) queryObj.templateStatus = __constants.TEMPLATE_STATUS.approved.statusCode
          const queryParam = []
          _.each(queryObj, val => queryParam.push(val))
          __logger.info('validateAndUpdateStatus::update status query', queryParam)
          return __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.updateTemplateStatus(), queryParam)
        } else {
          return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.TEMPLATE_ID_NOT_EXISTS, data: {}, err: {} })
        }
      })
      .then(result => {
        if (result && result.affectedRows && result.affectedRows > 0) {
          statusChanged.resolve(true)
        } else {
          statusChanged.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
        }
      })
      .catch(err => {
        __logger.error('validateAndUpdateStatus::error: ', err)
        return statusChanged.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return statusChanged.promise
  }
}

module.exports = StatusService
