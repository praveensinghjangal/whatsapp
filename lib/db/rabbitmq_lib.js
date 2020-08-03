/**
 * @author deepak.ambekar
 * @email deepak.ambekar@vivainfomedia.com
 * @create date 2019-02-20 14:12:14
 * @modify date 2019-02-20 14:12:14
 * @desc [rabbitmq lib]
 */
var Humanize = require('humanize-plus')
var __logger = require('../../lib/logger')

class rabbitmqLib {
  // constructor() {
  //     __logger.debug("rabbitmqLib.constructor called.");
  //     this.connection = null;
  //     this.channel = false;
  // }

  handleError (err) {
    __logger.error('rabbitmqLib.handleError, error in connection', { err: err })
    console.error(err)
    this.connection = null
    process.exit(1)
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

  sendToQueue (queue, message, priorityNumber = 0) {
    return new Promise((resolve, reject) => {
      __logger.debug('rabbitmqLib.sendToQueue, got request', { q_name: queue.q_name, message: Humanize.truncate(message), priority: priorityNumber })
      if (this.connection) {
        if (this.channel[queue.q_name]) {
          this.channel[queue.q_name].sendToQueue(queue.q_name, new Buffer(message), { persistent: true, priority: priorityNumber })
          __logger.debug('rabbitmqLib.sendToQueue, queued success', { q_name: queue.q_name, message: Humanize.truncate(message) })
          resolve(null)
        } else {
          this.connection.createChannel().then(function (ch) {
            this.channel[queue.q_name] = ch
            var ok = this.channel[queue.q_name].assertQueue(queue.q_name, queue.q_options)
            ok.then((_qok) => {
              __logger.debug('rabbitmqLib.sendToQueue, queueDeclared', { q_name: queue.q_name })
              this.channel[queue.q_name].sendToQueue(queue.q_name, new Buffer(message), { persistent: true })
              __logger.debug('rabbitmqLib.sendToQueue, queued success', { q_name: queue.q_name, message: Humanize.truncate(message) })
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
      __logger.debug('rabbitmqLib.publishToExchange, got request', { q_name: exchange.q_name, r_key: r_key, message: Humanize.truncate(message) })
      if (vm.connection) {
        if (vm.channel[exchange.q_name]) {
          vm.channel[exchange.q_name].publish(exchange.q_name, r_key, new Buffer(message), { persistent: true })
          __logger.debug('rabbitmqLib.publishToExchange, queued success', { q_name: exchange.q_name, r_key: r_key, message: Humanize.truncate(message) })
          resolve(null)
        } else {
          vm.connection.createChannel().then((ch) => {
            vm.channel[exchange.q_name] = ch
            var ok = vm.channel[exchange.q_name].assertExchange(exchange.q_name, exchange.ex_type, exchange.q_options)
            ok.then((_qok) => {
              __logger.debug('rabbitmqLib.publishToExchange, queueDeclared', { q_name: exchange.q_name })
              vm.channel[exchange.q_name].publish(exchange.q_name, r_key, new Buffer(message), { persistent: true })
              __logger.debug('rabbitmqLib.publishToExchange, queued success', { q_name: exchange.q_name, r_key: r_key, message: Humanize.truncate(message) })
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
  //                 __logger.debug('rabbitmqLib.fetchFromQueue, got message', { r_key: (msg.fields) ? msg.fields.routingKey : "", message: Humanize.truncate(msg.content.toString(), __config.rabbitmq_vb.truncate_message_log_length) });
  //                 return Promise.resolve({
  //                     msg: msg,
  //                     ack: (ack_msg) => {
  //                         if (ack_msg) {
  //                             vm.channel[queue.q_name].ack(msg);
  //                             __logger.debug('rabbitmqLib.fetchFromQueue, ack message', { r_key: (msg.fields) ? msg.fields.routingKey : "", message: Humanize.truncate(msg.content.toString(), __config.rabbitmq_vb.truncate_message_log_length) });
  //                         }
  //                         else {
  //                             vm.channel[queue.q_name].nack(msg);
  //                             __logger.debug('rabbitmqLib.fetchFromQueue, nack message', { r_key: (msg.fields) ? msg.fields.routingKey : "", message: Humanize.truncate(msg.content.toString(), __config.rabbitmq_vb.truncate_message_log_length) });
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
  //             __logger.debug('rabbitmqLib.fetchFromQueue, got message', { r_key: (msg.fields) ? msg.fields.routingKey : "", message: Humanize.truncate(msg.content.toString(), __config.rabbitmq_vb.truncate_message_log_length) });
  //             return Promise.resolve({
  //                 msg: msg,
  //                 ack: (ack_msg) => {
  //                     if (ack_msg) {
  //                         vm.channel[queue.q_name].ack(msg);
  //                         __logger.debug('rabbitmqLib.fetchFromQueue, ack message', { r_key: (msg.fields) ? msg.fields.routingKey : "", message: Humanize.truncate(msg.content.toString(), __config.rabbitmq_vb.truncate_message_log_length) });
  //                     }
  //                     else {
  //                         vm.channel[queue.q_name].nack(msg);
  //                         __logger.debug('rabbitmqLib.fetchFromQueue, nack message', { r_key: (msg.fields) ? msg.fields.routingKey : "", message: Humanize.truncate(msg.content.toString(), __config.rabbitmq_vb.truncate_message_log_length) });
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
  //             __logger.debug('rabbitmqLib.fetchFromQueue, got message', { r_key: (msg.fields) ? msg.fields.routingKey : "", message: Humanize.truncate(msg.content.toString(), __config.rabbitmq_vb.truncate_message_log_length) });
  //             return {
  //                 msg: msg,
  //                 ack: (ack_msg) => {
  //                     if (ack_msg) {
  //                         vm.channel[queue.q_name].ack(msg);
  //                         __logger.debug('rabbitmqLib.fetchFromQueue, ack message', { r_key: (msg.fields) ? msg.fields.routingKey : "", message: Humanize.truncate(msg.content.toString(), __config.rabbitmq_vb.truncate_message_log_length) });
  //                     }
  //                     else {
  //                         vm.channel[queue.q_name].nack(msg);
  //                         __logger.debug('rabbitmqLib.fetchFromQueue, nack message', { r_key: (msg.fields) ? msg.fields.routingKey : "", message: Humanize.truncate(msg.content.toString(), __config.rabbitmq_vb.truncate_message_log_length) });
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
module.exports = rabbitmqLib
