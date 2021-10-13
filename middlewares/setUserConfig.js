const __db = require('../lib/db')
const q = require('q')
const UserService = require('../app_modules/user/services/dbData')
const rejectionHandler = require('../lib/util/rejectionHandler')
const __util = require('../lib/util')
const __constants = require('../config/constants')
const authorize = require('../app_modules/user/controllers/authorize').createAuthTokenByUserId
const __logger = require('../lib/logger')

const getAuthToken = userId => {
  const token = q.defer()
  authorize(userId)
    .then(data => token.resolve(data))
    .catch(err => {
      __logger.info(err)
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
      // __logger.info('data to be set ------->', userData)
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
const setUserConfig = (req, res, next) => {
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
      __logger.info('err', err)
      __util.send(res, { type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
    })
}

const setEndUserConfig = (req, res, next) => {
  const userId = req.body && req.body.userId ? req.body.userId : null
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
      req.endUserConfig = userConfig
      return next()
    })
    .catch(err => {
      __logger.info('err', err)
      __util.send(res, { type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
    })
}

const getUserData = userId => {
  const userData = q.defer()
  if (!userId) {
    userData.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: ['Please provide userId of type string'] })
    return userData.promise
  }
  getRedisDataStatus(userId)
    .then(redisData => {
      if (redisData.exists) return redisData.data
      return setDataInRedis(userId)
    })
    .then(userConfig => userData.resolve(userConfig))
    .catch(err => {
      __logger.info('err in get user config from db', err)
      userData.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
    })
  return userData.promise
}

module.exports = { setUserConfig, setEndUserConfig, getUserData }
