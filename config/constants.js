const APP_NAME = 'helowhatsapp'
const DB_NAME = 'helowhatsapp'
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
  SESSION_TIME: 86400,
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
  optinTemplateData: 43200
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
  SEGMENT: 'segment'
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
  process_message: { type: 'queue', q_name: 'process_message', q_options: { durable: true, maxPriority: 10 }, prefetchCount: PREFETCH_COUNT, createChannel: true },
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
  webhookQueue: { type: 'queue', q_name: 'webhook_queue', q_options: { durable: true, maxPriority: 10 }, prefetchCount: PREFETCH_COUNT, createChannel: true }
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
  toggleChatbot: '/helowhatsapp/api/business/profile/chatbot'
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
  failed: 'failed',
  pending: 'waiting for pending delivery',
  rejected: 'rejected'
}
const MESSAGE_STATUS_FOR_DISPLAY = [
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
  phoneNumber: '^\\d{1,10}$',
  phoneNumberWithPhoneCode: '^[\\d+]{1,3}\\s?[0-9]{10}$',
  postalCode: '^\\d{1,6}$',
  phoneCode: '^\\d{1,2}$',
  timeStamp: '^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]$',
  aplphaNumericWithUnderscore: '^[a-z0-9_]+$',
  fileExtType: /^(jpg|jpeg|png)$/,
  url: /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/,
  gst: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
  pan: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i,
  noTabLinebreakSpace: /^(?:(.)(?!\s\s\s\s)(?!\n)(?!\t))*$/g
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
  getTemplateList: '/v12.0/:userAccountIdByProvider/message_templates?fields=rejected_reason,status,name,category,language,components,last_updated_time,quality_score&access_token=',
  deleteTemplate: '/v12.0/:userAccountIdByProvider/message_templates?access_token=',
  updateAboutProfile: '/v1/settings/profile/about',
  updateBusinessProfile: '/v1/settings/business/profile',
  updateWebhook: '/v1/settings/application',
  sendMessage: '/v1/messages/',
  addTemplate: '/message_templates?access_token=',
  getMedia: '/v1/media/:MediaId',
  getWaba: 'v12.0/:userAccountIdByProvider?access_token='
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
  profileIncomplete: { statusCode: '7933d858-7bb7-47eb-90ec-269cbecc8c9b', displayName: 'Profile Incomplete' },
  pendingForSubmission: { statusCode: 'fdfcce74-81a3-4d41-b526-212d256f9a20', displayName: 'Pending For Submission' },
  submitted: { statusCode: '91b6a637-11bb-4f35-ace7-41e959c8fbb7', displayName: 'Submitted' },
  pendingForApproval: { statusCode: 'dce5d2a6-7ef0-4e6c-a428-55d6da50caf8', displayName: 'Pending For Approval' },
  rejected: { statusCode: '7933d858-7bb7-47eb-90ec-269cbecc8c7a', displayName: 'Rejected' },
  accepted: { statusCode: 'b2aacfbc-12da-4748-bae9-b4ec26e37840', displayName: 'Accepted' }
}
const CHAT_APP_BASE_PATH = '/helowhatsappchat/api'
const WABA_STATUS_MAPPING = {
  [WABA_PROFILE_STATUS.profileIncomplete.statusCode]: [WABA_PROFILE_STATUS.pendingForSubmission.statusCode, WABA_PROFILE_STATUS.profileIncomplete.statusCode],
  [WABA_PROFILE_STATUS.pendingForSubmission.statusCode]: [WABA_PROFILE_STATUS.submitted.statusCode, WABA_PROFILE_STATUS.profileIncomplete.statusCode, WABA_PROFILE_STATUS.pendingForSubmission.statusCode],
  [WABA_PROFILE_STATUS.submitted.statusCode]: [WABA_PROFILE_STATUS.rejected.statusCode, WABA_PROFILE_STATUS.pendingForApproval.statusCode],
  [WABA_PROFILE_STATUS.pendingForApproval.statusCode]: [WABA_PROFILE_STATUS.accepted.statusCode, WABA_PROFILE_STATUS.rejected.statusCode],
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
const ADD_UPDATE_TEMPLATE_LIMIT = 10000
const BATCH_SIZE_FOR_ADD_UPDATE_AUDIENCES = 2
const CHUNK_SIZE_FOR_ADD_UPDATE_AUDIENCES = 2
const BATCH_SIZE_FOR_SEND_SUCCESS_OPTIN_MESSAGE = 2
const CHUNK_SIZE_FOR_SEND_SUCCESS_OPTIN_MESSAGE = 2
const BATCH_SIZE_FOR_SAVE_OPTIN = 2
const CHUNK_SIZE_FOR_SAVE_OPTIN = 2
const DEFAULT_COUNTRY_CODE = 'IN'
const NAME_SPACE_FB = '29642c6d_62d8_4981_8c02_8bebdebfcbed'
const FACEBOOK_GRAPHURL = 'https://graph.facebook.com/'
const FACEBOOK_GRAPHURL_VERSION = 'v12.0'
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
module.exports.BULK = BULK
