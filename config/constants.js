
const APP_NAME = 'helowhatsapp'
const DB_NAME = 'helowhatsapp'
// const DB_NAME = 'whatsapp1'
const UPDATE_PROFILE_CONFIGURE_DATA = {
  // API_KEY: 'APIKEY@123',
  MAX_TPA_TO_PROVIDER: 15,
  TEMPLATESAllOWED: 2,
  TPS: 10

}
const DOWNLOAD_STATUS = {
  inProcess: 'InProcess',
  completed: 'Completed',
  fileExists: 'FileExists'
}
const CUSTOM_CONSTANT = {
  DEV_ENV: 'development',
  PROD_ENV: 'production',
  UAT_ENV: 'uat',
  STAG_ENV: 'staging',
  UPLOAD_ERROR_MSG: {
    LIMIT_FILE_SIZE: 'LIMIT_FILE_SIZE',
    WRONG_EXTENSION: 'WRONG_EXTENSION',
    UPLOAD_DIRECTORY_MISSING: 'UPLOAD_DIRECTORY_MISSING'
  },
  BOOL_STATUS: {
    TRUE: 1,
    FALSE: 0
  },
  CHAR_COUNT: {
    ONE: [95, 10, 13],
    TWO: [126, 94, 124, 92, 123, 125, 91, 93],
    THREE: [96]
  },
  // SESSION_TIME: 86400,
  SESSION_TIME: 691200, // 4 days
  AUTH_TOKEN_30_DAYS: 2592000,
  AUTH_TOKEN_30_MINS: 1800
}
const VERIFICATION_CHANNEL = {
  email: { name: 'email', expiresIn: 3600, codeLength: 4 },
  sms: { name: 'sms', expiresIn: 600, codeLength: 6 },
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
const DEFAULT_WABA_SETUP_STATUS_ID = '7933d858-7bb7-47eb-90ec-269cbecc8c9b'
const PUBLIC_FOLDER_PATH = process.env.PWD + '/public'
const REDIS_TTL = {
  userConfig: 300,
  wabaData: 900,
  templateData: 300,
  childMessage: 360,
  optinTemplateData: 43200,
  fbtemplateName: 3600
}
const SERVER_TIMEOUT = 2 * 60 * 1000
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
  USERS_TFA: 'users_tfa',
  AUD_WABA_NO_MAPPING: 'audience_waba_no_mapping',
  OPTION_SOURCE: 'optin_source',
  SEGMENT: 'segment',
  MESSAGES: 'messages',
  MESSAGE_STATUS: 'message_status',
  DOWNLOAD_STATUS: 'download_status',
  MESSAGE_STATUS_ERROR: 'message_status_error',
  CAMPAIGNAME_SUMMARY_REPORT: 'campaignname_summary_report',
  CONVERSATION_SUMMARY: 'conversation_summary',
  TEMEPLATE_SUMMARY: 'template_summary'
}
const TEMPLATE_HEADER_TYPE = [{
  templateHeaderType: 'Video'
}, {
  templateHeaderType: 'Document'
}, {
  templateHeaderType: 'Location'
}, {
  templateHeaderType: 'Text'
},
{
  templateHeaderType: 'Image'
}, {
  templateHeaderType: null
}]
const TEMPLATE_BUTTON_TYPE = [{
  buttonType: 'Call To Action'
}, {
  buttonType: 'Quick Reply'
}, {
  buttonType: null
}]
const PREFETCH_COUNT = +process.env.QUEUE_PREFETCH_COUNT || 25
const MQ = {
  // pre_process_message: { type: 'queue', q_name: 'pre_process_message', q_options: { durable: true, maxPriority: 10 }, prefetchCount: PREFETCH_COUNT, createChannel: true },
  pre_process_message_chatbot: { type: 'queue', q_name: 'pre_process_message_chatbot', q_options: { durable: true, maxPriority: 10 }, prefetchCount: PREFETCH_COUNT, createChannel: true },
  pre_process_message_category_otp: { type: 'queue', q_name: 'pre_process_message_category_otp', q_options: { durable: true, maxPriority: 10 }, prefetchCount: PREFETCH_COUNT, createChannel: true },
  pre_process_message_category_transactional: { type: 'queue', q_name: 'pre_process_message_category_transactional', q_options: { durable: true, maxPriority: 10 }, prefetchCount: PREFETCH_COUNT, createChannel: true },
  pre_process_message_category_promotional: { type: 'queue', q_name: 'pre_process_message_category_promotional', q_options: { durable: true, maxPriority: 10 }, prefetchCount: PREFETCH_COUNT, createChannel: true },
  pre_process_message_general: { type: 'queue', q_name: 'pre_process_message_general', q_options: { durable: true, maxPriority: 10 }, prefetchCount: PREFETCH_COUNT, createChannel: true },
  pre_process_message_campaign: { type: 'queue', q_name: 'pre_process_message_campaign', q_options: { durable: true, maxPriority: 10 }, prefetchCount: PREFETCH_COUNT, createChannel: true },
  // process_message: { type: 'queue', q_name: 'process_message', q_options: { durable: true, maxPriority: 10 }, prefetchCount: PREFETCH_COUNT, createChannel: true },
  process_message_chatbot: { type: 'queue', q_name: 'process_message_chatbot', q_options: { durable: true, maxPriority: 10 }, prefetchCount: PREFETCH_COUNT, createChannel: true },
  process_message_category_otp: { type: 'queue', q_name: 'process_message_category_otp', q_options: { durable: true, maxPriority: 10 }, prefetchCount: PREFETCH_COUNT, createChannel: true },
  process_message_category_transactional: { type: 'queue', q_name: 'process_message_category_transactional', q_options: { durable: true, maxPriority: 10 }, prefetchCount: PREFETCH_COUNT, createChannel: true },
  process_message_category_promotional: { type: 'queue', q_name: 'process_message_category_promotional', q_options: { durable: true, maxPriority: 10 }, prefetchCount: PREFETCH_COUNT, createChannel: true },
  process_message_general: { type: 'queue', q_name: 'process_message_general', q_options: { durable: true, maxPriority: 10 }, prefetchCount: PREFETCH_COUNT, createChannel: true },
  process_message_campaign: { type: 'queue', q_name: 'process_message_campaign', q_options: { durable: true, maxPriority: 10 }, prefetchCount: PREFETCH_COUNT, createChannel: true },
  mock: { type: 'queue', q_name: 'mock_provider', q_options: { durable: true }, prefetchCount: PREFETCH_COUNT, createChannel: true },
  mockSendmessageError: { type: 'queue', q_name: 'mock_sendmessage_error', q_options: { durable: true }, prefetchCount: PREFETCH_COUNT, createChannel: true },
  tyntecSendmessageError: { type: 'queue', q_name: 'tyntec_sendmessage_error', q_options: { durable: true }, prefetchCount: PREFETCH_COUNT, createChannel: true },
  tyntecOutgoing: { type: 'queue', q_name: 'tyntec_outgoing', q_options: { durable: true }, prefetchCount: PREFETCH_COUNT, createChannel: true },
  fbOutgoing: { type: 'queue', q_name: 'fb_outgoing', q_options: { durable: true }, prefetchCount: PREFETCH_COUNT, createChannel: true },
  fbSendmessageError: { type: 'queue', q_name: 'fb_sendmessage_error', q_options: { durable: true }, prefetchCount: PREFETCH_COUNT, createChannel: true },
  tyntecIncoming: { type: 'queue', q_name: 'tyntec_incoming', q_options: { durable: true }, prefetchCount: PREFETCH_COUNT, createChannel: true },
  fbIncoming: { type: 'queue', q_name: 'fb_incoming', q_options: { durable: true }, prefetchCount: PREFETCH_COUNT, createChannel: true },
  tyntecMessageStatus: { type: 'queue', q_name: 'tyntec_message_status', q_options: { durable: true }, prefetchCount: PREFETCH_COUNT, createChannel: true },
  fbMessageStatus: { type: 'queue', q_name: 'fb_message_status', q_options: { durable: true }, prefetchCount: PREFETCH_COUNT, createChannel: true },
  delay_failed_to_redirect_10_sec: { type: 'queue', q_name: 'delay_failed_to_redirect_10_sec', q_options: { durable: true, maxPriority: 10, messageTtl: 10000, deadLetterExchange: '', deadLetterRoutingKey: 'retry_failed_to_redirect_payload' }, prefetchCount: PREFETCH_COUNT, createChannel: true },
  delay_failed_to_redirect_20_sec: { type: 'queue', q_name: 'delay_failed_to_redirect_20_sec', q_options: { durable: true, maxPriority: 10, messageTtl: 20000, deadLetterExchange: '', deadLetterRoutingKey: 'retry_failed_to_redirect_payload' }, prefetchCount: PREFETCH_COUNT, createChannel: true },
  delay_failed_to_redirect_30_sec: { type: 'queue', q_name: 'delay_failed_to_redirect_30_sec', q_options: { durable: true, maxPriority: 10, messageTtl: 30000, deadLetterExchange: '', deadLetterRoutingKey: 'retry_failed_to_redirect_payload' }, prefetchCount: PREFETCH_COUNT, createChannel: true },
  delay_failed_to_redirect_40_sec: { type: 'queue', q_name: 'delay_failed_to_redirect_40_sec', q_options: { durable: true, maxPriority: 10, messageTtl: 40000, deadLetterExchange: '', deadLetterRoutingKey: 'retry_failed_to_redirect_payload' }, prefetchCount: PREFETCH_COUNT, createChannel: true },
  delay_failed_to_redirect_50_sec: { type: 'queue', q_name: 'delay_failed_to_redirect_50_sec', q_options: { durable: true, maxPriority: 10, messageTtl: 50000, deadLetterExchange: '', deadLetterRoutingKey: 'retry_failed_to_redirect_payload' }, prefetchCount: PREFETCH_COUNT, createChannel: true },
  retry_failed_to_redirect_payload: { type: 'queue', q_name: 'retry_failed_to_redirect_payload', q_options: { durable: true }, prefetchCount: PREFETCH_COUNT, createChannel: true },
  tyntecOutgoingSync: { type: 'queue', q_name: 'tyntec_outgoing_sync', q_options: { durable: true }, prefetchCount: PREFETCH_COUNT, createChannel: true },
  fbOutgoingSync: { type: 'queue', q_name: 'fb_outgoing_sync', q_options: { durable: true }, prefetchCount: PREFETCH_COUNT, createChannel: true },
  webhookHeloCampaign: { type: 'queue', q_name: 'webhook_helo_campaign', q_options: { durable: true, maxPriority: 10 }, prefetchCount: PREFETCH_COUNT, createChannel: true },
  webhookQueue: { type: 'queue', q_name: 'webhook_queue', q_options: { durable: true, maxPriority: 10 }, prefetchCount: PREFETCH_COUNT, createChannel: true },
  audience_webhook: { type: 'queue', q_name: 'audience_webhook', q_options: { durable: true, maxPriority: 10 }, prefetchCount: PREFETCH_COUNT, createChannel: true },
  default: { type: 'queue', q_name: 'default', q_options: { durable: true, maxPriority: 10 }, prefetchCount: PREFETCH_COUNT, createChannel: true },
  demoQueue: { type: 'queue', q_name: 'demoQueue', q_options: { durable: true }, prefetchCount: PREFETCH_COUNT, createChannel: true },
  demo_queue_10_sec: { type: 'queue', q_name: 'demo_queue_10_sec', q_options: { durable: true, maxPriority: 10, messageTtl: 10000, deadLetterExchange: '', deadLetterRoutingKey: 'demoQueue' }, prefetchCount: PREFETCH_COUNT, createChannel: true },
  wabaSetUpConsumerQueue: { type: 'queue', q_name: 'wabaSetUpConsumerQueue', q_options: { durable: true }, prefetchCount: PREFETCH_COUNT, createChannel: true },
  wabaSetUpConsumer_queue_10_sec: { type: 'queue', q_name: 'wabaSetUpConsumer_queue_10_sec', q_options: { durable: true, maxPriority: 10, messageTtl: 10000, deadLetterExchange: '', deadLetterRoutingKey: 'wabaSetUpConsumerQueue' }, prefetchCount: PREFETCH_COUNT, createChannel: true },
  wabaSetUpConsumer_queue_15_min: { type: 'queue', q_name: 'wabaSetUpConsumer_queue_15_min', q_options: { durable: true, maxPriority: 10, messageTtl: 900000, deadLetterExchange: '', deadLetterRoutingKey: 'wabaSetUpConsumerQueue' }, prefetchCount: PREFETCH_COUNT, createChannel: true },
  bussinessDetailsConsumerQueue: { type: 'queue', q_name: 'bussinessDetailsConsumerQueue', q_options: { durable: true }, prefetchCount: PREFETCH_COUNT, createChannel: true },
  bussinessDetailsConsumer_queue_10_sec: { type: 'queue', q_name: 'bussinessDetailsConsumer_queue_10_sec', q_options: { durable: true, maxPriority: 10, messageTtl: 10000, deadLetterExchange: '', deadLetterRoutingKey: 'bussinessDetailsConsumerQueue' }, prefetchCount: PREFETCH_COUNT, createChannel: true },
  spawningContainerConsumerQueue: { type: 'queue', q_name: 'spawningContainerConsumerQueue', q_options: { durable: true }, prefetchCount: PREFETCH_COUNT, createChannel: true },
  spawningContainerConsumer_queue_10_sec: { type: 'queue', q_name: 'spawningContainerConsumer_queue_10_sec', q_options: { durable: true, maxPriority: 10, messageTtl: 10000, deadLetterExchange: '', deadLetterRoutingKey: 'spawningContainerConsumerQueue' }, prefetchCount: PREFETCH_COUNT, createChannel: true },
  wabaContainerBindingConsumerQueue: { type: 'queue', q_name: 'wabaContainerBindingConsumerQueue', q_options: { durable: true }, prefetchCount: PREFETCH_COUNT, createChannel: true },
  wabaContainerBindingConsumer_queue_10_sec: { type: 'queue', q_name: 'wabaContainerBindingConsumer_queue_10_sec', q_options: { durable: true, maxPriority: 10, messageTtl: 10000, deadLetterExchange: '', deadLetterRoutingKey: 'wabaContainerBindingConsumerQueue' }, prefetchCount: PREFETCH_COUNT, createChannel: true },
  wabaContainerBindingConsumer_queue_2_min: { type: 'queue', q_name: 'wabaContainerBindingConsumer_queue_2_min', q_options: { durable: true, maxPriority: 10, messageTtl: 120000, deadLetterExchange: '', deadLetterRoutingKey: 'wabaContainerBindingConsumerQueue' }, prefetchCount: PREFETCH_COUNT, createChannel: true },
  wabaContainerBindingConsumer_queue_15_min: { type: 'queue', q_name: 'wabaContainerBindingConsumer_queue_15_min', q_options: { durable: true, maxPriority: 10, messageTtl: 900000, deadLetterExchange: '', deadLetterRoutingKey: 'wabaContainerBindingConsumerQueue' }, prefetchCount: PREFETCH_COUNT, createChannel: true },
  twoFaConsumerQueue: { type: 'queue', q_name: 'twoFaConsumerQueue', q_options: { durable: true }, prefetchCount: PREFETCH_COUNT, createChannel: true },
  facebookErrorConsumer: { type: 'queue', q_name: 'fb_sendmessage_error', q_options: { durable: true }, prefetchCount: PREFETCH_COUNT, createChannel: true },
  reportsDownloadConsumer: { type: 'queue', q_name: 'dlr_reports_download', q_options: { durable: true }, prefetchCount: PREFETCH_COUNT, createChannel: true },
  twoFaConsumer_queue_10_sec: { type: 'queue', q_name: 'twoFaConsumer_queue_10_sec', q_options: { durable: true, maxPriority: 10, messageTtl: 10000, deadLetterExchange: '', deadLetterRoutingKey: 'twoFaConsumerQueue' }, prefetchCount: PREFETCH_COUNT, createChannel: true },
  embeddedSingupErrorConsumerQueue: { type: 'queue', q_name: 'embeddedSingupErrorConsumerQueue', q_options: { durable: true }, prefetchCount: PREFETCH_COUNT, createChannel: true },
  embeddedSingupErrorConsumer_queue_10_sec: { type: 'queue', q_name: 'embeddedSingupErrorConsumer_queue_10_sec', q_options: { durable: true, maxPriority: 10, messageTtl: 10000, deadLetterExchange: '', deadLetterRoutingKey: 'embeddedSingupErrorConsumerQueue' }, prefetchCount: PREFETCH_COUNT, createChannel: true },
  embeddedSingupErrorConsumerQueue2: { type: 'queue', q_name: 'embeddedSingupErrorConsumerQueue2', q_options: { durable: true }, prefetchCount: PREFETCH_COUNT, createChannel: true },
  send_optin_excel_stream: { type: 'queue', q_name: 'send_optin_excel_stream', q_options: { durable: true, maxPriority: 10 }, prefetchCount: PREFETCH_COUNT, createChannel: true }
  // default: { type: 'queue', q_name: 'default', q_options: { durable: true, maxPriority: 10 }, prefetchCount: PREFETCH_COUNT, createChannel: true }
}
const INCOMING_MESSAGE_RETRY = {
  tyntec: 5,
  facebook: 5
}
const OUTGOING_MESSAGE_RETRY = {
  tyntec: 5,
  facebook: 5
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
  userLogin: '/helowhatsapp/api/users/auth/login',
  updateTemplateStatus: '/helowhatsapp/api/templates/',
  businessProfileLogoByUrl: '/helowhatsapp/api/business/profile/logo/url',
  addUpdateWabNoMapping: '/helowhatsapp/api/audience/internal/waba',
  getServiceProviderDetailsByUserId: '/helowhatsapp/api/business/internal/getServiceProviderDetailsByUserId',
  updateAgreementStatus: '/helowhatsapp/api/users/agreement/status',
  getMessageHistory: '/helowhatsapp/api/chat/v1/messages/tracking/:messageId',
  updateServiceProvider: '/helowhatsapp/api/business/profile/serviceProvider',
  updateAccountConfig: '/helowhatsapp/api/users/account/config',
  getTps: '/helowhatsapp/api/users/account/config/:userId',
  heloOssUpload: '/helowhatsapp/api/frontEnd/helo-oss/upload',
  heloOssBasePath: '/helowhatsapp/api/frontEnd/helo-oss',
  templateApproval: '/helowhatsapp/api/templates/:templateId/submit/:evaluationResult',
  templateList: '/helowhatsapp/api/templates/list',
  getTemplateListWithStatusId: '/helowhatsapp/api/templates?messageTemplateStatusId=',
  templateInfo: '/helowhatsapp/api/templates/:userId/:templateId',
  toggleChatbot: '/helowhatsapp/api/business/profile/chatbot',
  accessInformation: '/helowhatsapp/api/business/profile/accessInformation',
  markManagerVerified: '/helowhatsapp/api/business/profile/markManagerVerified',
  sendBusinessForApproval: '/helowhatsapp/api/business/profile/submit',
  setProfileStatus: '/helowhatsapp/api/business/profile/status',
  updateProfileConfigure: '/helowhatsapp/api/business/profile/configure',
  embeddedSignupSupportApi: '/helowhatsapp/api/users/signup/embedded/continue'
}
const HW_MYSQL_NAME = 'helo_whatsapp_mysql'
const HW_MYSQL_MIS_NAME = 'helo_whatsapp_mis_mysql'

const MESSAGE_STATUS = {
  preProcess: 'pre process',
  inProcess: 'in process',
  resourceAllocated: 'resource allocated',
  forwarded: 'forwarded',
  deleted: 'deleted',
  seen: 'seen',
  delivered: 'delivered',
  accepted: 'accepted',
  failed: 'failed',
  pending: 'waiting for pending delivery',
  rejected: 'rejected'
}
const MESSAGE_STATUS_FOR_DISPLAY = [
  MESSAGE_STATUS.preProcess,
  MESSAGE_STATUS.inProcess,
  MESSAGE_STATUS.accepted,
  MESSAGE_STATUS.delivered,
  MESSAGE_STATUS.seen,
  MESSAGE_STATUS.deleted,
  MESSAGE_STATUS.failed,
  MESSAGE_STATUS.rejected
]
const VALIDATOR = {
  email: '^(([^<>()\\[\\]\\.,;:\\s@"]+(\\.[^<>()\\[\\]\\.,;:\\s@"]+)*)|(".+"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$',
  password: '^(?=.*?[A-Z])(?=(.*[a-z]){1,})(?=(.*[\\d]){2,})(?=(.*[\\W]){1,})(?!.*\\s).{8,}$',
  text: '^[a-zA-Z]+$',
  textWithSpace: '^[a-zA-Z\t\\s]*$',
  number: '^[0-9]+$',
  aplphaNumeric: '^[a-zA-Z0-9]+$',
  phoneNumber: '^\\d{1,15}$',
  phoneNumberWithPhoneCode: '^[\\d+]{1,4}\\s?[0-9]{15}$',
  postalCode: '^\\d{1,6}$',
  phoneCode: '^\\d{1,2}$',
  timeStamp: '^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]$',
  timeStampSummary: '^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])T(2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9].[0-9][0-9][0-9]Z$',
  aplphaNumericWithUnderscore: '^[a-z0-9_]+$',
  fileExtType: /^(jpg|jpeg|png)$/,
  url: /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/,
  gst: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
  pan: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i,
  noTabLinebreakSpace: /^(?:(.)(?!\s\s\s\s)(?!\n)(?!\t))*$/g,
  empty: /^''$/g
}
const CHAT_APP_ENDPOINTS = {
  chatFlow: '/helowhatsappchat/api/flowmessage/chat',
  metadata: '/helowhatsappchat/api/flowmessage/chat/metadata',
  categories: '/helowhatsappchat/api/flowmessage/flow/categories',
  getFlow: '/helowhatsappchat/api/flowmessage/flow/:flowTopicId',
  getIdentifier: '/helowhatsappchat/api/flowmessage/flow/:flowTopicId/:identifierText',
  deleteFlow: '/helowhatsappchat/api/flowmessage/flow/:flowTopicId',
  deleteIdentifier: '/helowhatsappchat/api/flowmessage/flow/:flowTopicId/:identifierText',
  flow: '/helowhatsappchat/api/flowmessage/flow',
  sendMessage: '/helowhatsappchat/api/flowmessage/chat/sendMessage',
  invoke: '/helowhatsappchat/api/flowmessage/chat/invoke',
  menuBasedTemplates: '/helowhatsappchat/api/flowmessage/flow',
  activeTemplate: '/helowhatsappchat/api/flowmessage/flow/:flowTopicId/active/:active',
  evaluationResult: '/helowhatsappchat/api/flowmessage/flow/:flowTopicId/evaluate/:evaluationResponse',
  flowList: '/helowhatsappchat/api/flowmessage/flow/list',
  flowInfo: '/helowhatsappchat/api/flowmessage/flow/info',
  templateFlowStatus: '/helowhatsappchat/api/flowmessage/flow/status',
  menuBasedTemplatesCount: '/helowhatsappchat/api/flowmessage/flow/status/count'
}

const TAG = {
  insert: 'insert',
  update: 'update'
}
const TYNTEC_ENDPOINTS = {
  sendMessage: '/chat-api/v2/messages',
  addTemplate: '/chat-api/v2/channels/whatsapp/accounts/:accountId/templates',
  getTemplateList: '/chat-api/v2/channels/whatsapp/accounts/:accountId/templates',
  getTemplateInfo: '/chat-api/v2/channels/whatsapp/accounts/:accountId/templates/:templateId',
  getAccountInfo: '/chat-api/v2/channels/whatsapp/accounts/:accountId',
  updateProfilePic: '/chat-api/v2/channels/whatsapp/phone-numbers/:phoneNumber/settings/logo',
  deleteTemplate: '/chat-api/v2/channels/whatsapp/accounts/:accountId/templates/:templateId',
  getAccountPhoneNumberList: '/chat-api/v2/channels/whatsapp/accounts/:accountId/phone-numbers',
  getCurrentProfile: '/chat-api/v2/channels/whatsapp/phone-numbers/:phoneNumber/settings/profile',
  updateProfile: '/chat-api/v2/channels/whatsapp/phone-numbers/:phoneNumber/settings/profile',
  updateDefaultApp: '/chat-api/v2/applications/default',
  getMedia: '/chat-api/v2/media/:mediaId'
}
const FACEBOOK_ENDPOINTS = {
  saveOptin: '/v1/contacts',
  login: '/v1/users/login',
  profilePicUpdate: '/v1/settings/profile/photo',
  getProfilePic: '/v1/settings/profile/photo?format=link',
  // getTemplateList: '/v12.0/:userAccountIdByProvider/message_templates?fields=rejected_reason,status,name,category,language,components,last_updated_time,quality_score&access_token=',
  getTemplateList: '/v14.0/:userAccountIdByProvider/message_templates?fields=rejected_reason,status,name,category,language,components,last_updated_time,quality_score&access_token=',

  // deleteTemplate: '/v12.0/:userAccountIdByProvider/message_templates?access_token=',
  deleteTemplate: '/v14.0/:userAccountIdByProvider/message_templates?access_token=',

  updateAboutProfile: '/v1/settings/profile/about',
  updateBusinessProfile: '/v1/settings/business/profile',
  updateWebhook: '/v1/settings/application',
  sendMessage: '/v1/messages/',
  addTemplate: '/message_templates?access_token=',
  getMedia: '/v1/media/:MediaId',
  // getWaba: 'v12.0/:userAccountIdByProvider?access_token=',
  getWaba: 'v14.0/:userAccountIdByProvider?access_token=',

  // getPhoneNumbersByWabaid: '/v12.0/:userAccountIdByProvider/phone_numbers?limit=25&fields=quality_rating,quality_score,verified_name,code_verification_status,display_phone_number&access_token=',
  getPhoneNumbersByWabaid: '/v14.0/:userAccountIdByProvider/phone_numbers?limit=25&fields=quality_rating,quality_score,verified_name,code_verification_status,display_phone_number&access_token=',

  getBSPsSystemUserIds: 'https://graph.facebook.com/v14.0/{{Business-ID}}/system_users',
  debugToken: '/debug_token?input_token=',
  getWabaDetails: '/:wabaId',
  addSystemUser: "/:wabaId/assigned_users?user={{User-ID}}&tasks=['MANAGE']",
  getBussinessIdLineOfCredit: '/{{Business-ID}}/extendedcredits?fields=id,legal_entity_name',
  attachCreditLineClientWaba: '/{{Credit-Line-ID}}/whatsapp_credit_sharing_and_attach?waba_id={{Assigned-WABA-ID}}&waba_currency={{WABA-Currency}}',
  verifyLineOfCredit: '/{{Allocation-Config-ID}}?fields=receiving_credential{id}',
  subscribeAppToWaba: '/:wabaId/subscribed_apps',
  fetchAssignedUsersOfWaba: '/:wabaId/assigned_users?business=',
  getPhoneNumberOfWabaId: '/:wabaId/phone_numbers?fields=verified_name,code_verification_status,quality_rating,id,display_phone_number,certificate,name_status,new_certificate,new_name_status,status',
  requestCode: '/v1/account',
  getSettings: '/v1/settings/application',
  enableTFA: '/v1/settings/account/two-step'
}
const MESSAGE_TRANSACTION_TYPE = ['incoming', 'outgoing', '']
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
const TEMPLATE_QUICK_REPLY_BUTTON_MAX_LENGTH = {
  singleButtonLength: 20,
  arrayLength: 3
}
const TEMPLATE_STATUS = {
  rejected: { statusCode: '1cc8cc1f-282a-4431-8618-43effb1ef7c0', displayName: 'Rejected' },
  approved: { statusCode: '1d9d14ca-d3ec-4bea-b3de-05fcb8ceabd9', displayName: 'Approved' },
  requested: { statusCode: '3dd78583-9acd-42e8-b9f3-0413b3a339eb', displayName: 'Requested' },
  submitFailed: { statusCode: '512155a0-9006-4a0d-89d0-b023d887bd9a', displayName: 'Submit-Failed' },
  partiallyApproved: { statusCode: '588cff76-d6d1-49a3-8280-8c2c1d99bb81', displayName: 'Partially Approved' },
  denied: { statusCode: '27993dbb-e966-4f3a-a2b4-1adb28b05a8a', displayName: 'Denied' },
  deleted: { statusCode: '90789bf2-6142-4750-bca8-2e25a9a7e4aa', displayName: 'Deleted' },
  pending: { statusCode: '9d2560a6-732e-4ac2-b1fa-47f89a28b6dd', displayName: 'Pending' },
  submitted: { statusCode: 'b4414c85-5f80-4e8d-98bc-44bbc05b14b1', displayName: 'Submitted' },
  complete: { statusCode: 'c71a8387-80e0-468b-9ee3-abb5ec328176', displayName: 'Complete' },
  incomplete: { statusCode: 'd11a8387-80e0-468b-9ee3-abb5eckil980', displayName: 'Incomplete' }
}
const TEMPLATE_STATUS_MAPPING = {
  [TEMPLATE_STATUS.incomplete.statusCode]: [TEMPLATE_STATUS.incomplete.statusCode, TEMPLATE_STATUS.complete.statusCode, TEMPLATE_STATUS.deleted.statusCode],
  [TEMPLATE_STATUS.complete.statusCode]: [TEMPLATE_STATUS.complete.statusCode, TEMPLATE_STATUS.incomplete.statusCode, TEMPLATE_STATUS.requested.statusCode, TEMPLATE_STATUS.deleted.statusCode],
  [TEMPLATE_STATUS.requested.statusCode]: [TEMPLATE_STATUS.rejected.statusCode, TEMPLATE_STATUS.submitted.statusCode, TEMPLATE_STATUS.deleted.statusCode],
  [TEMPLATE_STATUS.rejected.statusCode]: [TEMPLATE_STATUS.complete.statusCode, TEMPLATE_STATUS.deleted.statusCode],
  [TEMPLATE_STATUS.submitted.statusCode]: [TEMPLATE_STATUS.submitFailed.statusCode, TEMPLATE_STATUS.pending.statusCode, TEMPLATE_STATUS.approved.statusCode, TEMPLATE_STATUS.denied.statusCode, TEMPLATE_STATUS.deleted.statusCode, TEMPLATE_STATUS.partiallyApproved.statusCode],
  [TEMPLATE_STATUS.submitFailed.statusCode]: [TEMPLATE_STATUS.submitted.statusCode, TEMPLATE_STATUS.deleted.statusCode],
  [TEMPLATE_STATUS.pending.statusCode]: [TEMPLATE_STATUS.approved.statusCode, TEMPLATE_STATUS.denied.statusCode, TEMPLATE_STATUS.deleted.statusCode, TEMPLATE_STATUS.partiallyApproved.statusCode],
  [TEMPLATE_STATUS.partiallyApproved.statusCode]: [TEMPLATE_STATUS.approved.statusCode, TEMPLATE_STATUS.deleted.statusCode],
  [TEMPLATE_STATUS.approved.statusCode]: [TEMPLATE_STATUS.deleted.statusCode],
  [TEMPLATE_STATUS.denied.statusCode]: [TEMPLATE_STATUS.deleted.statusCode],
  [TEMPLATE_STATUS.deleted.statusCode]: []
}
const TYNTEC_TEMPLATE_REPLY_STATUS = {
  deletePending: 'DELETE_PENDING',
  deleted: 'DELETED'
}
const TEMPLATE_APPROVE_STATUS = TEMPLATE_STATUS.approved.statusCode
const TEMPLATE_PARTIAL_APPROVE_STATUS = TEMPLATE_STATUS.partiallyApproved.statusCode
const TEMPLATE_DEFAULT_LANGUAGE_STATUS = TEMPLATE_STATUS.incomplete.statusCode
const TEMPLATE_DEFAULT_STATUS = TEMPLATE_STATUS.incomplete.statusCode
const TEMPLATE_EVALUATION_RESPONSE = ['approved', 'rejected']
const TEMPLATE_ROLLBACK_STATUS_MAPPING = {
  [TEMPLATE_STATUS.complete.statusCode]: TEMPLATE_STATUS.incomplete.statusCode,
  [TEMPLATE_STATUS.requested.statusCode]: TEMPLATE_STATUS.complete.statusCode,
  [TEMPLATE_STATUS.rejected.statusCode]: TEMPLATE_STATUS.complete.statusCode,
  [TEMPLATE_STATUS.submitted.statusCode]: TEMPLATE_STATUS.requested.statusCode,
  [TEMPLATE_STATUS.submitFailed.statusCode]: TEMPLATE_STATUS.submitted.statusCode,
  [TEMPLATE_STATUS.pending.statusCode]: TEMPLATE_STATUS.submitted.statusCode,
  [TEMPLATE_STATUS.approved.statusCode]: TEMPLATE_STATUS.pending.statusCode,
  [TEMPLATE_STATUS.denied.statusCode]: TEMPLATE_STATUS.pending.statusCode
}
const WABA_PROFILE_STATUS = {
  // wabaSetup: { statusCode: '5a3cb0f2-cab2-11ec-9d64-0242ac120002', displayName: 'Waba Setup' },
  profileIncomplete: { statusCode: '7933d858-7bb7-47eb-90ec-269cbecc8c9b', displayName: 'Profile Incomplete' },
  pendingForSubmission: { statusCode: 'fdfcce74-81a3-4d41-b526-212d256f9a20', displayName: 'Pending For Submission' },
  submitted: { statusCode: '91b6a637-11bb-4f35-ace7-41e959c8fbb7', displayName: 'Submitted' },
  pendingForApproval: { statusCode: 'dce5d2a6-7ef0-4e6c-a428-55d6da50caf8', displayName: 'Pending For Approval' },
  containerSpawned: { statusCode: '8c8cab06-cab3-11ec-9d64-0242ac120002', displayName: 'In progress' },
  rejected: { statusCode: '7933d858-7bb7-47eb-90ec-269cbecc8c7a', displayName: 'Rejected' },
  accepted: { statusCode: 'b2aacfbc-12da-4748-bae9-b4ec26e37840', displayName: 'Accepted' }
}
const CHAT_APP_BASE_PATH = '/helowhatsappchat/api'
const WABA_STATUS_MAPPING = {
  [WABA_PROFILE_STATUS.profileIncomplete.statusCode]: [WABA_PROFILE_STATUS.pendingForSubmission.statusCode, WABA_PROFILE_STATUS.profileIncomplete.statusCode],
  [WABA_PROFILE_STATUS.pendingForSubmission.statusCode]: [WABA_PROFILE_STATUS.submitted.statusCode, WABA_PROFILE_STATUS.profileIncomplete.statusCode, WABA_PROFILE_STATUS.pendingForSubmission.statusCode],
  [WABA_PROFILE_STATUS.submitted.statusCode]: [WABA_PROFILE_STATUS.rejected.statusCode, WABA_PROFILE_STATUS.pendingForApproval.statusCode],
  [WABA_PROFILE_STATUS.pendingForApproval.statusCode]: [WABA_PROFILE_STATUS.accepted.statusCode, WABA_PROFILE_STATUS.rejected.statusCode, WABA_PROFILE_STATUS.containerSpawned.statusCode], // remove accepted & rejected
  [WABA_PROFILE_STATUS.containerSpawned.statusCode]: [WABA_PROFILE_STATUS.accepted.statusCode, WABA_PROFILE_STATUS.rejected.statusCode],
  [WABA_PROFILE_STATUS.rejected.statusCode]: [WABA_PROFILE_STATUS.profileIncomplete.statusCode, WABA_PROFILE_STATUS.pendingForSubmission.statusCode],
  [WABA_PROFILE_STATUS.accepted.statusCode]: []
}
const FILE_MAX_UPLOAD_IN_BYTE = 5000000
const TYNTEC_MESSAGE_EVENTS = {
  moMessage: 'MoMessage',
  accepted: 'MessageStatus::accepted',
  delivered: 'MessageStatus::delivered',
  seen: 'MessageStatus::seen',
  failed: 'MessageStatus::failed',
  channelFailed: 'MessageStatus::channelFailed',
  unknown: 'MessageStatus::unknown',
  deleted: 'MessageStatus::deleted'
}
const FACEBOOK_MESSAGE_EVENTS = {
  moMessage: 'MoMessage'
}
const WEB_HOOK_END_POINT = {
  incomingMessage: '/helowhatsapp/api/web-hooks/tyntec/queue/incomingdata/e464e894-0ded-4122-86bc-4e215f9f8f5a',
  messageStatus: '/helowhatsapp/api/web-hooks/tyntec/queue/messageStatus/eaa82947-06f0-410a-bd2a-768ef0c4966e',
  fbWebhook: '/helowhatsapp/api/web-hooks/facebook/queue/messageandincomingdata/cd84929f-b458-4760-8f8a-a43984f1f4db'
}
const MENU_BASED_TEMPLATE_STATUS = {
  requested: { statusCode: '59903410-b3c5-4312-a444-617f04f6116e', displayName: 'Requested' },
  approved: { statusCode: '5a1ca5cb-0c8c-4919-8941-6c679260d5ff', displayName: 'Approved' },
  inactive: { statusCode: '5c11540b-9c49-42b8-ac9e-0d70ad7696f7', displayName: 'Inactive' },
  deleted: { statusCode: '7d33388e-f730-4f82-ae77-d09498543ec6', displayName: 'Deleted' },
  rejected: { statusCode: 'a64ab539-eebd-4a04-81b0-76348e7eaf7c', displayName: 'Rejected' }
}
const HELO_OSS_ENDPOINTS = {
  download: '/helo-oss/api/object/:action/:fileName',
  upload: '/helo-oss/api/object/upload'
}
const MESSAGE_TYPE = ['session', 'template']
const AGREEMENT_STATUS = {
  pendingForDownload: { statusCode: 'd6f211ed-c58c-41bb-951c-ef1dcb94887c', displayName: 'Pending For Download' },
  pendingForUpload: { statusCode: 'fca20279-15e3-42fe-bc14-0e854ecdfa36', displayName: 'Pending For Upload' },
  pendingForApproval: { statusCode: '53bbbfb9-4559-4956-928c-35fb0e34c00b', displayName: 'Pending For Approval' },
  approved: { statusCode: 'f7252fa6-409b-4525-9f91-191839883bac', displayName: 'Approved' },
  rejected: { statusCode: '85e72f46-1b86-41d6-99be-28e762f16f98', displayName: 'Rejected' }
}
const AGREEMENT_STATUS_MAPPING = {
  [AGREEMENT_STATUS.pendingForDownload.statusCode]: [AGREEMENT_STATUS.pendingForUpload.statusCode],
  [AGREEMENT_STATUS.pendingForUpload.statusCode]: [AGREEMENT_STATUS.pendingForApproval.statusCode, AGREEMENT_STATUS.pendingForUpload.statusCode],
  [AGREEMENT_STATUS.pendingForApproval.statusCode]: [AGREEMENT_STATUS.approved.statusCode, AGREEMENT_STATUS.rejected.statusCode],
  [AGREEMENT_STATUS.rejected.statusCode]: [AGREEMENT_STATUS.pendingForUpload.statusCode, AGREEMENT_STATUS.pendingForApproval.statusCode],
  [AGREEMENT_STATUS.approved.statusCode]: []
}
const AGREEMENT_EVALUATION_RESPONSE = ['approved', 'rejected']
const CONTINUE_SENDING_MESSAGE_STATUS = ['delivered', 'channelFailed', 'failed']
const CONTINUE_SENDING_MESSAGE_STATUS_FB = ['delivered', 'accepted', 'failed']
const INCOMING_MESSAGE_STATUS_MAPPING_FROM_FB_TO_TYNTEC = {
  sent: 'accepted',
  delivered: 'delivered',
  read: 'seen',
  failed: 'failed',
  deleted: 'deleted'
}
const TYNTEC_TO_FB_EVENT_KEY = 'MessageStatus::'
const FACEBOOK_CONTENT_TYPE = {
  text: 'text',
  media: 'media',
  contacts: 'contacts',
  location: 'location'
}
const SAMPLE_AGREEMENT_URL = 'https://stage-whatsapp.helo.ai/helowhatsapp/api/frontEnd/helo-oss/download/agreement_161459041944213.pdf'
const STATIC = 'static'
const INTERACTIVE = 'interactive'
const TEMPLATE_FLOW_APPROVAL = [STATIC, INTERACTIVE]
const DLT_PANEL_ENDPOINTS = {
  listOfUsers: '/api/panel/support/list_of_users',
  listOfPeids: '/api/panel/support/list_of_peids',
  updatePeid: '/api/panel/support/add_peid',
  createTemplate: '/api/panel/add_template',
  listOfTemplates: '/api/panel/list',
  convertMessage: '/api/panel/convert_msg',
  changePeidStatus: '/api/panel/support/changePeidStatus',
  verifyMessage: '/api/panel/verify_message_no_cache',
  downloadTemplates: '/api/panel/download_templates',
  bulkUpload: '/api/panel/upload_csv',
  listOfPeidsOtherThanUser: '/api/panel/support/listpeidOfOtherUsers'

}

const FACEBOOK_MASTERDATA_ID = 'cdbf2b4e-6655-4f83-9f24-89c8a075b05c'
const MASTERDATA = 'masterdata_'
const SUPPORT_ROLE_ID = '9f88f381-c05d-453e-90ef-cfeff5e345ea'
const HW_MYSQL = 'helo_whatsapp'
const FB_REDIS_KEY_BUFFER_TIME = 1800000 // 30 minutes
const FB_REDIS_KEY_FOLDER = 'token:'
const FB_REDIS_TOKEN_EXPIRY_KEY = 'token_expiry_identification_key:'
const FB_REDIS_TOKEN_EXPIRY = 'token_expiry_identification_key'
const REDIS_OPTIN_TEMPLATE_DATA_KEY = 'optin_template_'
const FACEBOOK_RESPONSES = {
  stable: { displayName: 'stable' },
  valid: { displayName: 'valid' }
}
const ADD_UPDATE_TEMPLATE_LIMIT = 100100
const BATCH_SIZE_FOR_ADD_UPDATE_AUDIENCES = 2
const CHUNK_SIZE_FOR_ADD_UPDATE_AUDIENCES = 2
const BATCH_SIZE_FOR_SEND_SUCCESS_OPTIN_MESSAGE = 2
const CHUNK_SIZE_FOR_SEND_SUCCESS_OPTIN_MESSAGE = 2
const BATCH_SIZE_FOR_SAVE_OPTIN = 5
const CHUNK_SIZE_FOR_SAVE_OPTIN = 1000
const DEFAULT_COUNTRY_CODE = 'IN'
const NAME_SPACE_FB = '29642c6d_62d8_4981_8c02_8bebdebfcbed'
const FACEBOOK_GRAPHURL = 'https://graph.facebook.com/'
// const FACEBOOK_GRAPHURL_VERSION = 'v12.0'
const FACEBOOK_GRAPHURL_VERSION = 'v14.0'

const HEADER_HANDLE = {
  video: '3:cmNzLWZsb3cubXA0:dmlkZW8vbXA0:ARaeTQefIvdx7preEi97FEyMthItXjjbUl-HgKwjnwNYkoRoKIXPdEX9dZtwbyAfouU3XGBzwLogL-IJSQI1MuK7UzcCsQO7xbD23Tdv-m5c8A:e:1635322172:ARasyMDonA6UQsVkQUc',
  document: '3:RkUtYXNzZXNzbWVudC5wZGY=:YXBwbGljYXRpb24vcGRm:ARbYQ0s6513RaoAfwTIj25IqGC0OgSuTCc5eLuWrjy_ALzkLOomSuIeoTPSK9lRzCZSUESTaD7fYCtGRIq3iP0gq7j5vWM8jdwEwdg0xeIu__g:e:1635322280:ARbIUJhxOCoX6fd32FU',
  image: '3:UGljc0FydF8wMi0xOS0wNy40Ny4wNy5qcGc=:aW1hZ2UvanBlZw==:ARYiA3-0ZU4-vsxvjZVGUZwP_o_qNkCa-QO0rL6cDHNwC6vesEZGBqVAXSSjE_N8zbAcTLG2tetlwgMRxXMxG8shSXaR-F_1pUyCqPqU9EB_Jw:e:1635317666:ARZ3iTS3u2ohm_muC0Q'
}
const FACEBOOK_APP_ID = 571422390685863
const MIMETYPE = {
  png: 'image/png',
  jpeg: 'image/jpeg',
  jpg: 'image/jpg',
  mp4: 'video/mp4',
  pdf: 'application/pdf'

}
const BATCH_SIZE_FOR_SEND_TO_QUEUE = 250
const SEND_WEBHOOK_ON = ['forwarded', 'accepted', 'delivered', 'seen', 'failed', 'rejected', 'waiting for pending delivery', 'in process']
const SINGLE = 'single'
const BULK = 'bulk'
const MESSAGES = 'messages'
const DB_NAME_MIS = 'helowhatsappmis'
const INTERNAL_CALL_USER_AGENT = '181081ac-9667-441a-9f4c-f198b7339nh1'
const INTERNAL_CALL_USER_AGENTS = ['181081ac-9667-441a-9f4c-f198b7339nh1', 'd8e25d6b-c7a2-4704-9c52-3ba3654b91c2']
const TELEGRAM_API = 'https://api.telegram.org/'
const TELEGRAM_ENDPOINTS = {
  sendMessage: '/sendMessage'
}
const CONVERSATION_BILLING_CATEGORY = ['ui', 'bi', 'rc', 'na']
const LOG_CONVERSATION_ON_STATUS = [MESSAGE_STATUS.accepted, MESSAGE_STATUS.delivered, MESSAGE_STATUS.seen]
const LOG_CONVERSATION_ON_TYPE_MAPPING = {
  user_initiated: CONVERSATION_BILLING_CATEGORY[0],
  business_initiated: CONVERSATION_BILLING_CATEGORY[1],
  referral_conversion: CONVERSATION_BILLING_CATEGORY[2]
}
const WHATSAPP_SUMMARY_SUBJECT = 'DAILY Whatsapp MIS | Total Messages Sent: ( | Total Conversations Created: ) | From: [ to ]'
const MIS_SCHEDULER_TIME = '00 30 08 * * *'
const CAMP_REPORTS_SCHEDULER_TIME = '*/29 * * * *'
const TEMPLATE_REPORTS_SCHEDULER_TIME = '*/30 * * * *'
const CONVERSATION_REPORTS_SCHEDULER_TIME = '*/31 * * * *'
const PROCESS_COUNT_SCHEDULER_TIME = '00 30 05 * * *'
const MIS_SCHEDULER_TIME_CONVERSATION = '00 45 08 * * *'
const PROCESS_COUNT_SCHEDULER = 'processCountScheduler'
const WABIZ_USERNAME = 'admin'
// const WABIZ_DEFAULT_PASSWORD = 'Pass@123'
const WABIZ_DEFAULT_PASSWORD = 'secret'
const WABIZ_CUSTOM_PASSWORD_LENGTH = 10
const OPTIN_TYPE = ['bi', 'ui']
const OPTOUT_TEXT = 'stop'
const FB_LANG_TO_VIVA_LANG_MAPPING = {
  cs: '00d9b1ea-600b-46af-bbfe-9977c332e0cf',
  hi: '00fe5312-8204-4bdc-b18a-811bfc73d065',
  hr: '0cc63480-16ef-4c32-a4f9-d1a4e062b65e',
  et: '0dd66c86-41b4-4cf1-ae77-1c9c95486580',
  kn: '0fc3434e-38bb-4731-b914-29e1b75cbd0c',
  sv: '1204c24b-80fe-49e3-94ca-71e0d4842f6b',
  az: '15a946ab-7498-4d38-bf65-e06339c23373',
  fa: '1bc939b1-16ca-4480-bd5e-8dad1762be41',
  pl: '1bf2aca4-bb54-4b4b-a6db-067a8b1f24b8',
  sq: '1cddab1a-7843-4384-a95c-9b51a581cebf',
  es: '1ed0dd04-2f8f-4005-9398-849f1743bab8',
  bn: '21c843cb-37de-4b88-914f-82620505276b',
  da: '25256135-c06d-4ddf-a3cd-e210e1943617',
  mk: '2ddef351-ebe5-4947-a2f9-d8088fcd5ccc',
  ko: '30f8f76c-9a9c-4ff4-981d-1ee2cdde4716',
  nl: '3a68b15d-1cf2-47dc-9e94-508d9125a323',
  th: '3c54e41a-4ed4-419d-8d70-87af0bb87a9e',
  sl: '47503439-37bd-40ad-aee6-a56b2c5b06ce',
  bg: '54337334-232a-4cb3-990c-eb26702d000c',
  id: '571dc45d-0a38-451a-9e49-522aa373e435',
  vi: '573c2733-be66-46e0-a631-aa9be26f076c',
  en: '57aa7635-5717-4397-8eb6-4799ef3bec05',
  af: '5ba41d9c-7219-4559-8e26-1ed53c43ed21',
  he: '6033eb5b-41e9-4236-9e63-fe55c30bb40d',
  de: '616474e3-1e2a-4b13-acd2-c72b31fc9362',
  nb: '64e933bd-dc25-43c9-a385-e292d7fc141f',
  sk: '77143be6-8b97-4777-b618-1a34c04e7f1e',
  lt: '7978d348-59db-4a71-aa92-f1c802eaa4ef',
  fr: '7a931669-0ce3-4f2d-b51b-4516bbad92d9',
  uz: '892ed39b-0209-41d7-99cb-014db27b164f',
  ta: '8a87bb14-fb4c-492e-8017-e14957507e3b',
  gu: '8e50adb9-d12f-43f2-968b-7fa19e1fb761',
  sr: '9c2d410c-0c55-46be-8cec-63ed20e39496',
  lv: '9d165f24-d46d-458f-a5b0-bed5158fd6ca',
  ml: '9ee5dd93-e009-4b4f-a3c9-2b0289a60e47',
  fi: 'a24cbec1-e4a6-49ea-9e69-768d703592dd',
  ca: 'a52ff895-73da-4fe1-a828-23c92470d106',
  lo: 'b0b5936c-47be-4668-b6cb-191645ac46e8',
  kk: 'b0f0c3c1-a4c7-46e6-91b9-3297cb9eba1c',
  te: 'b18c5772-c1a0-4d8f-b69a-2ce77a4dd51e',
  tr: 'b2140aa5-c113-4cd7-bc99-4d2d58894650',
  pa: 'b3c06bd2-7460-4efa-9c72-388e3ecd13da',
  ja: 'c305c292-b93e-44e9-a41d-4e1b7691cb4c',
  uk: 'c331baaf-16d6-4b52-9b83-621821f63eae',
  ar: 'c688e021-b071-4af3-adc4-980ed3ff488f',
  mr: 'cde192b7-c60f-4d2d-8573-dd5af7c9379b',
  hu: 'd14532fb-eade-4b07-800b-505a918bb05e',
  it: 'd3640e38-8641-4f3c-bd32-e43b582fe07b',
  el: 'd883416d-6f80-4828-8bc3-81ab025f83e1',
  ru: 'e3eca0de-759e-4e0a-b901-11b20061921d',
  ga: 'e424155a-f37f-46e2-96df-2146c318f6cd',
  ms: 'e904bc04-7c4c-49ff-9fad-27475a7d5290',
  sw: 'ed26d94c-e250-4d72-9670-38cc751af2a1',
  ro: 'fbf1426a-e884-4547-a079-684c65688423',
  zu: 'feb1338f-43e7-4a0d-828f-5ba6e59aff77',
  ka: 'fc37fc39-8486-40ab-880c-c6a2b592c8aa',
  ur: 'e68a4fa5-c7cf-4fc1-9d93-11b1178d9196',
  fil: 'c094dc3a-c0ba-48d2-b790-3cdd2b10ca41',
  ha: '8dbc173e-cd5f-4643-bb4c-cda552dfb53d',
  en_GB: 'd3a87def-74a5-4a01-8329-85f3e7e0fe45',
  en_US: 'bb89e9d3-3a2a-48a6-b78e-8ee29c8381ae',
  pt_BR: '94a76cb5-84ab-47ae-9f2c-255b5f32c713',
  pt_PT: '42be71bb-f302-43f8-b180-85907073339d'
}
const FB_CATEGORY_TO_VIVA_CATEGORY = {
  SHIPPING_UPDATE: 'b3f6ccc1-b271-45bd-aebb-413274f69da1',
  RESERVATION_UPDATE: '494b819e-ea15-4347-805b-d5eee38687e8',
  TRANSPORTATION_UPDATE: 'de4e36af-87aa-48e8-879f-36391df3935a',
  ISSUE_RESOLUTION: '6feb234a-4513-486a-8f4a-977dfb6e1597',
  APPOINTMENT_UPDATE: '15b0c326-2bee-401a-8568-a6e27d8f0af0',
  PERSONAL_FINANCE_UPDATE: '9166d845-98bd-4e78-aedf-edfade75bb8b',
  TICKET_UPDATE: '4268f874-eda3-42c3-b972-786a8b5f8716',
  AUTO_REPLY: 'f26c0c08-94a1-4992-acc8-f5197a02cbe1',
  PAYMENT_UPDATE: '92ba13f9-b560-414b-9dfd-bc9704c40cf7',
  ALERT_UPDATE: '957e4375-3297-42c6-a9a8-6a57fd8e5045',
  ACCOUNT_UPDATE: 'b8203a31-e439-4ea4-a270-bd211317d3ff',
  OTP: 'a5f15075-1a8d-4f84-a8f6-25b0f9cbd861',
  TRANSACTIONAL: '281dfa46-488a-472c-8c07-55ce7f4b648c',
  PROMOTIONAL: '37f8ac07-a370-4163-b713-854db656cd1b'
}
const FB_HEADER_TO_VIVA_HEADER = {
  video: 'Video',
  document: 'Document',
  location: 'Location',
  text: 'Text',
  image: 'Image'
}
const FB_TEMPLATE_REDIS_KEY_FOLDER = 'fb_viva_template_name_mapping:'
const STREAM_OPTIN_BATCH_SIZE = 3500
// const SEND_OPTIN_BATCH_ACK_IN_SECS = 180 // 3 minutes
const SEND_OPTIN_BATCH_ACK_IN_SECS = 120 // 2 minutes
const FILEPATH = 'public/createdFileCSV'

module.exports.RESPONSE_MESSAGES = require('api-responses')
module.exports.COUNTRY_LIST_ALPHA_TWO = require('./countries.json')
module.exports.CUSTOM_CONSTANT = CUSTOM_CONSTANT
module.exports.VERIFICATION_CHANNEL = VERIFICATION_CHANNEL
module.exports.ACCOUNT_PLAN_TYPE = ACCOUNT_PLAN_TYPE
module.exports.USER_ROLE_ID = USER_ROLE_ID
module.exports.PUBLIC_FOLDER_PATH = PUBLIC_FOLDER_PATH
module.exports.APP_NAME = APP_NAME
module.exports.DB_NAME = DB_NAME
module.exports.SERVER_TIMEOUT = SERVER_TIMEOUT
module.exports.TEMPLATE_TYPE = TEMPLATE_TYPE
module.exports.TEMPLATE_HEADER_TYPE = TEMPLATE_HEADER_TYPE
module.exports.TEMPLATE_BUTTON_TYPE = TEMPLATE_BUTTON_TYPE
module.exports.DEFAULT_WABA_SETUP_STATUS_ID = DEFAULT_WABA_SETUP_STATUS_ID
module.exports.TEMPLATE_STATUS = TEMPLATE_STATUS
module.exports.ENTITY_NAME = ENTITY_NAME
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
module.exports.FACEBOOK_ENDPOINTS = FACEBOOK_ENDPOINTS
module.exports.MESSAGE_TRANSACTION_TYPE = MESSAGE_TRANSACTION_TYPE
module.exports.TEMPLATE_APPROVE_STATUS = TEMPLATE_APPROVE_STATUS
module.exports.TEMPLATE_PARTIAL_APPROVE_STATUS = TEMPLATE_PARTIAL_APPROVE_STATUS
module.exports.ADMIN_PANNEL_ENDPOINTS = ADMIN_PANNEL_ENDPOINTS
module.exports.TFA_TYPE_ENUM = TFA_TYPE_ENUM
module.exports.TFA_BACKUP_CODES_AMOUNT = TFA_BACKUP_CODES_AMOUNT
module.exports.TFA_AUTHENTICATOR_LABEL = TFA_AUTHENTICATOR_LABEL
module.exports.WA_ME_URL = WA_ME_URL
module.exports.TFA_TYPE_DISPLAYNAME = TFA_TYPE_DISPLAYNAME
module.exports.TEMPLATE_QUICK_REPLY_BUTTON_MAX_LENGTH = TEMPLATE_QUICK_REPLY_BUTTON_MAX_LENGTH
module.exports.TEMPLATE_STATUS_MAPPING = TEMPLATE_STATUS_MAPPING
module.exports.TEMPLATE_EVALUATION_RESPONSE = TEMPLATE_EVALUATION_RESPONSE
module.exports.TEMPLATE_ROLLBACK_STATUS_MAPPING = TEMPLATE_ROLLBACK_STATUS_MAPPING
module.exports.WABA_PROFILE_STATUS = WABA_PROFILE_STATUS
module.exports.TYNTEC_TEMPLATE_REPLY_STATUS = TYNTEC_TEMPLATE_REPLY_STATUS
module.exports.CHAT_APP_BASE_PATH = CHAT_APP_BASE_PATH
module.exports.WABA_STATUS_MAPPING = WABA_STATUS_MAPPING
module.exports.FILE_MAX_UPLOAD_IN_BYTE = FILE_MAX_UPLOAD_IN_BYTE
module.exports.TYNTEC_MESSAGE_EVENTS = TYNTEC_MESSAGE_EVENTS
module.exports.FACEBOOK_MESSAGE_EVENTS = FACEBOOK_MESSAGE_EVENTS
module.exports.WEB_HOOK_END_POINT = WEB_HOOK_END_POINT
module.exports.MENU_BASED_TEMPLATE_STATUS = MENU_BASED_TEMPLATE_STATUS
module.exports.HELO_OSS_ENDPOINTS = HELO_OSS_ENDPOINTS
module.exports.MESSAGE_STATUS_FOR_DISPLAY = MESSAGE_STATUS_FOR_DISPLAY
module.exports.MESSAGE_TYPE = MESSAGE_TYPE
module.exports.AGREEMENT_STATUS = AGREEMENT_STATUS
module.exports.AGREEMENT_STATUS_MAPPING = AGREEMENT_STATUS_MAPPING
module.exports.AGREEMENT_EVALUATION_RESPONSE = AGREEMENT_EVALUATION_RESPONSE
module.exports.CONTINUE_SENDING_MESSAGE_STATUS = CONTINUE_SENDING_MESSAGE_STATUS
module.exports.CONTINUE_SENDING_MESSAGE_STATUS_FB = CONTINUE_SENDING_MESSAGE_STATUS_FB
module.exports.INCOMING_MESSAGE_STATUS_MAPPING_FROM_FB_TO_TYNTEC = INCOMING_MESSAGE_STATUS_MAPPING_FROM_FB_TO_TYNTEC
module.exports.TYNTEC_TO_FB_EVENT_KEY = TYNTEC_TO_FB_EVENT_KEY
module.exports.FACEBOOK_CONTENT_TYPE = FACEBOOK_CONTENT_TYPE
module.exports.SAMPLE_AGREEMENT_URL = SAMPLE_AGREEMENT_URL
module.exports.TEMPLATE_FLOW_APPROVAL = TEMPLATE_FLOW_APPROVAL
module.exports.STATIC = STATIC
module.exports.INTERACTIVE = INTERACTIVE
module.exports.DLT_PANEL_ENDPOINTS = DLT_PANEL_ENDPOINTS
module.exports.SUPPORT_ROLE_ID = SUPPORT_ROLE_ID
module.exports.HW_MYSQL = HW_MYSQL
module.exports.FB_REDIS_KEY_BUFFER_TIME = FB_REDIS_KEY_BUFFER_TIME
module.exports.FB_REDIS_KEY_FOLDER = FB_REDIS_KEY_FOLDER
module.exports.FB_REDIS_TOKEN_EXPIRY_KEY = FB_REDIS_TOKEN_EXPIRY_KEY
module.exports.FB_REDIS_TOKEN_EXPIRY = FB_REDIS_TOKEN_EXPIRY
module.exports.REDIS_OPTIN_TEMPLATE_DATA_KEY = REDIS_OPTIN_TEMPLATE_DATA_KEY
module.exports.FACEBOOK_RESPONSES = FACEBOOK_RESPONSES
module.exports.ADD_UPDATE_TEMPLATE_LIMIT = ADD_UPDATE_TEMPLATE_LIMIT
module.exports.BATCH_SIZE_FOR_ADD_UPDATE_AUDIENCES = BATCH_SIZE_FOR_ADD_UPDATE_AUDIENCES
module.exports.CHUNK_SIZE_FOR_ADD_UPDATE_AUDIENCES = CHUNK_SIZE_FOR_ADD_UPDATE_AUDIENCES
module.exports.BATCH_SIZE_FOR_SEND_SUCCESS_OPTIN_MESSAGE = BATCH_SIZE_FOR_SEND_SUCCESS_OPTIN_MESSAGE
module.exports.CHUNK_SIZE_FOR_SEND_SUCCESS_OPTIN_MESSAGE = CHUNK_SIZE_FOR_SEND_SUCCESS_OPTIN_MESSAGE
module.exports.BATCH_SIZE_FOR_SAVE_OPTIN = BATCH_SIZE_FOR_SAVE_OPTIN
module.exports.CHUNK_SIZE_FOR_SAVE_OPTIN = CHUNK_SIZE_FOR_SAVE_OPTIN
module.exports.DEFAULT_COUNTRY_CODE = DEFAULT_COUNTRY_CODE
module.exports.FACEBOOK_GRAPHURL = FACEBOOK_GRAPHURL
module.exports.FACEBOOK_GRAPHURL_VERSION = FACEBOOK_GRAPHURL_VERSION
module.exports.HEADER_HANDLE = HEADER_HANDLE
module.exports.NAME_SPACE_FB = NAME_SPACE_FB
module.exports.FACEBOOK_APP_ID = FACEBOOK_APP_ID
module.exports.MIMETYPE = MIMETYPE
module.exports.BATCH_SIZE_FOR_SEND_TO_QUEUE = BATCH_SIZE_FOR_SEND_TO_QUEUE
module.exports.SEND_WEBHOOK_ON = SEND_WEBHOOK_ON
module.exports.SINGLE = SINGLE
module.exports.MESSAGES = MESSAGES
module.exports.DB_NAME_MIS = DB_NAME_MIS
module.exports.HW_MYSQL_MIS_NAME = HW_MYSQL_MIS_NAME
module.exports.BULK = BULK
module.exports.INTERNAL_CALL_USER_AGENT = INTERNAL_CALL_USER_AGENT
module.exports.INTERNAL_CALL_USER_AGENTS = INTERNAL_CALL_USER_AGENTS
module.exports.TELEGRAM_API = TELEGRAM_API
module.exports.TELEGRAM_ENDPOINTS = TELEGRAM_ENDPOINTS
module.exports.CONVERSATION_BILLING_CATEGORY = CONVERSATION_BILLING_CATEGORY
module.exports.LOG_CONVERSATION_ON_STATUS = LOG_CONVERSATION_ON_STATUS
module.exports.LOG_CONVERSATION_ON_TYPE_MAPPING = LOG_CONVERSATION_ON_TYPE_MAPPING
module.exports.MIS_SCHEDULER_TIME = MIS_SCHEDULER_TIME
module.exports.PROCESS_COUNT_SCHEDULER_TIME = PROCESS_COUNT_SCHEDULER_TIME
module.exports.PROCESS_COUNT_SCHEDULER = PROCESS_COUNT_SCHEDULER
module.exports.WHATSAPP_SUMMARY_SUBJECT = WHATSAPP_SUMMARY_SUBJECT
module.exports.MIS_SCHEDULER_TIME_CONVERSATION = MIS_SCHEDULER_TIME_CONVERSATION
module.exports.UPDATE_PROFILE_CONFIGURE_DATA = UPDATE_PROFILE_CONFIGURE_DATA
module.exports.FACEBOOK_MASTERDATA_ID = FACEBOOK_MASTERDATA_ID
module.exports.MASTERDATA = MASTERDATA
module.exports.WABIZ_USERNAME = WABIZ_USERNAME
module.exports.WABIZ_DEFAULT_PASSWORD = WABIZ_DEFAULT_PASSWORD
module.exports.WABIZ_CUSTOM_PASSWORD_LENGTH = WABIZ_CUSTOM_PASSWORD_LENGTH
module.exports.OPTIN_TYPE = OPTIN_TYPE
module.exports.OPTOUT_TEXT = OPTOUT_TEXT
module.exports.FB_LANG_TO_VIVA_LANG_MAPPING = FB_LANG_TO_VIVA_LANG_MAPPING
module.exports.FB_CATEGORY_TO_VIVA_CATEGORY = FB_CATEGORY_TO_VIVA_CATEGORY
module.exports.FB_HEADER_TO_VIVA_HEADER = FB_HEADER_TO_VIVA_HEADER
module.exports.FB_TEMPLATE_REDIS_KEY_FOLDER = FB_TEMPLATE_REDIS_KEY_FOLDER
module.exports.STREAM_OPTIN_BATCH_SIZE = STREAM_OPTIN_BATCH_SIZE
module.exports.SEND_OPTIN_BATCH_ACK_IN_SECS = SEND_OPTIN_BATCH_ACK_IN_SECS
module.exports.CAMP_REPORTS_SCHEDULER_TIME = CAMP_REPORTS_SCHEDULER_TIME
module.exports.TEMPLATE_REPORTS_SCHEDULER_TIME = TEMPLATE_REPORTS_SCHEDULER_TIME
module.exports.CONVERSATION_REPORTS_SCHEDULER_TIME = CONVERSATION_REPORTS_SCHEDULER_TIME
module.exports.FILEPATH = FILEPATH
module.exports.DOWNLOAD_STATUS = DOWNLOAD_STATUS
