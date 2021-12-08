/**
 * @namespace -Template-Services-
 * @description This Section contains services of templates send to whatsapp for approval
 *  * *** Last-Updated :- Danish Galiyara 8th December, 2020 ***
 */

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

  /**
 * @memberof -Template-Services-
 * @name getTemplateTableDataAndWabaId
 * @description This service is get template data and waba data by template ID and user ID.
 * @body {string} messageTemplateId
 * @body {string} userId
 * @response {object} templateAndWabaData  -  Object which is fetched from DB.
 * @author Danish Galiyara 5th June, 2020
 *  * *** Last-Updated :- Danish Galiyara 8th December, 2020 ***
 */
  getTemplateTableDataAndWabaId (messageTemplateId, userId) {
    __logger.info('inside get template by id service', messageTemplateId, userId)
    const templateData = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getTemplateTableDataAndWabaId(), [messageTemplateId, userId])
      .then(result => {
        __logger.info('Qquery Result', { result })
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
        __logger.info('result', { result })
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
        __logger.info('result', { result })
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
      messageTemplateId: this.uniqueId.uuid().split('-').join('_'),
      wabaInformationId: oldData.wabaInformationId,
      templateName: newData.templateName ? newData.templateName : null,
      type: newData.type ? newData.type : null,
      messageTemplateCategoryId: newData.messageTemplateCategoryId ? newData.messageTemplateCategoryId : null,
      messageTemplateStatusId: newData.messageTemplateStatusId || __constants.TEMPLATE_DEFAULT_STATUS,
      messageTemplateLanguageId: newData.messageTemplateLanguageId ? newData.messageTemplateLanguageId : null,
      bodyText: newData.bodyText ? newData.bodyText : null,
      headerText: newData.headerText ? newData.headerText : null,
      footerText: newData.footerText ? newData.footerText : null,
      mediaType: newData.mediaType ? newData.mediaType : null,
      secondLanguageRequired: newData.secondLanguageRequired ? newData.secondLanguageRequired : false,
      secondMessageTemplateLanguageId: newData.secondMessageTemplateLanguageId ? newData.secondMessageTemplateLanguageId : null,
      secondLanguageHeaderText: newData.secondLanguageHeaderText ? newData.secondLanguageHeaderText : null,
      secondLanguageBodyText: newData.secondLanguageBodyText ? newData.secondLanguageBodyText : null,
      secondLanguageFooterText: newData.secondLanguageFooterText ? newData.secondLanguageFooterText : null,
      headerType: newData.headerType ? newData.headerType : null,
      buttonType: newData.buttonType ? newData.buttonType : null,
      buttonData: newData.buttonData ? newData.buttonData : null,
      createdBy: userId,
      firstLocalizationStatus: newData.messageTemplateStatusId || __constants.TEMPLATE_DEFAULT_STATUS,
      updatedBy: userId,
      secondLocalizationStatus: null,
      bodyTextVarExample: JSON.stringify(newData.bodyTextVarExample) || [],
      headerTextVarExample: JSON.stringify(newData.headerTextVarExample) || [],
      secondLanguageBodyTextVarExample: JSON.stringify(newData.secondLanguageBodyTextVarExample),
      secondLanguageHeaderTextVarExample: JSON.stringify(newData.secondLanguageHeaderTextVarExample),
      mediaExampleUrl: newData.mediaExampleUrl
    }

    if (newData.type.toLowerCase() === __constants.TEMPLATE_TYPE[1].templateType.toLowerCase()) {
      if (newData.headerType.toLowerCase() === __constants.TEMPLATE_HEADER_TYPE[3].templateHeaderType.toLowerCase() && (newData.bodyTextVarExample.length === 0 && newData.headerTextVarExample.length === 0)) {
        templateData.isPersonalized = 0
      } else {
        templateData.isPersonalized = 1
      }
    } else if (newData.bodyTextVarExample.length > 0 || newData.headerTextVarExample.length > 0) {
      templateData.isPersonalized = 1
    } else {
      templateData.isPersonalized = 0
    }

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
    }

    if (!templateData.secondLanguageRequired && templateData.buttonData) {
      if (templateData.buttonData.secondLanguageQuickReply) delete templateData.buttonData.secondLanguageQuickReply
      if (templateData.buttonData.secondLanguageWebsiteButtontext) delete templateData.buttonData.secondLanguageWebsiteButtontext
      if (templateData.buttonData.secondLanguagePhoneButtonText) delete templateData.buttonData.secondLanguagePhoneButtonText
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
        __logger.info('result', { result })
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
        __logger.info('data', { data })
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

  /**
 * @memberof -Template-Services-
 * @name updateTemplate
 * @description This service is used to update template data.
 * @body {object} newData - Request body by API
 * @body {object} oldData - Data present in DB
 * @body {string} userId - ID fetchd from token by controller
 * @response {object} templateData  -  Object which is updated in DB.
 * @author Danish Galiyara 5th June, 2020
 *  * *** Last-Updated :- Danish Galiyara 3rd January, 2021 ***
 */
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
      headerType: newData.headerType ? newData.headerType : (newData.headerType === null ? null : oldData.headerType),
      buttonType: newData.buttonType ? newData.buttonType : (newData.buttonType === null ? null : oldData.buttonType),
      buttonData: newData.buttonType === null ? {} : (newData.buttonData || oldData.buttonData),
      updatedBy: userId,
      bodyTextVarExample: JSON.stringify(newData.bodyTextVarExample) || JSON.stringify(oldData.bodyTextVarExample) || [],
      headerTextVarExample: JSON.stringify(newData.headerTextVarExample) || JSON.stringify(oldData.headerTextVarExample) || [],
      secondLanguageBodyTextVarExample: JSON.stringify(newData.secondLanguageBodyTextVarExample) || JSON.stringify(oldData.secondLanguageBodyTextVarExample),
      secondLanguageHeaderTextVarExample: JSON.stringify(newData.secondLanguageHeaderTextVarExample) || JSON.stringify(oldData.secondLanguageHeaderTextVarExample),
      mediaExampleUrl: newData.mediaExampleUrl || oldData.mediaExampleUrl,
      isPersonalized: 0,
      messageTemplateId: newData.messageTemplateId,
      wabaInformationId: oldData.wabaInformationId
    }
    if (newData.type === __constants.TEMPLATE_TYPE[1].templateType.toLowerCase()) {
      if (newData.headerType.toLowerCase() === __constants.TEMPLATE_HEADER_TYPE[3].templateHeaderType.toLowerCase() && (newData.bodyTextVarExample.length === 0 && newData.headerTextVarExample.length === 0)) {
        templateData.isPersonalized = 0
      } else {
        templateData.isPersonalized = 1
      }
    } else if (newData.bodyTextVarExample.length > 0 || newData.headerTextVarExample.length > 0) {
      templateData.isPersonalized = 1
    } else {
      templateData.isPersonalized = 0
    }
    if (templateData.buttonData) templateData.buttonData = JSON.stringify(templateData.buttonData)
    // Checks
    // If Second Lang is not opted deleting the field related to it
    if (!templateData.secondLanguageRequired) {
      templateData.secondMessageTemplateLanguageId = null
      templateData.secondLanguageHeaderText = null
      templateData.secondLanguageBodyText = null
      templateData.secondLanguageFooterText = null
      templateData.secondLanguageBodyTextVarExample = null
      templateData.secondLanguageHeaderTextVarExample = null
    }

    // If template type is standard then deleting the header text footer text and button data
    if (templateData.type === __constants.TEMPLATE_TYPE[0].templateType.toLowerCase()) {
      templateData.footerText = null
      templateData.headerText = null
      templateData.buttonData = null
      templateData.buttonType = null
      templateData.secondLanguageHeaderText = null
      templateData.mediaExampleUrl = null
      templateData.headerTextVarExample = null
      templateData.secondLanguageHeaderTextVarExample = null
    }

    if (!templateData.secondLanguageRequired && templateData.buttonData) {
      if (templateData.buttonData.secondLanguageQuickReply) delete templateData.buttonData.secondLanguageQuickReply
      if (templateData.buttonData.secondLanguageWebsiteButtontext) delete templateData.buttonData.secondLanguageWebsiteButtontext
      if (templateData.buttonData.secondLanguagePhoneButtonText) delete templateData.buttonData.secondLanguagePhoneButtonText
    }
    if (templateData.headerType && templateData.headerType !== __constants.TEMPLATE_HEADER_TYPE[3].templateHeaderType.toLocaleLowerCase()) {
      templateData.headerTextVarExample = null
      templateData.secondLanguageHeaderTextVarExample = null
    }
    if (templateData.headerType && templateData.headerType === __constants.TEMPLATE_HEADER_TYPE[3].templateHeaderType.toLocaleLowerCase()) {
      templateData.mediaExampleUrl = null
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
        __logger.info('result', { result })
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
    __logger.info('i will updateeeee')
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
        __logger.info('getTemplateInfo ::>>>>>>>..', { result })
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

  deleteTemplate (templateId, userId) {
    __logger.info('delete template service called')
    const templateDeleted = q.defer()
    const StatusEngine = require('./status')
    const statusEngine = new StatusEngine()
    this.getTemplateInfo(userId, templateId)
      .then(data => {
        if (!data) {
          return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {}, data: {} })
        }
        if (data && statusEngine.canUpdateStatus(__constants.TEMPLATE_STATUS.deleted.statusCode, data.messageTemplateStatusId)) {
          saveHistoryData(data, __constants.ENTITY_NAME.MESSAGE_TEMPLATE, data.messageTemplateId, userId)
          const templateData = {
            messageTemplateStatusId: __constants.TEMPLATE_STATUS.deleted.statusCode,
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
        } else {
          return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.CANNOT_CHANGE_STATUS, err: {} })
        }
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
        templateDeleted.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })

    return templateDeleted.promise
  }

  getTemplateTableDataByTemplateName (templateName, userId) {
    __logger.info('inside get template by name service', templateName, userId)
    const templateData = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getTemplateTableDataByTemplateName(), [templateName, userId])
      .then(result => {
        __logger.info('Qquery Result', { result })
        if (result && result.length > 0) {
          result[0].secondLanguageRequired = result[0].secondLanguageRequired === 1
          templateData.resolve(result[0])
        } else {
          templateData.reject({ type: __constants.RESPONSE_MESSAGES.WABA_ID_NOT_EXISTS, err: {} })
        }
      })
      .catch(err => {
        __logger.error('error in get template by name function: ', err)
        templateData.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return templateData.promise
  }

  getTemplateTableDataByTemplateId (messageTemplateId, userId) {
    __logger.info('inside get template by id service', messageTemplateId, userId)
    const templateData = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getTemplateTableDataByTemplateId(), [messageTemplateId, userId])
      .then(result => {
        __logger.info('Qquery Result', { result })
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

  getAllTemplateWithStatus (columnArray, offset, ItemsPerPage, valArray) {
    const templateData = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getAllTemplateWithStatus(columnArray), [...valArray, ItemsPerPage, offset])
      .then(result => {
        __logger.info('Qquery Result', { result })
        if (result && result[0].length > 0) {
          templateData.resolve(result)
        } else {
          templateData.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {} })
        }
      })
      .catch(err => {
        __logger.error('error in get template by statusId function: ', err)
        templateData.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return templateData.promise
  }

  getTemplateStatusList () {
    __logger.info('inside get template list function')
    const templateData = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getTemplateStatusList(), [])
      .then(result => {
        __logger.info('Qquery Result', { result })
        if (result && result.length > 0) {
          templateData.resolve(result)
        } else {
          templateData.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {} })
        }
      })
      .catch(err => {
        __logger.error('error in get template status list function: ', err)
        templateData.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return templateData.promise
  }

  getAllTemplateCount () {
    __logger.info('inside get template count by status service for support')
    const templateData = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getAllTemplateCount(), [])
      .then(result => {
        __logger.info('get support template count query result', { result })
        if (result && result.length > 0) {
          templateData.resolve(result)
        } else {
          templateData.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {} })
        }
      })
      .catch(err => {
        __logger.error('error in get template count service for support: ', err)
        templateData.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return templateData.promise
  }
}

module.exports = TemplateService
