const q = require('q')
const _ = require('lodash')
const __db = require('../db')
const __constants = require('../../config/constants')
const __logger = require('../logger')
const queryProvider = require('./queryProvider')
const rejectionHandler = require('../util/rejectionHandler')
const { getTemplateIdData } = require('../../app_modules/front_end/controllers/optinAndTemplate')

class RedisService {
  constructor() {
    this.WabaService = require('../../app_modules/whatsapp_business/services/businesAccount')
  }

  getWabaDataByPhoneNumber(wabaNumber) {
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

  setDataInRedis(wabaNumber) {
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

  getTemplateDataByIdAndPhoneNumber(inputTemplateData) {
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

  setTemplatesInRedisForWabaPhoneNumber(wabaPhoneNumber) {
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

  setFacebookAuthKeysInRedis(tokenData, wabaNumber, serviceProviderId, userId) {
    const dataInRedis = q.defer()
    const token = __constants.FB_REDIS_KEY_FOLDER
    const tokenExpiry = __constants.FB_REDIS_TOKEN_EXPIRY_KEY

    __db.redis.setex(`${token}${wabaNumber}`, JSON.stringify(tokenData), Math.ceil(tokenData.timeLeftToExpire / 1000)) // divide by 1000 to convert ms to second
      .then(data => __db.redis.setex(`${tokenExpiry}${wabaNumber}__${serviceProviderId}__${userId}`, '1', Math.ceil((tokenData.timeLeftToExpire - __constants.FB_REDIS_KEY_BUFFER_TIME + 1000) / 1000))) // adding 1 second so that when this key expires the calling func in fb integration layer always gets condition of < buffer as true)
      .then(data => dataInRedis.resolve(tokenData))
      .catch(err => {
        console.log(err)
        return dataInRedis.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return dataInRedis.promise
  }

  getFacebookAuthKeys(wabaNumber) {
    __logger.info('inside getFacebookAuthKeys', wabaNumber)
    const dataFetched = q.defer()
    const token = __constants.FB_REDIS_KEY_FOLDER
    __db.redis.get(`${token}${wabaNumber}`)
      .then(data => {
        // __logger.info('dataatatatatwaba ==> ', data, typeof data)
        if (data) {
          return JSON.parse(data)
        } else {
          return false
        }
      })
      .then(data => dataFetched.resolve(data))
      .catch(err => {
        __logger.error('getFacebookAuthKeys redis error:', err)
        dataFetched.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return dataFetched.promise
  }

  getOptinTemplateFromRedis(redisKey) {
    const statusMappingData = q.defer()
    __db.redis.get(redisKey)
      .then(data => {
        if (data) {
          statusMappingData.resolve({ exists: true, data: JSON.parse(data) })
        } else {
          statusMappingData.resolve({ exists: false, data: {} })
        }
      })
      .catch(err => statusMappingData.reject(err))
    return statusMappingData.promise
  }

  setOptinTemplateInRedis(redisKey, authToken) {
    const dataSet = q.defer()
    let statusData = {}
    // api call to get the template from chat module.
    getTemplateIdData(authToken)
      .then(metaData => {
        statusData = metaData.data
        return __db.redis.setex(redisKey, JSON.stringify(metaData.data), __constants.REDIS_TTL.templateData)
      })
      .then(result => dataSet.resolve(statusData))
      .catch(err => dataSet.reject(err))
    return dataSet.promise
  }

  getOptinTemplateId(wabaPhoneNumber, authToken) {
    const platformStatus = q.defer()
    __logger.info('Inside function to get platform Status', { wabaPhoneNumber })
    this.getOptinTemplateFromRedis('optin_template' + '_' + wabaPhoneNumber)
      .then(redisData => {
        if (redisData.exists) {
          return redisData.data
        } else {
          return this.setOptinTemplateInRedis('optin_template' + '_' + wabaPhoneNumber, authToken)
        }
      })
      .then(redisData => platformStatus.resolve(redisData))
      .catch(err => {
        __logger.error('error: ', err)
        platformStatus.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return platformStatus.promise
  }


}

module.exports = RedisService
