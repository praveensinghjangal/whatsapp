var jwt = require('jsonwebtoken');
var util = require('../../../lib/util');
var jwt = require('jsonwebtoken');
var __logger = require('../../../lib/logger');
var pass_mgmt = require("../../../lib/util/password_mgmt");
var __db = require('../../../lib/db');
var fs = require('fs');
var __config = require('../../../config');
const uuid4 = require('uuid4');
const db_helper = require("../../../lib/util/db_helpers");
const __util = require('../../../lib/util');
const __define = require('../../../config/define');
const __user_dbo = require('./dbo');

user_func = {};

user_func.get_user = (req, res) => {
    __util.make_log_statement(req, "get_user");
    var user_id = req.params.user_id
    // console.log(req.user_config)
    // let user_id = req.user_config.user_id  || null;
    // console.log(req.user_config)
    let sql_param = [user_id];
    let sql_query = "select u.first_name, u.last_name, u.username, u.status, u.email_id, u.mobile_number, u.company_name, u.industry, u.otp_purpose, u.registered, u.lead_checked, u.status, u.user_type from `HELO-OTP` u where u.user_id like ?";

    if (req.query.search !== '' && req.query.search !== undefined) {
        if(sql_query.includes("where")) {
            sql_query += " and ";
        } else {
            sql_query += " where ";
        }
        sql_query += ' username like ? ';
        sql_param.push(req.query.search)
    }
    if ((req.query.sort_by_columns !== '' && req.query.sort_by_columns !== undefined) && (req.query.sort_way !== '' && req.query.sort_way !== undefined )) {
        sql_query += ' order by ' + req.query.sort_by_columns + ' ' + req.query.sort_way;
    }
    if ((req.query.limit !== '' && req.query.limit !== undefined) || (req.query.offset !== '' && req.query.offset !== undefined)) {
        sql_query += ' limit ' + req.query.limit + ' offset ' + req.query.offset;
    }

    __db.mysql.query("mysql_user_local_db", sql_query, sql_param).then((results) => {
        if (results.length === 0) {
            __util.send(res, {
                type: __define.RESPONSE_MESSAGES.NOT_FOUND,
                data: { message: "no such user found" }
            })
        } else {
            __util.send(res, {
                type: __define.RESPONSE_MESSAGES.SUCCESS,
                data: results
            })
        }
    }).catch(err => {
        __logger.error("error: ", err);
        __util.send(res, {
            type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
            data: {"message": "Please contact administrator"}
        });
    });
};

user_func.create_user = (req, res) => {
    __util.make_log_statement(req, "create_user");
    if(!req.body.username) {
        return __util.send(res, {
            type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
            data: { message: "username not provided" }
        });
    } else if(!req.body.first_name) {
        return __util.send(res, {
            type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
            data: { message: "firstname not provided" }
        });
    } else if(!req.body.last_name) {
        return __util.send(res, {
            type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
            data: { message: "lastname not provided" }
        });
    } else if(!req.body.password) {
        return __util.send(res, {
            type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
            data: { message: "password not provided" }
        });
    } else if(!req.body.mobile_number) {
        return __util.send(res, {
            type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
            data: { message: "Mobile number not provided" }
        });
    } else if(!req.body.company_name) {
        return __util.send(res, {
            type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
            data: { message: "company name not provided" }
        });
    } else if(!req.body.otp_purpose) {
        return __util.send(res, {
            type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
            data: { message: "otp_type not mentioned" }
        });
    }

    const user_id = uuid4();
    const username = req.body.username;
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const email = req.body.email;
    const mobile_number = req.body.mobile_number;
    const company_name = req.body.company_name;
    const industry = req.body.industry;
    const otp_purpose = req.body.otp_purpose;
    const password = req.body.password;
    var created_at = new Date();
    var modified_at = new Date();   
    var status = "active";
    var registered = 'Y'
    var package_selected = 'Demo';
    var user_type = 'normal';
    const salt_key = pass_mgmt.genRandomString(16);
    const hash_password = pass_mgmt.create_hash_of_password(password, salt_key)['passwordHash'];

    __db.mysql.query("mysql_user_local_db", "insert into users (user_id, username, first_name, last_name, email_id,mobile_number,company_name, industry, otp_purpose, status, hash_password, saltkey, created_at, modified_at, package_selected, registered, user_type) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", [user_id,username, first_name, last_name,email,mobile_number,company_name,industry, otp_purpose,status, hash_password, salt_key, created_at,modified_at, package_selected, registered,user_type]).then((results) => {
        // console.log(results)
        __util.send(res, {
            type: __define.RESPONSE_MESSAGES.SUCCESS,
            data: { message: "User created successfully", "user_id": user_id }
        })
    }).catch(err => {
        console.log(err)
        if(err.code === "ER_DUP_ENTRY") {
            return __util.send(res, {
                type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
                data: { message: "Username/email already exists" }
            });
        } else {
            __logger.error("error: ", err);
            return __util.send(res, {
                type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
                data: { message: "Problem while creating new user" }
            });
        }
    });
};

user_func.update_user = (req, res) => {
    __util.make_log_statement(req, "update_user");
    if(!req.body.user_id) {
        return __util.send(res, {
            type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
            data: { message: "user_id not provided" }
        });
    }
    let user_id = req.body.user_id;
    delete req.body.user_id;
    let restrict_field_update = ["user_id", "username", "hash_password", "saltkey"];
    let set_command = db_helper.get_set_command_for_update(req.body, restrict_field_update);
    let query_param = [user_id];

    __db.mysql.query("mysql_user_local_db", 'update users set ' + set_command + ' where user_id=?', query_param).then((results) => {
        __util.send(res, {
            type: __define.RESPONSE_MESSAGES.SUCCESS,
            data: { message: "Data updated successfully", "user_id": user_id }
        })
    }).catch(err => {
        if(err.code === "ER_DUP_ENTRY") {
            return __util.send(res, {
                type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
                data: { message: "User name already exists" }
            });
        } else {
            __logger.error("error: ", err);
            console.log(err)
            return __util.send(res, {
                type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
                data: { message: "Problem while updating User" }
            });
        }
    });
};

user_func.deactivate_user = (req, res) => {
    __util.make_log_statement(req, "deactivate_user");
    let user_id = req.body.user_id;
    let query_param = [user_id];

    __db.mysql.query("mysql_user_local_db", 'update users set status="inactive" where user_id=?', query_param).then((results) => {
        __util.send(res, {
            type: __define.RESPONSE_MESSAGES.SUCCESS,
            data: { message: "User deactivated successfully", "user_id": user_id }
        })
    }).catch(err => {
        __logger.error("error: ", err);
        return __util.send(res, {
            type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
            data: { message: "Problem while updating User" }
        });
    });
};

user_func.activate_user = (req, res) => {
    __util.make_log_statement(req, "activate_user");
    if(!req.body.user_id) {
        return __util.send(res, {
            type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
            data: { message: "user_id not provided" }
        });
    }
    let user_id = req.body.user_id;
    let query_param = [user_id];

    __db.mysql.query("mysql_user_local_db", 'update users set status="active" where user_id=?', query_param).then((results) => {
        __util.send(res, {
            type: __define.RESPONSE_MESSAGES.SUCCESS,
            data: { message: "User activated successfully", "user_id": user_id }
        })
    }).catch(err => {
        __logger.error("error: ", err);
        return __util.send(res, {
            type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
            data: { message: "Problem while updating User" }
        });
    });
};

user_func.get_user_config = (req, res) => {
    __util.make_log_statement(req, "get_user_config");
    __util.send(res, {
        type: __define.RESPONSE_MESSAGES.SUCCESS,
        data: req.user_config
    });
}




// route_func.login = (req, res) => {
//     __util.make_log_statement(req, "login");
//     if (req.body.username && req.body.password) {
//         var username = req.body.username;
//         var password = req.body.password;
//     }

//     __db.mysql.query("mysql_user_local_db", "select u.user_id,u.email_id as email,  u.hash_password as hash_password, u.saltkey as saltkey from users u where username like ?;", [username]).then((results) => {
//         console.log(results, "==============")
//         if (results.length === 0) {
//             __util.send(res, {
//                 type: __define.RESPONSE_MESSAGES.NOT_AUTHORIZED,
//                 data: { message: "no such user found" }
//             });
//         } else {
//             const hash_password = pass_mgmt.create_hash_of_password(password, results[0]['saltkey'].toLowerCase());
//             if(hash_password['passwordHash'] !== results[0]['hash_password'].toLowerCase()) {
//                 __util.send(res, {
//                     type: __define.RESPONSE_MESSAGES.NOT_AUTHORIZED,
//                     data: { message: "no such user found" }
//                 });
//             }
//             if(results[0]['status'] === 'inactive') {
//                 __util.send(res, {
//                     type: __define.RESPONSE_MESSAGES.ACCESS_DENIED,
//                     data: { message: "User is disabled, please contact administrator" }
//                 })
//             } 

//             const user_data = results[0];
//             const payload = { user_id: user_data.user_id, username: username , email: user_data.email};
//             const token = jwt.sign(payload, __config.jwt_secret_key);
//             __util.send(res, {
//                 type: __define.RESPONSE_MESSAGES.SUCCESS,
//                 data: {token: token}
//             })
//         }
//     }).catch(err => {
//         __logger.error("error: ", err);
//         __util.send(res, {
//             type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
//             data: {"message": "Please contact administrator"}
//         });
//     });
// };

// route_func.create_user = async (req, res) => {
//     __util.make_log_statement(req, "create_user");

//     const parent_user_id = req.user_config.user_id || null;
//     const parent_username = req.user_config.username || null;

//     if(!req.body.username) {
//         return __util.send(res, {
//             type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
//             data: { message: "username not provided" }
//         });
//     } else if(!req.body.firstname) {
//         return __util.send(res, {
//             type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
//             data: { message: "firstname not provided" }
//         });
//     } else if(!req.body.lastname) {
//         return __util.send(res, {
//             type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
//             data: { message: "lastname not provided" }
//         });
//     } else if(!req.body.password) {
//         return __util.send(res, {
//             type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
//             data: { message: "password not provided" }
//         });
//     }

//     const user_id = uuid4();
//     const username = req.body.username;
//     const firstname = req.body.firstname;
//     const lastname = req.body.lastname;
//     const password = req.body.password;
//     const role = new_role;
//     const role_displayname = new_role;

//     if(!company_id) { // INFO: This is for support user.
//         const company_id = req.body.company_id;
//     }

//     const status = "active";
//     const password_salt = pass_mgmt.genRandomString(16);
//     const hash_password = pass_mgmt.create_hash_of_password(password, password_salt)['passwordHash'];

//     __db.mysql.query("mysql_user_local_db", "insert into user (user_id, username, firstname, lastname, role, role_displayname, company_id, status, hash_password, saltkey, parent_user_id) values (?, ?, ?, ?, ?, ?, ?, ?, UNHEX(?), UNHEX(?), ?)", [user_id, username, firstname, lastname, role, role_displayname, company_id, status, hash_password, salt_key, parent_user_id]).then((results) => {
//         __util.send(res, {
//             type: __define.RESPONSE_MESSAGES.SUCCESS,
//             data: { message: "User created successfully", "user_id": user_id }
//         })
//     }).catch(err => {
//         if(err.code === "ER_DUP_ENTRY") {
//             return __util.send(res, {
//                 type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
//                 data: { message: "Username already exists" }
//             });
//         } else {
//             __logger.error("error: ", err);
//             return __util.send(res, {
//                 type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
//                 data: { message: "Problem while creating new user" }
//             });
//         }
//     });
// };

// route_func.change_password = (req, res) => {
//     __util.make_log_statement(req, "change_password");
//     let current_password = req.body.current_password;
//     let new_password = req.body.new_password;
//     if(!current_password) {
//         return __util.send(res, {
//             type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
//             data: { message: "Current Password is required" }
//         });
//     }
//     if(!new_password) {
//         return __util.send(res, {
//             type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
//             data: { message: "New Password is required" }
//         });
//     }
//     let company_id = req.body.company_id || null;
//     let user_id = req.body.user_id || null;

//     const saltkey = pass_mgmt.genRandomString(16);
//     const hash_password = pass_mgmt.create_hash_of_password(new_password, saltkey)['passwordHash'];

//     query_param = [hash_password, saltkey, user_id, company_id];
//     // TODO: Need to authenticate current_password of the user, before allowing for password change.
//     __db.mysql.query("mysql_user_db", 'update user set hash_password=UNHEX(?), saltkey=UNHEX(?) where user_id=? and company_id=?', query_param).then((results) => {
//         __util.send(res, {
//             type: __define.RESPONSE_MESSAGES.SUCCESS,
//             data: { message: "Password updated successfully"}
//         })
//     }).catch(err => {
//         __logger.error("error: ", err);
//         return __util.send(res, {
//             type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
//             data: { message: "Problem while updating user" }
//         });
//     });
// };


module.exports = user_func;
