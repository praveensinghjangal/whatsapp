const q = require('q')
const _ = require('lodash')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const __db = require('../../../lib/db')
const queryProvider = require('../queryProvider')
const rejectionHandler = require('../../../lib/util/rejectionHandler')

class TemplateParamValidationService {
  setAllTemplatesInRedis () {
    __logger.info('inside setAllTemplatesInRedis')
    const dataStored = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.setAllTemplatesInRedis(), [])
      .then(result => {
        if (result && result.affectedRows && result.affectedRows === 0) {
          return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {} })
        } else {
          return result
        }
      })
      .then(dbData => {
        _.each(dbData, singleObj => {
          const dataObject = {
            templateId: singleObj.message_template_id,
            headerParamCount: (singleObj.header_text.match(/{{\d}}/g) || []).length,
            bodyParamCount: (singleObj.body_text.match(/{{\d}}/g) || []).length,
            footerParamCount: (singleObj.footer_text.match(/{{\d}}/g) || []).length,
            phoneNumber: singleObj.phone_number
          }
          __db.redis.set(dataObject.templateId + '_' + dataObject.phoneNumber, JSON.stringify(dataObject))
        })
      })
      .catch(err => {
        __logger.error('error in setAllTemplatesInRedis function: ', err)
        dataStored.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return dataStored.promise
  }

  setTemplatesInRedisForWabaId (wabaId) {
    __logger.info('inside setTemplatesInRedisForWabaId')
    const dataStored = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.setTemplatesInRedisForWabaId(), [wabaId])
      .then(result => {
        if (result && result.affectedRows && result.affectedRows === 0) {
          return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {} })
        } else {
          return result
        }
      })
      .then(dbData => {
        _.each(dbData, singleObj => {
          const dataObject = {
            templateId: singleObj.message_template_id,
            headerParamCount: (singleObj.header_text.match(/{{\d}}/g) || []).length,
            bodyParamCount: (singleObj.body_text.match(/{{\d}}/g) || []).length,
            footerParamCount: (singleObj.footer_text.match(/{{\d}}/g) || []).length,
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
    const dataStored = q.defer()
    if (!templateObject) {
      dataStored.resolve(true)
      return dataStored.promise
    }
    __db.redis.get(templateObject.templateId + '_' + phoneNumber)
      .then(redisData => {
        if (redisData) {
          redisData = JSON.parse(redisData)
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
          return dataStored.resolve({ type: __constants.RESPONSE_MESSAGES.TEMPLATE_VALID, data: {} })
        } else {
          return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.TEMPLATE_ID_NOT_EXISTS, err: {}, data: {} })
        }
      })
      .catch(err => dataStored.reject(err))

    return dataStored.promise
  }
}

module.exports = TemplateParamValidationService
