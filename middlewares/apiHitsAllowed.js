const { RateLimiterRedis } = require('rate-limiter-flexible')
const __util = require('../lib/util')
const redisConnectionObject = require('../lib/db/redis_local').connection
const __constants = require('../config/constants')
const userConfgiMiddleware = require('./setUserConfig').setUserConfig
const __logger = require('../lib/logger')

const rateLimit = (req, res, next) => {
  __logger.info('Request>>>>>>>>>>>>>>>>>>>>>>>>..', req.userConfig)
  if (!req.userConfig) return next()
  let consumekey = req.user.user_id
  if (req.userConfig.tps) {
    const routeUrl = req.originalUrl.split('/')
    if (routeUrl[routeUrl.length - 1] === __constants.BULK) {
      req.userConfig.routeUrl = routeUrl
      req.userConfig.tps = 1
      consumekey += '_mb'
    } else if (routeUrl[routeUrl.length - 1] === __constants.SINGLE) {
      req.userConfig.routeUrl = routeUrl
      req.userConfig.tps = 500
      consumekey += '_ms'
    } else if (routeUrl[routeUrl.length - 1] === __constants.MESSAGES) {
      req.userConfig.routeUrl = routeUrl
      return next()
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
        console.log('error in ratelimitter ->>', __constants.RESPONSE_MESSAGES.LIMIT_EXCEEDED, err)
        __util.send(res, { type: err.type || __constants.RESPONSE_MESSAGES.LIMIT_EXCEEDED, data: {}, err: err })
      })
  } else {
    console.log('error in ratelimitter !req.userConfig.tps else condition ->>', __constants.RESPONSE_MESSAGES.LIMIT_EXCEEDED)
    __util.send(res, { type: __constants.RESPONSE_MESSAGES.LIMIT_EXCEEDED, data: {}, err: {} })
  }
}

module.exports = [userConfgiMiddleware, rateLimit]
