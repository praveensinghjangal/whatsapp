const __constants = require('../../config/constants')
const ColumnMapService = require('../../lib/columnMapService/columnMap')
const columnMapService = new ColumnMapService()
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
  bcat.category_name as "businessCategory",bcat.business_category_id as "businessCategoryId",
  state, whatsapp_status as "whatsappStatus", description, profile_photo_url as "profilePhotoUrl",
  address, country, can_receive_sms as "canReceiveSms", can_receive_voice_call as "canReceiveVoiceCall",
  associated_with_ivr as "associatedWithIvr", wabaprof.status_name as "wabaProfileSetupStatus",
  business_manager_verified as "businessManagerVerified", phone_verified as "phoneVerified", city,
  postal_code as "postalCode",wabainfo.service_provider_id as "serviceProviderId", 
  user_account_id_by_provider as "serviceProviderUserAccountId",
  service_provider_name as "serviceProviderName", api_key as "apiKey",IFNULL(sp.max_website_allowed, 1) as "maxWebsiteAllowed",
  webhook_post_url as "webhookPostUrl", optin_text as "optinText", chatbot_activated as "chatBotActivated", websites, img_data as "imageData",
  access_info_rejection_reason as "accessInfoRejectionReason",wabainfo.waba_profile_setup_status_id as "wabaProfileSetupStatusId",
  wabainfo.user_id as "userId",wabainfo.max_tps_to_provider as "maxTpsToProvider"
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
  waba_profile_setup_status_id as "wabaProfileSetupStatusId",
  business_manager_verified as "businessManagerVerified", 
  phone_verified as "phoneVerified",city,postal_code as "postalCode",
  service_provider_id as "serviceProviderId",api_key as "apiKey",
  webhook_post_url as "webhookPostUrl",optin_text as "optinText",chatbot_activated as "chatBotActivated", websites,
  user_account_id_by_provider as "serviceProviderUserAccountId", img_data as "imageData",
  access_info_rejection_reason as "accessInfoRejectionReason",templates_allowed as "templatesAllowed",
  max_tps_to_provider as "maxTpsToProvider"
  FROM waba_information wabainfo
  where wabainfo.user_id = ? and wabainfo.is_active = true`
}

const updateServiceProviderDetails = () => {
  return `update waba_information
  set service_provider_id = ?,api_key = ?,
  user_account_id_by_provider = ?,
  max_tps_to_provider = ?,
  updated_on=now(),updated_by=? 
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
  country, email, business_category_id , waba_profile_setup_status_id ,business_manager_verified,
  phone_verified ,waba_information_id,created_by, user_id,city,postal_code, service_provider_id,api_key,webhook_post_url,
  optin_text,chatbot_activated,user_account_id_by_provider,websites,access_info_rejection_reason)
  VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
}

const updateWabaTableData = () => {
  return `update waba_information set can_receive_sms=?,
  can_receive_voice_call=?, associated_with_ivr=?,business_name =?, state=?,whatsapp_status =?, description=?
  ,address=?,country=?, email=?, business_category_id =?,
  waba_profile_setup_status_id =?,business_manager_verified=?,phone_verified =?,waba_information_id=?,
  updated_by=?,updated_on=now(),user_id=?,city=?,postal_code =?, facebook_manager_id=?, 
  service_provider_id=?,api_key=?,webhook_post_url=?,optin_text=?,chatbot_activated=?,
  user_account_id_by_provider=? ,websites=?,img_data=?, access_info_rejection_reason =?,
  templates_allowed=?,max_tps_to_provider=?
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
  wi.user_account_id_by_provider as "userAccountIdByProvider",
  wi.wabiz_username as "wabizUsername",
  wi.wabiz_password as "wabizPassword",
  wi.wabiz_api_key_expires_on as "wabizApiKeyExpiresOn",
  wi.wabiz_base_url as "wabizBaseUrl",
  wi.graph_api_key as "graphApiKey"
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
  return `select phone_number as "phoneNumber",phone_code as "phoneCode",
  user_id  as "userId",waba_profile_setup_status_id as "wabaProfileSetupStatusId"
  from waba_information wi 
  where is_active = 1
  and wi.phone_code=? and wi.phone_number=? or wi.user_id=? and is_active = 1`
}

const getWabaNumberFromUserId = () => {
  return `SELECT CONCAT(wi.phone_code, wi.phone_number) as "wabaPhoneNumber"
  FROM waba_information wi
  where wi.user_id = ? and wi.is_active = true`
}

const getUserIdAndTokenKeyByWabaNumber = () => {
  return `select u.user_id as "userId", u.token_key as "apiKey"
  from waba_information wi
  left join users u
  on wi.user_id = u.user_id and u.is_active=true and wi.is_active=true
  where wi.phone_number =? and wi.phone_code=?`
}

const getWabaNumberAndOptinTextFromUserId = () => {
  return `SELECT CONCAT(wi.phone_code, wi.phone_number) as "wabaPhoneNumber",
  optin_text as "optinText"
  FROM waba_information wi
  where wi.user_id = ? and wi.is_active = true`
}

const getWebsiteLimit = () => {
  return `select max_website_allowed as "maxWebsiteAllowed"
  from service_provider 
  where service_provider_id = ? and is_active = 1`
}

/* Not in use */
const updateProfilePicUrl = () => {
  return `update waba_information
  set profile_photo_url= ?
  WHERE user_id=? and is_active = true`
}

const getServiceProviderDetailsByUserId = () => {
  return `SELECT waba_information_id as "wabaInformationId",user_id as "userId",
  phone_code as "phoneCode",phone_number as "phoneNumber",
  waba_profile_setup_status_id as "wabaProfileSetupStatusId",
  service_provider_id as "serviceProviderId",api_key as "apiKey",
  user_account_id_by_provider as "serviceProviderUserAccountId",
  max_tps_to_provider as "maxTpsToProvider"
  FROM waba_information wabainfo
  where wabainfo.user_id = ? and wabainfo.is_active = true`
}

const getBusinessProfileListByStatusId = (columnArray) => {
  let query = `select count(1) over() as "totalFilteredRecord", wa.waba_information_id as 'wabaInformationId',
  wa.phone_number as 'phoneNumber',wa.phone_code as 'phoneCode',wa.facebook_manager_id as 'facebookManagerId',
  wa.user_id as "userId",wa.business_name as 'businessName',wa.waba_profile_setup_status_id as "wabaProfileSetupStatusId",
  ws.status_name as "wabaProfileSetupStatus",wa.access_info_rejection_reason as "accessInfoRejectionReason" 
  from waba_information wa
  JOIN waba_profile_setup_status ws on wa.waba_profile_setup_status_id = ws.waba_profile_setup_status_id and ws.is_active = true
  where wa.is_active = true`

  columnArray.forEach((element) => {
    query += columnMapService.mapColumn(element.colName, element.type)
  })
  query += ` order by wa.updated_on desc limit ? offset ?;
  select count(1) as "totalRecord" from waba_information wi
  where wi.is_active = true`
  return query
}

const getProfileByWabaId = () => {
  return `SELECT waba_information_id as "wabaInformationId", phone_number as "phoneNumber", phone_code as "phoneCode", 
  facebook_manager_id as "facebookManagerId", business_name as "businessName", email, 
  bcat.category_name as "businessCategory",bcat.business_category_id as "businessCategoryId",
  state, whatsapp_status as "whatsappStatus", description, profile_photo_url as "profilePhotoUrl",
  address, country, can_receive_sms as "canReceiveSms", can_receive_voice_call as "canReceiveVoiceCall",
  associated_with_ivr as "associatedWithIvr", wabaprof.status_name as "wabaProfileSetupStatus",
  business_manager_verified as "businessManagerVerified", phone_verified as "phoneVerified", city,
  postal_code as "postalCode",wabainfo.service_provider_id as "serviceProviderId", 
  user_account_id_by_provider as "serviceProviderUserAccountId",
  service_provider_name as "serviceProviderName", api_key as "apiKey",IFNULL(sp.max_website_allowed, 1) as "maxWebsiteAllowed",
  webhook_post_url as "webhookPostUrl", optin_text as "optinText", chatbot_activated as "chatBotActivated", websites, img_data as "imageData",
  access_info_rejection_reason as "accessInfoRejectionReason",wabainfo.waba_profile_setup_status_id as "wabaProfileSetupStatusId",
  wabainfo.user_id as "userId",wabainfo.max_tps_to_provider as "maxTpsToProvider",wabainfo.templates_allowed as "templateAllowed"
  FROM waba_information wabainfo
  LEFT JOIN business_category bcat on wabainfo.business_category_id = bcat.business_category_id and bcat.is_active = true
  LEFT JOIN waba_profile_setup_status wabaprof on wabainfo.waba_profile_setup_status_id = wabaprof.waba_profile_setup_status_id and wabaprof.is_active  = true
  LEFT JOIN service_provider sp on wabainfo.service_provider_id = sp.service_provider_id and sp.is_active  = true
  where wabainfo.waba_information_id = ? and wabainfo.is_active = true`
}

const getWabaStatus = () => {
  return `select waba_profile_setup_status_id as "wabaProfileStatusId", status_name as "statusName"
  from waba_profile_setup_status
  where is_active = true`
}

const getTemplateAllocatedCount = () => {
  // return `select count(distinct (mt.message_template_id)) as "templateAllocated" from waba_information wi join message_template mt on wi.waba_information_id = mt.waba_information_id
  // where wi.user_id = ? and mt.is_active = 1 and wi.is_active = 1`
  return `select templates_allowed as "templateAllocated" from waba_information
  where user_id = ? and is_active = true;`
}

const getServiceProviderData = () => {
  return `select service_provider_id as "serviceProviderId", service_provider_name as "serviceProviderName", max_website_allowed as maxWebsiteAllowed, updated_by as updatedBy 
  from service_provider sp
  where is_active = true
  order by sp.updated_on desc`
}

const toggleChatbot = () => {
  return `update waba_information
  set chatbot_activated = ?,
  updated_on=now(),updated_by=? 
  WHERE user_id=? and is_active = true`
}

const getWabaAccountActiveInactiveCount = () => {
  return `select (select count(DISTINCT(business_number)) 
  from message_history mh 
  where is_active =true and created_on  BETWEEN CURRENT_DATE() - INTERVAL 30 DAY AND CURRENT_DATE()) as "totalActiveUsers",
  (select count(1) from users u 
  where is_active = true and user_role_id != '${__constants.SUPPORT_ROLE_ID}') as "totalUsers"`
}

const getWabaStatusCount = () => {
  return ` select wpss.status_name as "statusName",count(1) as "statusCount" 
  from waba_information wi 
  join waba_profile_setup_status wpss on wi.waba_profile_setup_status_id = wpss.waba_profile_setup_status_id  and wpss.is_active =true 
  where wi.is_active =true 
  group by status_name`
}

const getServiceProvider = () => {
  return 'select service_provider_id as serviceProviderId, service_provider_name as serviceProviderName, max_website_allowed as maxWebsiteAllowed from service_provider where (service_provider_id = ? or service_provider_name = ? ) and is_active = true;'
}

const insertServiceProviderData = () => {
  return `insert into service_provider (service_provider_id,service_provider_name,created_on,created_by,is_active, max_website_allowed,updated_by,updated_on) 
  values(?,?,CURRENT_TIMESTAMP, ?,  1, ?,?,now())`
}

const updateServiceProviderData = (deactive, columnArray) => {
  let query = 'update service_provider set'

  columnArray.forEach((element, index) => {
    query += (index === (columnArray.length - 1)) ? ` ${element} = ? ` : ` ${element} = ? , `
  })
  query += (deactive) ? ' WHERE service_provider_id = ?' : ' WHERE service_provider_id = ? and is_active = true'
  return query
}

const getServiceTotalProviderCount = () => {
  return `select count(1) as "totalServiceProvider"
  from service_provider sp 
  where sp.is_active =true`
}

const updateWabizApiKeyAndExpireyTime = () => {
  return `update waba_information
  set api_key = ?,wabiz_api_key_expires_on = ?
  WHERE phone_code= ? and phone_number = ? and is_active = true`
}

module.exports = {
  getBusinessCategory,
  getBusinessProfile,
  updateBusinessProfileVerificationStatus,
  getWabaTableDataByUserId,
  addWabaTableData,
  updateWabaTableData,
  setIsActiveFalseByWabaId,
  updateServiceProviderDetails,
  getUserIdFromWabaNumber,
  getWabaData,
  checkWabaNumberAlreadyExist,
  updateWabaPhoneNumberAndPhoneCodeByWabaIdAndUserId,
  getWabaNumberFromUserId,
  getUserIdAndTokenKeyByWabaNumber,
  getWabaNumberAndOptinTextFromUserId,
  getWebsiteLimit,
  updateProfilePicUrl,
  getServiceProviderDetailsByUserId,
  getBusinessProfileListByStatusId,
  getProfileByWabaId,
  getWabaStatus,
  getTemplateAllocatedCount,
  getServiceProviderData,
  toggleChatbot,
  getWabaAccountActiveInactiveCount,
  getWabaStatusCount,
  getServiceProvider,
  insertServiceProviderData,
  updateServiceProviderData,
  getServiceTotalProviderCount,
  updateWabizApiKeyAndExpireyTime
}
