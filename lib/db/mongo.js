const mongodb = require('mongodb');
const __config = require('../../config');
const __constants = require('../../config/constants');
const __logger = require('../logger');
const MongoClient = mongodb.MongoClient;
const mongoAutoIncrement = require("mongodb-autoincrement");
const _ = require('lodash');
const dateUtil = require('date-format-utils');
let encrypyDecrypt = require('encrypy-decrypt')

class mongoLib {
    constructor() {
        __logger.debug("mongoLib.constructor called.");
        this.connection = null;
        this.connection_status = false;
    }

    init() {
        return new Promise((resolve, reject) => {
            let vm = this;
            if (!__config.mongo.init) {
                vm.connection = null;
                __logger.debug("mongoLib.init mongodb not initialized.");
                resolve("mongodb not initialized");
                return
            }
            const configOptions = {
                useNewUrlParser: true,
                useUnifiedTopology: true
            }
            if (process.env.WORKER_TYPE === __constants.PROCESS_COUNT_SCHEDULER) {
                configOptions.connectTimeoutMS = 18000000
                configOptions.socketTimeoutMS = 18000000
                configOptions.keepAlive = true
                configOptions.reconnectTries = 30000
            }
            MongoClient.connect(__config.mongo.uri, configOptions, (err, connection) => {
                if (err) {
                    __logger.error('mongoLib.init, error connecting mongodb:', {
                        error: err
                    });
                    reject(err);
                } else {
                    __logger.info('mongoLib.init, success connection to mongodb:');
                    vm.connection = connection;
                    resolve("mongo connected");
                    connection.on('error', () => {
                        __logger.error('mongoLib.init, error connecting mongodb:');
                        vm.connection = null;
                    });
                    connection.on('close', () => {
                        __logger.error('mongoLib.init, connection closed:');
                    });
                    connection.on('reconnect', () => {
                        __logger.info('mongoLib.init, re-connected to mongodb:');
                        vm.connection = connection;
                    });
                }
            });
        });
    }

    close() {
        return new Promise((resolve, reject) => {
            if (__config.mongo.init) {
                __logger.warn('mongoLib.close, function called', {});
                this.connection.close();
                resolve(null);
            } else {
                resolve(null);
            }
        });
    }

    __getDbNameWithArchive(db_referrer) {
        let db_name = db_referrer;
        let archive_date = dateUtil.formatDate(new Date(), 'yyyyMMdd');
        if (typeof db_referrer != 'string' && typeof db_referrer == 'object') {
            let dbObj = _.clone(db_referrer);
            archive_date = dbObj.date || archive_date;
            db_name = dbObj.db_name;
        }

        try {
            if (!_.isEmpty(__constants.DB_NAME)) {
                return __constants.DB_NAME
            }
            //  if (!_.isEmpty(__define.MONGO_DBS)) {
            //      for (let key in __define.MONGO_DBS) {
            //          let db_config = __define.MONGO_DBS[key];
            //          if (!_.isEmpty(db_config) && db_config.name == db_name) {
            //              db_name = db_config.db;
            //              if (db_config.archive) {
            //                  db_name = db_name + '_' + archive_date;
            //              }
            //          }
            //      }
            //  }
            //        console.log("******************db_name::", db_name);
            //  return db_name;
        } catch (e) {
            __logger.error('lib_mongo.__getDbNameWithArchive, error to get db_name', {
                err: e,
                db_name: db_name
            });
            return db_name;
        }
    }


    __getMongoDbConnection(db_name) {
        return new Promise((resolve, reject) => {
            let vm = this;
            if (vm.connection) {
                if (db_name) {
                    //  console.log(__getDbNameWithArchive(db_name));
                    db_name = vm.__getDbNameWithArchive(db_name);
                    let conn = vm.connection.db(db_name);
                    // __logger.debug('lib_mongo.__getMongoDbConnection::', {, db_name: db_name});
                    if (conn) {
                        resolve(conn);
                    } else {
                        __logger.error('lib_mongo.__getMongoDbConnection, error connecting mongodb:', {});
                        reject(db_name + ' db not connected.');
                    }
                } else {
                    __logger.error('lib_mongo.__getMongoDbConnection, error connecting mongodb:', {});
                    reject('db name not define.');
                }
            } else {
                __logger.error('lib_mongo.__getMongoDbConnection, error connecting mongodb:', {});
                reject('not connected');
            }
        });
    };


    __autoIncrement(db_name, collection_name, query_index) {
        __logger.debug('lib_mongo.__autoIncrement, request', {
            db: db_name,
            collection: collection_name,
            query_index: query_index
        });
        return new Promise((resolve, reject) => {
            let vm = this;
            vm.__getMongoDbConnection(db_name).then((connection) => {
                mongoAutoIncrement.getNextSequence(connection, collection_name, (err, autoIndex) => {
                    if (err) {
                        __logger.error('lib_mongo.__autoIncrement, failed', {
                            db: db_name,
                            collection: collection_name,
                            query_index: query_index
                        });
                        reject(err);
                    } else {
                        let collection = connection.collection(collection_name);
                        collection.createIndex(query_index, {
                            unique: true
                        });
                        __logger.debug('lib_mongo.__autoIncrement, success', {
                            db: db_name,
                            collection: collection_name,
                            query_index: query_index
                        });
                        resolve(null, autoIndex);
                    }
                });
            }).catch((connError) => {
                if (connError) {
                    reject(connError);
                }
            });
        });
    };

    __distinct(db_name, collection_name, distinct_param) {
        __logger.debug('lib_mongo.__distinct, request', {
            db: db_name,
            collection: collection_name,
            distinct_param: distinct_param
        });
        return new Promise((resolve, reject) => {
            let vm = this;
            vm.__getMongoDbConnection(db_name).then((connection) => {
                connection.collection(collection_name).distinct(distinct_param, (err, result) => {
                    if (err) {
                        __logger.error('lib_mongo.__distinct, failed', {
                            db: db_name,
                            collection: collection_name,
                            distinct_param: distinct_param
                        });
                        reject(err);
                    } else {
                        __logger.debug('lib_mongo.__distinct, success', {
                            db: db_name,
                            collection: collection_name,
                            distinct_param: distinct_param
                        });
                        resolve(result);
                    }
                });
            }).catch((connError) => {
                if (connError) {
                    reject(connError);
                }
            });
        });
    };


    __findOne(db_name, collection_name, find_params, select_params) {
        let mongoConfig = require('../../config/keysToEncrypt.json')
        __logger.debug('lib_mongo.__findOne, request', {
            db: db_name,
            collection: collection_name,
            params: find_params
        });
        return new Promise((resolve, reject) => {
            let vm = this;
            vm.__getMongoDbConnection(db_name).then((connection) => {
                select_params = select_params || {};
                connection.collection(collection_name).findOne(encrypyDecrypt.encryptKeysInObj(find_params, mongoConfig[collection_name] || []), select_params, (err, result) => {
                    if (err) {
                        __logger.error('lib_mongo.__findOne, failed', {
                            db: db_name,
                            collection: collection_name,
                            params: find_params
                        });
                        reject(err);
                    } else {
                        __logger.debug('lib_mongo.__findOne, success', {
                            db: db_name,
                            collection: collection_name,
                            params: find_params
                        });
                        resolve(encrypyDecrypt.decryptKeysInObj(result, mongoConfig[collection_name] || []));
                    }
                });
            }).catch((connError) => {
                if (connError) {
                    reject(connError);
                }
            });
        });
    };


    __find(db_name, collection_name, find_params, select_params) {
        let mongoConfig = require('../../config/keysToEncrypt.json')
        __logger.debug('lib_mongo.__find, request', {
            db: db_name,
            collection: collection_name,
            params: find_params
        });
        return new Promise((resolve, reject) => {
            let vm = this;
            vm.__getMongoDbConnection(db_name).then((connection) => {
                select_params = select_params || {};
                connection.collection(collection_name).find(encrypyDecrypt.encryptKeysInObj(find_params, mongoConfig[collection_name] || [])).project(select_params).toArray((err, result) => {
                    if (err) {
                        __logger.error('lib_mongo.__find, failed', {
                            db: db_name,
                            collection: collection_name,
                            params: find_params
                        });
                        reject(err);
                    } else {
                        __logger.debug('lib_mongo.__find, success', {
                            db: db_name,
                            collection: collection_name,
                            params: find_params
                        });
                        resolve(encrypyDecrypt.decryptKeysInObj(result, mongoConfig[collection_name] || []));
                    }
                });
            }).catch((connError) => {
                if (connError) {
                    reject(connError);
                }
            });
        });
    };

    __findSort(db_name, collection_name, find_params, select_params, sort_params, skip_param, limit_param) {
        let mongoConfig = require('../../config/keysToEncrypt.json')
        __logger.debug('lib_mongo.__find, request', {
            db: db_name,
            collection: collection_name,
            params: find_params,
            sort_params: sort_params
        });
        return new Promise((resolve, reject) => {
            let vm = this;
            vm.__getMongoDbConnection(db_name).then((connection) => {
                select_params = select_params || {};
                sort_params = sort_params || {};
                connection.collection(collection_name).find(encrypyDecrypt.encryptKeysInObj(find_params, mongoConfig[collection_name] || [])).project(select_params).skip(skip_param).limit(limit_param).sort(sort_params).toArray((err, result) => {
                    if (err) {
                        __logger.error('lib_mongo.__find, failed', {
                            db: db_name,
                            collection: collection_name,
                            params: find_params,
                            sort_params: sort_params
                        });
                        reject(err);
                    } else {
                        __logger.debug('lib_mongo.__find, success', {
                            db: db_name,
                            collection: collection_name,
                            params: find_params,
                            sort_params: sort_params
                        });
                        resolve(result);
                    }
                });
            }).catch((connError) => {
                if (connError) {
                    reject(connError);
                }
            });
        });
    };

    __aggregate(db_name, collection_name, find_params, select_params, sort_params) {
        __logger.debug('lib_mongo.__aggregate, request', {
            db: db_name,
            collection: collection_name,
            params: find_params,
            sort_params: sort_params
        });
        return new Promise((resolve, reject) => {
            let vm = this;
            vm.__getMongoDbConnection(db_name).then((connection) => {
                select_params = select_params || {};
                sort_params = sort_params || {};
                connection.collection(collection_name).aggregate([find_params, select_params, sort_params]).toArray((err, result) => {
                    if (err) {
                        __logger.error('lib_mongo.__aggregate, failed', {
                            db: db_name,
                            collection: collection_name,
                            params: find_params,
                            sort_params: sort_params
                        });
                        reject(err);
                    } else {
                        __logger.debug('lib_mongo.__aggregate, success', {
                            db: db_name,
                            collection: collection_name,
                            params: find_params,
                            sort_params: sort_params
                        });
                        resolve(result);
                    }
                });
            }).catch((connError) => {
                if (connError) {
                    reject(connError);
                }
            });
        });
    };

    __custom_aggregate(db_name, collection_name, params) {
        __logger.debug('lib_mongo.__aggregate, request', {
            db: db_name,
            collection: collection_name,
            params: params
        });
        return new Promise((resolve, reject) => {
            let vm = this;
            vm.__getMongoDbConnection(db_name).then((connection) => {
                connection.collection(collection_name).aggregate(params).toArray((err, result) => {
                    if (err) {
                        __logger.error('lib_mongo.__aggregate, failed', {
                            db: db_name,
                            collection: collection_name,
                            params: params,
                        });
                        reject(err);
                    } else {
                        __logger.debug('lib_mongo.__aggregate, success', {
                            db: db_name,
                            collection: collection_name,
                            params: params
                        });
                        resolve(result);
                    }
                });
            }).catch((connError) => {
                if (connError) {
                    reject(connError);
                }
            });
        });
    };

    __insert(db_name, collection_name, document) {
        let mongoConfig = require('../../config/keysToEncrypt.json')
        __logger.debug('lib_mongo.__insert, request', {
            db: db_name,
            collection: collection_name,
            document: document
        });
        return new Promise((resolve, reject) => {
            let vm = this;
            vm.__getMongoDbConnection(db_name).then((connection) => {
                connection.collection(collection_name).insertOne(encrypyDecrypt.encryptKeysInObj(document, mongoConfig[collection_name] || []), {
                    w: 1
                }, (err, result) => {
                    if (err) {
                        __logger.error('lib_mongo.__insert, failed', {
                            db: db_name,
                            collection: collection_name,
                            document: document
                        });
                        reject(err);
                    } else {
                        __logger.debug('lib_mongo.__insert, success', {
                            db: db_name,
                            collection: collection_name,
                            document: document
                        });
                        resolve(result);
                    }
                });
            }).catch((connError) => {
                if (connError) {
                    reject(connError);
                }
            });
        });
    };

    __update(db_name, collection_name, find_params, update_params) {
        let mongoConfig = require('../../config/keysToEncrypt.json')
        __logger.debug('lib_mongo.__update, request', {
            db: db_name,
            collection: collection_name,
            params: find_params
        });
        return new Promise((resolve, reject) => {
            let vm = this;
            vm.__getMongoDbConnection(db_name).then((connection) => {
                connection.collection(collection_name).updateMany(encrypyDecrypt.encryptKeysInObj(find_params, mongoConfig[collection_name] || []), {
                    "$set": encrypyDecrypt.encryptKeysInObj(update_params, mongoConfig[collection_name] || [])
                }, (err, result) => {
                    if (err) {
                        __logger.error('lib_mongo.__update, failed', {
                            db: db_name,
                            collection: collection_name,
                            params: find_params
                        });
                        reject(err);
                    } else {
                        __logger.debug('lib_mongo.__update, success', {
                            db: db_name,
                            collection: collection_name,
                            params: find_params
                        });
                        resolve(result);
                    }
                });
            }).catch((connError) => {
                if (connError) {
                    reject(connError);
                }
            });
        });
    };

    __updateWithInsert(db_name, collection_name, find_params, update_insert_params) {
        let mongoConfig = require('../../config/keysToEncrypt.json')
        __logger.debug('lib_mongo.__updateWithInsert, request', {
            db: db_name,
            collection: collection_name,
            params: find_params
        });
        return new Promise((resolve, reject) => {
            let vm = this;
            vm.__getMongoDbConnection(db_name).then((connection) => {
                connection.collection(collection_name).update(encrypyDecrypt.encryptKeysInObj(find_params, mongoConfig[collection_name] || []), {
                    "$set": encrypyDecrypt.encryptKeysInObj(update_insert_params, mongoConfig[collection_name] || [])
                }, {
                    upsert: true
                }, (err, result) => {
                    if (err) {
                        __logger.error('lib_mongo.__updateWithInsert, failed', {
                            db: db_name,
                            collection: collection_name,
                            params: find_params
                        });
                        reject(err);
                    } else {
                        __logger.debug('lib_mongo.__updateWithInsert, success', {
                            db: db_name,
                            collection: collection_name,
                            params: find_params
                        });
                        resolve(result);
                    }
                });
            }).catch((connError) => {
                if (connError) {
                    reject(connError);
                }
            });
        });
    };

    __update_addToSet(db_name, collection_name, find_params, update_params) {
        let mongoConfig = require('../../config/keysToEncrypt.json')
        __logger.debug('lib_mongo.__update_addToSet, request', {
            db: db_name,
            collection: collection_name,
            params: find_params
        });
        return new Promise((resolve, reject) => {
            let vm = this;
            vm.__getMongoDbConnection(db_name).then((connection) => {
                connection.collection(collection_name).update(encrypyDecrypt.encryptKeysInObj(find_params, mongoConfig[collection_name] || []), {
                    "$addToSet": encrypyDecrypt.encryptKeysInObj(update_params, mongoConfig[collection_name] || [])
                }, (err, result) => {
                    if (err) {
                        __logger.error('lib_mongo.__update_addToSet, failed', {
                            db: db_name,
                            collection: collection_name,
                            params: find_params
                        });
                        reject(err);
                    } else {
                        __logger.debug('lib_mongo.__update_addToSet, success', {
                            db: db_name,
                            collection: collection_name,
                            params: find_params
                        });
                        resolve(result);
                    }
                });
            }).catch((connError) => {
                if (connError) {
                    reject(connError);
                }
            });
        });
    };

    __update_addToSet_and_other_param(db_name, collection_name, find_params, update_params_arr, update_params) {
        let mongoConfig = require('../../config/keysToEncrypt.json')
        __logger.debug('lib_mongo.__update_addToSet_and_other_param, request', {
            db: db_name,
            collection: collection_name,
            params: find_params
        });
        return new Promise((resolve, reject) => {
            let vm = this;
            vm.__getMongoDbConnection(db_name).then((connection) => {
                connection.collection(collection_name).findOneAndUpdate(encrypyDecrypt.encryptKeysInObj(find_params, mongoConfig[collection_name] || []), {
                    "$addToSet": encrypyDecrypt.encryptKeysInObj(update_params_arr, mongoConfig[collection_name] || []),
                    "$set": encrypyDecrypt.encryptKeysInObj(update_params, mongoConfig[collection_name] || [])
                }, (err, result) => {
                    if (err) {
                        __logger.error('lib_mongo.__update_addToSet_and_other_param, failed', {
                            db: db_name,
                            collection: collection_name,
                            params: find_params
                        });
                        reject(err);
                    } else {
                        __logger.debug('lib_mongo.__update_addToSet_and_other_param, success', {
                            db: db_name,
                            collection: collection_name,
                            params: find_params
                        });
                        resolve(result);
                    }
                });
            }).catch((connError) => {
                if (connError) {
                    reject(connError);
                }
            });
        });
    };

    __multiupdate(db_name, collection_name, find_params, update_params) {
        let mongoConfig = require('../../config/keysToEncrypt.json')
        __logger.debug('lib_mongo.__multiupdate, request', {
            db: db_name,
            collection: collection_name,
            params: find_params
        });
        return new Promise((resolve, reject) => {
            let vm = this;
            vm.__getMongoDbConnection(db_name).then((connection) => {
                connection.collection(collection_name).update(encrypyDecrypt.encryptKeysInObj(find_params, mongoConfig[collection_name] || []), {
                    "$set": encrypyDecrypt.encryptKeysInObj(update_params, mongoConfig[collection_name] || [])
                }, {
                    multi: true,
                    upsert: true
                }, (err, result) => {
                    if (err) {
                        __logger.error('lib_mongo.__multiupdate, failed', {
                            db: db_name,
                            collection: collection_name,
                            params: find_params
                        });
                        reject(err);
                    } else {
                        __logger.debug('lib_mongo.__multiupdate, success', {
                            db: db_name,
                            collection: collection_name,
                            params: find_params
                        });
                        resolve(result);
                    }
                });
            }).catch((connError) => {
                if (connError) {
                    reject(connError);
                }
            });
        });
    };

    __incr(db_name, collection_name, find_params, update_params, update_options) {
        let mongoConfig = require('../../config/keysToEncrypt.json')
        __logger.debug('lib_mongo.__incr, request', {
            db: db_name,
            collection: collection_name,
            params: find_params
        });
        return new Promise((resolve, reject) => {
            let vm = this;
            vm.__getMongoDbConnection(db_name).then((connection) => {
                connection.collection(collection_name).updateOne(encrypyDecrypt.encryptKeysInObj(find_params, mongoConfig[collection_name] || []), encrypyDecrypt.encryptKeysInObj(update_params, mongoConfig[collection_name] || []), update_options, (err, result) => {
                    if (err) {
                        __logger.error('lib_mongo.__incr, failed', {
                            db: db_name,
                            collection: collection_name,
                            params: find_params
                        });
                        reject(err);
                    } else {
                        __logger.debug('lib_mongo.__incr, success', {
                            db: db_name,
                            collection: collection_name,
                            params: find_params
                        });
                        resolve(result);
                    }
                });
            }).catch((connError) => {
                if (connError) {
                    reject(connError);
                }
            });
        });
    };

    __push(db_name, collection_name, find_params, push_params, update_params) {
        __logger.debug('lib_mongo.__push, request', {
            db: db_name,
            collection: collection_name,
            params: find_params
        });
        return new Promise((resolve, reject) => {
            let vm = this;
            vm.__getMongoDbConnection(db_name).then((connection) => {
                let update_fields = {};
                if (push_params) {
                    update_fields["$push"] = push_params;
                }
                if (update_params) {
                    update_fields["$set"] = update_params;
                }
                connection.collection(collection_name).update(find_params, update_fields, (err, result) => {
                    if (err) {
                        __logger.error('lib_mongo.__push, failed', {
                            db: db_name,
                            collection: collection_name,
                            params: find_params
                        });
                        reject(err);
                    } else {
                        __logger.debug('lib_mongo.__push, success', {
                            db: db_name,
                            collection: collection_name,
                            params: find_params
                        });
                        resolve(result);
                    }
                });
            }).catch((connError) => {
                if (connError) {
                    reject(connError);
                }
            });
        });
    };

    __delete(db_name, collection_name, find_params) {
        let mongoConfig = require('../../config/keysToEncrypt.json')
        __logger.debug('lib_mongo.__delete, request', {
            db: db_name,
            collection: collection_name,
            params: find_params
        });
        return new Promise((resolve, reject) => {
            let vm = this;
            vm.__getMongoDbConnection(db_name).then((connection) => {
                connection.collection(collection_name).remove(encrypyDecrypt.encryptKeysInObj(find_params, mongoConfig[collection_name] || []), (err, result) => {
                    if (err) {
                        __logger.error('lib_mongo.__delete, failed', {
                            db: db_name,
                            collection: collection_name,
                            params: find_params
                        });
                        reject(err);
                    } else {
                        __logger.debug('lib_mongo.__delete, success', {
                            db: db_name,
                            collection: collection_name,
                            params: find_params
                        });
                        resolve(result);
                    }
                });
            }).catch((connError) => {
                if (connError) {
                    reject(connError);
                }
            });
        });
    };

    __eval(db_name, mongo_function, find_param) {
        __logger.debug('lib_mongo.__eval, request', {
            db: db_name,
            function: mongo_function,
            params: find_param
        });
        return new Promise((resolve, reject) => {
            let vm = this;
            vm.__getMongoDbConnection(db_name).then((connection) => {
                connection.eval(mongo_function + "(" + find_param + ")", (err, result) => {
                    if (err) {
                        __logger.error('lib_mongo.__eval, failed', {
                            db: db_name,
                            function: mongo_function,
                            params: find_param
                        });
                        reject(err);
                    } else {
                        __logger.debug('lib_mongo.__eval, success', {
                            db: db_name,
                            function: mongo_function,
                            params: find_param
                        });
                        resolve(result);
                    }
                });
            }).catch((connError) => {
                if (connError) {
                    reject(connError);
                }
            });
        });
    };

    __count(db_name, collection_name, find_params) {
        __logger.debug('lib_mongo.__count, request', {
            db: 'mongo',
            collection: collection_name,
            params: find_params
        });
        return new Promise((resolve, reject) => {
            let vm = this;
            vm.__getMongoDbConnection(db_name).then((connection) => {
                connection.collection(collection_name).countDocuments(find_params).then((result) => {
                    __logger.debug('lib_mongo.__count, success', {
                        db: db_name,
                        collection: collection_name,
                        params: find_params
                    });
                    resolve(result);
                }).catch(err => {
                    __logger.error('lib_mongo.__count, failed', {
                        db: db_name,
                        collection: collection_name,
                        params: find_params
                    });
                    reject(err);
                })
            }).catch((connError) => {
                if (connError) {
                    reject(connError);
                }
            });
        });
    };

    __bulkinsert(db_name, collection_name, data) {
        return new Promise((resolve, reject) => {
            let vm = this;
            vm.__getMongoDbConnection(db_name).then((connection) => {
                let bulk = connection.collection(collection_name).initializeUnorderedBulkOp();
                if (data && data.length > 0) {
                    data.forEach(element => {
                        bulk.find({
                            "destination": element['destination']
                        }).upsert().updateOne(element);
                    });

                    bulk.execute(function(err, result) {
                        if (err) {
                            reject(err)
                        } else {
                            resolve(result)
                        }
                    });
                } else {
                    reject('document array empty')
                }
            }).catch((connError) => {
                if (connError) {
                    reject(connError)
                }
            });
        });
    }

    __insertMany(db_name, collection_name, document) {
        let mongoConfig = require('../../config/keysToEncrypt.json')
        __logger.debug('lib_mongo.__insert, request', {
            db: db_name,
            collection: collection_name,
            document: document
        });
        return new Promise((resolve, reject) => {
            let vm = this;
            vm.__getMongoDbConnection(db_name).then((connection) => {
                connection.collection(collection_name).insertMany(encrypyDecrypt.encryptKeysInObj(document, mongoConfig[collection_name] || []), {}, (err, result) => {
                    if (err) {
                        __logger.error('lib_mongo.__insert, failed', {
                            db: db_name,
                            collection: collection_name,
                            document: document
                        });
                        reject(err);
                    } else {
                        __logger.debug('lib_mongo.__insert, success', {
                            db: db_name,
                            collection: collection_name,
                            document: document
                        });
                        resolve(result);
                    }
                });
            }).catch((connError) => {
                if (connError) {
                    reject(connError);
                }
            });
        });
    };

}

module.exports = new mongoLib();