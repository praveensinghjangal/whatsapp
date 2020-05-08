/**
 * @author deepak.ambekar
 * @email deepak.ambekar@vivainfomedia.com
 * @create date 2019-02-20 14:12:14
 * @modify date 2019-02-20 14:12:14
 * @desc [rabbitmq lib]
 */

var amqplib = require('amqplib');
var Humanize = require('humanize-plus');

var __config = require('../../config');
var __define = require('../../config/define');
var __logger = require('../../lib/logger');
var rabbitmq_lib = require('./rabbitmq_lib');

class rabbitmq_vb extends rabbitmq_lib {
    async init() {
        return new Promise((resolve, reject) => {
            var vm = this;
            if (!__config.rabbitmq_vb.init) {
                this.connection = null;
                __logger.debug("rabbitmqLib.init rabbitmq not initialized.");
                return resolve("rabbitmq not initialized");
            }
            if (__config.rabbitmq_vb.init && __config.rabbitmq_vb.use_auth) {
                __config.rabbitmq_vb.amqp_url = "amqp://" + __config.rabbitmq_vb.user + ":" + __config.rabbitmq_vb.pass + "@" + __config.rabbitmq_vb.host + ":" + __config.rabbitmq_vb.port + "/" + __config.rabbitmq_vb.virtual_host + "?heartbeat=30";
            }

            amqplib.connect(__config.rabbitmq_vb.amqp_url).then(async (conn) => {
                vm.connection = conn;
                vm.channel = {};
                conn.once('error', vm.handleError);
                const all_queues = __define.MQ;
                if (all_queues && Object.keys(all_queues).length > 0) {
                    for (let queue_index in all_queues) {
                        let queue = all_queues[queue_index];
                        switch (queue.type) {
                            case 'queue':
                                if (queue.createChannel) {
                                    await vm.createChannelsForQueue(queue);
                                }
                                break;
                            case 'exchange':
                                vm.createExchange(queue.q_name, queue.ex_type, queue.q_options);
                                if (queue.createChannel) {
                                    await vm.createChannelsForQueue(queue);
                                }
                                break;
                            case 'bind':
                                if (queue.createBind)
                                    await vm.createBind(queue.q_name, queue.ex_name, queue.r_key);
                                break;
                        }
                    }
                    return true;
                } else {
                    throw new Error('queue or exchange not define.');
                }
            }, (err) => {
                throw new Error(err);
            }).then(() => {
                //connection success
                __logger.info('rabbitmqLib.init, connection success', { amqp_host: __config.rabbitmq_vb.host });
                resolve("rabbitmq connection success");
            }, (err) => {
                //connection error
                __logger.error('rabbitmqLib.init, error in connection', { amqp_host: __config.rabbitmq_vb.host, err: err.message });
                resolve("rabbitmq connection error");
                process.exit(1)
            });
        });
    }

    close() {
        return new Promise((resolve, reject) => {
            if (__config.rabbitmq_vb.init) {
                __logger.warn('rabbitmqLib.close, function called', { amqp_host: __config.rabbitmq_vb.host });
                try {
                    this.connection.close();
                } catch (e) {
                    __logger.error('rabbitmqLib.close, exception', { exception: e });
                } finally {
                    resolve(null);
                }
            } else {
                resolve(null);
            }
        });
    }
}
module.exports = new rabbitmq_vb();
