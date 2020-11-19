var amqplib = require('amqplib')
var Humanize = require('humanize-plus')

var __config = require('../../config')
var __constants = require('../../config/constants')
var __logger = require('../../lib/logger')

class rabbitmqLib {
  constructor () {
    __logger.debug('rabbitmqLib.constructor called.')
    this.connection = null
    this.channel = false
  }

  async init () {
    return new Promise((resolve, reject) => {
      var vm = this
      if (!__config.rabbitmq.init) {
        this.connection = null
        __logger.debug('rabbitmqLib.init rabbitmq not initialized.')
        return resolve('rabbitmq not initialized')
      }
      amqplib.connect(__config.rabbitmq.amqp_url).then(async (conn) => {
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

  handleError (err) {
    __logger.error('rabbitmqLib.handleError, error in connection', { amqp_url: __config.rabbitmq.amqp_url, err: err })
    this.connection = null
    process.exit(1)
    // var reconnect = setInterval(function () {
    //     if (this.connection) {
    //         clearInterval(reconnect);
    //     } else {
    //         this.connection.init();
    //         __logger.warn('rabbitmqLib.handleError, reconnecting', { amqp_url: __config.rabbitmq.amqp_url });
    //     }
    // }, __config.rabbitmq.reconnect_interval);
  };

  createExchange (exchange_name, exchange_type, options) {
    if (this.connection) {
      this.connection.createChannel().then((ch) => {
        __logger.debug('rabbitmqLib.createExchange, declaring a exchange', { exchange_name: exchange_name })
        ch.on('error', (err) => {
          __logger.error('channel Closed', err)
        })
        var ok = ch.assertExchange(exchange_name, exchange_type, options)
        return ok.then((_qok) => {
          __logger.info('rabbitmqLib.createExchange, exchangeDeclared', { exchange_name: exchange_name })
          ch.close()
          // this.connection.close();
        })
      }, (err) => {
        return new Error(err)
      })
    } else {
      __logger.error('rabbitmqLib.createExchange, no connection found', { q_name: q_name, exchange_name: exchange_name })
      return new Error('no connection found')
    }
  }

  createBind (q_name, exchange_name, routing_key) {
    if (this.connection) {
      this.connection.createChannel().then((ch) => {
        __logger.debug('rabbitmqLib.createBind, declaring a bind', { q_name: q_name, exchange_name: exchange_name })
        var ok = ch.bindQueue(q_name, exchange_name, routing_key)
        return ok.then((_qok) => {
          __logger.info('rabbitmqLib.createBind, success', { q_name: q_name, exchange_name: exchange_name })
          ch.close()
          // this.connection.close();
        })
      }, (err) => {
        return new Error(err)
      })
    } else {
      __logger.error('rabbitmqLib.createBind, no connection found', { q_name: q_name, exchange_name: exchange_name })
      return new Error('no connection found')
    }
  }

  async createChannelsForQueue (queue) {
    var vm = this
    // vm.channel = {}
    if (vm.connection) {
      if (!vm.channel[queue.q_name]) {
        await vm.connection.createChannel().then((ch) => {
          vm.channel[queue.q_name] = ch
          __logger.debug('lib_amqp.createChannelsForQueue, declaring a queue', { q_name: queue.q_name })
          var ok = vm.channel[queue.q_name].assertQueue(queue.q_name, queue.q_options)
          vm.channel[queue.q_name].prefetch(queue.prefetchCount)
          return ok.then((_qok) => {
            __logger.info('rabbitmqLib.createChannelsForQueue, queueDeclared', { q_name: queue.q_name })
          })
        })
      } else {
        __logger.error('rabbitmqLib.createChannelsForQueue, channel exits', { q_name: queue.q_name })
        return new Error('channel exits')
      }
    } else {
      __logger.error('rabbitmqLib.createChannelsForQueue, no connection found', { q_name: queue.q_name })
      return new Error('no connection found')
    }
  }

  sendToQueue (queue, message) {
    return new Promise((resolve, reject) => {
      __logger.debug('rabbitmqLib.sendToQueue, got request', { q_name: queue.q_name, message: Humanize.truncate(message, __config.rabbitmq.truncate_message_log_length) })
      if (this.connection) {
        if (this.channel[queue.q_name]) {
          this.channel[queue.q_name].sendToQueue(queue.q_name, new Buffer(message), { persistent: true })
          __logger.debug('rabbitmqLib.sendToQueue, queued success', { q_name: queue.q_name, message: Humanize.truncate(message, __config.rabbitmq.truncate_message_log_length) })
          resolve(null)
        } else {
          this.connection.createChannel().then(function (ch) {
            this.channel[queue.q_name] = ch
            var ok = this.channel[queue.q_name].assertQueue(queue.q_name, queue.q_options)
            ok.then((_qok) => {
              __logger.debug('rabbitmqLib.sendToQueue, queueDeclared', { q_name: queue.q_name })
              this.channel[queue.q_name].sendToQueue(queue.q_name, new Buffer(message), { persistent: true })
              __logger.debug('rabbitmqLib.sendToQueue, queued success', { q_name: queue.q_name, message: Humanize.truncate(message, __config.rabbitmq.truncate_message_log_length) })
              resolve(null)
            })
          })
        }
      } else {
        __logger.error('rabbitmqLib.sendToQueue, failed due to closed connection', { q_name: queue.q_name, message: message })
        reject('failed due to closed connection')
      }
    })
  }

  publishToExchange (exchange, r_key, message) {
    return new Promise((resolve, reject) => {
      var vm = this
      __logger.debug('rabbitmqLib.publishToExchange, got request', { q_name: exchange.q_name, r_key: r_key, message: Humanize.truncate(message, __config.rabbitmq.truncate_message_log_length) })
      if (vm.connection) {
        if (vm.channel[exchange.q_name]) {
          vm.channel[exchange.q_name].publish(exchange.q_name, r_key, new Buffer(message), { persistent: true })
          __logger.debug('rabbitmqLib.publishToExchange, queued success', { q_name: exchange.q_name, r_key: r_key, message: Humanize.truncate(message, __config.rabbitmq.truncate_message_log_length) })
          resolve(null)
        } else {
          vm.connection.createChannel().then((ch) => {
            vm.channel[exchange.q_name] = ch
            var ok = vm.channel[exchange.q_name].assertExchange(exchange.q_name, exchange.ex_type, exchange.q_options)
            ok.then((_qok) => {
              __logger.debug('rabbitmqLib.publishToExchange, queueDeclared', { q_name: exchange.q_name })
              vm.channel[exchange.q_name].publish(exchange.q_name, r_key, new Buffer(message), { persistent: true })
              __logger.debug('rabbitmqLib.publishToExchange, queued success', { q_name: exchange.q_name, r_key: r_key, message: Humanize.truncate(message, __config.rabbitmq.truncate_message_log_length) })
              resolve(null)
            })
          })
        }
      } else {
        __logger.error('rabbitmqLib.publishToExchange, failed due to closed connection', { q_name: queue.q_name, message: message })
        reject('failed due to closed connection')
      }
    })
  }

  //
  // fetchFromQueue(queue) {
  //     return new Promise((resolve, reject) => {
  //         var vm = this;
  //         if (vm.connection) {
  //             __logger.debug('rabbitmqLib.fetchFromQueue, waiting for message');
  //             vm.channel[queue].consume(queue, (msg) => {
  //                 __logger.debug('rabbitmqLib.fetchFromQueue, got message', { r_key: (msg.fields) ? msg.fields.routingKey : "", message: Humanize.truncate(msg.content.toString(), __config.rabbitmq.truncate_message_log_length) });
  //                 return Promise.resolve({
  //                     msg: msg,
  //                     ack: (ack_msg) => {
  //                         if (ack_msg) {
  //                             vm.channel[queue.q_name].ack(msg);
  //                             __logger.debug('rabbitmqLib.fetchFromQueue, ack message', { r_key: (msg.fields) ? msg.fields.routingKey : "", message: Humanize.truncate(msg.content.toString(), __config.rabbitmq.truncate_message_log_length) });
  //                         }
  //                         else {
  //                             vm.channel[queue.q_name].nack(msg);
  //                             __logger.debug('rabbitmqLib.fetchFromQueue, nack message', { r_key: (msg.fields) ? msg.fields.routingKey : "", message: Humanize.truncate(msg.content.toString(), __config.rabbitmq.truncate_message_log_length) });
  //                         }
  //                     }
  //                 });
  //             }, { noAck: true });
  //         }
  //         else {
  //             __logger.error('rabbitmqLib.fetchFromQueue, failed due to closed connection', { q_name: queue.q_name });
  //             reject("failed due to closed connection");
  //         }
  //     });
  // }
  fetchFromQueue () {
    return this
  }
  // fetchFromQueue(queue) {
  //     var vm = this;
  //     if (vm.connection) {
  //         __logger.debug('rabbitmqLib.fetchFromQueue, waiting for message');
  //         return vm.channel[queue].consume(queue, (msg) => {
  //             __logger.debug('rabbitmqLib.fetchFromQueue, got message', { r_key: (msg.fields) ? msg.fields.routingKey : "", message: Humanize.truncate(msg.content.toString(), __config.rabbitmq.truncate_message_log_length) });
  //             return Promise.resolve({
  //                 msg: msg,
  //                 ack: (ack_msg) => {
  //                     if (ack_msg) {
  //                         vm.channel[queue.q_name].ack(msg);
  //                         __logger.debug('rabbitmqLib.fetchFromQueue, ack message', { r_key: (msg.fields) ? msg.fields.routingKey : "", message: Humanize.truncate(msg.content.toString(), __config.rabbitmq.truncate_message_log_length) });
  //                     }
  //                     else {
  //                         vm.channel[queue.q_name].nack(msg);
  //                         __logger.debug('rabbitmqLib.fetchFromQueue, nack message', { r_key: (msg.fields) ? msg.fields.routingKey : "", message: Humanize.truncate(msg.content.toString(), __config.rabbitmq.truncate_message_log_length) });
  //                     }
  //                 }
  //             });
  //         }, { noAck: true });
  //     }
  // }

  // fetchFromQueue(queue, callback) {
  //     var vm = this;
  //     if (vm.connection) {
  //         __logger.debug('rabbitmqLib.fetchFromQueue, waiting for message');
  //         vm.channel[queue].consume(queue, (msg) => {
  //             __logger.debug('rabbitmqLib.fetchFromQueue, got message', { r_key: (msg.fields) ? msg.fields.routingKey : "", message: Humanize.truncate(msg.content.toString(), __config.rabbitmq.truncate_message_log_length) });
  //             return {
  //                 msg: msg,
  //                 ack: (ack_msg) => {
  //                     if (ack_msg) {
  //                         vm.channel[queue.q_name].ack(msg);
  //                         __logger.debug('rabbitmqLib.fetchFromQueue, ack message', { r_key: (msg.fields) ? msg.fields.routingKey : "", message: Humanize.truncate(msg.content.toString(), __config.rabbitmq.truncate_message_log_length) });
  //                     }
  //                     else {
  //                         vm.channel[queue.q_name].nack(msg);
  //                         __logger.debug('rabbitmqLib.fetchFromQueue, nack message', { r_key: (msg.fields) ? msg.fields.routingKey : "", message: Humanize.truncate(msg.content.toString(), __config.rabbitmq.truncate_message_log_length) });
  //                     }
  //                 }
  //             };
  //         }, { noAck: true });
  //     }
  //     else {
  //         __logger.error('rabbitmqLib.fetchFromQueue, failed due to closed connection', { q_name: queue.q_name });
  //         callback("failed due to closed connection", null);
  //     }
  //
  //     return null;
  // }
}
module.exports = new rabbitmqLib()
