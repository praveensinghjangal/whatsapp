const config = require('../config')

const MQ_PREFETCH = process.env.MQ_PREFETCH ? parseInt(process.env.MQ_PREFETCH) : 1

let CAMP_CHUNK_SIZE = process.env.CAMP_CHUNK_SIZE ? parseInt(process.env.CAMP_CHUNK_SIZE) : 2000
CAMP_CHUNK_SIZE = (CAMP_CHUNK_SIZE > 5000 ? 5000 : CAMP_CHUNK_SIZE)

const ARCHIVE_DAYS = process.env.ARCHIVE_DAYS ? parseInt(process.env.ARCHIVE_DAYS) : 75

// let MQ = {
//     EX_DLX: {type: 'exchange', ex_type: 'direct', q_name: 'dlx', q_options: {durable: true}},
//     Q_CAMP: {type: 'queue', q_name: '0-q_camp', q_options: {durable: true}, prefetchCount: MQ_PREFETCH, createChannel: false},
//     BIND_Q_CAMP: {type: 'bind', q_name: '0-q_camp', r_key: '0-q_camp', ex_name: 'dlx', createBind: false},
//     Q_CAMP_RETRY: {
//         type: 'queue',
//         q_name: '0-q_camp_retry',
//         q_options: {durable: true, deadLetterExchange: 'dlx', deadLetterRoutingKey: '0-q_camp', messageTtl: 2 * 60 * 1000}, // 2 min
//         prefetchCount: MQ_PREFETCH,
//         createChannel: false
//     },
//
//     Q_CAMP_CHUNK: {type: 'queue', q_name: '1-q_camp_chunk', q_options: {durable: true}, prefetchCount: MQ_PREFETCH, createChannel: false},
//     BIND_Q_CAMP_CHUNK: {type: 'bind', q_name: '1-q_camp_chunk', r_key: '1-q_camp_chunk', ex_name: 'dlx', createBind: false},
//     Q_CAMP_CHUNK_RETRY: {
//         type: 'queue',
//         q_name: '1-q_camp_chunk_retry',
//         q_options: {durable: true, deadLetterExchange: 'dlx', deadLetterRoutingKey: '1-q_camp_chunk', messageTtl: 10 * 60 * 1000}, // 10 min
//         prefetchCount: MQ_PREFETCH,
//         createChannel: false
//     },
//     Q_CAMP_FAILED_CHUNK: {type: 'queue', q_name: '1-q_camp_failed_chunk', q_options: {durable: true}, prefetchCount: MQ_PREFETCH, createChannel: false},
//
//     Q_MSG_SENT_STATUS: {type: 'queue', q_name: '2-q_msg_sent_status', q_options: {durable: true}, prefetchCount: MQ_PREFETCH, createChannel: false},
//     BIND_Q_MSG_SENT_STATUS: {type: 'bind', q_name: '2-q_msg_sent_status', r_key: '2-q_msg_sent_status', ex_name: 'dlx', createBind: false},
//     Q_MSG_SENT_STATUS_RETRY: {
//         type: 'queue',
//         q_name: '2-q_msg_sent_status_retry',
//         q_options: {durable: true, deadLetterExchange: 'dlx', deadLetterRoutingKey: '2-q_msg_sent_status', messageTtl: 5 * 60 * 1000}, // 5 min
//         prefetchCount: MQ_PREFETCH,
//         createChannel: false
//     },
//
//     Q_SSP_SEND: {type: 'queue', q_name: '2-q_ssp_send', q_options: {durable: true}, prefetchCount: MQ_PREFETCH, createChannel: false},
//     BIND_Q_SSP_SEND: {type: 'bind', q_name: '2-q_ssp_send', r_key: '2-q_ssp_send', ex_name: 'dlx', createBind: false},
//     Q_SSP_SEND_RETRY: {
//         type: 'queue',
//         q_name: '2-q_ssp_send_retry',
//         q_options: {durable: true, deadLetterExchange: 'dlx', deadLetterRoutingKey: '2-q_ssp_send', messageTtl: 2 * 1000}, // 2 sec
//         prefetchCount: MQ_PREFETCH,
//         createChannel: false
//     },
//
//     Q_SSP_PINGBACK: {type: 'queue', q_name: '3-q_ssp_pingback', q_options: {durable: true}, prefetchCount: MQ_PREFETCH, createChannel: false},
//     BIND_Q_SSP_PINGBACK: {type: 'bind', q_name: '3-q_ssp_pingback', r_key: '3-q_ssp_pingback', ex_name: 'dlx', createBind: false},
//     Q_SSP_PINGBACK_RETRY: {
//         type: 'queue',
//         q_name: '3-q_ssp_pingback_retry',
//         q_options: {durable: true, deadLetterExchange: 'dlx', deadLetterRoutingKey: '3-q_ssp_pingback', messageTtl: 2 * 60 * 1000}, // 2 min
//         prefetchCount: MQ_PREFETCH,
//         createChannel: false
//     },
//
//     Q_MSG_STATUS: {type: 'queue', q_name: '3-q_msg_deliver_status', q_options: {durable: true}, prefetchCount: MQ_PREFETCH, createChannel: false},
//     BIND_Q_MSG_STATUS: {type: 'bind', q_name: '3-q_msg_deliver_status', r_key: '3-q_msg_deliver_status', ex_name: 'dlx', createBind: false},
//     Q_MSG_STATUS_TRIGGER: {
//         type: 'queue',
//         q_name: '3-q_msg_deliver_status_trigger',
//         q_options: {durable: true, deadLetterExchange: 'dlx', deadLetterRoutingKey: '3-q_msg_deliver_status', messageTtl: 5 * 60 * 1000}, // 5 min
//         prefetchCount: MQ_PREFETCH,
//         createChannel: false
//     },
//
//     Q_CAMP_STATUS: {type: 'queue', q_name: '4-q_camp_status', q_options: {durable: true}, prefetchCount: MQ_PREFETCH, createChannel: false},
//     BIND_Q_CAMP_STATUS: {type: 'bind', q_name: '4-q_camp_status', r_key: '4-q_camp_status', ex_name: 'dlx', createBind: false},
//     Q_CAMP_STATUS_RETRY: {
//         type: 'queue',
//         q_name: '4-q_camp_status_retry',
//         q_options: {durable: true, deadLetterExchange: 'dlx', deadLetterRoutingKey: '4-q_camp_status', messageTtl: 2 * 60 * 1000}, // 2 min
//         prefetchCount: MQ_PREFETCH,
//         createChannel: false
//     },
//
//     Q_REDIS_CLEAN: {type: 'queue', q_name: '5-q_redis_clean', q_options: {durable: true}, prefetchCount: 1, createChannel: false},
//     BIND_Q_REDIS_CLEAN: {type: 'bind', q_name: '5-q_redis_clean', r_key: '5-q_redis_clean', ex_name: 'dlx', createBind: false},
//     Q_REDIS_CLEAN_TRIGGER: {
//         type: 'queue',
//         q_name: '5-q_redis_clean_trigger',
//         q_options: {durable: true, deadLetterExchange: 'dlx', deadLetterRoutingKey: '5-q_redis_clean', messageTtl: 24 * 60 * 60 * 1000}, // 24 hour
//         prefetchCount: MQ_PREFETCH,
//         createChannel: false
//     },
//
//     Q_WEBHOOK: {type: 'queue', q_name: '7-q_webhook', q_options: {durable: true}, prefetchCount: 1, createChannel: false},
//     BIND_Q_WEBHOOK: {type: 'bind', q_name: '7-q_webhook', r_key: '7-q_webhook', ex_name: 'dlx', createBind: false},
//     Q_WEBHOOK_TRIGGER: {
//         type: 'queue',
//         q_name: '7-q_webhook_trigger',
//         q_options: {durable: true, deadLetterExchange: 'dlx', deadLetterRoutingKey: '7-q_webhook', messageTtl: 5 * 60 * 1000}, // 5 min
//         prefetchCount: MQ_PREFETCH,
//         createChannel: false
//     },
//
//     Q_CAMP_ARCHIVE: {type: 'queue', q_name: '6-q_camp_archive', q_options: {durable: true}, prefetchCount: 1, createChannel: false},
//
//     Q_A_CODE_ANALYTICS: {type: 'queue', q_name: 'a-0-q_code_analytics', q_options: {durable: true}, prefetchCount: 1, createChannel: false},
//     Q_A_VIDEO: {type: 'queue', q_name: 'a-0-q_video', q_options: {durable: true}, prefetchCount: 1, createChannel: false},
//
//     Q_A_CA_DEVICE: {type: 'queue', q_name: 'a-1-q_ca_device', q_options: {durable: true}, prefetchCount: 1, createChannel: false},
//     BIND_Q_A_CA_DEVICE: {type: 'bind', q_name: 'a-1-q_ca_device', r_key: 'a-1-q_ca_device', ex_name: 'dlx', createBind: false},
//     Q_A_CA_DEVICE_TRIGGER: {
//         type: 'queue',
//         q_name: 'a-1-q_ca_device_trigger',
//         q_options: {durable: true, deadLetterExchange: 'dlx', deadLetterRoutingKey: 'a-1-q_ca_device', messageTtl: 1.5 * 60 * 1000}, // 1.5 min
//         prefetchCount: MQ_PREFETCH,
//         createChannel: false
//     },
//
//     Q_A_CA_RESOLUTION: {type: 'queue', q_name: 'a-1-q_ca_resolution', q_options: {durable: true}, prefetchCount: 1, createChannel: false},
//     BIND_Q_A_CA_RESOLUTION: {type: 'bind', q_name: 'a-1-q_ca_resolution', r_key: 'a-1-q_ca_resolution', ex_name: 'dlx', createBind: false},
//     Q_A_CA_RESOLUTION_TRIGGER: {
//         type: 'queue',
//         q_name: 'a-1-q_ca_resolution_trigger',
//         q_options: {durable: true, deadLetterExchange: 'dlx', deadLetterRoutingKey: 'a-1-q_ca_resolution', messageTtl: 1.5 * 60 * 1000}, // 1.5 min
//         prefetchCount: MQ_PREFETCH,
//         createChannel: false
//     },
// };

// var MQ = {
//     Normal_queue: {type: 'queue', q_name: 'zca_obd', q_options: {durable: true}, prefetchCount: 1, createChannel: true},
//     BIND_Q_SAMPLE1: {type: 'bind', q_name: 'zca_obd', ex_name: 'amq.direct'},
//     Delay_queue: {type: 'queue', q_name: 'zca_obd_delay', q_options: {durable: true, arguments: {"x-message-ttl" : 10 * 60000, "x-dead-letter-exchange" : 'amq.direct', "x-dead-letter-routing-key" : "zca_obd"}}, prefetchCount: 1, createChannel: true},
// };

var MYSQL_QUERY = {
  cdr_reason: 'case ' +
        "when cm.hangup_cause='NORMAL_CLEARING' or cm.billsec>0 then 'SUCCESS' " +
        "when cm.hangup_cause in ('NO_ANSWER','CALL_REJECTED','USER_BUSY','NO_USER_RESPONSE','NO_ANSWER','CALL_AWARDED_DELIVERED') then 'ATTEMPT' " +
        "when cm.hangup_cause in ('BLACKLISTED','OPTOUT','COOLING_PERIOD','DAILY','MONTHLYDEPT','NDNC_REJECT') then cm.hangup_cause " +
        "else 'FAILED' " +
        'end as reason'
}

if (process.env.rmq_queue == 'cdr') {
  var MQ = {
    // cdrqueue: {type: 'queue', q_name: process.env.cdrqueue, q_options: {durable: true}, prefetchCount: 1, createChannel: true},
    // BIND_Q_SAMPLE1: {type: 'bind', q_name: 'zca_obd', ex_name: 'amq.direct'},
    // Delay_queue: {type: 'queue', q_name: 'zca_obd_delay', q_options: {durable: true, arguments: {"x-message-ttl" : 10 * 60000, "x-dead-letter-exchange" : 'amq.direct', "x-dead-letter-routing-key" : "zca_obd"}}, prefetchCount: 1, createChannel: true},
  }
} else {
  var MQ = {
    // cdr_download_request: {type: 'queue', q_name: 'cdr_download_request', q_options: {durable: true}, prefetchCount: 1, createChannel: true},
    // share_data_to_bfsl: {type: 'queue', q_name: 'share_data_to_bfsl', q_options: {durable: true}, prefetchCount: 1, createChannel: true},
    // BIND_Q_SAMPLE1: {type: 'bind', q_name: 'zca_obd', ex_name: 'amq.direct'},
    // Delay_queue: {type: 'queue', q_name: 'zca_obd_delay', q_options: {durable: true, arguments: {"x-message-ttl" : 10 * 60000, "x-dead-letter-exchange" : 'amq.direct', "x-dead-letter-routing-key" : "zca_obd"}}, prefetchCount: 1, createChannel: true},
  }
}

const DYNAMODB_TABLES = {}

const MONGO_DBS = {
//    mongo collection example
//    vivasmpp_bulk: {
//        name: "vivasmpp_bulk",
//        archive: true,
//        archive_type:'date', //default 'date'
//        collections: {
//            bulkapi_requests: "bulkapi_requests",
//            bulkapi_auth: "bulkapi_auth"
//        },
//        functions: {
//        }
//    }
}

const REDIS_HASH = {
}

const REDIS_KEYS = {
}

const CUSTOM_CONSTANT = {
  ARCHIVE_DAYS: ARCHIVE_DAYS,
  SHORT_CODE_GEN_API_URL: 'http://viid.in:8002',
  META_TABLE_KEYS: {
    REDIS_SHORT_CODE_COUNTER: 'REDIS_SHORT_CODE_COUNTER'
  },
  SMS_MSG_ID_BYPASS_MERCHANT: 'SmsMsgIdBypassMerchant',
  DEV_ENV: 'development_pr',
  PROD_ENV: 'production',
  STAG_ENV: 'staging',
  NOT_TO_UPDATE: '#$#NOT_TO_UPDATE#$#',
  CAMP_CHUNK_SIZE: CAMP_CHUNK_SIZE,
  MAX_CAMP_CHUNK_RETRY: 10,
  ROW_STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    BLOCK: 'block'
  },
  UPLOAD_ERROR_MSG: {
    LIMIT_FILE_SIZE: 'LIMIT_FILE_SIZE',
    WRONG_EXTENSION: 'WRONG_EXTENSION',
    UPLOAD_DIRECTORY_MISSING: 'UPLOAD_DIRECTORY_MISSING'
  },
  PARTITION_NAME: {
    LIVE: 'live',
    ARCHIVED: 'archived'
  },
  // note: never change values for BOOL_STATUS
  BOOL_STATUS: {
    TRUE: 1,
    FALSE: 0
  },
  // note: never change values for PROCESS_STATUS //progress, 0:added; 1:pending; 2:inprocess; 3:success; 4:failed; 5:retry; 6:incomplete
  PROCESS_STATUS: {
    ADDED: 0,
    PENDING: 1,
    INPROCESS: 2,
    COMPLETE: 3,
    FAILED: 4,
    RETRY: 5,
    INCOMPLETE: 6,
    INVALID: 7,
    API_CAMP: 8,
    CANCEL: 9
  },
  ARCHIVE_STATUS: {
    NO: 0,
    YES: 1,
    INPROCESS: 2
  },
  CAMP_PLATFORM: {
    HELO: 0,
    SSP: 1,
    HELO_API: 9
  },
  CAMP_TYPE: {
    URL: 0,
    PSN: 1,
    NOURL: 2,
    PSNNOURL: 3
  },
  UNICODE_TYPE: {
    ENGLISH: 0,
    REGIONAL: 1
  },
  CHAR_COUNT: {
    ONE: [95, 10, 13],
    TWO: [126, 94, 124, 92, 123, 125, 91, 93],
    THREE: [96]
  },
  SSP_PINGBACK_SMS_STATUS: {
    4000: 'DELIVRD',
    4001: 'UNDELIV',
    4002: 'EXPIRED',
    4003: 'DNC REJECT',
    4004: 'SMSC',
    4010: 'UNKNOWN'
  },
  PINGBACK_SMS_STATUS: {
    DELIVRD: 'DELIVRD',
    UNDELIV: 'UNDELIV',
    EXPIRED: 'EXPIRED',
    DNC_REJECT: 'DNC REJECT',
    SMSC: 'SMSC',
    UNKNOWN: 'UNKNOWN',
    BLACKLIST: 'BLACKLIST'
  },
  CHECK_MSG_STATUS_AFTER_TIME: { // in minutes
    FIVE_M: 5,
    TEN_M: 10,
    HALF_H: 30,
    ONE_H: 60,
    TWO_H: 2 * 60,
    FOUR_H: 4 * 60,
    EIGTH_H: 8 * 60,
    TEN_H: 10 * 60,
    ONE_D: 24 * 60,
    TWO_D: 2 * 24 * 60,
    THREE_D: 3 * 24 * 60,
    FOUR_D: 4 * 24 * 60
  },
  SESSION_TIME: 600
}

const RESPONSE_MESSAGES = {
  INVALID_REQUEST: {
    status_code: 400,
    code: 4000,
    message: 'Invalid request'
  },
  NOT_FOUND: {
    status_code: 404,
    code: 4004,
    message: 'requested resource not found.'
  },
  NOT_AUTHORIZED: {
    status_code: 401,
    code: 4001,
    message: 'Unauthorized access.'
  },
  PAYMENT_REQUIRED: {
    status_code: 402,
    code: 4002,
    message: 'Payment required.'
  },
  ACCESS_DENIED: {
    status_code: 403,
    code: 4003,
    message: 'Access denied'
  },
  SERVER_TIMEOUT: {
    status_code: 408,
    code: 4008,
    message: 'request timeout.'
  },
  RATE_LIMITED: {
    status_code: 429,
    code: 4029,
    message: 'Too many request. request rate limited'
  },
  SERVER_ERROR: {
    status_code: 500,
    code: 5000,
    message: 'Something went wrong. Please try again later.'
  },
  // Note: use codes 2000 to 2999 for api success
  SUCCESS: {
    status_code: 200,
    code: 2000,
    message: 'Success'
  },
  // Note: use codes 3000 to 3999 for api error
  NO_RECORDS_FOUND: {
    status_code: 200,
    code: 3000,
    message: 'No record found.'
  },
  INVALID_CODE: {
    status_code: 200,
    code: 3002,
    message: 'Response code and msg not mention. please select valid response code.'
  },
  FAILED: {
    status_code: 200,
    code: 3003,
    message: 'Failed'
  },
  LOGIN_FAILED: {
    status_code: 200,
    code: 3004,
    message: 'credential are wrong.'
  },
  USERNAME_EXIST: {
    status_code: 200,
    code: 3005,
    message: 'username already exists.'
  },
  USER_EXIST: {
    status_code: 200,
    code: 3008,
    message: 'user already exists.'
  },
  INACTIVE_USER: {
    status_code: 200,
    code: 3006,
    message: 'inactive user.'
  },
  REDIRECTION_FAILED: {
    status_code: 200,
    code: 3007,
    message: 'failed to redirect.'
  },
  PROCESS_FAILED: {
    status_code: 200,
    code: 3010,
    message: 'Failed to process request.'
  },
  UPLOAD_FAILED: {
    status_code: 200,
    code: 3011,
    message: 'Upload failed.'
  },
  CAMP_ID_NOT_EXIT: {
    status_code: 200,
    code: 3012,
    message: 'camp_id not exit'
  }

}

module.exports.MONGO_DBS = MONGO_DBS
module.exports.MYSQL_QUERY = MYSQL_QUERY
module.exports.DYNAMODB_TABLES = DYNAMODB_TABLES
module.exports.MQ = MQ
module.exports.REDIS_KEYS = REDIS_KEYS
module.exports.REDIS_HASH = REDIS_HASH
module.exports.RESPONSE_MESSAGES = RESPONSE_MESSAGES
module.exports.CUSTOM_CONSTANT = CUSTOM_CONSTANT
