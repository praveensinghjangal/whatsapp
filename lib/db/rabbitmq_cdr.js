var amqplib = require('amqplib')
var Humanize = require('humanize-plus')
var __config = require('../../config')
var __constants = require('../../config/constants')
var __logger = require('../../lib/logger')
var rabbitmq_lib = require('./rabbitmq_lib')

class rabbitmq_cdr extends rabbitmq_lib {
  async init () {
    return new Promise((resolve, reject) => {
      var vm = this
            if (!__config.rabbitmq_cdr.init) {
        this.connection = null
               __logger.info('rabbitmqLib2.init rabbitmq not initialized.')
                return resolve('rabbitmq2 not initialized')
            }
      if (__config.rabbitmq_cdr.init && __config.rabbitmq_cdr.use_auth) {
        __config.rabbitmq_cdr.amqp_url = 'amqp://' + __config.rabbitmq_cdr.user + ':' + __config.rabbitmq_cdr.pass + '@' + __config.rabbitmq_cdr.host + ':' + __config.rabbitmq_cdr.port + '/' + __config.rabbitmq_cdr.virtual_host + '?heartbeat=30';
      }
      amqplib.connect(__config.rabbitmq_cdr.amqp_url).then(async (conn) => {
        vm.connection = conn
                vm.channel = {}
        conn.once('error', vm.handleError)
                const all_queues = __constants.MQ
                if (all_queues && Object.keys(all_queues).length > 0) {
          for (const queue_index in all_queues) {
            const queue = all_queues[queue_index]
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
                if (queue.createBind)
                  {await vm.createBind(queue.q_name, queue.ex_name, queue.r_key);}
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
        __logger.info('rabbitmqLib.init, connection success', { amqp_host: __config.rabbitmq_cdr.host })
                resolve('rabbitmq connection success')
            }, (err) => {
        // connection error
        __logger.error('rabbitmqLib.init, error in connection', { amqp_host: __config.rabbitmq_cdr.host, err: err.message })
                resolve('rabbitmq connection error')
                process.exit(1)
      })
        })
    }

  close () {
    return new Promise((resolve, reject) => {
      if (__config.rabbitmq_cdr.init) {
        __logger.warn('rabbitmqLib.close, function called', { amqp_host: __config.rabbitmq_cdr.host })
                try {
          this.connection.close()
                    // for (var q_name in this.channel) {
                    //     // this.channel[q_name].close();
                    // }
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
module.exports = new rabbitmq_cdr()
