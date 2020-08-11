const { RateLimiterRedis } = require('rate-limiter-flexible')
const __util = require('../lib/util')
const redisConnectionObject = require('../lib/db/redis_local').connection
const __constants = require('../config/constants')
const userConfgiMiddleware = require('./setUserConfig')

const rateLimit = (req, res, next) => {
  // console.log('Request>>>>>>>>>>>>>>>>>>>>>>>>..', req.userConfig.tps)
  // console.log('Request>>>>>>>>>>>>>>>>>>>>>>>>..', redisConnectionObject)
  if (req.userConfig && req.userConfig.tps) {
    this.noOfHitsAllowedConfig = new RateLimiterRedis({
      storeClient: redisConnectionObject,
      keyPrefix: 'TPS',
      points: req.userConfig.tps, // 10 requests
      duration: 1 // per sec
    })
    this.noOfHitsAllowedConfig.consume(req.user.user_id)
      .then(rate => next())
      .catch(err => __util.send(res, { type: err.type || __constants.RESPONSE_MESSAGES.LIMIT_EXCEEDED, data: {}, err: err }))
  } else {
    __util.send(res, { type: __constants.RESPONSE_MESSAGES.LIMIT_EXCEEDED, data: {}, err: {} })
  }
}

module.exports = [userConfgiMiddleware, rateLimit]
