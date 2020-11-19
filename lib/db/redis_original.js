
var lib_redis = {};
var redis = require('redis');
var __config = require('../../config');
var __logger = require('../../lib/logger');
var redis_client = null;

class redisLib {
    constructor() {
        __logger.debug("redisLib.constructor called.");
        this.connection = null;
        this.connection_status = false;
    }

    init() {
        return new Promise((resolve, reject) => {
            var vm = this;
            if (!__config.redis.init) {
                this.connection = null;
                __logger.debug("redisLib.init redis not initialized.");
                resolve("redis not initialized");
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

    //Returns all keys matching pattern.
    getKeys(key_pattern) {
        return new Promise((resolve, reject) => {
            if (this.connection) {
                this.connection.keys(key_pattern, (error, result) => {
                    if (error)
                        reject(error);
                    else
                        resolve(result);
                });
            } else {
                reject(new Error('redis connection failed'));
            }
        });
    }

    //Returns if key exists.
    getKeyExists(key) {
        return new Promise((resolve, reject) => {
            if (this.connection) {
                this.connection.exists(key, (error, result) => {
                    if (error)
                        reject(error);
                    else
                        resolve(result);
                });
            } else {
                reject(new Error('redis connection failed'));
            }
        });
    }

    get(key) {
        return new Promise((resolve, reject) => {
            if (this.connection) {
                this.connection.get(key, (error, result) => {
                    if (error)
                        reject(error);
                    else
                        resolve(result);
                });
            } else {
                reject(new Error('redis connection failed'));
            }
        });
    }

    set(key, value) {
        return new Promise((resolve, reject) => {
            if (this.connection) {
                this.connection.set(key, value, (error, result) => {
                    if (error)
                        reject(error);
                    else
                        resolve(result);
                });
            } else {
                reject(new Error('redis connection failed'));
            }
        });
    }

    setex(key, value, expiry_sec) {
        return new Promise((resolve, reject) => {
            if (this.connection) {
                this.connection.set(key, value, 'EX', expiry_sec, (error, result) => {
                    if (error)
                        reject(error);
                    else
                        resolve(result);
                });
            } else {
                reject(new Error('redis connection failed'));
            }
        });
    }

    update(key, value) {
        return new Promise((resolve, reject) => {
            if (this.connection) {
                keyExists(key).then((isExist) => {
                    if (isExist)
                        return set(key, value);
                    // this.connection.set(key, value, (error, result) => {
                    //     if (error)
                    //         reject(error);
                    //     else
                    //         resolve(result);
                    // });
                    else
                        reject(new Error("Key not exists."));
                }).catch((error) => {
                    reject(error);
                });
            } else {
                reject(new Error('redis connection failed'));
            }
        });
    }

    increment(key) {
        return new Promise((resolve, reject) => {
            if (this.connection) {
                this.connection.incr(key, (error, result) => {
                    if (error)
                        reject(error);
                    else
                        resolve(result);
                });
            } else {
                reject(new Error('redis connection failed'));
            }
        });
    }

    incrementby(key, value) {
        return new Promise((resolve, reject) => {
            if (this.connection) {
                this.connection.incrby(key, value, (error, result) => {
                    if (error)
                        reject(error);
                    else
                        resolve(result);
                });
            } else {
                reject(new Error('redis connection failed'));
            }
        });
    }



    hash_increment(hash, key) {
        return new Promise((resolve, reject) => {
            if (this.connection) {
                this.connection.hincrby(hash, key, "1", (err, result) => {
                    if (err)
                        reject(err);
                    else
                        resolve(result);
                });
            } else {
                reject(new Error('redis connection failed'));
            }
        });
    };

    hash_incrementby(hash, key, value) {
        return new Promise((resolve, reject) => {
            if (this.connection) {
                this.connection.hincrby(hash, key, value, (err, result) => {
                    if (err)
                        reject(err);
                    else
                        resolve(result);
                });
            } else {
                reject(new Error('redis connection failed'));
            }
        });
    }

    hash_get(hash, key) {
        return new Promise((resolve, reject) => {
            if (this.connection) {
                this.connection.hget(hash, key, (err, result) => {
                    if (err)
                        reject(err);
                    else
                        resolve(result);
                });
            } else {
                reject(new Error('redis connection failed'));
            }
        });
    }

    hash_set(hash, key, value) {
        return new Promise((resolve, reject) => {
            if (this.connection) {
                this.connection.hset(hash, key, value, (err, result) => {
                    if (err)
                        reject(err);
                    else
                        resolve(result);
                });
            } else {
                reject(new Error('redis connection failed'));
            }
        });
    }

    hash_mset(hash, value) {
        return new Promise((resolve, reject) => {
            if (this.connection) {
                this.connection.hmset(hash, value, (err, result) => {
                    if (err)
                        reject(err);
                    else
                        resolve(result);
                });
            } else {
                reject(new Error('redis connection failed'));
            }
        });
    }

    hash_delete(hash, key) {
        return new Promise((resolve, reject) => {
            if (this.connection) {
                this.connection.hdel(hash, key, (err, result) => {
                    if (err)
                        reject(err);
                    else
                        resolve(result);
                });
            } else {
                reject(new Error('redis connection failed'));
            }
        });
    }

    hash_getall(hash) {
        return new Promise((resolve, reject) => {
            if (this.connection) {
                this.connection.hgetall(hash, (err, result) => {
                    if (err)
                        reject(err);
                    else
                        resolve(result);
                });
            } else {
                reject(new Error('redis connection failed'));
            }
        });
    }

    set_add(key, member) {
        return new Promise((resolve, reject) => {
            if (this.connection) {
                this.connection.sadd(key, member, (err, result) => {
                    if (err)
                        reject(err);
                    else
                        resolve(result);
                });
            } else {
                reject(new Error('redis connection failed'));
            }
        });
    }

    set_delete(key, member) {
        return new Promise((resolve, reject) => {
            if (this.connection) {
                this.connection.srem(key, member, (err, result) => {
                    if (err)
                        reject(err);
                    else
                        resolve(result);
                });
            } else {
                reject(new Error('redis connection failed'));
            }
        });
    }

    key_delete(key) {
        return new Promise((resolve, reject) => {
            if (this.connection) {
                this.connection.del(key, (err, result) => {
                    if (err)
                        reject(err);
                    else
                        resolve(result);
                });
            } else {
                reject(new Error('redis connection failed'));
            }
        });
    }


}
module.exports = new redisLib();
