const pg = require('pg')
const config = require('../../config')
const __logger = require('../logger')

let pool = {}

const createPool = () => {
  const __m = 'lib_postgresql.init'
  pool = new pg.Pool(config.postgresql.options)
  pool.on('error', function (err, client) {
    __logger.error('client error::', { m: __m, host: config.postgresql.options.host, err_msg: err.message, err_stack: err.stack })
  })
}

function close () {
  return new Promise((resolve, reject) => {
    // let deferred = q.defer()
    if (config.postgresql.init && pool) {
      pool.end()
      //   return deferred.resolve(null)
      return resolve(null)
    } else {
    //   deferred.reject(null)
      return resolve(null)
    }
    // return deferred.promise
  })
}

function init () {
  return new Promise((resolve, reject) => {
    if (!config.postgresql.init) {
      pool = null
      return reject(null)
    } else {
      createPool()
      return resolve(true)
    }
  })
}

const reloadPool = function () {
  try {
    pool.end()
  } catch (error) {
    __logger.info('pool already closed')
  } finally {
    createPool()
  }
}

function __query (qry, value) {
  return new Promise((resolve, reject) => {
    // let deferred = q.defer()
    if (!qry || !value) {
      // deferred.reject('No Query Found')
      return reject('invalid input')
      //   return deferred.promise
    }

    if (pool.ending) { createPool() }
    pool.connect()
      .then(client => {
        client.query("SET statement_timeout = '1800s';")
        client.query(qry, value)
          .then((res) => {
            client.release()
            // deferred.resolve(res)

            // __logger.info('Querry result postgres', res)
            return resolve(res)
          })
          .catch(e => {
            client.release()
            __logger.info('Error in query', e.message)
            // deferred.reject(e)
            return reject(e)
          })
      }).catch(e => {
        __logger.error('query error out', e.message, e.stack)
        reloadPool()
        // deferred.reject(e)
        return reject(e)
      })
    // return deferred.promise
  })
}

module.exports = { __query, init, close }
