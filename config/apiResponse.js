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
    message: 'WABA id does not exists.'
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
  }
}
