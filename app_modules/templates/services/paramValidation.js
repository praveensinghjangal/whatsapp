const q = require('q')
const _ = require('lodash')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const __db = require('../../../lib/db')
const queryProvider = require('../queryProvider')
const rejectionHandler = require('../../../lib/util/rejectionHandler')
const RedisService = require('../../../lib/redis_service/redisService')

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
            headerParamCount: singleObj.header_text ? (singleObj.header_text.match(/{{\d}}/g) || []).length : 0,
            bodyParamCount: singleObj.body_text ? (singleObj.body_text.match(/{{\d}}/g) || []).length : 0,
            footerParamCount: singleObj.footer_text ? (singleObj.footer_text.match(/{{\d}}/g) || []).length : 0,
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
            headerParamCount: singleObj.header_text ? (singleObj.header_text.match(/{{\d}}/g) || []).length : 0,
            bodyParamCount: singleObj.body_text ? (singleObj.body_text.match(/{{\d}}/g) || []).length : 0,
            footerParamCount: singleObj.footer_text ? (singleObj.footer_text.match(/{{\d}}/g) || []).length : 0,
            phoneNumber: singleObj.phone_number
          }
          __db.redis.set(dataObject.templateId + '_' + dataObject.phoneNumber, JSON.stringify(dataObject))
        })
      })
      .catch(err => {
        __logger.error('error in get setTemplatesInRedisForWabaId function: ', err)
        dataStored.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return dataStored.promise
  }

  checkIfParamsEqual (templateObject, phoneNumber) {
    __logger.info('inside checkIfParamsEqual')
    const dataStored = q.defer()
    if (!templateObject) {
      dataStored.resolve(true)
      return dataStored.promise
    }
    const redisService = new RedisService()
    redisService.getTemplateDataByIdAndPhoneNumber(templateObject.templateId + '___' + phoneNumber)
      .then(redisData => {
        let headerOccurenceCount = 0
        let bodyOccurenceCount = 0
        let footerOccurenceCount = 0
        let headerParamCount = 0
        let bodyParamCount = 0
        let footerParamCount = 0
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
        })
        if (headerOccurenceCount > 1 || bodyOccurenceCount > 1 || footerOccurenceCount > 1) {
          return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.COMPONENTS_COUNT_MISMATCH, err: {}, data: {} })
        }
        if (headerParamCount !== redisData.headerParamCount) {
          return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.HEADER_PARAM_MISMATCH, err: {}, data: {} })
        }
        if (bodyParamCount !== redisData.bodyParamCount) {
          return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.BODY_PARAM_MISMATCH, err: {}, data: {} })
        }
        if (footerParamCount !== redisData.footerParamCount) {
          return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.FOOTER_PARAM_MISMATCH, err: {}, data: {} })
        }
        if (!redisData.approvedLanguages.some(lang => lang.toLowerCase() === templateObject.language.code.toLowerCase())) {
          return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.LANGUAGE_NOT_APPROVED, err: {}, data: {} })
        }
        return dataStored.resolve({ type: __constants.RESPONSE_MESSAGES.TEMPLATE_VALID, data: {} })
      })
      .catch(err => dataStored.reject(err))

    return dataStored.promise
  }
}

module.exports = TemplateParamValidationService
