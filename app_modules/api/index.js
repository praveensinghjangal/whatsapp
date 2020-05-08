const express = require('express');
const router = express.Router();
var __db = require("../../lib/db");
var __logger = require('../../lib/logger');
const __util = require('../../lib/util');
const __define = require('../../config/define');

router.get('/unauthorized', (req, res) => {
    __util.send(res, {
        type: __define.RESPONSE_MESSAGES.NOT_AUTHORIZED,
        data: { message: "Unauthenticated Request" }
    })
});

// async function set_get_redis() {
//     let set_result = await __db.redis.set("test_redis_key", "test_redis_value");
//     let get_result = await __db.redis.get("test_redis_key");
//     if (get_result === "test_redis_value" && set_result === "OK")
//         return Promise.resolve("redis value matched");
//     else
//         return Promise.reject("redis value do not match");
// }
//
// async function set_get_mysql() {
//     // connections['mysql_user_db'].conn
//     get_result = await __db.mysql.query("mysql_user_db", "select * from user_master", []);
//     // get_result = await __db.redis.get("test_redis_key");
//     if (get_result.length > 0)
//         return Promise.resolve("mysql data found");
//     else
//         return Promise.reject("mysql data not found");
// }
//
// async function set_get_rabbitmq() {
//     // connections['mysql_user_db'].conn
//     get_result = await __db.mysql.query("mysql_user_db", "select * from user_master", []);
//     // get_result = await __db.redis.get("test_redis_key");
//     if (get_result.length > 0)
//         return Promise.resolve("mysql data found");
//     else
//         return Promise.reject("mysql data not found");
// }
//
// async function test_tools() {
//     redis_result = await set_get_redis();
//     mysql_result = await set_get_mysql();
//     rabbitmq_result = await set_get_rabbitmq();
//     return Promise.resolve([redis_result, mysql_result, rabbitmq_result]);
// }
//
// router.get('/test', (req, res) => {
//     // __db.mongo.connection.db("ho").collection("user_master").find({}, (err, results) => {
//     //     res.send("test");
//     // });
//     __db.mongo.__find("ho", "user_master", {"username": "admin1"}, {}).then((results) => {
//         // set_get_redis().then((a) => {
//         //     console.log(a);
//         //     res.send(results);
//         // }).catch(err => {
//         //     res.send(err);
//         // });
//         test_tools().then((result) => {
//             console.log(result);
//             res.send(results);
//         }).catch(err => {
//             console.log(err);
//             res.send(err);
//         });
//     }).catch(err => {
//         __logger.error("error: ", err);
//         res.send(err);
//     });
// });

module.exports = router;
