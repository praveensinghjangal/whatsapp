const { RateLimiterRedis } = require('rate-limiter-flexible')
const __util = require('../lib/util')
const redisConnectionObject = require('../lib/db/redis_local').connection
const __constants = require('../config/constants')
const userConfgiMiddleware = require('./setUserConfig').setUserConfig
const __logger = require('../lib/logger')
const errorToTelegram = require('../lib/errorHandlingMechanism/sendToTelegram')

const rateLimit = (req, res, next) => {
  __logger.info('apiHitsAllowed: rateLimit():', req.userConfig)
  if (!req.userConfig) return next()
  const routeUrl = req.originalUrl.split('/')
  req.userConfig.routeUrl = routeUrl
  if (__constants.INTERNAL_CALL_USER_AGENTS.includes(req.headers['user-agent'])) return next()
  let consumekey = req.user.user_id
  if (req.userConfig.tps) {
    if (routeUrl[routeUrl.length - 1] === __constants.BULK) {
      req.userConfig.tps = 1
      consumekey += '_mb'
    } else if (routeUrl[routeUrl.length - 1] === __constants.SINGLE) {
      req.userConfig.tps = 500
      consumekey += '_ms'
    } else if (routeUrl[routeUrl.length - 1] === __constants.MESSAGES) {
      req.userConfig.tps = 0
      consumekey += '_mss'
    }
    this.noOfHitsAllowedConfig = new RateLimiterRedis({
      storeClient: redisConnectionObject,
      keyPrefix: 'TPS',
      points: req.userConfig.tps, // 10 requests
      duration: 1 // per sec
    })
    this.noOfHitsAllowedConfig.consume(consumekey)
      .then(rate => next())
      .catch(err => {
        __logger.error('apiHitsAllowed: rateLimit(): noOfHitsAllowedConfig.consume():', err, err.stack)
        errorToTelegram.send({}, `apiHitsAllowed: rateLimit(): ${req.user.wabaPhoneNumber}: limit: ${__constants.RESPONSE_MESSAGES.LIMIT_EXCEEDED.message}`)
        __util.send(res, { type: err.type || __constants.RESPONSE_MESSAGES.LIMIT_EXCEEDED, data: {}, err: err })
      })
  } else {
    __logger.error('apiHitsAllowed: rateLimit(): !req.userConfig.tps else condition', __constants.RESPONSE_MESSAGES.LIMIT_EXCEEDED.message)
    __util.send(res, { type: __constants.RESPONSE_MESSAGES.LIMIT_EXCEEDED, data: {}, err: {} })
  }
}

module.exports = [userConfgiMiddleware, rateLimit]
