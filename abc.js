const express = require('express');
const http = require('http');
const timeout = require('connect-timeout');
const bodyParser = require("body-parser");
const cors = require('cors');
const addRequestId = require('express-request-id')();
const path = require('path');
const favicon = require('serve-favicon');
const socketio = require('socket.io');
// const __db = require('../lib/db');
// const __logger = require('../lib/logger');
// const __util = require('../lib/util');
// const __config = require('../config');
// const __define = require('../config/define');
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;
const helmet = require('helmet');


a = [
    [
        {
            "destination": 9004694689,
            "circle": "MUMBAI",
            "operator": "AIRTEL",
            "start_epoch": 1564565371,
            "end_epoch": 1564565383,
            "answer_epoch": 1564565377,
            "billsec": 6,
            "reason": "SUCCESS",
            "hangup_cause": "NORMAL_CLEARING",
            "dtmf": null
        }
    ],
    [
        {
            "count": 1
        }
    ],
    [
        {
            "count": 1
        }
    ]
]

// delete a.__proto__.remove;
for(i in a){
    console.log(i)
}