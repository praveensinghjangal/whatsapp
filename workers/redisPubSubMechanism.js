const __logger = require('../lib/logger')

class redisPubSubMechanismWorker {
  constructor () {
    this.app = {}
    this.redis = require('./../lib/db/redis_pubsub.js')
    this.db = require('../lib/db')
    // this.mongo = require('./../lib/db/mongo.js')
  }

  async startServer () {
    await this.redis.init()
      .then((result) => {
        __logger.info(result)
      })
      .catch((error) => {
        __logger.error('redisPubsubMechanism: main catch:' + error)
        process.exit(1)
      })

    await this.db.init()
      .then((result) => {
        __logger.info(result)
      }).catch((error) => {
        __logger.error('redisPubsubMechanism: db.init: catch:' + error)
        process.exit(1)
      })
  }
}

class Worker extends redisPubSubMechanismWorker {
  start () {
    __logger.info('redisPubsubMechanism:' + (new Date()).toLocaleString() + '   >> Worker PID:', process.pid)
    // call initialization function of extended worker class
    super.startServer()
  }
}

module.exports.worker = new Worker()
