const APP_NAME = 'helowhatsapp'
const DB_NAME = 'helowhatsapp'
var MYSQL_QUERY = {
  cdr_reason: 'case ' +
        "when cm.hangup_cause='NORMAL_CLEARING' or cm.billsec>0 then 'SUCCESS' " +
        "when cm.hangup_cause in ('NO_ANSWER','CALL_REJECTED','USER_BUSY','NO_USER_RESPONSE','NO_ANSWER','CALL_AWARDED_DELIVERED') then 'ATTEMPT' " +
        "when cm.hangup_cause in ('BLACKLISTED','OPTOUT','COOLING_PERIOD','DAILY','MONTHLYDEPT','NDNC_REJECT') then cm.hangup_cause " +
        "else 'FAILED' " +
        'end as reason'
}
const CUSTOM_CONSTANT = {
  DEV_ENV: 'development',
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
  sms: { name: 'sms', expiresIn: 600, codeLength: 4 },
  businessNumber: { name: 'business-number', expiresIn: 3600, codeLength: 4 }
}
const ACCOUNT_PLAN_TYPE = {
  Prepaid: 'd9718ee1-50a1-4826-b0fa-ad1394308d59',
  Postpaid: 'eb004696-bcad-4998-adbb-d25fbbd3ad68',
  SemiPostPaid: '570af199-5b7c-4e7f-bc9f-e298d65b6273'
}
const USER_ROLE_ID = {
  admin: '7393e61e-df2e-4643-9eee-0f2382d19afa'
}

const TEMPLATE_TYPE = [{
  templateType: 'Standard Message Template'
}, {
  templateType: 'Media Message Template'
}]

const TEMPLATE_STATUS = ['Approved', 'Rejected']
const DEFAULT_WABA_SETUP_STATUS_ID = '7933d858-7bb7-47eb-90ec-269cbecc8c9b'
const PUBLIC_FOLDER_PATH = process.env.PWD + '/public'
const USER_CONFIG_REDIS_TTL = 300
const SERVER_TIMEOUT = 20 * 60 * 1000

module.exports.RESPONSE_MESSAGES = require('./apiResponse')
module.exports.CUSTOM_CONSTANT = CUSTOM_CONSTANT
module.exports.VERIFICATION_CHANNEL = VERIFICATION_CHANNEL
module.exports.ACCOUNT_PLAN_TYPE = ACCOUNT_PLAN_TYPE
module.exports.USER_ROLE_ID = USER_ROLE_ID
module.exports.PUBLIC_FOLDER_PATH = PUBLIC_FOLDER_PATH
module.exports.USER_CONFIG_REDIS_TTL = USER_CONFIG_REDIS_TTL
module.exports.MYSQL_QUERY = MYSQL_QUERY
module.exports.APP_NAME = APP_NAME
module.exports.DB_NAME = DB_NAME
module.exports.SERVER_TIMEOUT = SERVER_TIMEOUT
module.exports.TEMPLATE_TYPE = TEMPLATE_TYPE
module.exports.DEFAULT_WABA_SETUP_STATUS_ID = DEFAULT_WABA_SETUP_STATUS_ID
module.exports.TEMPLATE_STATUS = TEMPLATE_STATUS
