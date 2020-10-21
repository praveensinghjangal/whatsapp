const q = require('q')
const _ = require('lodash')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const __db = require('../../../lib/db')
const queryProvider = require('../queryProvider')
const rejectionHandler = require('../../../lib/util/rejectionHandler')
const UniqueId = require('../../../lib/util/uniqueIdGenerator')
const saveHistoryData = require('../../../lib/util/saveDataHistory')

class TemplateService {
  constructor () {
    this.uniqueId = new UniqueId()
  }

  getTemplateTableDataAndWabaId (messageTemplateId, userId) {
    __logger.info('inside get template by id service', messageTemplateId, userId)
    const templateData = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getTemplateTableDataAndWabaId(), [messageTemplateId, userId])
      .then(result => {
        // console.log('Qquery Result', result)
        if (result && result.length > 0) {
          result[0].secondLanguageRequired = result[0].secondLanguageRequired === 1
          templateData.resolve(result[0])
        } else {
          templateData.reject({ type: __constants.RESPONSE_MESSAGES.WABA_ID_NOT_EXISTS, err: {} })
        }
      })
      .catch(err => {
        __logger.error('error in get template by id function: ', err)
        templateData.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return templateData.promise
  }

  getTemplatesCount (wabaInformationId) {
    __logger.info('inside get template count service', wabaInformationId)
    const count = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getTemplateCount(), [wabaInformationId])
      .then(result => {
        if (result && result.length > 0) {
          count.resolve(result[0])
        } else {
          count.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: {} })
        }
      })
      .catch(err => {
        __logger.error('error in get template by id function: ', err)
        count.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return count.promise
  }

  deactivateOldTemplateData (messageTemplateId, userId) {
    const recordDeactivated = q.defer()
    __logger.info('Setting is active false to Template record', messageTemplateId)
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.setIsActiveFalseByTemplateId(), [messageTemplateId, userId])
      .then(result => {
        if (result && result.affectedRows && result.affectedRows > 0) {
          recordDeactivated.resolve(true)
        } else {
          recordDeactivated.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
        }
      })
      .catch(err => {
        __logger.error('error: ', err)
        recordDeactivated.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return recordDeactivated.promise
  }

  insertTemplate (newData, oldData, userId) {
    __logger.info('Inserting new template')
    const dataInserted = q.defer()
    const templateData = {
      messageTemplateId: oldData && oldData.messageTemplateId ? oldData.messageTemplateId : this.uniqueId.uuid().split('-').join('_'),
      wabaInformationId: oldData.wabaInformationId,
      templateName: newData.templateName || oldData.templateName,
      type: newData.type || oldData.type,
      messageTemplateCategoryId: newData.messageTemplateCategoryId || oldData.messageTemplateCategoryId,
      messageTemplateStatusId: newData.messageTemplateStatusId || __constants.TEMPLATE_DEFAULT_STATUS,
      messageTemplateLanguageId: newData.messageTemplateLanguageId || oldData.messageTemplateLanguageId,
      bodyText: newData.bodyText || oldData.bodyText,
      headerText: newData.headerText || oldData.headerText,
      footerText: newData.footerText || oldData.footerText,
      mediaType: newData.mediaType || oldData.mediaType,
      secondLanguageRequired: newData.secondLanguageRequired || oldData.secondLanguageRequired,
      secondMessageTemplateLanguageId: newData.secondMessageTemplateLanguageId || oldData.secondMessageTemplateLanguageId,
      secondLanguageHeaderText: newData.secondLanguageHeaderText || oldData.secondLanguageHeaderText,
      secondLanguageBodyText: newData.secondLanguageBodyText || oldData.secondLanguageBodyText,
      secondLanguageFooterText: newData.secondLanguageFooterText || oldData.secondLanguageFooterText,
      headerType: newData.headerType || oldData.headerType,
      buttonType: newData.buttonType || oldData.buttonType,
      buttonData: newData.buttonData || oldData.buttonData,
      createdBy: userId,
      firstLocalizationStatus: ''
    }
    templateData.firstLocalizationStatus = templateData.messageTemplateStatusId
    if (templateData.buttonData) templateData.buttonData = JSON.stringify(templateData.buttonData)

    // Checks
    if (templateData.secondLanguageRequired) {
      templateData.secondLocalizationStatus = templateData.messageTemplateStatusId
    }
    // If Second Lang is not opted deleting the field related to it
    if (!templateData.secondLanguageRequired) {
      templateData.secondMessageTemplateLanguageId = null
      templateData.secondLanguageHeaderText = null
      templateData.secondLanguageBodyText = null
      templateData.secondLanguageFooterText = null
      templateData.secondLanguageName = null
    }

    // If template type is standard then deleting the header text footer text and button data
    if (templateData.type === __constants.TEMPLATE_TYPE[0].templateType.toLowerCase()) {
      templateData.footerText = null
      templateData.headerText = null
      templateData.buttonData = null
      templateData.buttonType = null
    }

    // If template type is media then deleting the header text and footer text
    // if (templateData.type === __constants.TEMPLATE_TYPE[1].templateType.toLowerCase()) {
    //   templateData.headerText = null
    // }
    const queryParam = []
    _.each(templateData, (val) => queryParam.push(val))
    __logger.info('inserttttttttttttttttttttt->', templateData, queryParam)
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.addTemplate(), queryParam)
      .then(result => {
        if (result && result.affectedRows && result.affectedRows > 0) {
          dataInserted.resolve(templateData)
        } else {
          dataInserted.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
        }
      })
      .catch(err => {
        __logger.error('error: ', err)
        dataInserted.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return dataInserted.promise
  }

  addTemplateData (insertData, wabaData, userId) {
    __logger.info('Add template service called', insertData, wabaData, userId)
    const templateAdded = q.defer()
    this.getTemplatesCount(wabaData.wabaInformationId)
      .then(data => {
        if (data.templatesConsumed < wabaData.templatesAllowed) {
          return this.insertTemplate(insertData, wabaData, userId)
        } else {
          return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.MAX_TEMPLATE, data: {}, err: {} })
        }
      })
      .then(data => templateAdded.resolve(data))
      .catch(err => templateAdded.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err }))
    return templateAdded.promise
  }

  updateTemplate (newData, oldData, userId) {
    __logger.info('Updating template', newData)
    const dataUpdated = q.defer()
    saveHistoryData(oldData, __constants.ENTITY_NAME.MESSAGE_TEMPLATE, oldData.messageTemplateId, userId)
    const templateData = {
      templateName: newData.templateName || oldData.templateName,
      type: newData.type || oldData.type,
      messageTemplateCategoryId: newData.messageTemplateCategoryId || oldData.messageTemplateCategoryId,
      messageTemplateStatusId: newData.messageTemplateStatusId || oldData.messageTemplateStatusId,
      messageTemplateLanguageId: newData.messageTemplateLanguageId || oldData.messageTemplateLanguageId,
      bodyText: newData.bodyText || oldData.bodyText,
      headerText: newData.headerText || oldData.headerText,
      footerText: newData.footerText || oldData.footerText,
      mediaType: newData.mediaType || oldData.mediaType,
      secondLanguageRequired: typeof newData.secondLanguageRequired === 'boolean' ? newData.secondLanguageRequired : oldData.secondLanguageRequired,
      secondMessageTemplateLanguageId: newData.secondMessageTemplateLanguageId || oldData.secondMessageTemplateLanguageId,
      secondLanguageHeaderText: newData.secondLanguageHeaderText || oldData.secondLanguageHeaderText,
      secondLanguageBodyText: newData.secondLanguageBodyText || oldData.secondLanguageBodyText,
      secondLanguageFooterText: newData.secondLanguageFooterText || oldData.secondLanguageFooterText,
      headerType: newData.headerType || oldData.headerType,
      buttonType: newData.buttonType || oldData.buttonType,
      buttonData: newData.buttonData || oldData.buttonData,
      updatedBy: userId,
      messageTemplateId: oldData.messageTemplateId,
      wabaInformationId: oldData.wabaInformationId
    }
    if (templateData.buttonData) templateData.buttonData = JSON.stringify(templateData.buttonData)
    // Checks
    // If Second Lang is not opted deleting the field related to it
    if (!templateData.secondLanguageRequired) {
      templateData.secondMessageTemplateLanguageId = null
      templateData.secondLanguageHeaderText = null
      templateData.secondLanguageBodyText = null
      templateData.secondLanguageFooterText = null
      templateData.secondLanguageName = null
    }

    // If template type is standard then deleting the header text footer text and button data
    if (templateData.type === __constants.TEMPLATE_TYPE[0].templateType.toLowerCase()) {
      templateData.footerText = null
      templateData.headerText = null
      templateData.buttonData = null
      templateData.buttonType = null
    }

    // If template type is media then deleting the header text and footer text
    // if (templateData.type === __constants.TEMPLATE_TYPE[1].templateType.toLowerCase()) {
    //   templateData.headerText = null
    // }
    const queryParam = []
    _.each(templateData, (val) => queryParam.push(val))
    __logger.info('updateeeeee --->', templateData, queryParam)
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.updateTemplate(), queryParam)
      .then(result => {
        if (result && result.affectedRows && result.affectedRows > 0) {
          dataUpdated.resolve(templateData)
        } else {
          dataUpdated.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
        }
      })
      .catch(err => {
        __logger.error('error: ', err)
        dataUpdated.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return dataUpdated.promise
  }

  updateTemplateData (newData, oldData, userId) {
    __logger.info('update template service called', newData, oldData, userId)
    const templateUpdated = q.defer()
    console.log('i will updateeeee')
    // this.deactivateOldTemplateData(oldData.messageTemplateId, userId)
    // .then(data => this.insertTemplate(newData, oldData, userId))
    this.updateTemplate(newData, oldData, userId)
      .then(data => templateUpdated.resolve(data))
      .catch(err => templateUpdated.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err }))
    return templateUpdated.promise
  }

  getTemplateInfo (userId, templateId) {
    __logger.info('inside getTemplateInfo service')
    const templateFetched = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getTemplateInfo(), [userId, templateId])
      .then(result => {
        __logger.info('getTemplateInfo ::>>>>>>>..', result)
        if (result && result.length > 0) {
          templateFetched.resolve(result[0])
        } else {
          templateFetched.reject({ type: __constants.RESPONSE_MESSAGES.TEMPLATE_NOT_FOUND, err: {} })
        }
      })
      .catch(err => {
        __logger.error('error in getTemplateInfo function: ', err)
        templateFetched.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return templateFetched.promise
  }

  deleteTemplate (statusCode, oldStatusCode, templateId, userId) {
    __logger.info('delete template service called')
    const templateDeleted = q.defer()
    const StatusEngine = require('./status')
    const statusEngine = new StatusEngine()
    if (statusEngine.canUpdateStatus(statusCode, oldStatusCode)) {
      this.getTemplateInfo(userId, templateId)
        .then(data => {
          const templateData = {
            messageTemplateStatusId: statusCode,
            firstLocalizationStatus: __constants.TEMPLATE_STATUS.deleted.statusCode,
            secondLocalizationStatus: data.secondLocalizationStatusId ? data.secondLocalizationStatusId : null,
            updatedBy: userId,
            messageTemplateId: templateId,
            wabaInformationId: data.wabaInformationId
          }
          if (data && data.secondLanguageRequired) {
            templateData.secondLocalizationStatus = __constants.TEMPLATE_STATUS.deleted.statusCode
          }
          const queryParam = []
          _.each(templateData, (val) => queryParam.push(val))
          return __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.deleteTemplate(), queryParam)
        })
        .then(result => {
          if (result && result.affectedRows > 0) {
            templateDeleted.resolve(true)
          } else {
            return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: {}, data: {} })
          }
        })
        .catch(err => {
          __logger.error('error: ', err)
          templateDeleted.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
        })
    } else {
      templateDeleted.reject({ type: __constants.RESPONSE_MESSAGES.CANNOT_CHANGE_STATUS, err: {} })
    }
    return templateDeleted.promise
  }
}

module.exports = TemplateService
