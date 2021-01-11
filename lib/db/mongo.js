var lib_mongo = {}
var mongodb = require('mongodb')
var __config = require('../../config')
var __constants = require('../../config/constants')
var __logger = require('../../lib/logger')
var MongoClient = mongodb.MongoClient
var mongoAutoIncrement = require('mongodb-autoincrement')
var _ = require('lodash')
var dateUtil = require('date-format-utils')

class mongoLib {
  constructor () {
   __logger.info('mongoLib.constructor called.')
    this.connection = null
    this.connection_status = false
  }

  init () {
    return new Promise((resolve, reject) => {
      var vm = this
      if (!__config.mongo.init) {
        vm.connection = null
       __logger.info('mongoLib.init mongodb not initialized.')
        resolve('mongodb not initialized')
        return
      }
      MongoClient.connect(__config.mongo.uri, { useNewUrlParser: true, useUnifiedTopology: true }, (err, connection) => {
        if (err) {
          __logger.error('mongoLib.init, error connecting mongodb:', { uri: __config.mongo.uri, error: err })
          reject(err)
        } else {
          __logger.info('mongoLib.init, success connection to mongodb:', { uri: __config.mongo.uri })
          vm.connection = connection
          resolve('mongo connected')

          connection.on('error', () => {
            __logger.error('mongoLib.init, error connecting mongodb:', { uri: __config.mongo.uri })
            vm.connection = null
          })
          connection.on('close', () => {
            __logger.error('mongoLib.init, connection closed:', { uri: __config.mongo.uri })
          })
          connection.on('reconnect', () => {
            __logger.info('mongoLib.init, re-connected to mongodb:', { uri: __config.mongo.uri })
            vm.connection = connection
          })
        }
      })
    })
  }

  close () {
    return new Promise((resolve, reject) => {
      if (__config.mongo.init) {
        __logger.warn('mongoLib.close, function called', { uri: __config.mongo.uri })
        this.connection.close()
        resolve(null)
      } else {
        resolve(null)
      }
    })
  }

  __getDbNameWithArchive (db_referrer) {
    var db_name = db_referrer
    var archive_date = dateUtil.formatDate(new Date(), 'yyyyMMdd')
    if (typeof db_referrer !== 'string' && typeof db_referrer === 'object') {
      var dbObj = _.clone(db_referrer)
      archive_date = dbObj.date || archive_date
      db_name = dbObj.db_name
    }
    try {
      if (!_.isEmpty(__constants.MONGO_DBS)) {
        for (var key in __constants.MONGO_DBS) {
          var db_config = __constants.MONGO_DBS[key]
          if (!_.isEmpty(db_config) && db_config.name == db_name) {
            db_name = db_config.db
            if (db_config.archive) {
              db_name = db_name + '_' + archive_date
            }
          }
        }
      }
      //        console.log("******************db_name::", db_name);
      return db_name
    } catch (e) {
      __logger.error('lib_mongo.__getDbNameWithArchive, error to get db_name', { err: e, db_name: db_name })
      return db_name
    }
  }

  __getMongoDbConnection (db_name) {
    return new Promise((resolve, reject) => {
      var vm = this
      if (vm.connection) {
        if (db_name) {
          // console.log(__getDbNameWithArchive(db_name));
          db_name = vm.__getDbNameWithArchive(db_name)
          var conn = vm.connection.db(db_name)
          //__logger.info('lib_mongo.__getMongoDbConnection::', {uri: __config.mongo.uri, db_name: db_name});
          if (conn) {
            resolve(conn)
          } else {
            __logger.error('lib_mongo.__getMongoDbConnection, error connecting mongodb:', { uri: __config.mongo.uri })
            reject(db_name + ' db not connected.')
          }
        } else {
          __logger.error('lib_mongo.__getMongoDbConnection, error connecting mongodb:', { uri: __config.mongo.uri })
          reject('db name not define.')
        }
      } else {
        __logger.error('lib_mongo.__getMongoDbConnection, error connecting mongodb:', { uri: __config.mongo.uri })
        reject('not connected')
      }
    })
  };

  __autoIncrement (db_name, collection_name, query_index) {
   __logger.info('lib_mongo.__autoIncrement, request', {
      db: db_name,
      collection: collection_name,
      query_index: query_index
    })
    return new Promise((resolve, reject) => {
      var vm = this
      vm.__getMongoDbConnection(db_name).then((connection) => {
        mongoAutoIncrement.getNextSequence(connection, collection_name, (err, autoIndex) => {
          if (err) {
            __logger.error('lib_mongo.__autoIncrement, failed', {
              db: db_name,
              collection: collection_name,
              query_index: query_index
            })
            reject(err)
          } else {
            var collection = connection.collection(collection_name)
            collection.createIndex(query_index, { unique: true })
           __logger.info('lib_mongo.__autoIncrement, success', {
              db: db_name,
              collection: collection_name,
              query_index: query_index
            })
            resolve(null, autoIndex)
          }
        })
      }).catch((connError) => {
        if (connError) {
          reject(connError)
        }
      })
    })
  };

  __distinct (db_name, collection_name, distinct_param) {
   __logger.info('lib_mongo.__distinct, request', {
      db: db_name,
      collection: collection_name,
      distinct_param: distinct_param
    })
    return new Promise((resolve, reject) => {
      var vm = this
      vm.__getMongoDbConnection(db_name).then((connection) => {
        connection.collection(collection_name).distinct(distinct_param, (err, result) => {
          if (err) {
            __logger.error('lib_mongo.__distinct, failed', {
              db: db_name,
              collection: collection_name,
              distinct_param: distinct_param
            })
            reject(err)
          } else {
           __logger.info('lib_mongo.__distinct, success', {
              db: db_name,
              collection: collection_name,
              distinct_param: distinct_param
            })
            resolve(result)
          }
        })
      }).catch((connError) => {
        if (connError) {
          reject(connError)
        }
      })
    })
  };

  __findOne (db_name, collection_name, find_params, select_params) {
   __logger.info('lib_mongo.__findOne, request', { db: db_name, collection: collection_name, params: find_params })
    return new Promise((resolve, reject) => {
      var vm = this
      vm.__getMongoDbConnection(db_name).then((connection) => {
        select_params = select_params || {}
        connection.collection(collection_name).findOne(find_params, select_params, (err, result) => {
          if (err) {
            __logger.error('lib_mongo.__findOne, failed', {
              db: db_name,
              collection: collection_name,
              params: find_params
            })
            reject(err)
          } else {
           __logger.info('lib_mongo.__findOne, success', {
              db: db_name,
              collection: collection_name,
              params: find_params
            })
            resolve(result)
          }
        })
      }).catch((connError) => {
        if (connError) {
          reject(connError)
        }
      })
    })
  };

  __find (db_name, collection_name, find_params, select_params) {
   __logger.info('lib_mongo.__find, request', { db: db_name, collection: collection_name, params: find_params })
    return new Promise((resolve, reject) => {
      var vm = this
      vm.__getMongoDbConnection(db_name).then((connection) => {
        select_params = select_params || {}
        connection.collection(collection_name).find(find_params).project(select_params).toArray((err, result) => {
          if (err) {
            __logger.error('lib_mongo.__find, failed', {
              db: db_name,
              collection: collection_name,
              params: find_params
            })
            reject(err)
          } else {
           __logger.info('lib_mongo.__find, success', {
              db: db_name,
              collection: collection_name,
              params: find_params
            })
            resolve(result)
          }
        })
      }).catch((connError) => {
        if (connError) {
          reject(connError)
        }
      })
    })
  };

  __findSort (db_name, collection_name, find_params, select_params, sort_params, skip_param, limit_param) {
   __logger.info('lib_mongo.__find, request', {
      db: db_name,
      collection: collection_name,
      params: find_params,
      sort_params: sort_params
    })
    return new Promise((resolve, reject) => {
      var vm = this
      vm.__getMongoDbConnection(db_name).then((connection) => {
        select_params = select_params || {}
        sort_params = sort_params || {}
        connection.collection(collection_name).find(find_params).project(select_params).skip(skip_param).limit(limit_param).sort(sort_params).toArray((err, result) => {
          if (err) {
            __logger.error('lib_mongo.__find, failed', {
              db: db_name,
              collection: collection_name,
              params: find_params,
              sort_params: sort_params
            })
            reject(err)
          } else {
           __logger.info('lib_mongo.__find, success', {
              db: db_name,
              collection: collection_name,
              params: find_params,
              sort_params: sort_params
            })
            resolve(result)
          }
        })
      }).catch((connError) => {
        if (connError) {
          reject(connError)
        }
      })
    })
  };

  __aggregate (db_name, collection_name, find_params, select_params, sort_params) {
   __logger.info('lib_mongo.__aggregate, request', {
      db: db_name,
      collection: collection_name,
      params: find_params,
      sort_params: sort_params
    })
    return new Promise((resolve, reject) => {
      var vm = this
      vm.__getMongoDbConnection(db_name).then((connection) => {
        select_params = select_params || {}
        sort_params = sort_params || {}
        connection.collection(collection_name).aggregate([find_params, select_params, sort_params]).toArray((err, result) => {
          if (err) {
            __logger.error('lib_mongo.__aggregate, failed', {
              db: db_name,
              collection: collection_name,
              params: find_params,
              sort_params: sort_params
            })
            reject(err)
          } else {
           __logger.info('lib_mongo.__aggregate, success', {
              db: db_name,
              collection: collection_name,
              params: find_params,
              sort_params: sort_params
            })
            resolve(result)
          }
        })
      }).catch((connError) => {
        if (connError) {
          reject(connError)
        }
      })
    })
  };

  __custom_aggregate (db_name, collection_name, params) {
   __logger.info('lib_mongo.__aggregate, request', {
      db: db_name,
      collection: collection_name,
      params: params
    })
    return new Promise((resolve, reject) => {
      var vm = this
      vm.__getMongoDbConnection(db_name).then((connection) => {
        connection.collection(collection_name).aggregate(params).toArray((err, result) => {
          if (err) {
            __logger.error('lib_mongo.__aggregate, failed', {
              db: db_name,
              collection: collection_name,
              params: params
            })
            reject(err)
          } else {
           __logger.info('lib_mongo.__aggregate, success', {
              db: db_name,
              collection: collection_name,
              params: params
            })
            resolve(result)
          }
        })
      }).catch((connError) => {
        if (connError) {
          reject(connError)
        }
      })
    })
  };

  __insert (db_name, collection_name, document) {
   __logger.info('lib_mongo.__insert, request', { db: db_name, collection: collection_name, document: document })
    return new Promise((resolve, reject) => {
      var vm = this
      vm.__getMongoDbConnection(db_name).then((connection) => {
        connection.collection(collection_name).insertOne(document, { w: 1 }, (err, result) => {
          if (err) {
            __logger.error('lib_mongo.__insert, failed', {
              db: db_name,
              collection: collection_name,
              document: document
            })
            reject(err)
          } else {
           __logger.info('lib_mongo.__insert, success', {
              db: db_name,
              collection: collection_name,
              document: document
            })
            resolve(result)
          }
        })
      }).catch((connError) => {
        if (connError) {
          reject(connError)
        }
      })
    })
  };

  __update (db_name, collection_name, find_params, update_params) {
   __logger.info('lib_mongo.__update, request', { db: db_name, collection: collection_name, params: find_params })
    return new Promise((resolve, reject) => {
      var vm = this
      vm.__getMongoDbConnection(db_name).then((connection) => {
        connection.collection(collection_name).updateMany(find_params, { $set: update_params }, (err, result) => {
          if (err) {
            __logger.error('lib_mongo.__update, failed', {
              db: db_name,
              collection: collection_name,
              params: find_params
            })
            reject(err)
          } else {
           __logger.info('lib_mongo.__update, success', {
              db: db_name,
              collection: collection_name,
              params: find_params
            })
            resolve(result)
          }
        })
      }).catch((connError) => {
        if (connError) {
          reject(connError)
        }
      })
    })
  };

  __updateWithInsert (db_name, collection_name, find_params, update_insert_params) {
   __logger.info('lib_mongo.__updateWithInsert, request', {
      db: db_name,
      collection: collection_name,
      params: find_params
    })
    return new Promise((resolve, reject) => {
      var vm = this
      vm.__getMongoDbConnection(db_name).then((connection) => {
        connection.collection(collection_name).update(find_params, { $set: update_insert_params }, { upsert: true }, (err, result) => {
          if (err) {
            __logger.error('lib_mongo.__updateWithInsert, failed', {
              db: db_name,
              collection: collection_name,
              params: find_params
            })
            reject(err)
          } else {
           __logger.info('lib_mongo.__updateWithInsert, success', {
              db: db_name,
              collection: collection_name,
              params: find_params
            })
            resolve(result)
          }
        })
      }).catch((connError) => {
        if (connError) {
          reject(connError)
        }
      })
    })
  };

  __update_addToSet (db_name, collection_name, find_params, update_params) {
   __logger.info('lib_mongo.__update_addToSet, request', { db: db_name, collection: collection_name, params: find_params })
    return new Promise((resolve, reject) => {
      var vm = this
      vm.__getMongoDbConnection(db_name).then((connection) => {
        connection.collection(collection_name).update(find_params, { $addToSet: update_params }, (err, result) => {
          if (err) {
            __logger.error('lib_mongo.__update_addToSet, failed', {
              db: db_name,
              collection: collection_name,
              params: find_params
            })
            reject(err)
          } else {
           __logger.info('lib_mongo.__update_addToSet, success', {
              db: db_name,
              collection: collection_name,
              params: find_params
            })
            resolve(result)
          }
        })
      }).catch((connError) => {
        if (connError) {
          reject(connError)
        }
      })
    })
  };

  __multiupdate (db_name, collection_name, find_params, update_params) {
   __logger.info('lib_mongo.__multiupdate, request', {
      db: db_name,
      collection: collection_name,
      params: find_params
    })
    return new Promise((resolve, reject) => {
      var vm = this
      vm.__getMongoDbConnection(db_name).then((connection) => {
        connection.collection(collection_name).update(find_params, { $set: update_params }, {
          multi: true,
          upsert: true
        }, (err, result) => {
          if (err) {
            __logger.error('lib_mongo.__multiupdate, failed', {
              db: db_name,
              collection: collection_name,
              params: find_params
            })
            reject(err)
          } else {
           __logger.info('lib_mongo.__multiupdate, success', {
              db: db_name,
              collection: collection_name,
              params: find_params
            })
            resolve(result)
          }
        })
      }).catch((connError) => {
        if (connError) {
          reject(connError)
        }
      })
    })
  };

  __incr (db_name, collection_name, find_params, update_params, update_options) {
   __logger.info('lib_mongo.__incr, request', { db: db_name, collection: collection_name, params: find_params })
    return new Promise((resolve, reject) => {
      var vm = this
      vm.__getMongoDbConnection(db_name).then((connection) => {
        connection.collection(collection_name).updateOne(find_params, update_params, update_options, (err, result) => {
          if (err) {
            __logger.error('lib_mongo.__incr, failed', {
              db: db_name,
              collection: collection_name,
              params: find_params
            })
            reject(err)
          } else {
           __logger.info('lib_mongo.__incr, success', {
              db: db_name,
              collection: collection_name,
              params: find_params
            })
            resolve(result)
          }
        })
      }).catch((connError) => {
        if (connError) {
          reject(connError)
        }
      })
    })
  };

  __push (db_name, collection_name, find_params, push_params, update_params) {
   __logger.info('lib_mongo.__push, request', { db: db_name, collection: collection_name, params: find_params })
    return new Promise((resolve, reject) => {
      var vm = this
      vm.__getMongoDbConnection(db_name).then((connection) => {
        var update_fields = {}
        if (push_params) {
          update_fields.$push = push_params
        }
        if (update_params) {
          update_fields.$set = update_params
        }
        connection.collection(collection_name).update(find_params, update_fields, (err, result) => {
          if (err) {
            __logger.error('lib_mongo.__push, failed', {
              db: db_name,
              collection: collection_name,
              params: find_params
            })
            reject(err)
          } else {
           __logger.info('lib_mongo.__push, success', {
              db: db_name,
              collection: collection_name,
              params: find_params
            })
            resolve(result)
          }
        })
      }).catch((connError) => {
        if (connError) {
          reject(connError)
        }
      })
    })
  };

  __delete (db_name, collection_name, find_params) {
   __logger.info('lib_mongo.__delete, request', { db: db_name, collection: collection_name, params: find_params })
    return new Promise((resolve, reject) => {
      var vm = this
      vm.__getMongoDbConnection(db_name).then((connection) => {
        connection.collection(collection_name).remove(find_params, (err, result) => {
          if (err) {
            __logger.error('lib_mongo.__delete, failed', {
              db: db_name,
              collection: collection_name,
              params: find_params
            })
            reject(err)
          } else {
           __logger.info('lib_mongo.__delete, success', {
              db: db_name,
              collection: collection_name,
              params: find_params
            })
            resolve(result)
          }
        })
      }).catch((connError) => {
        if (connError) {
          reject(connError)
        }
      })
    })
  };

  __eval (db_name, mongo_function, find_param) {
   __logger.info('lib_mongo.__eval, request', { db: db_name, function: mongo_function, params: find_param })
    return new Promise((resolve, reject) => {
      var vm = this
      vm.__getMongoDbConnection(db_name).then((connection) => {
        connection.eval(mongo_function + '(' + find_param + ')', (err, result) => {
          if (err) {
            __logger.error('lib_mongo.__eval, failed', {
              db: db_name,
              function: mongo_function,
              params: find_param
            })
            reject(err)
          } else {
           __logger.info('lib_mongo.__eval, success', {
              db: db_name,
              function: mongo_function,
              params: find_param
            })
            resolve(result)
          }
        })
      }).catch((connError) => {
        if (connError) {
          reject(connError)
        }
      })
    })
  };

  __count (db_name, collection_name, find_params) {
   __logger.info('lib_mongo.__count, request', { db: 'mongo', collection: collection_name, params: find_params })
    return new Promise((resolve, reject) => {
      var vm = this
      vm.__getMongoDbConnection(db_name).then((connection) => {
        connection.collection(collection_name).countDocuments(find_params).then((result) => {
         __logger.info('lib_mongo.__count, success', {
            db: db_name,
            collection: collection_name,
            params: find_params
          })
          resolve(result)
        }).catch(err => {
          __logger.error('lib_mongo.__count, failed', {
            db: db_name,
            collection: collection_name,
            params: find_params
          })
          reject(err)
        })
      }).catch((connError) => {
        if (connError) {
          reject(connError)
        }
      })
    })
  };

  __bulkinsert (db_name, collection_name, data) {
    return new Promise((resolve, reject) => {
      var vm = this
      vm.__getMongoDbConnection(db_name).then((connection) => {
        var bulk = connection.collection(collection_name).initializeUnorderedBulkOp()
        if (data && data.length > 0) {
          data.forEach(element => {
            bulk.find({ destination: element.destination }).upsert().updateOne(element)
          })

          bulk.execute(function (err, result) {
            if (err) {
              reject(err)
            } else {
              resolve(result)
            }
          })
        } else {
          reject('document array empty')
        }
      }).catch((connError) => {
        if (connError) {
          reject(connError)
        }
      })
    })
  }
}

module.exports = new mongoLib()
