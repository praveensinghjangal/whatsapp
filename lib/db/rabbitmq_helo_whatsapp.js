var amqplib = require('amqplib')
var __config = require('../../config')
var __constants = require('../../config/constants')
var __logger = require('../../lib/logger')
var rabbitmqLib = require('./rabbitmq_lib')

class RabbitmqHeloWhatsapp extends rabbitmqLib {
  async init () {
    return new Promise((resolve, reject) => {
      var vm = this
      if (!__config.rabbitmq.init) {
        this.connection = null
       __logger.info('rabbitmqLib.init rabbitmq not initialized.')
        return resolve('rabbitmq not initialized')
      }
      if (__config.rabbitmq.init && __config.rabbitmq.use_auth) {
        __config.rabbitmq.amqp_url = 'amqp://' + __config.rabbitmq.user + ':' + __config.rabbitmq.pass + '@' + __config.rabbitmq.host + ':' + __config.rabbitmq.port + '/' + __config.rabbitmq.virtual_host + '?heartbeat=30'
      }
      amqplib.connect(__config.rabbitmq.amqp_url)
        .then(async (conn) => {
          vm.connection = conn
          vm.channel = {}
          conn.once('error', vm.handleError)
          const allQues = __constants.MQ
          if (allQues && Object.keys(allQues).length > 0) {
            for (const queueIndex in allQues) {
              const queue = allQues[queueIndex]
              switch (queue.type) {
                case 'queue':
                  if (queue.createChannel) {
                    await vm.createChannelsForQueue(queue)
                  }
                  break
                case 'exchange':
                  vm.createExchange(queue.q_name, queue.ex_type, queue.q_options)
                  if (queue.createChannel) {
                    await vm.createChannelsForQueue(queue)
                  }
                  break
                case 'bind':
                  if (queue.createBind) { await vm.createBind(queue.q_name, queue.ex_name, queue.r_key) }
                  break
              }
            }
            return true
          } else {
            throw new Error('queue or exchange not define.')
          }
        }, (err) => {
          throw new Error(err)
        }).then(() => {
        // connection success
          __logger.info('rabbitmqLib.init, connection success', { amqp_host: __config.rabbitmq.host })
          resolve('rabbitmq connection success')
        }, (err) => {
        // connection error
          __logger.error('rabbitmqLib.init, error in connection', { amqp_host: __config.rabbitmq.host, err: err.message })
          resolve('rabbitmq connection error')
          process.exit(1)
        })
    })
  }

  close () {
    return new Promise((resolve, reject) => {
      if (__config.rabbitmq.init) {
        __logger.warn('rabbitmqLib.close, function called', { amqp_host: __config.rabbitmq.host })
        try {
          this.connection.close()
        } catch (e) {
          __logger.error('rabbitmqLib.close, exception', { exception: e })
        } finally {
          resolve(null)
        }
      } else {
        resolve(null)
      }
    })
  }
}
module.exports = new RabbitmqHeloWhatsapp()
