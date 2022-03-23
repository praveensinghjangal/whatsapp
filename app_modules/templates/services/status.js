const q = require('q')
const _ = require('lodash')
const __db = require('../../../lib/db')
const __config = require('../../../config')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const queryProvider = require('../queryProvider')
const rejectionHandler = require('../../../lib/util/rejectionHandler')
const ValidatonService = require('../services/validation')
const TemplateService = require('./dbData')
const UserService = require('../../user/services/dbData')
const RedisService = require('../../../lib/redis_service/redisService')
const emailTemplates = require('../../../lib/sendNotifications/emailTemplates')
const EmailService = require('../../../lib/sendNotifications/email')
const integrationService = require('../../integration')
const telegramMessage = require('./../../../lib/errorHandlingMechanism/sendToTelegram')
const telegramTemplate = require('../../../lib/sendNotifications/telegramTemplate')

class StatusService {
  canUpdateStatus (newStatusId, oldStatusId) {
    __logger.info('canUpdateStatus::', oldStatusId, { TEMPLATE_STATUS_MAPPING: __constants.TEMPLATE_STATUS_MAPPING[oldStatusId], newStatusId })
    if (__constants.TEMPLATE_STATUS_MAPPING[oldStatusId] && __constants.TEMPLATE_STATUS_MAPPING[oldStatusId].includes(newStatusId)) return true
    return false
  }

  validateAndUpdateStatus (templateId, firstLocalizationNewStatusId, firstLocalizationOldStatusId, firstLocalizationRejectionReason, secondLocalizationNewStatusId, secondLocalizationOldStatusId, secondLocalizationRejectionReason, userId, callerUserId) {
    __logger.info('validateAndUpdateStatus::argumenst', { templateId, newStatusId: firstLocalizationNewStatusId, oldStatusId: firstLocalizationOldStatusId, firstLocalizationRejectionReason })
    const statusChanged = q.defer()
    const validate = new ValidatonService()
    const templateService = new TemplateService()
    let queryObj = {}
    validate.validateAndUpdateStatusService({ templateId, firstLocalizationNewStatusId, firstLocalizationOldStatusId, firstLocalizationRejectionReason, secondLocalizationNewStatusId, secondLocalizationOldStatusId, secondLocalizationRejectionReason })
      .then(data => {
        __logger.info('validateAndUpdateStatus::here to update sta  us then 1', { templateId, newStatusId: firstLocalizationNewStatusId, oldStatusId: firstLocalizationOldStatusId, firstLocalizationRejectionReason, userId })
        if (firstLocalizationNewStatusId && this.canUpdateStatus(firstLocalizationNewStatusId, firstLocalizationOldStatusId)) {
          return templateService.getTemplateTableDataAndWabaId(templateId, userId)
        } else if (secondLocalizationNewStatusId && this.canUpdateStatus(secondLocalizationNewStatusId, secondLocalizationOldStatusId)) {
          return templateService.getTemplateTableDataAndWabaId(templateId, userId)
        } else {
          return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.CANNOT_CHANGE_STATUS, err: { details: 'cannot change to a new requested status from this current status' } })
        }
      })
      .then(templateData => {
        __logger.info('validateAndUpdateStatus::dbData then 2', { templateData })
        if (templateData.messageTemplateId) {
          let flrr = templateData.firstLocalizationRejectionReason
          let slrr = templateData.secondLocalizationRejectionReason
          if (firstLocalizationNewStatusId && firstLocalizationNewStatusId === __constants.TEMPLATE_STATUS.rejected.statusCode) flrr = firstLocalizationRejectionReason
          if (firstLocalizationNewStatusId && firstLocalizationNewStatusId === __constants.TEMPLATE_STATUS.denied.statusCode) flrr = firstLocalizationRejectionReason
          if (firstLocalizationNewStatusId && firstLocalizationNewStatusId !== __constants.TEMPLATE_STATUS.rejected.statusCode && firstLocalizationNewStatusId !== __constants.TEMPLATE_STATUS.denied.statusCode) flrr = null
          if (secondLocalizationNewStatusId && secondLocalizationNewStatusId === __constants.TEMPLATE_STATUS.rejected.statusCode) slrr = secondLocalizationRejectionReason
          if (secondLocalizationNewStatusId && secondLocalizationNewStatusId === __constants.TEMPLATE_STATUS.denied.statusCode) slrr = secondLocalizationRejectionReason
          if (secondLocalizationNewStatusId && secondLocalizationNewStatusId !== __constants.TEMPLATE_STATUS.rejected.statusCode && secondLocalizationNewStatusId !== __constants.TEMPLATE_STATUS.denied.statusCode) slrr = null
          queryObj = {
            templateStatus: '',
            firstLocalizationStatus: firstLocalizationNewStatusId || templateData.firstLocalizationStatus,
            firstLocalizationRejectionReason: flrr || null,
            secondLocalizationStatus: secondLocalizationNewStatusId || templateData.secondLocalizationStatus,
            secondLocalizationRejectionReason: slrr || null,
            updatedBy: callerUserId || userId,
            messageTemplateId: templateId,
            wabaInformationId: templateData.wabaInformationId
          }
          queryObj.templateStatus = queryObj.firstLocalizationStatus
          if (queryObj.firstLocalizationStatus && queryObj.secondLocalizationStatus && (queryObj.firstLocalizationStatus === __constants.TEMPLATE_STATUS.approved.statusCode || queryObj.secondLocalizationStatus === __constants.TEMPLATE_STATUS.approved.statusCode)) queryObj.templateStatus = __constants.TEMPLATE_STATUS.partiallyApproved.statusCode
          if (queryObj.firstLocalizationStatus && queryObj.secondLocalizationStatus && queryObj.firstLocalizationStatus === __constants.TEMPLATE_STATUS.approved.statusCode && queryObj.secondLocalizationStatus === __constants.TEMPLATE_STATUS.approved.statusCode) queryObj.templateStatus = __constants.TEMPLATE_STATUS.approved.statusCode
          const queryParam = []
          _.each(queryObj, val => queryParam.push(val))
          __logger.info('validateAndUpdateStatus::update status query', queryParam)
          return __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.updateTemplateStatus(), queryParam)
        } else {
          return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.TEMPLATE_ID_NOT_EXISTS, data: {}, err: {} })
        }
      })
      .then(result => {
        __logger.info('result then 3 ')
        if (result && result.affectedRows && result.affectedRows > 0) {
          statusChanged.resolve(queryObj)
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

  singleStatusCompareAndChange (templateId, serviceProviderId, wabaNumber, userId, maxTpsToProvider, queryParams) {
    __logger.info('singleStatusCompareAndChange::', { templateId, serviceProviderId })
    const compared = q.defer()
    const templateIntegrationService = new integrationService.Template(serviceProviderId, maxTpsToProvider, userId)
    const templateService = new TemplateService()
    let firstLocalizationStatusFromProvider = ''
    let secondLocalizationStatusFromProvider = ''
    let firstRejectReason = ''
    let secondRejectReason = ''
    templateIntegrationService.getTemplateInfo(wabaNumber, templateId, queryParams)
      .then(result => {
        __logger.info('singleStatusCompareAndChange::integration result then 1', { result })
        if (result && result.code === __constants.RESPONSE_MESSAGES.SUCCESS.code) {
          firstLocalizationStatusFromProvider = result.data && result.data.localizations && result.data.localizations[0] && result.data.localizations[0].messageTemplateStatusId ? result.data.localizations[0].messageTemplateStatusId : null
          secondLocalizationStatusFromProvider = result.data && result.data.localizations && result.data.localizations[1] && result.data.localizations[1].messageTemplateStatusId ? result.data.localizations[1].messageTemplateStatusId : null
          firstRejectReason = result.data && result.data.localizations && result.data.localizations[0] && result.data.localizations[0].rejectionReason ? result.data.localizations[0].rejectionReason : 'Rejected by Facebook without providing a reason.'
          secondRejectReason = result.data && result.data.localizations && result.data.localizations[1] && result.data.localizations[1].rejectionReason ? result.data.localizations[1].rejectionReason : 'Rejected by Facebook without providing a reason.'
          return templateService.getTemplateTableDataAndWabaId(templateId, userId)
        } else {
          return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: result.error || result })
        }
      })
      .then(data => {
        __logger.info('singleStatusCompareAndChange::dbData then 2', data)
        let oldFirstLocalizationStatus = null
        let oldSecondLocalizationStatus = null

        const notifyStatusData = {
          secondLanguageRequired: data.secondLanguageRequired ? data.secondLanguageRequired : null,
          firstLocalizationRejectionReason: data.firstLocalizationRejectionReason ? data.firstLocalizationRejectionReason : null,
          secondLocalizationRejectionReason: data.secondLocalizationRejectionReason ? data.secondLocalizationRejectionReason : null
        }
        if (data.firstLocalizationStatus !== firstLocalizationStatusFromProvider) {
          oldFirstLocalizationStatus = data.firstLocalizationStatus
          notifyStatusData.firstLocalizationStatus = firstLocalizationStatusFromProvider ? this.getTemplateStatusName(firstLocalizationStatusFromProvider) : null
        }
        if (data.secondLanguageRequired && data.secondLocalizationStatus !== secondLocalizationStatusFromProvider) {
          oldSecondLocalizationStatus = data.secondLocalizationStatus
          notifyStatusData.secondLocalizationStatus = secondLocalizationStatusFromProvider ? this.getTemplateStatusName(secondLocalizationStatusFromProvider) : null
        }
        if (oldFirstLocalizationStatus && oldSecondLocalizationStatus) {
          __logger.info('time to update status ', { oldFirstLocalizationStatus, firstLocalizationStatusFromProvider, oldSecondLocalizationStatus, secondLocalizationStatusFromProvider })
          this.notify(userId, notifyStatusData, data.templateName)
          return this.validateAndUpdateStatus(templateId, firstLocalizationStatusFromProvider, oldFirstLocalizationStatus, firstRejectReason, secondLocalizationStatusFromProvider, oldSecondLocalizationStatus, secondRejectReason, userId)
        } else if (oldFirstLocalizationStatus) {
          __logger.info('time to update only 1st status ', { oldFirstLocalizationStatus, firstLocalizationStatusFromProvider, oldSecondLocalizationStatus, secondLocalizationStatusFromProvider })
          this.notify(userId, notifyStatusData, data.templateName)
          return this.validateAndUpdateStatus(templateId, firstLocalizationStatusFromProvider, oldFirstLocalizationStatus, firstRejectReason, null, null, null, userId)
        } else if (oldSecondLocalizationStatus) {
          __logger.info('time to update only 2nd status ', { oldFirstLocalizationStatus, firstLocalizationStatusFromProvider, oldSecondLocalizationStatus, secondLocalizationStatusFromProvider })
          this.notify(userId, notifyStatusData, data.templateName)
          return this.validateAndUpdateStatus(templateId, null, null, null, secondLocalizationStatusFromProvider, oldSecondLocalizationStatus, secondRejectReason, userId)
        } else {
          __logger.info('wont update status ', { oldFirstLocalizationStatus, firstLocalizationStatusFromProvider, oldSecondLocalizationStatus, secondLocalizationStatusFromProvider })
          return true
        }
      })
      .then(data => compared.resolve(data))
      .catch(err => {
        __logger.error('singleStatusCompareAndChange::error: ', err)
        return compared.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })

    return compared.promise
  }

  processBulkStatusCompareAndChange (templateIdArr, serviceProviderId, wabaNumber, userId, maxTpsToProvider, queryParams) {
    let p = q()
    const thePromises = []
    templateIdArr.forEach(singleTemplateId => {
      p = p.then(() => this.singleStatusCompareAndChange(singleTemplateId, serviceProviderId, wabaNumber, userId, maxTpsToProvider, queryParams))
        .catch(err => {
          if (err && typeof err === 'object') err.valid = false
          return err
        })
      thePromises.push(p)
    })
    return q.all(thePromises)
  }

  compareAndUpdateStatus (templateIdArr, serviceProviderId, wabaNumber, userId, maxTpsToProvider = 10, queryParams) {
    const comparedAndUpdated = q.defer()
    const validate = new ValidatonService()
    __logger.info('compareAndUpdateStatus::', { templateIdArr, serviceProviderId })
    validate.compareAndUpdateStatusService({ templateIdArr, serviceProviderId, wabaNumber, userId })
      .then(valRes => this.processBulkStatusCompareAndChange(templateIdArr, serviceProviderId, wabaNumber, userId, maxTpsToProvider, queryParams))
      .then(result => {
        __logger.info('compareAndUpdateStatus::After bulk process', { result })
        const redisService = new RedisService()
        redisService.setTemplatesInRedisForWabaPhoneNumber(wabaNumber.substring(2, wabaNumber.length))
        const invalidReq = _.filter(result, { valid: false })
        if (invalidReq.length > 0) {
          return comparedAndUpdated.reject({ type: __constants.RESPONSE_MESSAGES.ALL_STATUS_NOT_UPDATED, err: _.map(invalidReq, 'err') })
        } else {
          return comparedAndUpdated.resolve(true)
        }
      })
      .catch(err => {
        __logger.error('compareAndUpdateStatus::error: ', err)
        return comparedAndUpdated.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return comparedAndUpdated.promise
  }

  rollBackStatusService (userId, templateId, rejectionReason, callerUserId) {
    const statusChanged = q.defer()
    const validate = new ValidatonService()
    const templateService = new TemplateService()
    let templateData
    let validateBody
    templateService.getTemplateInfo(userId, templateId)
      .then(data => {
        __logger.info('rollBackStatusService::>>>>>>template data>>>>>>>. then 1', data)
        templateData = data
        validateBody = {
          templateId,
          firstLocalizationNewStatusId: data.firstLocalizationStatusId ? __constants.TEMPLATE_ROLLBACK_STATUS_MAPPING[data.firstLocalizationStatusId] : null,
          firstLocalizationOldStatusId: data.firstLocalizationStatusId ? data.firstLocalizationStatusId : null,
          firstLocalizationRejectionReason: data.firstLocalizationRejectionReason ? data.firstLocalizationRejectionReason : null
        }
        if (data.secondLanguageRequired) {
          validateBody.secondLocalizationNewStatusId = data.secondLocalizationStatusId ? __constants.TEMPLATE_ROLLBACK_STATUS_MAPPING[data.secondLocalizationStatusId] : null
          validateBody.secondLocalizationOldStatusId = data.secondLocalizationStatusId ? data.secondLocalizationStatusId : null
          validateBody.secondLocalizationRejectionReason = data.secondLocalizationRejectionReason ? data.secondLocalizationRejectionReason : null
        }
        Object.keys(validateBody).forEach((key) => (validateBody[key] == null) && delete validateBody[key])
        __logger.info('validateBody', validateBody)
        return validate.validateAndUpdateStatusService(validateBody)
      })
      .then(validationRes => {
        __logger.info('validationRes then 2', { validationRes })
        if (templateData.messageTemplateId) {
          const queryObj = {
            messageTemplateStatusId: '',
            firstLocalizationStatus: validateBody.firstLocalizationNewStatusId || templateData.firstLocalizationStatus,
            firstLocalizationRejectionReason: validateBody.firstLocalizationRejectionReason ? validateBody.firstLocalizationRejectionReason : null,
            secondLocalizationStatus: validateBody.secondLocalizationNewStatusId || templateData.secondLocalizationStatus,
            secondLocalizationRejectionReason: validateBody.secondLocalizationRejectionReason ? validateBody.secondLocalizationRejectionReason : null,
            updatedBy: callerUserId,
            messageTemplateId: templateId,
            wabaInformationId: templateData.wabaInformationId
          }
          queryObj.messageTemplateStatusId = queryObj.firstLocalizationStatus
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
        __logger.info('updateTemplateStatus >>>>>>>>>>. then 3', { result })
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

  notify (userId, statusData, templateName) {
    __logger.info('notify', { statusData, templateName })
    const notificationSent = q.defer()
    const userService = new UserService()
    const emailService = new EmailService(__config.emailProvider)
    const emailSubject = __config.emailProvider.subject.templateStatusSubject

    if (statusData && statusData.firstLocalizationStatus === __constants.TEMPLATE_STATUS.rejected.displayName.toLowerCase()) {
      statusData.firstLocalizationRejectionReason = statusData.firstLocalizationRejectionReason
        ? statusData.firstLocalizationRejectionReason : null
    }
    if (statusData && statusData.secondLanguageRequired &&
      statusData.secondLocalizationStatus === __constants.TEMPLATE_STATUS.rejected.displayName.toLowerCase()) {
      statusData.secondLocalizationRejectionReason = statusData.secondLocalizationRejectionReason
        ? statusData.secondLocalizationRejectionReason : null
    }
    userService.getEmailAndFirstNameFromUserId(userId)
      .then(userData => emailService.sendEmail([userData.email], emailSubject + ' - ' + templateName,
        emailTemplates.templateStatusUpdate(statusData, userData.firstName, templateName)))
      .then(data => {
        // __logger.info('Email Contents>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', { data })
        notificationSent.resolve(data)
      })
      .catch(err => {
        __logger.error('validateAndUpdateStatus::error: ', err)
        return notificationSent.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })

    return notificationSent.promise
  }

  notifySupport (userId, templateName, userRoleData) {
    __logger.info('notify', { userRoleData, templateName })
    const notificationSent = q.defer()
    const emailService = new EmailService(__config.emailProvider)
    const userService = new UserService()
    const emailSubject = __config.emailProvider.subject.templateStatusSubject
    // support mail ids are present in userRoleData array
    const supportEmail = userRoleData[0].email.split(',')
    let reqireTelegramData
    userService.getEmailAndFirstNameFromUserId(userId)
      .then(userData => {
        reqireTelegramData = userData
        return emailService.sendEmail(supportEmail, emailSubject + ' - ' + templateName, emailTemplates.supportTemplate(reqireTelegramData.firstName, userId, templateName))
      })
      .then(data => {
        const messageTemplate = telegramTemplate.emailTemplate(reqireTelegramData.firstName, userId, templateName)
        return telegramMessage.sendMessage(messageTemplate, __config.botToken, __config.telegramChatId)
      })
      .then(telegramData => {
        notificationSent.resolve(telegramData)
      })
      .catch(err => {
        __logger.error('validateAndUpdateStatus::error: ', err)
        return notificationSent.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })

    return notificationSent.promise
  }

  changeStatusToComplete (templateId, oldStatusId, userId, wabaInformationId, secondLanguageRequired) {
    __logger.info('changeStatusToComplete::', { templateId, oldStatusId, userId, wabaInformationId, secondLanguageRequired })
    const statusChanged = q.defer()
    if (!this.canUpdateStatus(__constants.TEMPLATE_STATUS.complete.statusCode, oldStatusId)) {
      statusChanged.reject({ type: __constants.RESPONSE_MESSAGES.CANNOT_CHANGE_STATUS, err: { details: 'cannot change to a complete status from this current status' } })
      return statusChanged.promise
    }
    const queryObj = {
      templateStatus: __constants.TEMPLATE_STATUS.complete.statusCode,
      firstLocalizationStatus: __constants.TEMPLATE_STATUS.complete.statusCode,
      firstLocalizationRejectionReason: null,
      secondLocalizationStatus: secondLanguageRequired ? __constants.TEMPLATE_STATUS.complete.statusCode : null,
      secondLocalizationRejectionReason: null,
      updatedBy: userId,
      messageTemplateId: templateId,
      wabaInformationId: wabaInformationId
    }
    const queryParam = []
    _.each(queryObj, val => queryParam.push(val))
    __logger.info('changeStatusToComplete::update status query', queryParam)
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.updateTemplateStatus(), queryParam)
      .then(result => {
        if (result && result.affectedRows && result.affectedRows > 0) {
          statusChanged.resolve(__constants.TEMPLATE_STATUS.complete)
        } else {
          statusChanged.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
        }
      })
      .catch(err => {
        __logger.error('changeStatusToComplete::error: ', err)
        return statusChanged.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return statusChanged.promise
  }

  changeStatusToIncomplete (templateId, oldStatusId, userId, wabaInformationId, secondLanguageRequired) {
    __logger.info('changeStatusToIncomplete::', { templateId, oldStatusId, userId, wabaInformationId, secondLanguageRequired })
    const statusChanged = q.defer()
    if (!this.canUpdateStatus(__constants.TEMPLATE_STATUS.incomplete.statusCode, oldStatusId)) {
      statusChanged.reject({ type: __constants.RESPONSE_MESSAGES.CANNOT_CHANGE_STATUS, err: { details: 'cannot change to a incomplete status from this current status' } })
      return statusChanged.promise
    }
    const queryObj = {
      templateStatus: __constants.TEMPLATE_STATUS.incomplete.statusCode,
      firstLocalizationStatus: __constants.TEMPLATE_STATUS.incomplete.statusCode,
      firstLocalizationRejectionReason: null,
      secondLocalizationStatus: secondLanguageRequired ? __constants.TEMPLATE_STATUS.incomplete.statusCode : null,
      secondLocalizationRejectionReason: null,
      updatedBy: userId,
      messageTemplateId: templateId,
      wabaInformationId: wabaInformationId
    }
    const queryParam = []
    _.each(queryObj, val => queryParam.push(val))
    __logger.info('changeStatusToIncomplete::update status query', queryParam)
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.updateTemplateStatus(), queryParam)
      .then(result => {
        if (result && result.affectedRows && result.affectedRows > 0) {
          statusChanged.resolve(__constants.TEMPLATE_STATUS.incomplete)
        } else {
          statusChanged.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
        }
      })
      .catch(err => {
        __logger.error('changeStatusToIncomplete::error: ', err)
        return statusChanged.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return statusChanged.promise
  }

  getTemplateStatusName (templateCode) {
    const result = _(__constants.TEMPLATE_STATUS)
      .filter(c => c.statusCode === templateCode)
      .map('displayName')
      .value()

    if (result && result.length > 0) {
      return result[0]
    } else {
      return null
    }
  }
}

module.exports = StatusService
