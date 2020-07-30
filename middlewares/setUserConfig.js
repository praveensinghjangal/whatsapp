const __db = require('../lib/db')
const q = require('q')
const UserService = require('../app_modules/user/services/dbData')
const rejectionHandler = require('../lib/util/rejectionHandler')
const __util = require('../lib/util')
const __constants = require('../config/constants')
const authorize = require('../app_modules/user/controllers/authorize').createAuthTokenByUserId

const getAuthToken = userId => {
  const token = q.defer()
  authorize(userId)
    .then(data => token.resolve(data))
    .catch(err => {
      console.log(err)
      token.resolve('')
    })
  return token.promise
}

const setDataInRedis = userId => {
  const dataSet = q.defer()
  let userData = {}
  const userService = new UserService()
  userService.checkUserIdExistsForAccountProfile(userId)
    .then(dbData => {
      if (dbData.exists) {
        userData = dbData.rows[0]
        return getAuthToken(userId)
      } else {
        return rejectionHandler('user does not exists')
      }
    })
    .then(token => {
      userData.authToken = token
      console.log('data to be set ------->', userData)
      return __db.redis.setex(userId, JSON.stringify(userData), __constants.REDIS_TTL.userConfig)
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
      __util.send(res, { type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
    })
}
