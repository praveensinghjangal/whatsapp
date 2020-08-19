// Business Category
const getBusinessCategory = () => {
  return `select business_category_id, category_name
    from business_category 
    WHERE is_active = true`
}

// Business Profile
const getBusinessProfile = () => {
  return `SELECT waba_information_id as "wabaInformationId", phone_number as "phoneNumber", phone_code as "phoneCode", 
  facebook_manager_id as "facebookManagerId", business_name as "businessName", email, 
  bcat.category_name as "businessCategory", state, whatsapp_status as "whatsappStatus", 
  description, profile_photo_url as "profilePhotoUrl", address, country, can_receive_sms as "canReceiveSms",
  can_receive_voice_call as "canReceiveVoiceCall", associated_with_ivr as "associatedWithIvr", 
  wabaprof.status_name as "wabaProfileSetupStatus", business_manager_verified as "businessManagerVerified", 
  phone_verified as "phoneVerified", city, postal_code as "postalCode",
  service_provider_name as "serviceProviderName",api_key as "apiKey",
  webhook_post_url as "webhookPostUrl",optin_text as "optinText",chatbot_activated as "chatBotActivated"
  FROM waba_information wabainfo
  LEFT JOIN business_category bcat on wabainfo.business_category_id = bcat.business_category_id and bcat.is_active = true
  LEFT JOIN waba_profile_setup_status wabaprof on wabainfo.waba_profile_setup_status_id = wabaprof.waba_profile_setup_status_id and wabaprof.is_active  = true
  LEFT JOIN service_provider sp on wabainfo.service_provider_id = sp.service_provider_id and sp.is_active  = true
  where wabainfo.user_id = ? and wabainfo.is_active = true`
}

// Business Profile
const getWabaTableDataByUserId = () => {
  return `SELECT waba_information_id as "wabaInformationId",user_id as "userId",
  facebook_manager_id as "facebookManagerId",phone_code as "phoneCode",
  phone_number as "phoneNumber",  can_receive_sms as "canReceiveSms",
  can_receive_voice_call as "canReceiveVoiceCall", 
  associated_with_ivr as "associatedWithIvr",business_name as "businessName",
   state, whatsapp_status as "whatsappStatus", 
  description,address, country, email, business_category_id as "businessCategoryId",
  profile_photo_url as "profilePhotoUrl", waba_profile_setup_status_id as "wabaProfileSetupStatusId",
  business_manager_verified as "businessManagerVerified", 
  phone_verified as "phoneVerified",city,postal_code as "postalCode",
  service_provider_id as "serviceProviderId",api_key as "apiKey",
  webhook_post_url as "webhookPostUrl",optin_text as "optinText",chatbot_activated as "chatBotActivated"
  FROM waba_information wabainfo
  where wabainfo.user_id = ? and wabainfo.is_active = true`
}

const updateServiceProviderId = () => {
  return `update waba_information
  set service_provider_id = ?,updated_on=now(),updated_by=? 
  WHERE user_id=? and is_active = true`
}

// Business Verification

const updateBusinessProfileVerificationStatus = () => {
  return `update waba_information
  set business_manager_verified=?,updated_on=now(),updated_by=? WHERE user_id=? and is_active = true`
}

const addWabaTableData = () => {
  return `insert into waba_information (facebook_manager_id ,phone_code ,phone_number,can_receive_sms,
  can_receive_voice_call, associated_with_ivr,business_name , state,whatsapp_status , description,address,
  country, email, business_category_id ,profile_photo_url , waba_profile_setup_status_id ,business_manager_verified,
  phone_verified ,waba_information_id,created_by, user_id,city,postal_code, service_provider_id,api_key,webhook_post_url,
  optin_text,chatbot_activated)
  VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
}

const updateWabaTableData = () => {
  return `update waba_information set can_receive_sms=?,
  can_receive_voice_call=?, associated_with_ivr=?,business_name =?, state=?,whatsapp_status =?, description=?
  ,address=?,country=?, email=?, business_category_id =?,profile_photo_url =?,
  waba_profile_setup_status_id =?,business_manager_verified=?,phone_verified =?,waba_information_id=?,
  updated_by=?,updated_on=now(),user_id=?,city=?,postal_code =?, facebook_manager_id=?, 
  service_provider_id=?,api_key=?,webhook_post_url=?,optin_text=?,chatbot_activated=?
  where waba_information_id=? and user_id=?`
}

const setIsActiveFalseByWabaId = () => {
  return `update waba_information 
          set is_active = false, updated_on=now(),updated_by=?
          where waba_information_id = ? and is_active = true`
}

const getUserIdFromWabaNumber = () => {
  return `select user_id as "userId"
  from waba_information wi where is_active = 1
  and wi.phone_number = ? and wi.phone_code = ?`
}

const getWabaData = () => {
  return `select CONCAT(wi.phone_code, wi.phone_number) as "id",
  wi.service_provider_id as "serviceProviderId",
  wi.api_key as "apiKey",
  wi.webhook_post_url as "webhookPostUrl",
  wi.optin_text as "optinText",
  pd.plan_priority as "planPriority",
  wi.chatbot_activated as "chatbotActivated",
  wi.chat_default_message as "chatDefaultMessage"
  from waba_information wi
  join billing_information bi on wi.user_id = bi.user_id and bi.is_active = 1
  join plan_details pd on pd.plan_id = bi.plan_id and pd.is_active = 1
  where wi.is_active = 1 and wi.phone_number = ?`
}

const updateWabaPhoneNumberAndPhoneCodeByWabaIdAndUserId = () => {
  return `update waba_information  set phone_code =?,phone_number=?,
  updated_by=?,updated_on=now()
  where user_id=? and is_active = true`
}

const checkWabaNumberAlreadyExist = () => {
  return `select phone_number as "phoneNumber",phone_code as "phoneCode", user_id  as "userId"
  from waba_information wi 
  where is_active = 1
  and wi.phone_code=? and wi.phone_number=? or wi.user_id=? and is_active = 1`
}

const getWabaNumberFromUserId = () => {
  return `SELECT CONCAT(wi.phone_code, wi.phone_number) as "wabaPhoneNumber"
  FROM waba_information wi
  where wi.user_id = ? and wi.is_active = true`
}

module.exports = {
  getBusinessCategory,
  getBusinessProfile,
  updateBusinessProfileVerificationStatus,
  getWabaTableDataByUserId,
  addWabaTableData,
  updateWabaTableData,
  setIsActiveFalseByWabaId,
  updateServiceProviderId,
  getUserIdFromWabaNumber,
  getWabaData,
  checkWabaNumberAlreadyExist,
  updateWabaPhoneNumberAndPhoneCodeByWabaIdAndUserId,
  getWabaNumberFromUserId
}
