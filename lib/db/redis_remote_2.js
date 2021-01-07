
var lib_redis = {};
var redis = require('redis');
var __config = require('../../config');
var __logger = require('../../lib/logger');
var redis_lib = require('./redis_lib');
var redis_client = null;

class redisLib extends redis_lib{

    init() {
        return new Promise((resolve, reject) => {
            var vm = this;
            if (!__config.redis_remote_2.init) {
                this.connection = null;
               __logger.info("redisLib.init redis not initialized.");
                resolve("redis not initialized");
                return
            }
           __logger.info('redisLib.init, initializing redis connection ', { port: __config.redis_remote_2.port, host: __config.redis_remote_2.host, uri: __config.redis_remote_2.uri });
            var redisClient = redis.createClient(__config.redis_remote_2.uri);//(__config.redis_remote_2.port, __config.redis_remote_2.host, {});
            redisClient.on("error", function (err) {
                __logger.error('redisLib.init, error in redis connection ', { port: __config.redis_remote_2.port, host: __config.redis_remote_2.host, err: err });
                vm.connection = null;
                if (vm.connection_status == false)
                    reject("redis error");
                else
                    process.exit(1);
            });
            redisClient.on("connect", function () {
                __logger.info('redisLib.init, success redis connection ', { port: __config.redis_remote_2.port, host: __config.redis_remote_2.host });
                vm.connection = redisClient;
                vm.connection_status = true;
                resolve("redis connected");
            });
        });
    }

    close() {
        return new Promise((resolve, reject) => {
            if (__config.redis_remote_2.init) {
                __logger.warn('redisLib.close, function called', { port: __config.redis_remote_2.port, host: __config.redis_remote_2.host });
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
