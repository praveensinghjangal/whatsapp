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
    __logger.info('inside get template by id service', messageTemplateId)
    const templateData = q.defer()
    __db.postgresql.__query(queryProvider.getTemplateTableDataAndWabaId(), [messageTemplateId, userId])
      .then(result => {
      // console.log('Qquery Result', results)
        if (result && result.rows && result.rows.length === 0) {
          templateData.reject({ type: __constants.RESPONSE_MESSAGES.WABA_ID_NOT_EXISTS, err: {} })
        } else {
          templateData.resolve(result.rows[0])
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
    __db.postgresql.__query(queryProvider.getTemplateCount(), [wabaInformationId])
      .then(result => {
        if (result && result.rows && result.rows.length === 0) {
          count.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: {} })
        } else {
          count.resolve(result.rows[0])
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
    __db.postgresql.__query(queryProvider.setIsActiveFalseByTemplateId(), [messageTemplateId, userId])
      .then(result => {
        if (result && result.rowCount && result.rowCount > 0) {
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
      messageTemplateId: oldData.messageTemplateId || this.uniqueId.uuid(),
      wabaInformationId: oldData.wabaInformationId,
      templateName: newData.templateName || oldData.templateName,
      type: newData.type || oldData.type,
      messageTemplateCategoryId: newData.messageTemplateCategoryId || oldData.messageTemplateCategoryId,
      messageTemplateStatusId: newData.messageTemplateStatusId || oldData.messageTemplateStatusId,
      messageTemplateLanguageId: newData.messageTemplateLanguageId || oldData.messageTemplateLanguageId,
      bodyText: newData.bodyText || oldData.bodyText,
      headerText: newData.headerText || oldData.headerText,
      footerText: newData.footerText || oldData.footerText,
      mediaType: newData.mediaType || oldData.mediaType,
      secondLanguageRequired: newData.secondLanguageRequired || oldData.secondLanguageRequired,
      secondMessageTemplateLanguageId: newData.secondMessageTemplateLanguageId || oldData.secondMessageTemplateLanguageId,
      secondlanguageBodyText: newData.secondlanguageBodyText || oldData.secondlanguageBodyText,
      headerType: newData.headerType || oldData.headerType,
      buttonType: newData.buttonType || oldData.buttonType,
      buttonData: newData.buttonData || oldData.buttonData
    }
    const queryParam = []
    _.each(templateData, (val) => queryParam.push(val))
    queryParam.push(userId)
    __logger.info('inserttttttttttttttttttttt->', templateData, queryParam)
    __db.postgresql.__query(queryProvider.addTemplate(), queryParam)
      .then(result => {
        if (result && result.rowCount && result.rowCount > 0) {
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
    __logger.info('Updating template')
    const dataUpdated = q.defer()
    saveHistoryData(oldData, __constants.ENTITY_NAME.MESSAGE_TEMPLATE, oldData.messageTemplateId, userId)
    const templateData = {
      messageTemplateId: oldData.messageTemplateId,
      wabaInformationId: oldData.wabaInformationId,
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
      secondlanguageBodyText: newData.secondlanguageBodyText || oldData.secondlanguageBodyText,
      headerType: newData.headerType || oldData.headerType,
      buttonType: newData.buttonType || oldData.buttonType,
      buttonData: newData.buttonData || oldData.buttonData
    }
    const queryParam = []
    _.each(templateData, (val) => queryParam.push(val))
    queryParam.push(userId)
    __logger.info('updateeeeee --->', templateData, queryParam)
    __db.postgresql.__query(queryProvider.updateTemplate(), queryParam)
      .then(result => {
        if (result && result.rowCount && result.rowCount > 0) {
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
}

module.exports = TemplateService
