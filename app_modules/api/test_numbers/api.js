var util = require('../../../lib/util');
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
var async = require('async');

test_numbers_func = {};

test_numbers_func.create_test_numbers = async (req, res) => {
    if (!req.query.user_id || req.query.user_id == null) {
        __util.send(res, {
            type: __define.RESPONSE_MESSAGES.ACCESS_DENIED,
            data: { "message": "user_id required to continue" }
        });
    }
    if (!req.body.mobile_number || req.body.mobile_number == null) {
        __util.send(res, {
            type: __define.RESPONSE_MESSAGES.ACCESS_DENIED,
            data: { "message": "mobile number required to continue" }
        });
    }

    var user_id = req.query.user_id;
    var row_number = req.query.row_number;
    var access = false
    var checkuser_sql_query = "select * from users where user_id like ?";
    var checkuser_sql_param = [user_id];
    var checkuser = await __db.mysql.query("mysql_user_local_db", checkuser_sql_query, checkuser_sql_param)
    try {
        if (checkuser.length == 0) {
            access = false;
        } else {
            access = true;
        }

    } catch (e) {
        __util.send(res, {
            type: __define.RESPONSE_MESSAGES.NOT_FOUND,
            data: { message: "something went wrong" }
        })
    }

    if(access) {
        var otp_sent = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
        var mobile_number = req.body.mobile_number;
        var test_number_id = uuid4();
        var mobile_verified = 'N'
        let query_param = [row_number, user_id];
        let sql_query = "select * from helootplocal.test_numbers where row_number = ? and user_id = ?"
        __db.mysql.query("mysql_user_local_db", sql_query, query_param).then((results) => {
            if(results.length == 0) {
                let insertion_query = "insert into helootplocal.test_numbers(test_number_id, mobile_number,otp_sent,mobile_verified,user_id,row_number) values(?,?,?,?,?,?)";
                let insertion_param = [test_number_id,mobile_number,otp_sent,mobile_verified,user_id,row_number];
                __db.mysql.query("mysql_user_local_db", insertion_query, insertion_param).then((results) => {
                    __util.send(res, {
                        type: __define.RESPONSE_MESSAGES.SUCCESS,
                         // for tesing
                        data: { otp_sent: otp_sent ,message: "otp sent successfully", "test_number_id": test_number_id }
                    })
                }).catch(err => {
                    __logger.error("error: ", err);
                    return __util.send(res, {
                        type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
                        data: { message: "Problem while sending otp" }
                    });
            
                });
            } else {
                let update_query = "update test_numbers set mobile_number = ?, otp_sent = ? where row_number = ? and user_id = ?";
                let update_params = [mobile_number,otp_sent,row_number, user_id];
                __db.mysql.query("mysql_user_local_db", update_query, update_params).then((results) => {
                    __util.send(res, {
                        type: __define.RESPONSE_MESSAGES.SUCCESS,
                        // for testing
                        data: {otp_sent: otp_sent , message: "otp sent successfully", "test_number_id": test_number_id }
                    })
                }).catch(err => {
                    __logger.error("error: ", err);
                    return __util.send(res, {
                        type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
                        data: { message: "Problem while sending otp" }
                    });
            
                });
            }      
        }).catch(err => {
            __logger.error("error: ", err);
            return __util.send(res, {
                type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
                data: { message: "Problem while sending otp" }
            });
    
        });
    } else {
        __util.send(res, {
            type: __define.RESPONSE_MESSAGES.ACCESS_DENIED,
            data: { "message": "You dont have permission" }
        })
    }
};


test_numbers_func.verify_otp = async (req, res) => {
    if (!req.query.user_id || req.query.user_id == null) {
        __util.send(res, {
            type: __define.RESPONSE_MESSAGES.ACCESS_DENIED,
            data: { "message": "user_id required to continue" }
        });
    };

    var user_id = req.query.user_id;
    var otp_sent = req.body.otp_sent;
    var row_number = req.query.row_number;
    var checkuser_sql_query = "select * from users where user_id like ?";
    var checkuser_sql_param = [user_id];
    var checkuser = await __db.mysql.query("mysql_user_local_db", checkuser_sql_query, checkuser_sql_param)
    try {
        if (checkuser.length == 0) {
            access = false;
        } else {
            access = true;
        }

    } catch (e) {
        __util.send(res, {
            type: __define.RESPONSE_MESSAGES.NOT_FOUND,
            data: { message: "something went wrong" }
        })
    };

    if(access) {
        var sql_query = "select * from helootplocal.test_numbers where row_number = ? and user_id = ?";
        var query_param =  [row_number,user_id]
        __db.mysql.query("mysql_user_local_db", sql_query, query_param).then((results) => {
            if(results.length != 0 ) {
                if(results[0].otp_sent == otp_sent) {
                    __db_verify_mobile(row_number)
                   res.send({
                       code: 2000,
                       status: true,
                    //    verified: true
                      data: { message: 'successfully verified', verified: true }
                   })
                } else {
                    __util.send(res, {
                        type: __define.RESPONSE_MESSAGES.NOT_FOUND,
                        data: { message: "wrong otp",verified: false}
                        // verified: false
                    });
                }
               
            } else {
                __util.send(res, {
                    type: __define.RESPONSE_MESSAGES.NOT_FOUND,
                    // verified: false
                    data: { message: "wrong otp" ,verified: false}
                });
            }
        }).catch(err => {
            __logger.error("error: ", err);
            return __util.send(res, {
                type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
                data: { message: "Problem while sending otp" }
            });
    
        });
    } else {
        __util.send(res, {
            type: __define.RESPONSE_MESSAGES.ACCESS_DENIED,
            data: { "message": "You dont have permission" }
        })
    }

};

async function __db_verify_mobile(row_number) {
    var sql_query = "update test_numbers set mobile_verified = 'Y' WHERE row_number = ?" 
    var sql_param = [row_number];
    var result = await __db.mysql.query("mysql_user_local_db", sql_query, sql_param).then((results) => {})
    if(result) {
        __logger.debug("test_numbers::updated mobile_verified")
    } else {
        __logger.error("test_numbers::error in updating data")
    }
};

test_numbers_func.reset_number = (req, res) => {
    if (!req.query.user_id || req.query.user_id == null) {
        __util.send(res, {
            type: __define.RESPONSE_MESSAGES.ACCESS_DENIED,
            data: { "message": "user_id required to continue" }
        });
    };

    var row_number = req.query.row_number;
    var sql_query = "update test_numbers set mobile_verified= 'N' where row_number = ?";
    var query_param = [row_number];
    __db.mysql.query("mysql_user_local_db", sql_query, query_param).then((results) => {
        if(results.length != 0) {
            __util.send(res, {
                type: __define.RESPONSE_MESSAGES.SUCCESS,
                data: true
            })
        } else {
            __util.send(res, {
                type: __define.RESPONSE_MESSAGES.ACCESS_DENIED,
                data: { "message": "You dont have permission" }
            })
        }

    })
};

test_numbers_func.reset_all = async (req, res) => {
    if (!req.query.user_id || req.query.user_id == null) {
        __util.send(res, {
            type: __define.RESPONSE_MESSAGES.ACCESS_DENIED,
            data: { "message": "user_id required to continue" }
        });
    };
    var access = false;
    var user_id = req.query.user_id;
    const find_user = await __db.mysql.query("mysql_user_local_db","select * from users where user_id = ?",[user_id]);
    try {
        if(find_user.length !=0) {
            access = true
        }
    } catch(e) {
        console.log(e)
        __util.send(res, {
            type: __define.RESPONSE_MESSAGES.FAILED,
            data: {message: 'unknown exception'}
        })
    }
if(access) {
    var sql_query = "update test_numbers set mobile_verified= 'N' where user_id = ?";
    var query_param = [user_id];
    __db.mysql.query("mysql_user_local_db", sql_query, query_param).then((results) => {
        if(results.length != 0) {
            __util.send(res, {
                type: __define.RESPONSE_MESSAGES.SUCCESS,
                data: true
            })
        } else {
            __util.send(res, {
                type: __define.RESPONSE_MESSAGES.ACCESS_DENIED,
                data: { "message": "You dont have permission" }
            })
        }

    })
} else {
    __util.send(res, {
        type: __define.RESPONSE_MESSAGES.NOT_FOUND,
        data: { "message": "Invalid user" }
    })
}
};


// route_func.create_template = async (req, res) => {
//     __util.make_log_statement(req, "create_template");
//     if (!req.query.user_id || req.query.user_id == null) {
//         __util.send(res, {
//             type: __define.RESPONSE_MESSAGES.ACCESS_DENIED,
//             data: { "message": "user_id required to continue" }
//         });
//     }
//     var user_id = req.query.user_id;
//     var checkuser_sql_query = "select * from helootplocal.users where user_id like?";
//     var checkuser_sql_param = [user_id];

//     async function findUser(checkuser_sql_query, checkuser_sql_param) {
//         const result = await __db.mysql.query("mysql_user_local_db", checkuser_sql_query, checkuser_sql_param);
//         console.log(result)
//         if (result.length == 0) {
//             return false
//         } else {
//             return true
//         }
//     }

//     var checkuser = await findUser(checkuser_sql_query, checkuser_sql_param);

//     if (checkuser) {
//         if (req.body.name && req.body.sms_text && req.body.sender_id && req.body.otp_type && req.body.otp_expire_in_sec && req.body.otp_length && req.body.language) {
//             var template_name = req.body.name;
//             var sms_text = req.body.sms_text;
//             var sender_id = req.body.sender_id;
//             var template_id = uuid4();
//             var created_on = new Date();
//             var modified_on = new Date();
//             var otp_length = req.body.otp_length;
//             var otp_expire_in_sec = req.body.otp_expire_in_sec;
//             var otp_type = req.body.otp_type;
//             var otp_route = 'promo';
//             var language = req.body.language;
//             var sender_id_approval = 'N';
//             var status = 'active';
//             var template_status = 'pending';
//             var approved = 'N';
//             var user_sql_query = "select number_of_templates_allowed from helootplocal.package AS P INNER JOIN helootplocal.users as U INNER JOIN helootplocal.template as T on U.package_selected=P.name and U.user_id = T.user_id WHERE U.user_id like ?";
//             var user_sql_param = [user_id];

//             async function templateLogic(user_sql_query, user_sql_param) {
//                 const result = await __db.mysql.query("mysql_user_local_db", user_sql_query, user_sql_param);
//                 if (result.length == 0) {
//                     return true
//                 } else if (result.length >= result[0].number_of_templates_allowed) {
//                     return false
//                 } else {
//                     return true
//                 };
//             }

//             var templateLimit = await templateLogic(user_sql_query, user_sql_param);

//             // if (templateLimit) {
//             __db.mysql.query("mysql_user_local_db", "insert into template (template_id, name, sms_text, otp_length, otp_expiry_in_sec, otp_type,  language, sender_id, sender_id_approval, status, template_status, approved,user_id,created_on, updated_on, otp_route) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", [template_id, template_name, sms_text, otp_length, otp_expire_in_sec, otp_type, language, sender_id, sender_id_approval, status, template_status, approved, user_id, created_on, modified_on, otp_route]).then((results) => {
//                 // console.log(results)
//                 __util.send(res, {
//                     type: __define.RESPONSE_MESSAGES.SUCCESS,
//                     data: { message: "template created successfully", "template_id": template_id }
//                 })
//             }).catch(err => {
//                 console.log(err)
//                 if (err.code === "ER_DUP_ENTRY") {
//                     return __util.send(res, {
//                         type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
//                         data: { message: "template already exists" }
//                     });
//                 } else {
//                     __logger.error("error: ", err);
//                     return __util.send(res, {
//                         type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
//                         data: { message: "Problem while creating template" }
//                     });
//                 }
//             });
//             // } else {
//             //     __util.send(res, {
//             //         type: __define.RESPONSE_MESSAGES.ACCESS_DENIED,
//             //         data: { message: "Template limit over, upgrade plan to continue" }
//             //     })
//             // }

//         } else {
//             __util.send(res, {
//                 type: __define.RESPONSE_MESSAGES.NOT_FOUND,
//                 data: { message: "required fields not mentioned" }
//             })
//         }

//     } else {
//         __util.send(res, {
//             type: __define.RESPONSE_MESSAGES.ACCESS_DENIED,
//             data: { message: "user not found" }
//         })
//     }

// };

// route_func.view_template = (req, res) => {
//     __util.make_log_statement(req, "view_template");
//     var user_id = req.query.user_id;
//     if (user_id) {

//         let sql_param = [user_id];
//         let sql_query = "select u.template_id, u.name, u.sms_text, u.otp_length, u.otp_expiry_in_sec, u.otp_type, u.sender_id, u.sender_id_approval, u.status, u.template_status, u.approved, u.credit_used, u.created_on, u.updated_on, u.user_id, u.language from template u where u.user_id  like ?";

//         if (req.query.search !== '' && req.query.search !== undefined) {
//             if (sql_query.includes("where")) {
//                 sql_query += " and ";
//             } else {
//                 sql_query += " where ";
//             }
//             sql_query += ' name like ? ';
//             sql_param.push(req.query.search)
//         }

//         if ((req.query.length !== '' && req.query.length !== undefined) || (req.query.start !== '' && req.query.start !== undefined)) {
//             sql_query += ' limit ' + req.query.length + ' offset ' + req.query.start;
//         }

//         __db.mysql.query("mysql_user_local_db", sql_query, sql_param).then((results) => {

//             if (results.length === 0) {
//                 __util.send(res, {
//                     type: __define.RESPONSE_MESSAGES.NOT_FOUND,
//                     data: { message: "template not found" }
//                 })
//             } else {
//                 var template_count = results.length;
//                 res.send({
//                     code: 2000,
//                     status: true,
//                     data: {
//                         recordsFiltered: template_count,
//                         recordsTotal: template_count,
//                         records: results,
//                     }
//                 })
//             }
//         }).catch(err => {
//             __logger.error("error: ", err);
//             __util.send(res, {
//                 type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
//                 data: { "message": "error in finding templates" }
//             });
//         });
//     } else {
//         __util.send(res, {
//             type: __define.RESPONSE_MESSAGES.ACCESS_DENIED,
//             data: { "message": "You dont have permission" }
//         });
//     }

// };

// route_func.view_single_template = (req, res) => {
//     __util.make_log_statement(req, "view_single_template");
//     var user_id = req.query.user_id;
//     var template_id = req.params.template_id;
//     if (user_id) {
//         let sql_param = [template_id];
//         let sql_query = "select u.template_id, u.name, u.sms_text, u.otp_length, u.otp_expiry_in_sec, u.otp_type, u.sender_id, u.sender_id_approval, u.status, u.template_status, u.approved, u.credit_used, u.created_on, u.updated_on from template u where u.template_id like ?";

//         __db.mysql.query("mysql_user_local_db", sql_query, sql_param).then((results) => {
//             if (results.length === 0) {
//                 __util.send(res, {
//                     type: __define.RESPONSE_MESSAGES.NOT_FOUND,
//                     data: { message: "template not found" }
//                 })
//             } else {
//                 __util.send(res, {
//                     type: __define.RESPONSE_MESSAGES.SUCCESS,
//                     data: results
//                 })
//             }
//         }).catch(err => {
//             __logger.error("error: ", err);
//             __util.send(res, {
//                 type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
//                 data: { "message": "error in finding templates" }
//             });
//         });
//     } else {
//         __util.send(res, {
//             type: __define.RESPONSE_MESSAGES.ACCESS_DENIED,
//             data: { "message": "You dont have permission" }
//         });
//     }

// };

// route_func.update_template = (req, res) => {
//     __util.make_log_statement(req, "update_template");
//     if (!req.query.user_id) {
//         return __util.send(res, {
//             type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
//             data: { message: "user_id not provided" }
//         });
//     }

//     let template_id = req.params.template_id;
//     let restrict_field_update = ["sender_id_approval", "status", "template_status", "approved", "credit_used", "user_id"];
//     let set_command = db_helper.get_set_command_for_update(req.body, restrict_field_update);
//     let query_param = [template_id];

//     __db.mysql.query("mysql_user_local_db", 'update template set ' + set_command + ' where template_id=?', query_param).then((results) => {
//         console.log(results)
//         __util.send(res, {
//             type: __define.RESPONSE_MESSAGES.SUCCESS,
//             data: { message: "Data updated successfully", "template_id": template_id }
//         })
//     }).catch(err => {
//         __logger.error("error: ", err);
//         return __util.send(res, {
//             type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
//             data: { message: "Problem while updating template" }
//         });

//     });
// };

// route_func.approve_template = (req, res) => {
//     __util.make_log_statement(req, "approve_template");
//     if (!req.query.user_id) {
//         return __util.send(res, {
//             type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
//             data: { message: "user_id not provided" }
//         });
//     };
//     var user_id = req.query.user_id;
//     var approved = req.body.approved;
//     var template_status = req.body.template_status;
//     // console.log(template_status)
//     if (user_id == '515adee1-7f8e-48a8-9fcc-0cfe7016f1c8') {  // user_id of support team for approval of template
//         let template_id = req.params.template_id;
//         let query_param = [approved,template_status,template_id];

//         __db.mysql.query("mysql_user_local_db", 'update template set approved = ?, template_status = ?  where template_id=?', query_param).then((results) => {
//             console.log(results)
//             __util.send(res, {
//                 type: __define.RESPONSE_MESSAGES.SUCCESS,
//                 data: { message: "template approved successfully", "template_id": template_id }
//             })
//         }).catch(err => {
//             __logger.error("error: ", err);
//             return __util.send(res, {
//                 type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
//                 data: { message: "Problem while approving template" }
//             });

//         });
//     } else {
//         __util.send(res, {
//             type: __define.RESPONSE_MESSAGES.ACCESS_DENIED,
//             data: { "message": "You dont have permission" }
//         });
//     }
// };
// // route_func.change_status_template = (req, res) => {
// //     __util.make_log_statement(req, "change_status_template");
// //     if (!req.query.user_id) {
// //         return __util.send(res, {
// //             type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
// //             data: { message: "user_id not provided" }
// //         });
// //     };
// //     let user_id = req.query.user_id;
// //     let template_id = req.params.template_id;
// //     let query_param = [template_id];

// //     __db.mysql.query("mysql_user_local_db", 'update template set status = "inactive" where template_id=? and user_id= ?', query_param).then((results) => {
// //         // console.log(results)
// //         __util.send(res, {
// //             type: __define.RESPONSE_MESSAGES.SUCCESS,
// //             data: { message: "status changed successfully", "template_id": template_id }
// //         })
// //     }).catch(err => {
// //         __logger.error("error: ", err);
// //         return __util.send(res, {
// //             type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
// //             data: { message: "Problem while updating template" }
// //         });

// //     });
// // };

// // route_func.get_user_info = (req, res) => {
// //     __util.make_log_statement(req, "get_user_info");
// //     // console.log(req.query)
// //     const user_id = req.query.user_id;
// //     let sql_param = [user_id];
// //     let sql_query = "select * from users u where u.user_id like ?";

// //     __db.mysql.query("mysql_user_local_db", sql_query, sql_param).then((results) => {
// //         console.log(results)
// //         // var required_results = {};
// //         // required_results.name = results[0].first_name + ' ' + results[0].last_name;
// //         // required_results.username = results[0].username;
// //         // required_results.email_id = results[0].email_id;
// //         // required_results.mobile_number = results[0].mobile_number;
// //         if (results.length === 0) {
// //             __util.send(res, {
// //                 type: __define.RESPONSE_MESSAGES.NOT_FOUND,
// //                 data: { message: "no such user found" }
// //             })
// //         } else {
// //             if (results[0]['status'] === 'inactive') {
// //                 __util.send(res, {
// //                     type: __define.RESPONSE_MESSAGES.ACCESS_DENIED,
// //                     data: { message: "User is disabled, please contact administrator" }
// //                 })
// //             }
// //             __util.send(res, {
// //                 type: __define.RESPONSE_MESSAGES.SUCCESS,
// //                 data: results
// //             })
// //         }
// //     }).catch(err => {
// //         __logger.error("error: ", err);
// //         __util.send(res, {
// //             type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
// //             data: { "message": "Please contact administrator" }
// //         });
// //     });

// // };

// // route_func.update_user_info = (req, res) => {
// //     __util.make_log_statement(req, "update_user_info");
// //     if(!req.body.user_id) {
// //         return __util.send(res, {
// //             type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
// //             data: { message: "user_id not provided" }
// //         });
// //     }
// //     let user_id = req.body.user_id;
// //     delete req.body.user_id;
// //     let restrict_field_update = ["user_id", "username", "hash_password", "saltkey"];
// //     let set_command = db_helper.get_set_command_for_update(req.body, restrict_field_update);
// //     let query_param = [user_id];

// //     __db.mysql.query("mysql_user_db", 'update user set ' + set_command + ' where user_id=?', query_param).then((results) => {
// //         __util.send(res, {
// //             type: __define.RESPONSE_MESSAGES.SUCCESS,
// //             data: { message: "Data updated successfully", "user_id": user_id }
// //         })
// //     }).catch(err => {
// //         if(err.code === "ER_DUP_ENTRY") {
// //             return __util.send(res, {
// //                 type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
// //                 data: { message: "User name already exists" }
// //             });
// //         } else {
// //             __logger.error("error: ", err);
// //             return __util.send(res, {
// //                 type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
// //                 data: { message: "Problem while updating User" }
// //             });
// //         }
// //     });
// // };




// // route_func.update_user_info = (req, res) => {
// //     __util.make_log_statement(req, "get_user_info");
// //     // console.log(req.query)
// //     const userId = req.query.userId;
// //     let sql_param = [userId];
// //     let sql_query = "select u.first_name, u.last_name, u.username, u.status, u.email_id, u.mobile_number from `HELO-OTP` u where u.userId like ?";

// //     __db.mysql.query("mysql_user_local_db", sql_query, sql_param).then((results) => {
// //         console.log(results)
// //         var required_results = {};
// //         required_results.name = results[0].first_name + ' ' + results[0].last_name;
// //         required_results.username = results[0].username;
// //         required_results.email_id = results[0].email_id;
// //         required_results.mobile_number = results[0].mobile_number;
// //         if (results.length === 0) {
// //             __util.send(res, {
// //                 type: __define.RESPONSE_MESSAGES.NOT_FOUND,
// //                 data: { message: "no such user found" }
// //             })
// //         } else {
// //             if (results[0]['status'] === 'inactive') {
// //                 __util.send(res, {
// //                     type: __define.RESPONSE_MESSAGES.ACCESS_DENIED,
// //                     data: { message: "User is disabled, please contact administrator" }
// //                 })
// //             }
// //             __util.send(res, {
// //                 type: __define.RESPONSE_MESSAGES.SUCCESS,
// //                 data: required_results
// //             })
// //         }
// //     }).catch(err => {
// //         __logger.error("error: ", err);
// //         __util.send(res, {
// //             type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
// //             data: { "message": "Please contact administrator" }
// //         });
// //     });

// // };

// // route_func.get_user = (req, res) => {
// //     __util.make_log_statement(req, "get_user");
// //     // console.log(req.user_config)
// //     let user_id = req.user_config.user_id  || null;
// //     // console.log(req.user_config)
// //     let sql_param = [user_id];
// //     let sql_query = "select u.firstname, u.lastname, u.username, u.status, u.email_id, u.mobile_number, u.company_name, u.industry, u.otp_purpose, u.registered, u.lead_checked, u.status, u.user_type from user u where u.user_id like ?";

// //     if (req.query.search !== '' && req.query.search !== undefined) {
// //         if(sql_query.includes("where")) {
// //             sql_query += " and ";
// //         } else {
// //             sql_query += " where ";
// //         }
// //         sql_query += ' username like ? ';
// //         sql_param.push(req.query.search)
// //     }
// //     if ((req.query.sort_by_columns !== '' && req.query.sort_by_columns !== undefined) && (req.query.sort_way !== '' && req.query.sort_way !== undefined )) {
// //         sql_query += ' order by ' + req.query.sort_by_columns + ' ' + req.query.sort_way;
// //     }
// //     if ((req.query.limit !== '' && req.query.limit !== undefined) || (req.query.offset !== '' && req.query.offset !== undefined)) {
// //         sql_query += ' limit ' + req.query.limit + ' offset ' + req.query.offset;
// //     }

// //     __db.mysql.query("mysql_user_db", sql_query, sql_param).then((results) => {
// //         if (results.length === 0) {
// //             __util.send(res, {
// //                 type: __define.RESPONSE_MESSAGES.NOT_FOUND,
// //                 data: { message: "no such user found" }
// //             })
// //         } else {
// //             __util.send(res, {
// //                 type: __define.RESPONSE_MESSAGES.SUCCESS,
// //                 data: results
// //             })
// //         }
// //     }).catch(err => {
// //         __logger.error("error: ", err);
// //         __util.send(res, {
// //             type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
// //             data: {"message": "Please contact administrator"}
// //         });
// //     });
// // };

// // route_func.create_user = async (req, res) => {
// //     __util.make_log_statement(req, "create_user");

// //     const parent_user_id = req.user_config.user_id || null;
// //     const parent_username = req.user_config.username || null;

// //     if(!req.body.username) {
// //         return __util.send(res, {
// //             type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
// //             data: { message: "username not provided" }
// //         });
// //     } else if(!req.body.firstname) {
// //         return __util.send(res, {
// //             type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
// //             data: { message: "firstname not provided" }
// //         });
// //     } else if(!req.body.lastname) {
// //         return __util.send(res, {
// //             type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
// //             data: { message: "lastname not provided" }
// //         });
// //     } else if(!req.body.password) {
// //         return __util.send(res, {
// //             type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
// //             data: { message: "password not provided" }
// //         });
// //     }

// //     const user_id = uuid4();
// //     const username = req.body.username;
// //     const firstname = req.body.firstname;
// //     const lastname = req.body.lastname;
// //     const password = req.body.password;
// //     const role = new_role;
// //     const role_displayname = new_role;

// //     if(!company_id) { // INFO: This is for support user.
// //         const company_id = req.body.company_id;
// //     }

// //     const status = "active";
// //     const password_salt = pass_mgmt.genRandomString(16);
// //     const hash_password = pass_mgmt.create_hash_of_password(password, password_salt)['passwordHash'];

// //     __db.mysql.query("mysql_user_local_db", "insert into user (user_id, username, firstname, lastname, role, role_displayname, company_id, status, hash_password, saltkey, parent_user_id) values (?, ?, ?, ?, ?, ?, ?, ?, UNHEX(?), UNHEX(?), ?)", [user_id, username, firstname, lastname, role, role_displayname, company_id, status, hash_password, salt_key, parent_user_id]).then((results) => {
// //         __util.send(res, {
// //             type: __define.RESPONSE_MESSAGES.SUCCESS,
// //             data: { message: "User created successfully", "user_id": user_id }
// //         })
// //     }).catch(err => {
// //         if(err.code === "ER_DUP_ENTRY") {
// //             return __util.send(res, {
// //                 type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
// //                 data: { message: "Username already exists" }
// //             });
// //         } else {
// //             __logger.error("error: ", err);
// //             return __util.send(res, {
// //                 type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
// //                 data: { message: "Problem while creating new user" }
// //             });
// //         }
// //     });
// // };

// // route_func.create_user = async (req, res) => {
// //     __util.make_log_statement(req, "create_user");

// //     if(!req.body.username) {
// //         return __util.send(res, {
// //             type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
// //             data: { message: "username not provided" }
// //         });
// //     } else if(!req.body.first_name) {
// //         return __util.send(res, {
// //             type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
// //             data: { message: "firstname not provided" }
// //         });
// //     } else if(!req.body.last_name) {
// //         return __util.send(res, {
// //             type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
// //             data: { message: "lastname not provided" }
// //         });
// //     } else if(!req.body.password) {
// //         return __util.send(res, {
// //             type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
// //             data: { message: "password not provided" }
// //         });
// //     } else if(!req.body.mobile_number) {
// //         return __util.send(res, {
// //             type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
// //             data: { message: "Mobile number not provided" }
// //         });
// //     } else if(!req.body.company_name) {
// //         return __util.send(res, {
// //             type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
// //             data: { message: "company name not provided" }
// //         });
// //     } else if(!req.body.otp_purpose) {
// //         return __util.send(res, {
// //             type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
// //             data: { message: "otp not mentioned" }
// //         });
// //     }

// //     const user_id = uuid4();
// //     const username = req.body.username;
// //     const first_name = req.body.first_name;
// //     const last_name = req.body.last_name;
// //     const email = req.body.email;
// //     const mobile_number = req.body.mobile_number;
// //     const company_name = req.body.company_name;
// //     const industry = req.body.industry;
// //     const otp_purpose = req.body.otp_purpose;
// //     const password = req.body.password;
// //     const created_at = new Date();
// //     const modified_at = new Date();   
// //     const status = "active";
// //     const salt_key = pass_mgmt.genRandomString(16);
// //     const hash_password = pass_mgmt.create_hash_of_password(password, salt_key)['passwordHash'];

// //     __db.mysql.query("mysql_user_local_db", "insert into `HELO-OTP` (userId, username, first_name, last_name, email_id,mobile_number,company_name, industry, otp_purpose, status, hash_password, saltkey, created_at, modified_at) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?)", [user_id,username, first_name, last_name,email,mobile_number,company_name,industry, otp_purpose,status, hash_password, salt_key, created_at,modified_at]).then((results) => {
// //         // console.log(results)
// //         __util.send(res, {
// //             type: __define.RESPONSE_MESSAGES.SUCCESS,
// //             data: { message: "User created successfully", "user_id": user_id }
// //         })
// //     }).catch(err => {
// //         console.log(err)
// //         if(err.code === "ER_DUP_ENTRY") {
// //             return __util.send(res, {
// //                 type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
// //                 data: { message: "Username/email already exists" }
// //             });
// //         } else {
// //             __logger.error("error: ", err);
// //             return __util.send(res, {
// //                 type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
// //                 data: { message: "Problem while creating new user" }
// //             });
// //         }
// //     });
// // };

// // route_func.login = (req, res) => {
// //     __util.make_log_statement(req, "login");
// //     if (req.body.username && req.body.password) {
// //         var username = req.body.username;
// //         var password = req.body.password;
// //     }

// //     __db.mysql.query("mysql_user_local_db", "select u.userId,u.email_id as email,  u.hash_password as hash_password, u.saltkey as saltkey from `HELO-OTP` u where username like ?;", [username]).then((results) => {
// //         if (results.length === 0) {
// //             __util.send(res, {
// //                 type: __define.RESPONSE_MESSAGES.NOT_AUTHORIZED,
// //                 data: { message: "no such user found" }
// //             });
// //         } else {
// //             const hash_password = pass_mgmt.create_hash_of_password(password, results[0]['saltkey'].toLowerCase());
// //             if(hash_password['passwordHash'] !== results[0]['hash_password'].toLowerCase()) {
// //                 __util.send(res, {
// //                     type: __define.RESPONSE_MESSAGES.NOT_AUTHORIZED,
// //                     data: { message: "no such user found" }
// //                 });
// //             }
// //             if(results[0]['status'] === 'inactive') {
// //                 __util.send(res, {
// //                     type: __define.RESPONSE_MESSAGES.ACCESS_DENIED,
// //                     data: { message: "User is disabled, please contact administrator" }
// //                 })
// //             } 

// //             const user_data = results[0];
// //             const payload = { user_id: user_data.user_id, username: username , email: user_data.email};
// //             const token = jwt.sign(payload, __config.jwt_secret_key);
// //             __util.send(res, {
// //                 type: __define.RESPONSE_MESSAGES.SUCCESS,
// //                 data: {token: token}
// //             })
// //         }
// //     }).catch(err => {
// //         __logger.error("error: ", err);
// //         __util.send(res, {
// //             type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
// //             data: {"message": "Please contact administrator"}
// //         });
// //     });
// // };
// // route_func.update_user = (req, res) => {
// //     __util.make_log_statement(req, "update_user");
// //     // if(!req.body.user_id) {
// //     //     return __util.send(res, {
// //     //         type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
// //     //         data: { message: "user_id not provided" }
// //     //     });
// //     // }
// //     let user_id = req.body.user_id;
// //     delete req.body.user_id;
// //     let restrict_field_update = ["user_id", "username", "hash_password", "saltkey"];
// //     let set_command = db_helper.get_set_command_for_update(req.body, restrict_field_update);
// //     let query_param = [user_id];

// //     __db.mysql.query("mysql_user_db", 'update user set ' + set_command + ' where user_id=?', query_param).then((results) => {
// //         __util.send(res, {
// //             type: __define.RESPONSE_MESSAGES.SUCCESS,
// //             data: { message: "Data updated successfully", "user_id": user_id }
// //         })
// //     }).catch(err => {
// //         if(err.code === "ER_DUP_ENTRY") {
// //             return __util.send(res, {
// //                 type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
// //                 data: { message: "User name already exists" }
// //             });
// //         } else {
// //             __logger.error("error: ", err);
// //             return __util.send(res, {
// //                 type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
// //                 data: { message: "Problem while updating User" }
// //             });
// //         }
// //     });
// // };

// // route_func.deactivate_user = (req, res) => {
// //     __util.make_log_statement(req, "deactivate_user");
// //     let user_id = req.body.user_id;
// //     let query_param = [user_id];

// //     __db.mysql.query("mysql_user_db", 'update user set status="inactive" where user_id=?', query_param).then((results) => {
// //         __util.send(res, {
// //             type: __define.RESPONSE_MESSAGES.SUCCESS,
// //             data: { message: "User deactivated successfully", "user_id": user_id }
// //         })
// //     }).catch(err => {
// //         __logger.error("error: ", err);
// //         return __util.send(res, {
// //             type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
// //             data: { message: "Problem while updating User" }
// //         });
// //     });
// // };

// // route_func.activate_user = (req, res) => {
// //     __util.make_log_statement(req, "activate_user");
// //     if(!req.body.user_id) {
// //         return __util.send(res, {
// //             type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
// //             data: { message: "user_id not provided" }
// //         });
// //     }
// //     let user_id = req.body.user_id;
// //     let query_param = [user_id];

// //     __db.mysql.query("mysql_user_db", 'update user set status="active" where user_id=?', query_param).then((results) => {
// //         __util.send(res, {
// //             type: __define.RESPONSE_MESSAGES.SUCCESS,
// //             data: { message: "User activated successfully", "user_id": user_id }
// //         })
// //     }).catch(err => {
// //         __logger.error("error: ", err);
// //         return __util.send(res, {
// //             type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
// //             data: { message: "Problem while updating User" }
// //         });
// //     });
// // };


// // route_func.get_user_config = (req, res) => {
// //     __util.make_log_statement(req, "get_user_config");
// //     __util.send(res, {
// //         type: __define.RESPONSE_MESSAGES.SUCCESS,
// //         data: req.user_config
// //     })
// // }

// // route_func.change_password = (req, res) => {
// //     __util.make_log_statement(req, "change_password");
// //     let current_password = req.body.current_password;
// //     let new_password = req.body.new_password;
// //     if(!current_password) {
// //         return __util.send(res, {
// //             type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
// //             data: { message: "Current Password is required" }
// //         });
// //     }
// //     if(!new_password) {
// //         return __util.send(res, {
// //             type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
// //             data: { message: "New Password is required" }
// //         });
// //     }
// //     let company_id = req.body.company_id || null;
// //     let user_id = req.body.user_id || null;

// //     const saltkey = pass_mgmt.genRandomString(16);
// //     const hash_password = pass_mgmt.create_hash_of_password(new_password, saltkey)['passwordHash'];

// //     query_param = [hash_password, saltkey, user_id, company_id];
// //     // TODO: Need to authenticate current_password of the user, before allowing for password change.
// //     __db.mysql.query("mysql_user_db", 'update user set hash_password=UNHEX(?), saltkey=UNHEX(?) where user_id=? and company_id=?', query_param).then((results) => {
// //         __util.send(res, {
// //             type: __define.RESPONSE_MESSAGES.SUCCESS,
// //             data: { message: "Password updated successfully"}
// //         })
// //     }).catch(err => {
// //         __logger.error("error: ", err);
// //         return __util.send(res, {
// //             type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
// //             data: { message: "Problem while updating user" }
// //         });
// //     });
// // };


module.exports = test_numbers_func;
