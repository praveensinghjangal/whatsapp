const q = require('q')
const _ = require('lodash')
const __db = require('../db')
const __constants = require('../../config/constants')
const __logger = require('../logger')
const queryProvider = require('./queryProvider')
const rejectionHandler = require('../util/rejectionHandler')

class RedisService {
  constructor () {
    this.WabaService = require('../../app_modules/whatsapp_business/services/businesAccount')
  }

  getWabaDataByPhoneNumber (wabaNumber) {
    __logger.info('inside getWabaDataByPhoneNumber', wabaNumber)
    const dataFetched = q.defer()
    __db.redis.get(wabaNumber)
      .then(data => {
        // __logger.info('dataatatatatwaba ==> ', data, typeof data)
        if (data) {
          data = JSON.parse(data)
          return data
        } else {
          if (wabaNumber.includes('91')) {
            wabaNumber = wabaNumber.substring(2, wabaNumber.length)
          }
          if (wabaNumber.includes('+91')) {
            wabaNumber = wabaNumber.substring(3, wabaNumber.length)
          }
          return this.setDataInRedis(wabaNumber)
        }
      })
      .then(data => dataFetched.resolve(data))
      .catch(err => {
        __logger.error('get waba data by number error:', err)
        dataFetched.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return dataFetched.promise
  }

  setDataInRedis (wabaNumber) {
    __logger.info('set data in redis called:', wabaNumber)
    const dataUploaded = q.defer()
    const wabaService = new this.WabaService()
    let dataObj = {}
    wabaService.getWabaDataFromDb(wabaNumber)
      .then(data => {
        dataObj = data
        return __db.redis.setex(dataObj.id, JSON.stringify(dataObj), __constants.REDIS_TTL.wabaData)
      })
      .then(data => dataUploaded.resolve(dataObj))
      .catch(err => {
        __logger.info('Error in Ser Data in Redis ', err)
        dataUploaded.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return dataUploaded.promise
  }

  getTemplateDataByIdAndPhoneNumber (inputTemplateData) {
    const dataFetched = q.defer()
    __db.redis.get(inputTemplateData)
      .then(redisData => {
        if (redisData) {
          redisData = JSON.parse(redisData)
          return { redisData, firstAttemp: true }
        } else {
          return this.setTemplatesInRedisForWabaPhoneNumber(inputTemplateData.split('___')[1].substring(2))
        }
      })
      .then(data => {
        if (data && data.firstAttemp) {
          dataFetched.resolve(data.redisData)
        } else {
          const inputArr = inputTemplateData.split('___')
          const templateData = _.find(data, { templateId: inputArr[0], phoneNumber: inputArr[1] })
          // __logger.info('{{{{{{{{{{{{{{{{{{{{{{{{{{{{', inputArr, templateData)
          if (templateData) {
            dataFetched.resolve(templateData)
          } else {
            dataFetched.reject({ type: __constants.RESPONSE_MESSAGES.TEMPLATE_ID_NOT_EXISTS, err: {}, data: {} })
          }
        }
      })
      .catch(err => dataFetched.reject(err))

    return dataFetched.promise
  }

  setTemplatesInRedisForWabaPhoneNumber (wabaPhoneNumber) {
    __logger.info('inside setTemplatesInRedisForWabaPhoneNumber', { wabaPhoneNumber })
    const dataStored = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.setTemplatesInRedisForWabaPhoneNumber(), [wabaPhoneNumber])
      .then(result => {
        if (result && result.length === 0) {
          return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {} })
        } else {
          return result
        }
      })
      .then(dbData => {
        // todo : replace service with single template insert in redis to optimize
        __logger.info('db datata for redis set template ---->', { dbData })
        const resolveData = []
        _.each(dbData, singleObj => {
          const dataObject = {
            templateId: singleObj.message_template_id,
            headerParamCount: singleObj.header_text ? (singleObj.header_text.match(/{{\d}}/g) || []).length : 0,
            bodyParamCount: singleObj.body_text ? (singleObj.body_text.match(/{{\d}}/g) || []).length : 0,
            footerParamCount: singleObj.footer_text ? (singleObj.footer_text.match(/{{\d}}/g) || []).length : 0,
            phoneNumber: singleObj.phone_number
          }
          dataObject.approvedLanguages = []
          if (singleObj.first_localization_status === __constants.TEMPLATE_APPROVE_STATUS) dataObject.approvedLanguages.push(singleObj.first_language_code)
          if (singleObj.second_localization_status === __constants.TEMPLATE_APPROVE_STATUS) dataObject.approvedLanguages.push(singleObj.second_language_code)
          if (singleObj.header_type && singleObj.header_type !== 'text') dataObject.headerParamCount = dataObject.headerParamCount + 1
          resolveData.push(dataObject)
          __db.redis.setex(dataObject.templateId + '___' + dataObject.phoneNumber, JSON.stringify(dataObject), __constants.REDIS_TTL.templateData)
        })
        dataStored.resolve(resolveData)
      })
      .catch(err => {
        __logger.error('error in get setTemplatesInRedisForWabaPhoneNumber function: ', err)
        dataStored.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return dataStored.promise
  }
}

module.exports = RedisService
