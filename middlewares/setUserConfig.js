const __db = require('../lib/db')
const q = require('q')
const UserService = require('../app_modules/user/services/dbData')
const rejectionHandler = require('../lib/util/rejectionHandler')
const __util = require('../lib/util')
const __define = require('../config/define')

const setDataInRedis = userId => {
  const dataSet = q.defer()
  let userData = {}
  const userService = new UserService()
  userService.checkUserIdExistsForAccountProfile(userId)
    .then(dbData => {
      if (dbData.exists) {
        userData = dbData.rows[0]
        return __db.redis.setex(userId, JSON.stringify(userData), __define.USER_CONFIG_REDIS_TTL)
      } else {
        return rejectionHandler('user does not exists')
      }
    })
    .then(result => dataSet.resolve(userData))
    .catch(err => dataSet.reject(err))
  return dataSet.promise
}

const getRedisDataStatus = userId => {
  const dataExists = q.defer()
  __db.redis.get(userId)
    .then(data => {
      if (data) {
        dataExists.resolve({ exists: true, data: JSON.parse(data) })
      } else {
        dataExists.resolve({ exists: false, data: {} })
      }
    })
    .catch(err => dataExists.reject(err))
  return dataExists.promise
}

module.exports = (req, res, next) => {
  const userId = req.user && req.user.user_id ? req.user.user_id : null
  if (!userId) return next()
  getRedisDataStatus(userId)
    .then(redisData => {
      if (redisData.exists) {
        return redisData.data
      } else {
        return setDataInRedis(userId)
      }
    })
    .then(userConfig => {
      req.userConfig = userConfig
      return next()
    })
    .catch(err => {
      console.log('err', err)
      __util.send(res, { type: __define.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
    })
}
