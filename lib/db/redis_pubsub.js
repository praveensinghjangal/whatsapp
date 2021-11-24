const redis = require('redis')
const __config = require('../../config')
const __constants = require('../../config/constants')
const __logger = require('../logger')
const redisLib = require('./redis_lib')

// const RedisExpiryServices = require('../../app_modules/message/services/redisExpiryServices')

class RedisLib extends redisLib {
  subscribeExpired (e, r) {
    try {
      const IntegrationService = require('../../app_modules/integration')
      const sub = redis.createClient(__config.redis_local)
      const expiredSubKey = '__keyevent@' + 0 + '__:expired'
      sub.subscribe(expiredSubKey, function () {
        sub.on('message', function (channel, eventData) {
          const tokenExpiry = __constants.FB_REDIS_TOKEN_EXPIRY
          const keyData = eventData.split(':')
          const authData = keyData[1] ? keyData[1].split('__') : []
          if (keyData[0] && keyData[0] === tokenExpiry && authData.length === 3) {
            console.log('pubsub', authData)
            const authService = new IntegrationService.Authentication(authData[1], authData[2])
            authService.setFaceBookTokensByWabaNumber(authData[0])
              .then((data) => {
                __logger.info('Facebook token by waba number', { data })
              }).catch(err => {
                console.log(err)
              })
          }
          return eventData
        })
      })
    } catch (e) {
      console.log('redisLib :: subscribeExpired function :: error', e)
      __logger.error('redisLib :: subscribeExpired function :: error', e)
    }
  }

  init () {
    return new Promise((resolve, reject) => {
      const vm = this
      if (!__config.redis_local.init) {
        this.connection = null
        __logger.debug('redisLib.init redis not initialized.')
        resolve('redis not initialized')
        return
      }
      __logger.debug('redisLib.init, initializing redis connection ', { port: __config.redis_local.port, host: __config.redis_local.host, uri: __config.redis_local.uri })
      const redisClient = redis.createClient(__config.redis_local)
      // (__config.redis_local.port, __config.redis_local.host, {});
      redisClient.on('error', (err) => {
        __logger.error('redisLib.init, error in redis connection ', { port: __config.redis_local.port, host: __config.redis_local.host, err: err })
        vm.connection = null
        if (vm.connection_status === false) { reject('redis error') } else { process.exit(1) }
      })
      redisClient.on('connect', () => {
        __logger.info('redisLib.init, success redis connection ', { port: __config.redis_local.port, host: __config.redis_local.host })
        vm.connection = redisClient
        vm.connection_status = true
        redisClient.send_command('config', ['set', 'notify-keyspace-events', 'Ex'], this.subscribeExpired)
        resolve('redis connected')
      })
    })
  }

  close () {
    return new Promise((resolve, reject) => {
      if (__config.redis_local.init) {
        __logger.warn('redisLib.close, function called', { port: __config.redis_local.port, host: __config.redis_local.host })
        this.connection.quit()
        this.connection_status = false
        resolve(null)
      } else {
        resolve(null)
      }
    })
  }
}
module.exports = new RedisLib()
