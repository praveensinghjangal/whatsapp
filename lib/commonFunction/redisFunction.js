const __db = require('../db')
const q = require('q')
const UserService = require('../../app_modules/masterData/facebook//services/dbData')
const rejectionHandler = require('../../lib/util/rejectionHandler')
const __util = require('../../lib/util')
const __constants = require('../../config/constants')
// const UserService = require('../../app_modules/masterData/facebook/services/dbData')
// const authorize = require('../app_modules/user/controllers/authorize').createAuthTokenByUserId
// const __logger = require('../lib/logger')

//get data from redis by masterId
const getMasterRedisDataStatusById = (masterId) => {
  const dataExists = q.defer()
  const userService = new UserService()
  __db.redis.get(__constants.MASTERDATA + masterId)
    .then(data => {
      if (data) {
        return data
      } else {
        return userService.getMasterData(masterId)
      }
    })
    .then(data => {
      return dataExists.resolve({ exists: true, data: JSON.parse(data) })
    })
    .catch(err => {
      dataExists.reject(err)
    })
  return dataExists.promise
}


//delete data from redis with the help of masterId

const deleteMasterDataInRedis = (masterId) => {
  const masterDataDeleted = q.defer()
  __db.redis.key_delete(masterId)
    .then(data => {
      if (data) {
        masterDataDeleted.resolve({ exists: true })
      } else {
        masterDataDeleted.resolve({ exists: false })
      }
    })
    .catch(err => masterDataDeleted.reject(err))
  return masterDataDeleted.promise
}



module.exports = { getMasterRedisDataStatusById, deleteMasterDataInRedis }
