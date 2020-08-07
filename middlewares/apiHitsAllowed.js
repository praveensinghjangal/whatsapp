const { RateLimiterRedis } = require('rate-limiter-flexible')
const RedisService = require('../lib/redis_service/redisService')
const __util = require('../lib/util')
const __constants = require('../config/constants')
const userConfgiMiddleware = require('./setUserConfig')

const rateLimit = (req, res, next) => {
  // console.log('Request>>>>>>>>>>>>>>>>>>>>>>>>..', req.userConfig.tps)
  const redisService = new RedisService()
  this.noOfHitsAllowedConfig = new RateLimiterRedis({
    storeClient: redisService.getRedisConnectionObject(),
    keyPrefix: 'TPS',
    points: req.userConfig.tps, // 10 requests
    duration: 1 // per sec
  })
  this.noOfHitsAllowedConfig.consume(req.user.user_id)
    .then(rate => next())
    .catch(err => __util.send(res, { type: err.type || __constants.RESPONSE_MESSAGES.LIMIT_EXCEEDED, data: {}, err: err }))
}

module.exports = [userConfgiMiddleware, rateLimit]
