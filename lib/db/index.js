const config = require('../../config')
const __logger = require('../../lib/logger')

class Databases {
  constructor () {
    __logger.info('databases constructor called.')
    this.redis = require('./redis_local.js')
    // if (process.env.rmq_queue === 'cdr') {
    //   this.redis_remote_1 = require('./redis_remote_1.js')
    //   this.redis_remote_2 = require('./redis_remote_2.js')
    //   this.rabbitmq_cdr = require('./rabbitmq_cdr.js')
    // }
    // this.mongo = require('./mongo.js')
    this.mysql = require('./mysql.js')
    this.rabbitmqHeloWhatsapp = require('./rabbitmq_helo_whatsapp.js')
    // this.postgresql = require('./postgresql.js')
  }

  async init () {
    await this.redis.init()
    // if (process.env.rmq_queue === 'cdr') {
    //   await this.redis_remote_1.init()
    //   await this.redis_remote_2.init()
    //   await this.rabbitmq_cdr.init()
    // }
    // await this.mongo.init()
    // await this.postgresql.init()
    await this.mysql.init(config.helo_whatsapp_mysql.name)
    // await this.mysql.init(config.mysql_user_db && config.mysql_user_db.name);
    // await this.mysql.init(config.mysql_user_local_db && config.mysql_user_local_db.name)
    // await this.mysql.init(config.mysql_call_db && config.mysql_call_db.name);
    await this.rabbitmqHeloWhatsapp.init()
    return 'connections open.'
  }

  async close () {
    await this.redis.close()
    // if (process.env.rmq_queue === 'cdr') {
    //   await this.redis_remote_1.close()
    //   await this.redis_remote_2.close()
    // }
    // await this.mongo.close()
    // await this.postgresql.close()
    await this.mysql.close(config.helo_whatsapp_mysql.name)
    // await this.mysql.close(config.mysql_call_db && config.mysql_call_db.name);
    await this.rabbitmqHeloWhatsapp.close()
    return 'connection closed.'
  }
}

module.exports = new Databases()
