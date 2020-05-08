/**
 *
 * @author deepak.ambekar [9/28/2017].
 */
var lib_redis = {};
var redis = require('redis');
var __config = require('../../config');
var __logger = require('../../lib/logger');
var redis_lib = require('./redis_lib');
var redis_client = null;

class redisLib extends redis_lib {

    init() {
        return new Promise((resolve, reject) => {
            var vm = this;
            if (!__config.redis.init) {
                this.connection = null;
                __logger.debug("redisLib.init redis not initialized.");
                resolve("redis not initialized");
                return
            }
            __logger.debug('redisLib.init, initializing redis connection ', { port: __config.redis.port, host: __config.redis.host, uri: __config.redis.uri });
            var redisClient = redis.createClient(__config.redis.uri);//(__config.redis.port, __config.redis.host, {});
            redisClient.on("error", function (err) {
                __logger.error('redisLib.init, error in redis connection ', { port: __config.redis.port, host: __config.redis.host, err: err });
                vm.connection = null;
                if (vm.connection_status == false)
                    reject("redis error");
                else
                    process.exit(1);
            });
            redisClient.on("connect", function () {
                __logger.info('redisLib.init, success redis connection ', { port: __config.redis.port, host: __config.redis.host });
                vm.connection = redisClient;
                vm.connection_status = true;
                resolve("redis connected");
            });
        });
    }

    close() {
        return new Promise((resolve, reject) => {
            if (__config.redis.init) {
                __logger.warn('redisLib.close, function called', { port: __config.redis.port, host: __config.redis.host });
                this.connection.quit();
                this.connection_status = false;
                resolve(null);
            } else {
                resolve(null);
            }
        });
    }

}
module.exports = new redisLib();
