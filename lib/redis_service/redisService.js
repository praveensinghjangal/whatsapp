const q = require('q')
const __db = require('../db')
const __constants = require('../../config/constants')
const __logger = require('../logger')
const queryProvider = require('./queryProvider')
const rejectionHandler = require('../util/rejectionHandler')
const _ = require('lodash')

class DbDataService {
  getWabaDataFromDb (wabaNumber) {
    const dbData = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getWabaData(), [wabaNumber])
      .then(result => {
        // console.log('resulttttttttttttttttttttttttttt', result[0], wabaNumber)
        if (result && result.length === 0) {
          dbData.reject({ type: __constants.RESPONSE_MESSAGES.WABA_PHONE_NUM_NOT_EXISTS, err: {} })
        } else {
          dbData.resolve(result[0])
        }
      })
      .catch(err => {
        __logger.error('error in get getDataFromDb: ', err)
        dbData.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return dbData.promise
  }

  setWabaDataInRedis (dataObject) {
    // console.log('datat to set', dataObject)
    const dataSaved = q.defer()
    __db.redis.setex(dataObject.id, JSON.stringify(dataObject), __constants.REDIS_TTL.wabaData)
      .then(data => dataSaved.resolve(dataObject))
      .catch(err => dataSaved.reject(err))
    return dataSaved.promise
  }
}

class RedisService {
  getWabaDataByPhoneNumber (wabaNumber) {
    __logger.info('inside getWabaDataByPhoneNumber', wabaNumber)
    const dataFetched = q.defer()
    __db.redis.get(wabaNumber)
      .then(data => {
        // console.log('dataatatatat', data, typeof data)
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
      .catch(err => dataFetched.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err }))
    return dataFetched.promise
  }

  setDataInRedis (wabaNumber) {
    __logger.info('set data in redis called:', wabaNumber)
    const dataUploaded = q.defer()
    const dbDataService = new DbDataService()
    dbDataService.getWabaDataFromDb(wabaNumber)
      .then(data => dbDataService.setWabaDataInRedis(data))
      .then(data => dataUploaded.resolve(data))
      .catch(err => dataUploaded.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err }))
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
          return this.setTemplatesInRedisForWabaPhoneNumber(inputTemplateData.split('_')[1].substring(2))
        }
      })
      .then(data => {
        if (data && data.firstAttemp) {
          dataFetched.resolve(data.redisData)
        } else {
          const inputArr = inputTemplateData.split('_')
          const templateData = _.find(data, { templateId: inputArr[0], phoneNumber: inputArr[1] })
          // console.log('{{{{{{{{{{{{{{{{{{{{{{{{{{{{', inputArr, templateData)
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
    __logger.info('inside setTemplatesInRedisForWabaPhoneNumber')
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
        const resolveData = []
        _.each(dbData, singleObj => {
          const dataObject = {
            templateId: singleObj.message_template_id,
            headerParamCount: singleObj.header_text ? (singleObj.header_text.match(/{{\d}}/g) || []).length : 0,
            bodyParamCount: singleObj.body_text ? (singleObj.body_text.match(/{{\d}}/g) || []).length : 0,
            footerParamCount: singleObj.footer_text ? (singleObj.footer_text.match(/{{\d}}/g) || []).length : 0,
            phoneNumber: singleObj.phone_number
          }
          resolveData.push(dataObject)
          __db.redis.setex(dataObject.templateId + '_' + dataObject.phoneNumber, JSON.stringify(dataObject), __constants.REDIS_TTL.templateData)
        })
        dataStored.resolve(resolveData)
      })
      .catch(err => {
        __logger.error('error in get setTemplatesInRedisForWabaPhoneNumber function: ', err)
        dataStored.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return dataStored.promise
  }

  getRedisConnectionObject () {
    return __db.redis.connection
  }
}

module.exports = RedisService
