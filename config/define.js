var MYSQL_QUERY = {
  cdr_reason: 'case ' +
        "when cm.hangup_cause='NORMAL_CLEARING' or cm.billsec>0 then 'SUCCESS' " +
        "when cm.hangup_cause in ('NO_ANSWER','CALL_REJECTED','USER_BUSY','NO_USER_RESPONSE','NO_ANSWER','CALL_AWARDED_DELIVERED') then 'ATTEMPT' " +
        "when cm.hangup_cause in ('BLACKLISTED','OPTOUT','COOLING_PERIOD','DAILY','MONTHLYDEPT','NDNC_REJECT') then cm.hangup_cause " +
        "else 'FAILED' " +
        'end as reason'
}
const CUSTOM_CONSTANT = {
  DEV_ENV: 'development_pr',
  PROD_ENV: 'production',
  STAG_ENV: 'staging',
  NOT_TO_UPDATE: '#$#NOT_TO_UPDATE#$#',
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
  UNICODE_TYPE: {
    ENGLISH: 0,
    REGIONAL: 1
  },
  CHAR_COUNT: {
    ONE: [95, 10, 13],
    TWO: [126, 94, 124, 92, 123, 125, 91, 93],
    THREE: [96]
  },
  SESSION_TIME: 86400
}
const VERIFICATION_CHANNEL = {
  email: { name: 'email', expiresIn: 3600, codeLength: 4 },
  sms: { name: 'sms', expiresIn: 600, codeLength: 4 }
}
const PUBLIC_FOLDER_PATH = process.env.PWD + '/public'
const USER_CONFIG_REDIS_TTL = 300

module.exports.MYSQL_QUERY = MYSQL_QUERY
module.exports.RESPONSE_MESSAGES = require('./apiResponse')
module.exports.CUSTOM_CONSTANT = CUSTOM_CONSTANT
module.exports.VERIFICATION_CHANNEL = VERIFICATION_CHANNEL
module.exports.PUBLIC_FOLDER_PATH = PUBLIC_FOLDER_PATH
module.exports.USER_CONFIG_REDIS_TTL = USER_CONFIG_REDIS_TTL
