

/**
 * @namespace <b> -API-RESPONSE- </b>
 * @description Click the below link for all the API Response with its related status code
 */

module.exports = {
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
  PROVIDE_FILE: {
    status_code: 400,
    code: 4030,
    message: 'Please provide a file'
  },
  INVALID_FILE_TYPE: {
    status_code: 400,
    code: 4031,
    message: 'Invalid file type'
  },
  INVALID_URL: {
    status_code: 400,
    code: 4032,
    message: 'Invalid request URL'
  },
  INVALID_FILE_SIZE: {
    status_code: 400,
    code: 4033,
    message: 'File size or pixel is less than expected'
  },
  SERVER_ERROR: {
    status_code: 500,
    code: 5000,
    message: 'Something went wrong. Please try again later.'
  },
  SERVICE_PROVIDER_NOT_PRESENT: {
    status_code: 500,
    code: 5000,
    message: 'Please ensure service provider data is present.'
  },
  // Note: use codes 2000 to 2999 for api success
  SUCCESS: {
    status_code: 200,
    code: 2000,
    message: 'Success'
  },
  ACCEPTED: {
    status_code: 202,
    code: 2002,
    message: 'Request Accepted'
  },
  EMAIL_VC: {
    status_code: 200,
    code: 2001,
    message: 'Please check your registered email for verification code'
  },
  PHONE_VC: {
    status_code: 200,
    code: 2002,
    message: 'Please check your registered contact number for verification code'
  },
  EMAIL_VERIFIED: {
    status_code: 200,
    code: 2003,
    message: 'Email address verified'
  },
  PHONE_VERIFIED: {
    status_code: 200,
    code: 2003,
    message: 'Phone number verified'
  },
  BUSINESS_PHONE_VC: {
    status_code: 200,
    code: 2001,
    message: 'Please check your registered business phone number for verification code'
  },
  BUSINESS_PHONE_VERIFIED: {
    status_code: 200,
    code: 2003,
    message: 'Business phone number verified'
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
  },
  RECORD_EXIST: {
    status_code: 200,
    code: 3013,
    message: 'Record Already Exists.'
  },
  USER_ID_NOT_EXIST: {
    status_code: 200,
    code: 3014,
    message: 'User does not exist'
  },
  EMAIL_ALREADY_VERIFIED: {
    status_code: 200,
    code: 3015,
    message: 'Email already verified for user'
  },
  PHONE_ALREADY_VERIFIED: {
    status_code: 200,
    code: 3016,
    message: 'Phone number already verified for user'
  },
  INVALID_VERIFICATION_CODE: {
    status_code: 401,
    code: 3017,
    message: 'Invalid verification code'
  },
  BUSINESS_ACCESS_INFO_NOT_COMPLETE: {
    status_code: 200,
    code: 3018,
    message: 'Please complete whatsapp business access info first'
  },
  BUSINESS_INFO_NOT_COMPLETE: {
    status_code: 200,
    code: 3019,
    message: 'Please complete whatsapp business info first'
  },
  BUSINESS_PHONE_NUMBER_ALREADY_VERIFIED: {
    status_code: 200,
    code: 3020,
    message: 'Business phone number already verified for WABA'
  },
  WABA_ID_NOT_EXISTS: {
    status_code: 200,
    code: 3021,
    message: 'WABA profile does not exists.'
  },
  WABA_PHONE_NUM_NOT_EXISTS: {
    status_code: 200,
    code: 3021,
    message: 'WABA phone number does not exists.'
  },
  WABA_ACCOUNT_NOT_EXISTS: {
    status_code: 200,
    code: 3021,
    message: 'WABA account does not exists.'
  },
  WABA_PHONE_NUM_EXISTS: {
    status_code: 200,
    code: 3021,
    message: 'WABA phone number already exists.'
  },
  AUDIENCE_ID_NOT_EXISTS: {
    status_code: 200,
    code: 3021,
    message: 'Audience id does not exists.'
  },
  MAX_TEMPLATE: {
    status_code: 200,
    code: 3022,
    message: 'Maximum number of template allowed for this account has exausted.'
  },
  MASTER_NOT_EXISTS: {
    status_code: 200,
    code: 3023,
    message: 'Master data does not exists.'
  },
  ERROR_SENDING_MESSAGE: {
    status_code: 500,
    code: 3024,
    message: 'Error while sending message'
  },
  NOT_REDIRECTED: {
    status_code: 406,
    code: 3025,
    message: 'Fail to redirect payload'
  },
  TEMPLATE_ID_NOT_EXISTS: {
    status_code: 400,
    code: 3026,
    message: 'TemplateId does not exist for this waba number'
  },
  COMPONENTS_COUNT_MISMATCH: {
    status_code: 400,
    code: 3027,
    message: 'Header,footer and body should appear in component only once'
  },
  HEADER_PARAM_MISMATCH: {
    status_code: 400,
    code: 3030,
    message: 'Parameters provided in request and parameters required by template hedaer does not match'
  },
  BODY_PARAM_MISMATCH: {
    status_code: 400,
    code: 3028,
    message: 'Parameters provided in request and parameters required by template body does not match'
  },
  FOOTER_PARAM_MISMATCH: {
    status_code: 400,
    code: 3029,
    message: 'Parameters provided in request and parameters required by template footer does not match'
  },
  LANGUAGE_NOT_APPROVED: {
    status_code: 400,
    code: 3037,
    message: 'Provided language is not approved to be used with this template'
  },
  TEMPLATE_VALID: {
    status_code: 200,
    code: 2055,
    message: 'Template Valid'
  },
  WABA_NO_VALID: {
    status_code: 200,
    code: 2056,
    message: 'WABA number valid'
  },
  WABA_NO_INVALID: {
    status_code: 400,
    code: 3031,
    message: 'Provided WABA number is invalid'
  },
  EXPECT_ARRAY: {
    status_code: 400,
    code: 3032,
    message: 'Expect input in array'
  },
  CANNOT_SEND_MESSAGE: {
    status_code: 200,
    code: 2057,
    message: 'Cannot send message to user, Make sure you have obtained the optin or you have received message form user in last 24 hours'
  },
  LIMIT_EXCEEDED: {
    status_code: 400,
    code: 3033,
    message: 'You\'ve exceeded the allowed limit please try again after some time'
  },
  IDENTIFIER_EXIST: {
    status_code: 200,
    code: 3034,
    message: 'Identifier Text Already Exists.'
  },
  PARENT_IDENTIFIER_NOT_EXIST: {
    status_code: 200,
    code: 3035,
    message: 'Parent Identifier Text Does Not Exists.'
  },
  EMAIL_FORGET_PASSWORD: {
    status_code: 200,
    code: 2001,
    message: 'Link to set new password has been sent on your registered email'
  },
  INVALID_PASS_TOKEN: {
    status_code: 200,
    code: 3036,
    message: 'Invalid token.'
  },
  OPTIN_NOT_SET: {
    status_code: 200,
    code: 3038,
    message: 'optin text not updated.'
  },
  META_DATA_NOT_FOUND: {
    status_code: 200,
    code: 3039,
    message: 'chat metadata not found.'
  },
  META_DATA_NOT_SET: {
    status_code: 200,
    code: 3040,
    message: 'chat metadata not set.'
  },
  EMAIL_OTP: {
    status_code: 200,
    code: 2001,
    message: 'Please check your registered email for one time code'
  },
  SMS_OTP: {
    status_code: 200,
    code: 2001,
    message: 'Please check your registered phone number for one time code'
  },
  TFA_NOT_SETTED_UP: {
    status_code: 200,
    code: 3041,
    message: 'Please Setup 2FA first.'
  },
  INVALID_TFA_TYPE: {
    status_code: 200,
    code: 3042,
    message: 'Invalid tfa type.'
  },
  TFA_ALREADY_SETTED_UP: {
    status_code: 200,
    code: 3043,
    message: '2FA setup already done'
  },
  QRCODE_GEN_ERR: {
    status_code: 200,
    code: 3044,
    message: 'Unable to generate QRcode'
  },
  TEMP_TFA_NOT_FOUND: {
    status_code: 200,
    code: 3045,
    message: 'Authentication method change request not found'
  },
  AUTHENTICATOR_QR_GENERATED: {
    status_code: 200,
    code: 2001,
    message: 'Please scan the QRcode or enter the secret key in authenticator app and then enter the OTP received.'
  },
  AUTHENTICATOR_CHECK_APP: {
    status_code: 200,
    code: 2001,
    message: 'Please check the authenticator app and then enter the OTP received.'
  },
  INVALID_BACKUP_CODE: {
    status_code: 401,
    code: 3046,
    message: 'Invalid backup code'
  },
  ERROR_CALLING_PROVIDER: {
    status_code: 500,
    code: 5005,
    message: 'Something went wrong. Please try again later.'
  },
  CATEGORY_MAPPING_NOT_FOUND: {
    status_code: 500,
    code: 3047,
    message: 'Some error occured'
  },
  CANNOT_CHANGE_STATUS: {
    status_code: 200,
    code: 3048,
    message: 'Status cannot be changed'
  },
  TEMPLATE_DELETED: {
    status_code: 200,
    code: 3048,
    message: 'Template has already been deleted'
  },
  TEMPLATE_DELETE_INITIATED: {
    status_code: 200,
    code: 3047,
    message: 'Template Deletion already intiated'
  },
  STATUS_MAPPING_NOT_FOUND: {
    status_code: 500,
    code: 3049,
    message: 'Some error occured'
  },
  ALL_STATUS_NOT_UPDATED: {
    status_code: 500,
    code: 3050,
    message: 'Some error occured'
  },
  TEMPLATE_SENT_FOR_DELETION: {
    status_code: 204,
    code: 3051,
    message: 'Template has been sent for deletion'
  },
  TEMPLATE_DELETION_ERROR: {
    status_code: 404,
    code: 3052,
    message: 'Error ocurred while template deletion'
  },
  TEMPLATE_NOT_FOUND: {
    status_code: 200,
    code: 3053,
    message: 'Template not found'
  },
  EVALUTAION_CANNOT_BE_PROCEDDED: {
    status_code: 200,
    code: 3053,
    message: 'Evaluation cannot be proceeded as the approval or rejection from support person is not received.'
  },
  TEMPLATE_STATUS_ROLLBACK: {
    status_code: 200,
    code: 3054,
    message: 'Template status has been rolled over to previous state'
  },
  TEMPLATE_CANNOT_BE_EDITED: {
    status_code: 200,
    code: 3055,
    message: 'Template cannot be edited in this current status'
  },
  TEMPLATE_CANNOT_BE_ADDED: {
    status_code: 200,
    code: 3056,
    message: 'Template with same name already exists'
  }
}
