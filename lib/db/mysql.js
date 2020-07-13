/**
 *
 * @author deepak.ambekar [9/28/2017].
 */
var mysql = require('mysql')
var config = require('../../config')
var __logger = require('../../lib/logger')

class MysqlLib {
  constructor () {
    __logger.debug('mysqlLib.constructor called.')
    this.connections = {}
    this.connection_status = false
  }

  init (connName) {
    return new Promise((resolve, reject) => {
      var vm = this
      if (config[connName]) {
        vm.connections[connName] = {}
        if (!config[connName].init) {
          vm.connections[connName].conn = null
          __logger.debug('mysqlLib.init mysql[' + connName + '] not initialized.')
          return resolve('mysql[' + connName + '] connection initialized')
        }
        const pool = mysql.createPool({
          connectionLimit: config[connName].options.connection_limit,
          host: config[connName].options.host,
          port: config[connName].options.port,
          user: config[connName].options.user,
          password: config[connName].options.password,
          database: config[connName].options.database,
          acquireTimeout: config[connName].options.acquireTimeout || 10 * 1000,
          multipleStatements: true,
          timezone: config[connName].options.timezone
        })
        setTimeout(() => {
          __logger.info('mysqlLib.init connecting with mysql', { conn_name: connName, host: config[connName].options.host })
          pool.getConnection((err, connection) => {
            if (err) {
              __logger.error('mysqlLib.init connection failed with mysql', { conn_name: connName, host: config[connName].options.host, err: err })
              return reject('mysql[' + connName + '] connection failed')
            } else {
              __logger.info('mysqlLib.init connection established with mysql', { conn_name: connName, host: config[connName].options.host })
              connection.release()
              vm.connections[connName].conn = pool
              return resolve('mysql[' + connName + '] connected.')
            }
          })
        }, 1000)
      } else {
        __logger.error('mysqlLib.init mysql[' + connName + '] connection is not define in config.')
        return reject('mysql[' + connName + '] connection not define')
      }
    })
  };

  close (connName) {
    return new Promise((resolve, reject) => {
      if (config[connName] && config[connName].init) {
        __logger.warn('mysqlLib.close, connection close', { host: config[connName].options.host, conn_name: connName })
        this.connections[connName].conn.end()
        return resolve('mysql[' + connName + ']connection closed.')
      } else { return resolve(null) }
    })
  }

  isSelectQuery (query) {
    if (query) {
      var trimQuery = query.trim().toLowerCase()
      if (trimQuery.indexOf('select') === 0) {
        return true
      }
    }
    return false
  }

  query (connName, queryString, queryParam) {
    return new Promise((resolve, reject) => {
      var vm = this
      __logger.debug('mysqlLib.query request::', { conn_name: connName, host: (config[connName] && config[connName].options && config[connName].options.host), query: queryString.substr(0, 50) })
      if (config[connName] && config[connName].init) {
        if (vm.connections[connName] && vm.connections[connName].conn) {
          vm.connections[connName].conn.getConnection((err, connection) => {
            if (err) {
              __logger.error('mysqlLib.query connection failed with mysql', { conn_name: connName, host: config[connName].options.host, err: err })
              return reject('mysql connection failed')
            } else {
              if (config[connName].is_slave && !vm.isSelectQuery(queryString)) {
                __logger.error('mysqlLib.query slave support only select query:', { conn_name: connName, host: config[connName].options.host, query: queryString.substr(0, 30) })
                return reject('slave support only select query')
              }
              const sql = connection.query(queryString, queryParam, (err, result) => {
                // console.log('wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww', sql.sql)
                connection.release()
                if (err) {
                  __logger.error('mysqlLib.query error in query ::', { err_code: err.code, err_msg: err.sqlMessage, conn_name: connName, host: (config[connName].options && config[connName].options.host), query: sql.sql })
                  return reject(err)
                } else {
                  __logger.debug('mysqlLib.query success ::', { conn_name: connName, host: (config[connName].options && config[connName].options.host) })
                  return resolve(result)
                }
              }
              )
            }
          })
        } else {
          __logger.error('mysqlLib.query mysql[' + connName + '] not initialized.')
          return reject('mysql[' + connName + '] connection not initialized')
        }
      } else {
        __logger.error('mysqlLib.query mysql[' + connName + '] connection is not define in config.')
        return reject('mysql[' + connName + '] connection not define')
      }
    })
  }
}
module.exports = new MysqlLib()
