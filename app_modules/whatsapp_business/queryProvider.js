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
  phone_verified as "phoneVerified", city, postal_code as "postalCode"
  FROM waba_information wabainfo
  LEFT JOIN business_category bcat on wabainfo.business_category_id = bcat.business_category_id and bcat.is_active = true
  LEFT JOIN waba_profile_setup_status wabaprof on wabainfo.waba_profile_setup_status_id = wabaprof.waba_profile_setup_status_id and wabaprof.is_active 
  where wabainfo.user_id = $1 and wabainfo.is_active = true`
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
  phone_verified as "phoneVerified",city,postal_code as "postalCode"
  FROM waba_information wabainfo
  where wabainfo.user_id = $1 and wabainfo.is_active = true`
}

// Business Verification

const updateBusinessProfileVerificationStatus = () => {
  return `update waba_information
  set business_manager_verified=$1,updated_on=now(),updated_by=$2 WHERE user_id=$3 and is_active = true`
}

const addWabaTableData = () => {
  return `insert into waba_information (facebook_manager_id ,phone_code ,phone_number,can_receive_sms,
  can_receive_voice_call, associated_with_ivr,business_name , state,whatsapp_status , description,address,
  country, email, business_category_id ,profile_photo_url , waba_profile_setup_status_id ,business_manager_verified,
  phone_verified ,waba_information_id,created_by, user_id,city,postal_code)
  VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23)`
}

const updateWabaTableData = () => {
  return `update waba_information  set phone_code =$1,phone_number=$2,can_receive_sms=$3,
  can_receive_voice_call=$4, associated_with_ivr=$5,business_name =$6, state=$7,whatsapp_status =$8, description=$9
  ,address=$10,country=$11, email=$12, business_category_id =$13,profile_photo_url =$14,
  waba_profile_setup_status_id =$15,business_manager_verified=$16,
  phone_verified =$17,waba_information_id=$18,updated_by=$19,updated_on=now(),user_id=$20,city=$21,postal_code =$22
  where waba_information_id=$18 and user_id=$20`
}

const setIsActiveFalseByWabaId = () => {
  return `update waba_information 
          set is_active = false, updated_on=now(),updated_by=$2
          where waba_information_id = $1 and is_active = true`
}

module.exports = {
  getBusinessCategory,
  getBusinessProfile,
  updateBusinessProfileVerificationStatus,
  getWabaTableDataByUserId,
  addWabaTableData,
  updateWabaTableData,
  setIsActiveFalseByWabaId
}
