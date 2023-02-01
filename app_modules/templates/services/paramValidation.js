const q = require('q')
const _ = require('lodash')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const __db = require('../../../lib/db')
const queryProvider = require('../queryProvider')
const rejectionHandler = require('../../../lib/util/rejectionHandler')

class TemplateParamValidationService {
  // not used
  setAllTemplatesInRedis () {
    __logger.info('inside setAllTemplatesInRedis')
    const dataStored = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.setAllTemplatesInRedis(), [])
      .then(result => {
        __logger.info('result then 1', { result })
        if (result && result.length === 0) {
          return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {} })
        } else {
          return result
        }
      })
      .then(dbData => {
        __logger.info('dbData then 2', { dbData })
        _.each(dbData, singleObj => {
          const dataObject = {
            templateId: singleObj.message_template_id,
            headerParamCount: singleObj.header_text ? (singleObj.header_text.match(/{{\d{1,2}}}/g) || []).length : 0,
            bodyParamCount: singleObj.body_text ? (singleObj.body_text.match(/{{\d{1,2}}}/g) || []).length : 0,
            footerParamCount: singleObj.footer_text ? (singleObj.footer_text.match(/{{\d{1,2}}}/g) || []).length : 0,
            phoneNumber: singleObj.phone_number
          }
          if (singleObj.header_type && singleObj.header_type !== 'text') dataObject.headerParamCount = dataObject.headerParamCount + 1
          __db.redis.set(dataObject.templateId + '_' + dataObject.phoneNumber, JSON.stringify(dataObject))
        })
      })
      .catch(err => {
        __logger.error('error in setAllTemplatesInRedis function: ', err)
        dataStored.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return dataStored.promise
  }

  // not used
  setTemplatesInRedisForWabaId (wabaId) {
    __logger.info('inside setTemplatesInRedisForWabaId')
    const dataStored = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.setTemplatesInRedisForWabaId(), [wabaId])
      .then(result => {
        __logger.info('result then 1', { result })
        if (result && result.length === 0) {
          return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {} })
        } else {
          return result
        }
      })
      .then(dbData => {
        __logger.info('result then 2', { dbData })
        _.each(dbData, singleObj => {
          const dataObject = {
            templateId: singleObj.message_template_id,
            headerParamCount: singleObj.header_text ? (singleObj.header_text.match(/{{\d{1,2}}}/g) || []).length : 0,
            bodyParamCount: singleObj.body_text ? (singleObj.body_text.match(/{{\d{1,2}}}/g) || []).length : 0,
            footerParamCount: singleObj.footer_text ? (singleObj.footer_text.match(/{{\d{1,2}}}/g) || []).length : 0,
            phoneNumber: singleObj.phone_number
          }
          if (singleObj.header_type && singleObj.header_type !== 'text') dataObject.headerParamCount = dataObject.headerParamCount + 1
          __db.redis.set(dataObject.templateId + '_' + dataObject.phoneNumber, JSON.stringify(dataObject))
        })
      })
      .catch(err => {
        __logger.error('error in get setTemplatesInRedisForWabaId function: ', err)
        dataStored.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return dataStored.promise
  }

  checkIfParamsEqual (templateObject, phoneNumber, redisData) {
    const dataStored = q.defer()
    if (!templateObject) {
      dataStored.resolve(true)
      return dataStored.promise
    }

    if (redisData[templateObject.templateId]) {
      let headerOccurenceCount = 0
      let bodyOccurenceCount = 0
      let footerOccurenceCount = 0
      let payloadButtonOccurenceCount = 0
      let urlButtonOccurenceCount = 0
      let headerParamCount = 0
      let bodyParamCount = 0
      let footerParamCount = 0
      let singlePayloadButtonParamCount = 0
      let singleUrlButtonParamCount = 0
      _.each(templateObject.components, compObj => {
        if (compObj.type.toLowerCase() === 'header') {
          headerOccurenceCount++
          if (compObj.parameters) {
            headerParamCount = compObj.parameters.length
          }
        }
        if (compObj.type.toLowerCase() === 'body') {
          bodyOccurenceCount++
          if (compObj.parameters) {
            bodyParamCount = compObj.parameters.length
          }
        }
        if (compObj.type.toLowerCase() === 'footer') {
          footerOccurenceCount++
          if (compObj.parameters) {
            footerParamCount = compObj.parameters.length
          }
        }
        if (compObj.type.toLowerCase() === 'button') {
          if (compObj.parameters && compObj.parameters[0].type && compObj.parameters[0].type === 'payload') {
            payloadButtonOccurenceCount++
            singlePayloadButtonParamCount = compObj.parameters.length
          }
        }
        if (compObj.type.toLowerCase() === 'button') {
          if (compObj.parameters && compObj.parameters[0].type && compObj.parameters[0].type === 'text') {
            urlButtonOccurenceCount++
            singleUrlButtonParamCount = compObj.parameters.length
          }
        }

        if (singlePayloadButtonParamCount > 1) {
          dataStored.reject({ type: __constants.RESPONSE_MESSAGES.BUTTON_PARAM_MISMATCH, err: {}, data: {} })
        }
        if (singleUrlButtonParamCount > 1) {
          dataStored.reject({ type: __constants.RESPONSE_MESSAGES.BUTTON_URL_PARAM_MISMATCH, err: {}, data: {} })
        }
      })
      if (headerOccurenceCount > 1 || bodyOccurenceCount > 1 || footerOccurenceCount > 1) {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.COMPONENTS_COUNT_MISMATCH, err: {}, data: {} })
      }
      if (headerParamCount !== redisData[templateObject.templateId].headerParamCount) {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.HEADER_PARAM_MISMATCH, err: {}, data: {} })
      }
      if (bodyParamCount !== redisData[templateObject.templateId].bodyParamCount) {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.BODY_PARAM_MISMATCH, err: {}, data: {} })
      }
      if (footerParamCount !== redisData[templateObject.templateId].footerParamCount) {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.FOOTER_PARAM_MISMATCH, err: {}, data: {} })
      }
      if (payloadButtonOccurenceCount > redisData[templateObject.templateId].payloadButtonCount) {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.BUTTON_PARAM_MISMATCH, err: {}, data: {} })
      }
      if (urlButtonOccurenceCount > redisData[templateObject.templateId].urlButtonCount) {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.BUTTON_URL_PARAM_MISMATCH, err: {}, data: {} })
      }
      if (!redisData[templateObject.templateId].approvedLanguages.some(lang => lang.toLowerCase() === templateObject.language.code.toLowerCase())) {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.LANGUAGE_NOT_APPROVED, err: {}, data: {} })
      }
      dataStored.resolve({ type: __constants.RESPONSE_MESSAGES.TEMPLATE_VALID, data: {} })
    } else {
      const returnObj = JSON.parse(JSON.stringify(__constants.RESPONSE_MESSAGES.TEMPLATE_NOT_FOUND))
      returnObj.message = returnObj.message + ' - ' + templateObject.templateId
      return rejectionHandler({ type: returnObj, err: {} })
    }
    return dataStored.promise
  }
}

module.exports = TemplateParamValidationService
