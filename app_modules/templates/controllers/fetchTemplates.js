const __logger = require('../../../lib/logger')
const __constants = require('../../../config/constants')
const __util = require('../../../lib/util')
const __db = require('../../../lib/db')
const rejectionHandler = require('../../../lib/util/rejectionHandler')
const q = require('q')
const queryProvider = require('../queryProvider')
const StatusService = require('../services/status')

// Services
const ValidatonService = require('../services/validation')

const compareAndUpdateStatus = (templateId, providerId, wabaPhoneNumber, userId) => {
  const statusUpdated = q.defer()
  const statusService = new StatusService()
  statusService.compareAndUpdateStatus([templateId], providerId, wabaPhoneNumber, userId)
    .then(data => statusUpdated.resolve(data))
    .catch(err => statusUpdated.resolve(err))
  return statusUpdated.promise
}

const getTemplateList = (req, res) => {
  __logger.info('Get Templates List API Called', req.query)
  const { messageTemplateStatusId } = req.query
  const params = [req.user.user_id]

  if (messageTemplateStatusId) {
    params.push(messageTemplateStatusId)
  }

  __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getTemplateList(messageTemplateStatusId), params)
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
  // __logger.info('Get Templates Info API Called', req.user.user_id)
  const validate = new ValidatonService()
  let finalResult
  compareAndUpdateStatus(req.params.templateId, req.user.providerId, req.user.wabaPhoneNumber, req.user.user_id)
    .then(statusUpdated => __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getTemplateInfo(), [req.user.user_id, req.params.templateId]))
    .then(result => {
      __logger.info('then 1', { result })
      if (result && result.length === 0) {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {}, data: {} })
      } else {
        result[0].secondLanguageRequired = result[0].secondLanguageRequired === 1
        finalResult = result
        return validate.checkTemplateInfoStatus(result[0])
      }
    })
    .then(data => {
      __logger.info('data then 2', { data })
      finalResult[0].mediaTemplateComplete = data.complete
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

module.exports = {
  getTemplateList,
  getTemplateInfo,
  getTemplateTypes,
  getTemplateHeaderTypes,
  getTemplateButtonTypes
}
