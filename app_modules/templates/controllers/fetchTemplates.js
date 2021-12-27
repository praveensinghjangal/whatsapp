const __logger = require('../../../lib/logger')
const __constants = require('../../../config/constants')
const __util = require('../../../lib/util')
const __db = require('../../../lib/db')
const rejectionHandler = require('../../../lib/util/rejectionHandler')
const q = require('q')
const queryProvider = require('../queryProvider')
const StatusService = require('../services/status')
const RuleEngine = require('../services/ruleEngine')

const compareAndUpdateStatus = (templateId, providerId, wabaPhoneNumber, userId, maxTpsToProvider, queryParams) => {
  const statusUpdated = q.defer()
  const statusService = new StatusService()
  statusService.compareAndUpdateStatus([templateId], providerId, wabaPhoneNumber, userId, maxTpsToProvider, queryParams)
    .then(data => statusUpdated.resolve(data))
    .catch(err => statusUpdated.resolve(err))
  return statusUpdated.promise
}

const getTemplateList = (req, res) => {
  __logger.info('Get Templates List API Called', req.query)
  const { messageTemplateStatusId, isPersonalized } = req.query
  const params = [req.user.user_id]
  if (messageTemplateStatusId) {
    params.push(messageTemplateStatusId)
  }

  if (isPersonalized) {
    params.push(+isPersonalized)
  }
  __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getTemplateList(messageTemplateStatusId, isPersonalized), params)
    .then(result => {
      if (result && result.length === 0) {
        __util.send(res, { type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, data: {} })
      } else {
        __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: result })
      }
    })
    .catch(err => {
      __logger.error('error in create user function: ', err)
      __util.send(res, { type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
    })
}

const getTemplateInfo = (req, res) => {
  __logger.info('Get Templates Info API Called', req.params)
  const ruleEngine = new RuleEngine()
  let finalResult
  compareAndUpdateStatus(req.params.templateId, req.user.providerId, req.user.wabaPhoneNumber, req.user.user_id, req.user.maxTpsToProvider, req.query)
    .then(statusUpdated => __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getTemplateInfo(), [req.user.user_id, req.params.templateId]))
    .then(result => {
      __logger.info('then 1', { result })
      if (result && result.length === 0) {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {}, data: {} })
      } else {
        result[0].secondLanguageRequired = result[0].secondLanguageRequired === 1
        finalResult = result
        return ruleEngine.getTemplateCompletionStatus(result[0])
      }
    })
    .then(data => {
      __logger.info('data then 2', { data })
      finalResult[0].isTemplateValid = data.complete
      finalResult[0].invalidRemark = data.err && data.err.err ? data.err.err : null
      finalResult[0].bodyTextVariableCount = finalResult[0].bodyTextVarExample.length || 0
      finalResult[0].headerTextVariableCount = finalResult[0].headerTextVarExample.length || 0
      return checksForTemplate(finalResult[0])
    })
    .then(data => __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: finalResult }))
    .catch(err => {
      __logger.error('error in create get template info: ', err)
      if (err && err.type && err.type.code && err.type.code === __constants.RESPONSE_MESSAGES.ALL_STATUS_NOT_UPDATED.code) {
        err = { type: err.err[0], data: {} }
      }
      return __util.send(res, { type: err.type, err: err.err })
    })
}

const getTemplateTypes = (req, res) => {
  __logger.info('Get Templates Type API Called')

  return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: __constants.TEMPLATE_TYPE })
}

const getTemplateHeaderTypes = (req, res) => {
  __logger.info('Get Templates Header Type API Called')

  return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: __constants.TEMPLATE_HEADER_TYPE })
}

const getTemplateButtonTypes = (req, res) => {
  __logger.info('Get Templates Button Type API Called')

  return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: __constants.TEMPLATE_BUTTON_TYPE })
}

const varMask = (req, res) => {
  __logger.info('Get Templates Info VarMask API Called', req.params)
  const ruleEngine = new RuleEngine()
  let finalResult
  compareAndUpdateStatus(req.params.templateId, req.user.providerId, req.user.wabaPhoneNumber, req.user.user_id, req.user.maxTpsToProvider, req.query)
    .then(statusUpdated => __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getTemplateInfo(), [req.user.user_id, req.params.templateId]))
    .then(result => {
      __logger.info('then 1', { result })
      if (result && result.length === 0) {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {}, data: {} })
      } else {
        result[0].secondLanguageRequired = result[0].secondLanguageRequired === 1
        finalResult = result
        return ruleEngine.getTemplateCompletionStatus(result[0])
      }
    })
    .then(data => {
      __logger.info('data then 2', { data })
      finalResult[0].isTemplateValid = data.complete
      finalResult[0].invalidRemark = data.err && data.err.err ? data.err.err : null
      finalResult[0] = JSON.stringify(finalResult[0])
      finalResult[0] = finalResult[0].replace(/{{\d{1,3}}}/g, (match, key) => '<var' + match.slice(2).slice(0, -2) + '>')
      finalResult[0] = JSON.parse(finalResult[0]) || {}
      finalResult[0].bodyTextVariableCount = finalResult[0].bodyTextVarExample.length || 0
      finalResult[0].headerTextVariableCount = finalResult[0].headerTextVarExample.length || 0
      return checksForTemplate(finalResult[0])
    })
    .then(data => __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: finalResult }))
    .catch(err => {
      __logger.error('error in get template info VarMask: ', err)
      if (err && err.type && err.type.code && err.type.code === __constants.RESPONSE_MESSAGES.ALL_STATUS_NOT_UPDATED.code) {
        err = { type: err.err[0], data: {} }
      }
      return __util.send(res, { type: err.type, err: err.err })
    })
}

const checksForTemplate = (templateData) => {
  const dataValidated = q.defer()
  // Checks

  // If Second Lang is not opted deleting the field related to it
  if (!templateData.secondLanguageRequired) {
    delete templateData.secondMessageTemplateLanguageId
    delete templateData.secondLanguageHeaderText
    delete templateData.secondLanguageBodyText
    delete templateData.secondLanguageFooterText
    delete templateData.secondLanguageName
  }

  // If template type is standard then deleting the header text and footer text
  if (templateData.type === __constants.TEMPLATE_TYPE[0].templateType.toLowerCase()) {
    delete templateData.footerText
    delete templateData.headerText
    delete templateData.buttonData
    delete templateData.buttonType
  }

  // If template type is media then deleting the header text and footer text
  // if (templateData.type === __constants.TEMPLATE_TYPE[1].templateType.toLowerCase()) {
  //   delete templateData.headerText
  // }

  dataValidated.resolve(templateData)
  return dataValidated.promise
}

const getTemplateInfoByUserIdAndTemplateId = (req, res) => {
  __logger.info('Get getTemplateInfoByUserIdAndTemplateId API Called', req.params)
  const ruleEngine = new RuleEngine()
  let finalResult
  __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getTemplateInfo(), [req.params.userId, req.params.templateId])
    .then(result => {
      __logger.info('getTemplateInfoByUserIdAndTemplateId then 1', { result })
      if (result && result.length === 0) {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {}, data: {} })
      } else {
        result[0].secondLanguageRequired = result[0].secondLanguageRequired === 1
        finalResult = result
        return ruleEngine.getTemplateCompletionStatus(result[0])
      }
    })
    .then(data => {
      __logger.info('getTemplateInfoByUserIdAndTemplateId data then 2', { data })
      finalResult[0].isTemplateValid = data.complete
      finalResult[0].invalidRemark = data.err && data.err.err ? data.err.err : null
      return checksForTemplate(finalResult[0])
    })
    .then(data => __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: finalResult }))
    .catch(err => {
      __logger.error('getTemplateInfoByUserIdAndTemplateId error in create get template info: ', err)
      if (err && err.type && err.type.code && err.type.code === __constants.RESPONSE_MESSAGES.ALL_STATUS_NOT_UPDATED.code) {
        err = { type: err.err[0], data: {} }
      }
      return __util.send(res, { type: err.type, err: err.err })
    })
}

module.exports = {
  getTemplateList,
  getTemplateInfo,
  getTemplateTypes,
  getTemplateHeaderTypes,
  getTemplateButtonTypes,
  getTemplateInfoByUserIdAndTemplateId,
  varMask
}
