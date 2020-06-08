const q = require('q')
const __db = require('../db')
const __constants = require('../../config/constants')
const __logger = require('../logger')
const queryProvider = require('./queryProvider')

class DbDataService {
  getDataFromDb (tableName, columnArr) {
    const dbData = q.defer()
    __db.postgresql.__query(queryProvider.getMasterData(tableName, columnArr), [])
      .then(result => {
        if (result && result.rows && result.rows.length === 0) {
          dbData.reject({ type: __constants.RESPONSE_MESSAGES.MASTER_NOT_EXISTS, err: {} })
        } else {
          dbData.resolve(result.rows)
        }
      })
      .catch(err => {
        __logger.error('error in get getDataFromDb: ', err)
        dbData.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return dbData.promise
  }

  saveSingleDatainredis (dataObject) {
    const dataSaved = q.defer()
    __db.redis.set(dataObject.id, JSON.stringify(dataObject))
      .then(data => dataSaved.resolve(data))
      .catch(err => dataSaved.reject(err))
    return dataSaved.promise
  }

  saveDatainRedis (dataArr) {
    let p = q()
    const thePromises = []
    dataArr.forEach(singleObject => {
      p = p.then(() => {
        return this.saveSingleDatainredis(singleObject)
      })
        .catch(err => err)
      thePromises.push(p)
    })
    return q.all(thePromises)
  }
}

class RedisMaster {
  setDataInRedis (tableName, columnArr) {
    __logger.info('set data in redis called:', tableName, columnArr)
    const dataUploaded = q.defer()
    const dbDataService = new DbDataService()
    dbDataService.getDataFromDb(tableName, columnArr)
      .then(data => dbDataService.saveDatainRedis(data))
      .then(data => dataUploaded.resolve({ type: __constants.RESPONSE_MESSAGES.SUCCESS, data: {} }))
      .catch(err => dataUploaded.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err }))
    return dataUploaded.promise
  }
}
module.exports = RedisMaster
