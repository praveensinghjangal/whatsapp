var __db = require("../../lib/db");
var __logger = require('../../lib/logger');
var _ = require("lodash");
var __define = require('../../config/define');

custom_func = {};
SQL_QUERIES = {
    // "get_user_role_modules": `SELECT
    //         rm.module_id,
    //         m.module_name,
    //         rm.read_permission,
    //         rm.write_permission,
    //         r.name,
    //         r.role_id,
    //         rm.role_id
    //     FROM
    //         role r
    //         INNER JOIN user u
    //          ON r.role_id = u.role
    //         INNER JOIN role_module_mapping rm
    //          ON r.role_id = rm.role_id
    //         INNER JOIN modules m
    //          ON rm.module_id = m.module_id
    //     WHERE
    //         u.user_id = ?`,
    // "get_role": "SELECT r.name, r.displayname FROM user u INNER JOIN role r on r.role_id=u.role WHERE u.user_id=?",
    "get_user_info": "SELECT u.username, u.status, u.firstname, u.lastname from user u where u.user_id=?"
}


async function execute_mysql_query(sql_query, sql_param) {
    get_result = await __db.mysql.query("mysql_user_db", sql_query, sql_param);
    // if(get_result) {
        return Promise.resolve(get_result);
    // } else {
    //     return Promise.reject(get_result);
    // }

}

async function get_more_user_info(user_id) {
    // module_permissions_result = await execute_mysql_query(SQL_QUERIES['get_user_role_modules'], [user_id]);
    // role_result = await execute_mysql_query(SQL_QUERIES['get_role'], [user_id]);
    user_info_result = await execute_mysql_query(SQL_QUERIES['get_user_info'], [user_id]);
    if(user_info_result.length > 0) {
        username = user_info_result[0]['username'];
        status = user_info_result[0]['status'];
    }

    return Promise.resolve({username, user_id})
}

create_user_config = (user_id) => {
    return new Promise((resolve, reject) => {
        get_more_user_info(user_id).then((results) => {
            __logger.debug("", results);
            data = {user_id: user_id};
            merged_data = _.merge(data, results);
            resolve(merged_data)
        }).catch(err => {
            __logger.error("error: ", err);
            resolve({user_id: user_id, role_name: "admin"});
        });
    });
};

custom_func.get_set_user_config = (req, res, next) => {
    console.log(req.user)
    var user_id = req.user['user_id'];
    var redis_key_name = "user_config_" + user_id;
    __db.redis.get(redis_key_name).then((result) => {
        if(!result) {
            create_user_config(user_id).then((user_config_result) => {
                if(user_config_result['user_id'] === "640f11ee-1cc2-4e50-a1cf-c22b3b8cd1de") {
                    user_config_result['user_id'] = undefined;
                }
                req.user_config = user_config_result;
                __db.redis.setex(redis_key_name, JSON.stringify(user_config_result), 300).then((result) => {
                    next()
                }).catch(err => {
                    __logger.error("error: ", err);
                    next()
                })
            })
        } else {
            req.user_config = JSON.parse(result);
            next()
        }
    }).catch(err => {
        __logger.error("error: ", err);
        next()
    })
};



module.exports = custom_func;
