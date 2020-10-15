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
  UAT_ENV: 'uat',
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
  SESSION_TIME: 86400,
  AUTH_TOKEN_30_DAYS: 2592000,
  AUTH_TOKEN_30_MINS: 1800
}
const VERIFICATION_CHANNEL = {
  email: { name: 'email', expiresIn: 3600, codeLength: 4 },
  sms: { name: 'sms', expiresIn: 600, codeLength: 4 },
  businessNumber: { name: 'business-number', expiresIn: 3600, codeLength: 4 },
  emailTfa: { name: 'email2fa', expiresIn: 300, codeLength: 6 },
  smsTfa: { name: 'sms2fa', expiresIn: 300, codeLength: 6 }
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
const PLAN_CATEGORY = {
  standard: 'Standard',
  custom: 'Custom'
}
const RESET_PASSWORD_TOKEN_EXPIREY_TIME = 3600
const FREE_PLAN_ID = 'cd9b694f-3106-4ce3-8b87-b02d8754fe9b'
const TEMPLATE_STATUS = {
  rejected: { statusCode: '1cc8cc1f-282a-4431-8618-43effb1ef7c0', displayName: 'Rejected' },
  approved: { statusCode: '1d9d14ca-d3ec-4bea-b3de-05fcb8ceabd9', displayName: 'Approved' },
  requested: { statusCode: '3dd78583-9acd-42e8-b9f3-0413b3a339eb', displayName: 'Requested' },
  submitFailed: { statusCode: '512155a0-9006-4a0d-89d0-b023d887bd9a', displayName: 'Submit-Failed' },
  partiallyApproved: { statusCode: '588cff76-d6d1-49a3-8280-8c2c1d99bb81', displayName: 'Partially Approved' },
  denied: { statusCode: '82889bf2-6142-4750-bca8-2e25ahsbvhsbhsbvh', displayName: 'Denied' },
  deleted: { statusCode: '90789bf2-6142-4750-bca8-2e25a9a7e4aa', displayName: 'Deleted' },
  pending: { statusCode: '9d2560a6-732e-4ac2-b1fa-47f89a28b6dd', displayName: 'Pending' },
  submitted: { statusCode: 'b4414c85-5f80-4e8d-98bc-44bbc05b14b1', displayName: 'Submitted' },
  complete: { statusCode: 'c71a8387-80e0-468b-9ee3-abb5ec328176', displayName: 'Complete' },
  incomplete: { statusCode: 'd11a8387-80e0-468b-9ee3-abb5eckil980', displayName: 'Incomplete' }
}
const DEFAULT_WABA_SETUP_STATUS_ID = '7933d858-7bb7-47eb-90ec-269cbecc8c9b'
const PUBLIC_FOLDER_PATH = process.env.PWD + '/public'
const REDIS_TTL = {
  userConfig: 300,
  wabaData: 900,
  templateData: 300
}
const SERVER_TIMEOUT = 20 * 60 * 1000
const ENTITY_NAME = {
  MESSAGE_TEMPLATE_CATEGORY: 'message_template_category',
  MESSAGE_TEMPLATE_LANGUAGE: 'message_template_language',
  MESSAGE_TEMPLATE_STATUS: 'message_template_status',
  WABA_INFORMATION: 'waba_information',
  BUSINESS_CATEGORY: 'business_category',
  WABA_PROFILE_SETUP_STATUS: 'waba_profile_setup_status',
  APP_CATEGORY: 'app_category',
  MESSAGE_TEMPLATE: 'message_template',
  HISTORY_DATA: 'history_data',
  BILLING_INFORMATION: 'billing_information',
  USERS: 'users',
  USER_ROLE: 'user_role',
  SERVICE_PROVIDER: 'service_provider',
  SERVICE_PROVIDER_APPS: 'service_provider_apps',
  USER_VERIFICATION_CODE: 'user_verification_code',
  USER_APPS: 'user_apps',
  USER_ACCOUNT_TYPE: 'user_account_type',
  USER_ACCOUNT_PROFILE: 'user_account_profile',
  MESSAGE_TEMPLATE_LIBRARY: 'message_template_library',
  USER_AGREEMENT_FILES: 'user_agreement_files',
  AUDIENCE: 'audience',
  USERS_TFA: 'users_tfa'
}
const TEMPLATE_HEADER_TYPE = [{
  templateHeaderType: 'Video'
}, {
  templateHeaderType: 'Pdf'
}, {
  templateHeaderType: 'Location'
}, {
  templateHeaderType: 'Text'
}]
const TEMPLATE_BUTTON_TYPE = [{
  buttonType: 'Call To Action'
}, {
  buttonType: 'Quick Reply'
}]
const MQ = {
  process_message: { type: 'queue', q_name: 'process_message', q_options: { durable: true, maxPriority: 10 }, prefetchCount: 1, createChannel: true },
  mock: { type: 'queue', q_name: 'mock_provider', q_options: { durable: true }, prefetchCount: 1, createChannel: true },
  mockSendmessageError: { type: 'queue', q_name: 'mock_sendmessage_error', q_options: { durable: true }, prefetchCount: 1, createChannel: true },
  tyntecSendmessageError: { type: 'queue', q_name: 'tyntec_sendmessage_error', q_options: { durable: true }, prefetchCount: 1, createChannel: true },
  tyntecOutgoing: { type: 'queue', q_name: 'tyntec_outgoing', q_options: { durable: true }, prefetchCount: 1, createChannel: true },
  tyntecIncoming: { type: 'queue', q_name: 'tyntec_incoming', q_options: { durable: true }, prefetchCount: 1, createChannel: true },
  tyntecMessageStatus: { type: 'queue', q_name: 'tyntec_message_status', q_options: { durable: true }, prefetchCount: 1, createChannel: true },
  delay_failed_to_redirect_10_sec: { type: 'queue', q_name: 'delay_failed_to_redirect_10_sec', q_options: { durable: true, maxPriority: 10, messageTtl: 10000, deadLetterExchange: '', deadLetterRoutingKey: 'retry_failed_to_redirect_payload' }, prefetchCount: 1, createChannel: true },
  delay_failed_to_redirect_20_sec: { type: 'queue', q_name: 'delay_failed_to_redirect_20_sec', q_options: { durable: true, maxPriority: 10, messageTtl: 20000, deadLetterExchange: '', deadLetterRoutingKey: 'retry_failed_to_redirect_payload' }, prefetchCount: 1, createChannel: true },
  delay_failed_to_redirect_30_sec: { type: 'queue', q_name: 'delay_failed_to_redirect_30_sec', q_options: { durable: true, maxPriority: 10, messageTtl: 30000, deadLetterExchange: '', deadLetterRoutingKey: 'retry_failed_to_redirect_payload' }, prefetchCount: 1, createChannel: true },
  delay_failed_to_redirect_40_sec: { type: 'queue', q_name: 'delay_failed_to_redirect_40_sec', q_options: { durable: true, maxPriority: 10, messageTtl: 40000, deadLetterExchange: '', deadLetterRoutingKey: 'retry_failed_to_redirect_payload' }, prefetchCount: 1, createChannel: true },
  delay_failed_to_redirect_50_sec: { type: 'queue', q_name: 'delay_failed_to_redirect_50_sec', q_options: { durable: true, maxPriority: 10, messageTtl: 50000, deadLetterExchange: '', deadLetterRoutingKey: 'retry_failed_to_redirect_payload' }, prefetchCount: 1, createChannel: true },
  retry_failed_to_redirect_payload: { type: 'queue', q_name: 'retry_failed_to_redirect_payload', q_options: { durable: true }, prefetchCount: 1, createChannel: true }

}
const INCOMING_MESSAGE_RETRY = {
  tyntec: 5
}
const OUTGOING_MESSAGE_RETRY = {
  tyntec: 5
}
const DELIVERY_CHANNEL = {
  whatsapp: 'whatsapp'
}
const INTERNAL_END_POINTS = {
  sendMessageToQueue: '/helowhatsapp/api/chat/v1/messages',
  addupdateAudience: '/helowhatsapp/api/audience',
  getWabaNumberByUserId: '/helowhatsapp/api/business/internal/wabaPhoneNumber',
  addUpdateOptinText: '/helowhatsapp/api/business/profile/optinmessage',
  businessProfile: '/helowhatsapp/api/business/profile',
  sendOtpViaEmail: '/helowhatsapp/api/users/otp/email',
  sendOtpViaSms: '/helowhatsapp/api/users/otp/sms',
  redirectToWameUrl: '/helowhatsapp/api/audience/optin/url/redirect',
  userLogin: '/helowhatsapp/api/users/auth/login'
}
const HW_MYSQL_NAME = 'helo_whatsapp_mysql'
const MESSAGE_STATUS = {
  inProcess: 'in process',
  resourceAllocated: 'resource allocated',
  forwarded: 'forwarded',
  deleted: 'deleted',
  seen: 'seen',
  delivered: 'delivered',
  accepted: 'accepted',
  failed: 'failed'
}
const VALIDATOR = {
  email: '^(([^<>()\\[\\]\\.,;:\\s@"]+(\\.[^<>()\\[\\]\\.,;:\\s@"]+)*)|(".+"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$',
  password: '^(?=.*?[A-Z])(?=(.*[a-z]){1,})(?=(.*[\\d]){2,})(?=(.*[\\W]){1,})(?!.*\\s).{8,}$',
  text: '^[a-zA-Z]+$',
  number: '^[0-9]+$',
  aplphaNumeric: '^[a-zA-Z0-9]+$',
  phoneNumber: '^\\d{1,10}$',
  postalCode: '^\\d{1,6}$',
  phoneCode: '^\\d{1,2}$',
  timeStamp: '^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]$'
}
const CHAT_APP_ENDPOINTS = {
  chatFlow: '/helowhatsappchat/api/flowmessage/chat',
  metadata: '/helowhatsappchat/api/flowmessage/chat/metadata'
}
const TAG = {
  insert: 'insert',
  update: 'update'
}
const TEMPLATE_DEFAULT_LANGUAGE_STATUS = 'b4414c85-5f80-4e8d-98bc-44bbc05b14b1'
const TEMPLATE_DEFAULT_STATUS = 'd11a8387-80e0-468b-9ee3-abb5eckil980'
const TYNTEC_ENDPOINTS = {
  sendMessage: '/chat-api/v2/messages',
  addTemplate: '/chat-api/v2/channels/whatsapp/accounts/:accountId/templates',
  getTemplateList: '/chat-api/v2/channels/whatsapp/accounts/:accountId/templates',
  getTemplateInfo: '/chat-api/v2/channels/whatsapp/accounts/:accountId/templates/:templateId'
}
const MESSAGE_TRANSACTION_TYPE = ['incoming', 'outgoing', '']
const TEMPLATE_APPROVE_STATUS = '1d9d14ca-d3ec-4bea-b3de-05fcb8ceabd9'
const TEMPLATE_PARTIAL_APPROVE_STATUS = '588cff76-d6d1-49a3-8280-8c2c1d99bb81'
const ADMIN_PANNEL_ENDPOINTS = {
  adminPannelResetPassword: '/#/new-password'
}
const TFA_TYPE_ENUM = ['sms', 'email', 'authenticator']
const TFA_BACKUP_CODES_AMOUNT = 5
const TFA_AUTHENTICATOR_LABEL = 'helo-whatsapp'
const WA_ME_URL = 'https://wa.me'
const TFA_TYPE_DISPLAYNAME = {
  [TFA_TYPE_ENUM[0]]: 'Phone Number',
  [TFA_TYPE_ENUM[1]]: 'Email Address',
  [TFA_TYPE_ENUM[2]]: 'Authenticator App'
}

module.exports.RESPONSE_MESSAGES = require('./apiResponse')
module.exports.CUSTOM_CONSTANT = CUSTOM_CONSTANT
module.exports.VERIFICATION_CHANNEL = VERIFICATION_CHANNEL
module.exports.ACCOUNT_PLAN_TYPE = ACCOUNT_PLAN_TYPE
module.exports.USER_ROLE_ID = USER_ROLE_ID
module.exports.PUBLIC_FOLDER_PATH = PUBLIC_FOLDER_PATH
module.exports.MYSQL_QUERY = MYSQL_QUERY
module.exports.APP_NAME = APP_NAME
module.exports.DB_NAME = DB_NAME
module.exports.SERVER_TIMEOUT = SERVER_TIMEOUT
module.exports.TEMPLATE_TYPE = TEMPLATE_TYPE
module.exports.TEMPLATE_HEADER_TYPE = TEMPLATE_HEADER_TYPE
module.exports.TEMPLATE_BUTTON_TYPE = TEMPLATE_BUTTON_TYPE
module.exports.DEFAULT_WABA_SETUP_STATUS_ID = DEFAULT_WABA_SETUP_STATUS_ID
module.exports.TEMPLATE_STATUS = TEMPLATE_STATUS
module.exports.ENTITY_NAME = ENTITY_NAME
module.exports.TEMPLATE_HEADER_TYPE = TEMPLATE_HEADER_TYPE
module.exports.TEMPLATE_BUTTON_TYPE = TEMPLATE_BUTTON_TYPE
module.exports.PLAN_CATEGORY = PLAN_CATEGORY
module.exports.FREE_PLAN_ID = FREE_PLAN_ID
module.exports.MQ = MQ
module.exports.INCOMING_MESSAGE_RETRY = INCOMING_MESSAGE_RETRY
module.exports.OUTGOING_MESSAGE_RETRY = OUTGOING_MESSAGE_RETRY
module.exports.DELIVERY_CHANNEL = DELIVERY_CHANNEL
module.exports.INTERNAL_END_POINTS = INTERNAL_END_POINTS
module.exports.HW_MYSQL_NAME = HW_MYSQL_NAME
module.exports.MESSAGE_STATUS = MESSAGE_STATUS
module.exports.REDIS_TTL = REDIS_TTL
module.exports.VALIDATOR = VALIDATOR
module.exports.TAG = TAG
module.exports.CHAT_APP_ENDPOINTS = CHAT_APP_ENDPOINTS
module.exports.RESET_PASSWORD_TOKEN_EXPIREY_TIME = RESET_PASSWORD_TOKEN_EXPIREY_TIME
module.exports.TEMPLATE_DEFAULT_LANGUAGE_STATUS = TEMPLATE_DEFAULT_LANGUAGE_STATUS
module.exports.TEMPLATE_DEFAULT_STATUS = TEMPLATE_DEFAULT_STATUS
module.exports.TYNTEC_ENDPOINTS = TYNTEC_ENDPOINTS
module.exports.MESSAGE_TRANSACTION_TYPE = MESSAGE_TRANSACTION_TYPE
module.exports.TEMPLATE_APPROVE_STATUS = TEMPLATE_APPROVE_STATUS
module.exports.TEMPLATE_PARTIAL_APPROVE_STATUS = TEMPLATE_PARTIAL_APPROVE_STATUS
module.exports.ADMIN_PANNEL_ENDPOINTS = ADMIN_PANNEL_ENDPOINTS
module.exports.TFA_TYPE_ENUM = TFA_TYPE_ENUM
module.exports.TFA_BACKUP_CODES_AMOUNT = TFA_BACKUP_CODES_AMOUNT
module.exports.TFA_AUTHENTICATOR_LABEL = TFA_AUTHENTICATOR_LABEL
module.exports.WA_ME_URL = WA_ME_URL
module.exports.TFA_TYPE_DISPLAYNAME = TFA_TYPE_DISPLAYNAME
