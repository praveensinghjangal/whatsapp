/**
 *
 * @author deepak.ambekar [9/28/2017].
 */
var lib_mysql = {};
var mysql = require('mysql');
var config = require('../../config');
var __logger = require('../../lib/logger');

class mysqlLib {
    constructor() {
        __logger.debug("mysqlLib.constructor called.");
        this.connections = {};
        this.connection_status = false;
    }

    init(conn_name) {
        return new Promise((resolve, reject) => {
            var vm = this;
            if (config[conn_name]) {
                vm.connections[conn_name] = {};
                if (!config[conn_name].init) {
                    vm.connections[conn_name].conn = null;
                    __logger.debug("mysqlLib.init mysql[" + conn_name + "] not initialized.");
                    resolve("mysql[" + conn_name + "] connection initialized");
                    return
                }
                const pool = mysql.createPool({
                    connectionLimit: config[conn_name].options.connection_limit,
                    host: config[conn_name].options.host,
                    port: config[conn_name].options.port,
                    user: config[conn_name].options.user,
                    password: config[conn_name].options.password,
                    database: config[conn_name].options.database,
                    acquireTimeout: config[conn_name].options.acquireTimeout || 10 * 1000,
                    multipleStatements: true
                });
                setTimeout(() => {
                    __logger.info('mysqlLib.init connecting with mysql', { conn_name: conn_name, host: config[conn_name].options.host });
                    pool.getConnection((err, connection) => {
                        if (err) {
                            __logger.error('mysqlLib.init connection failed with mysql', { conn_name: conn_name, host: config[conn_name].options.host, err: err });
                            reject("mysql[" + conn_name + "] connection failed");
                        }
                        else {
                            __logger.info('mysqlLib.init connection established with mysql', { conn_name: conn_name, host: config[conn_name].options.host });
                            connection.release();
                            vm.connections[conn_name].conn = pool;
                            resolve("mysql[" + conn_name + "] connected.");
                        }
                    });
                }, 1000);
            }
            else {
                __logger.error("mysqlLib.init mysql[" + conn_name + "] connection is not define in config.");
                reject("mysql[" + conn_name + "] connection not define");
            }
        })
    };

    close(conn_name) {
        return new Promise((resolve, reject) => {
            if (config[conn_name] && config[conn_name].init) {
                __logger.warn('mysqlLib.close, connection close', { host: config[conn_name].options.host, conn_name: conn_name });
                this.connections[conn_name].conn.end();
                resolve("mysql[" + conn_name + "]connection closed.");
            }
            else
                resolve(null);
        });
    }

    isSelectQuery(query) {
        if (query) {
            var trimQuery = query.trim().toLowerCase();
            if (trimQuery.indexOf('select') == 0) {
                return true;
            }
        }
        return false;
    }

    query(conn_name, query_string, query_param) {
        return new Promise((resolve, reject) => {
            var vm = this;
            __logger.debug('mysqlLib.query request::', { conn_name: conn_name, host: (config[conn_name] && config[conn_name].options && config[conn_name].options.host), query: query_string.substr(0, 50) });
            if (config[conn_name] && config[conn_name].init) {
                if (vm.connections[conn_name] && vm.connections[conn_name].conn) {
                    vm.connections[conn_name].conn.getConnection((err, connection) => {
                        if (err) {
                            __logger.error('mysqlLib.query connection failed with mysql', { conn_name: conn_name, host: config[conn_name].options.host, err: err });
                            reject('mysql connection failed');
                        }
                        else {
                            if (config[conn_name].is_slave && !vm.isSelectQuery(query_string)) {
                                __logger.error("mysqlLib.query slave support only select query:", { conn_name: conn_name, host: config[conn_name].options.host, query: query_string.substr(0, 30) });
                                reject("slave support only select query");
                            }
                            const sql = connection.query(query_string, query_param, (err, result) => {
                                connection.release();
                                if (err) {
                                    __logger.error('mysqlLib.query error in query ::', { err_code: err.code, err_msg: err.sqlMessage, conn_name: conn_name, host: (config[conn_name].options && config[conn_name].options.host), query: sql.sql });
                                    reject(err);
                                } else {
                                    __logger.debug('mysqlLib.query success ::', { conn_name: conn_name, host: (config[conn_name].options && config[conn_name].options.host) });
                                    resolve(result);
                                }
                            }
                            );
                        }
                    });
                }
                else {
                    __logger.error("mysqlLib.query mysql[" + conn_name + "] not initialized.");
                    reject("mysql[" + conn_name + "] connection not initialized");
                }
            }
            else {
                __logger.error("mysqlLib.query mysql[" + conn_name + "] connection is not define in config.");
                reject("mysql[" + conn_name + "] connection not define");
            }
        });
    }
}
module.exports = new mysqlLib();