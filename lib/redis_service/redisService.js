const q = require('q')
const __db = require('../db')
const __constants = require('../../config/constants')
const __logger = require('../logger')
const queryProvider = require('./queryProvider')

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
          dataFetched.resolve(redisData)
        } else {
          dataFetched.reject({ type: __constants.RESPONSE_MESSAGES.TEMPLATE_ID_NOT_EXISTS, err: {}, data: {} })
        }
      })
      .catch(err => dataFetched.reject(err))

    return dataFetched.promise
  }
}

module.exports = RedisService