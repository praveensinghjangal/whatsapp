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
    __db.postgresql.__query(queryProvider.setAllTemplatesInRedis(), [])
      .then(result => {
        if (result && result.rows && result.rows.length === 0) {
          return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {} })
        } else {
          return result.rows
        }
      })
      .then(dbData => {
        _.each(dbData, singleObj => {
          const dataObject = {
            templateId: singleObj.message_template_id,
            headerParamCount: (singleObj.header_text.match(/{{\d}}/g) || []).length,
            bodyParamCount: (singleObj.body_text.match(/{{\d}}/g) || []).length,
            footerParamCount: (singleObj.footer_text.match(/{{\d}}/g) || []).length
          }
          __db.redis.set(dataObject.templateId, JSON.stringify(dataObject))
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
    __db.postgresql.__query(queryProvider.setTemplatesInRedisForWabaId(), [wabaId])
      .then(result => {
        if (result && result.rows && result.rows.length === 0) {
          return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {} })
        } else {
          return result.rows
        }
      })
      .then(dbData => {
        _.each(dbData, singleObj => {
          const dataObject = {
            templateId: singleObj.message_template_id,
            headerParamCount: (singleObj.header_text.match(/{{\d}}/g) || []).length,
            bodyParamCount: (singleObj.body_text.match(/{{\d}}/g) || []).length,
            footerParamCount: (singleObj.footer_text.match(/{{\d}}/g) || []).length
          }
          __db.redis.set(dataObject.templateId, JSON.stringify(dataObject))
        })
      })
      .catch(err => {
        __logger.error('error in get setTemplatesInRedisForWabaId function: ', err)
        dataStored.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return dataStored.promise
  }
}

module.exports = TemplateParamValidationService
