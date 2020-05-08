const util = require('../../../lib/util');
const jwt = require('jsonwebtoken');
const __logger = require('../../../lib/logger');
const pass_mgmt = require("../../../lib/util/password_mgmt");
const __db = require('../../../lib/db');
const __config = require('../../../config');
const __util = require('../../../lib/util');
const __define = require('../../../config/define');
const _ = require('lodash');

route_func = {};

route_func.login = (req, res) => {
    __util.make_log_statement(req, "login");
    if (req.body.username && req.body.password) {
        var username = req.body.username;
        var password = req.body.password;
    }

    __db.mysql.query("mysql_user_local_db", "select u.user_id, u.status as user_status, u.hash_password as hash_password, u.saltkey as saltkey from users u where BINARY username like ?;", [username]).then((results) => {
        if (results.length === 0) {
            __logger.error(':Authentication:: Login API: User not found')
            __util.send(res, {
                type: __define.RESPONSE_MESSAGES.NOT_FOUND,
                data: { message: "No such user found" }
            });
        } else {
            const hash_password = pass_mgmt.create_hash_of_password(password, results[0]['saltkey'].toLowerCase());
            if (hash_password['passwordHash'] !== results[0]['hash_password'].toLowerCase()) {
                __logger.error(':Authentication:: Login API: wrong password')
                __util.send(res, {
                    type: __define.RESPONSE_MESSAGES.NOT_FOUND,
                    data: { message: "wrong password" }
                });
            }
            
            const user_data = results[0];
            const payload = { user_id: user_data.user_id, username: username};
            const token = jwt.sign(payload, __config.jwt_secret_key);
            __util.send(res, {
                type: __define.RESPONSE_MESSAGES.SUCCESS,
                data: { token: token, user_id: user_data.user_id }
            })
        }
    }).catch(err => {
        __logger.error("error: ", err);
        __util.send(res, {
            type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
            data: { "message": "Please contact administrator" }
        });
    });
};

route_func.get_country = (req, res) => {
    __util.make_log_statement(req, "get_country");
    __db.mysql.query("mysql_user_local_db", "select u.name from countries u;").then((results) => {
        if (results) {
            var countries = _.map(results, "name");
            __util.send(res, {
                type: __define.RESPONSE_MESSAGES.SUCCESS,
                data: { countries, status: true }
            })
        } else {
            __util.send(res, {
                type: __define.RESPONSE_MESSAGES.NOT_AUTHORIZED,
                data: { message: "Error in fetching countries" }
            });
        };
    });
};

route_func.get_industry = (req, res) => {
    __util.make_log_statement(req, "get_industry");
    __db.mysql.query("mysql_user_local_db", "select u.name from Industry u;").then((results) => {
        if (results) {
            var industries = _.map(results, "name");
            __util.send(res, {
                type: __define.RESPONSE_MESSAGES.SUCCESS,
                data: { industries, status: true }
            })
        } else {
            __logger.error('Authentication:: Error in fetching countries ')
            __util.send(res, {
                type: __define.RESPONSE_MESSAGES.NOT_AUTHORIZED,
                data: { message: "Error in feting industries" }
            });
        };
    });
};

route_func.get_otp_purpose = (req, res) => {
    __util.make_log_statement(req, "get_otp_purpose");
    __db.mysql.query("mysql_user_local_db", "select u.purpose from otp_purpose u;").then((results) => {
        if (results) {
            var otp_purpose = _.map(results, "purpose");
            __util.send(res, {
                type: __define.RESPONSE_MESSAGES.SUCCESS,
                data: { otp_purpose, status: true }
            })
        } else {
            __util.send(res, {
                type: __define.RESPONSE_MESSAGES.NOT_AUTHORIZED,
                data: { message: "Error in fetching otp purpose" }
            });
        };
    });
};

route_func.check_username = (req, res) => {
    __util.make_log_statement(req, "check_username");
    
    if (req.query.username) {
        var username = req.query.username;
        __db.mysql.query("mysql_user_local_db", "select u.username from users u where BINARY username like ?;",[username]).then((results) => {
            if(results.length === 0) {
                __util.send(res, {
                    type: __define.RESPONSE_MESSAGES.SUCCESS,
                    data: { results: username }
                })
            }
            else {
                __util.send(res, {
                    type: __define.RESPONSE_MESSAGES.USERNAME_EXIT,
                    data: { message: "Username already exist" }
                });
            };
        });
    } else {
        __util.send(res, {
            type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
            data: { "error": "username required" }
        });
    };
};

route_func.check_email = (req, res) => {
    __util.make_log_statement(req, "check_email");
    if (req.query.email_id) {
        var email_id = req.query.email_id;
        __db.mysql.query("mysql_user_local_db", "select u.email_id from users u where email_id like ?;",[email_id]).then((results) => {
            if(results.length === 0) {
                __util.send(res, {
                    type: __define.RESPONSE_MESSAGES.NOT_FOUND,
                    data: {message: "Email not found" }
                })
            }
            else {
                var result = results[0].email_id;
                __util.send(res, {
                    type: __define.RESPONSE_MESSAGES.SUCCESS,
                    data: { result }
                });
            };
        });
    } else {
        __util.send(res, {
            type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
            data: { "error": "email required" }
        });
    };
};

module.exports = route_func;


// if (results[0]['company_status'] === 'inactive') {
            //     __util.send(res, {
            //         type: __define.RESPONSE_MESSAGES.ACCESS_DENIED,
            //         data: { message: "Company is disabled, please contact administrator" }
            //     })
            // } else if (results[0]['company_status'] === "inactive") {
            //     __util.send(res, {
            //         type: __define.RESPONSE_MESSAGES.ACCESS_DENIED,
            //         data: { message: "User is disabled, please contact administrator" }
            //     })
            // }