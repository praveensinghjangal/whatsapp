// Business Category
const getBusinessCategory = () => {
  return `select business_category_id, category_name
    from business_category 
    WHERE created_by = $1 and is_active = true`
}

// Business Profile
const getBusinessProfile = () => {
  return `SELECT waba_information_id as "wabaInformationId", phone_number as "phoneNumber", phone_code as "phoneCode", 
  facebook_manager_id as "facebookManagerId", business_name as "businessName", email, 
  bcat.category_name as "businessCategory", state, whatsapp_status as "whatsappStatus", 
  description, profile_photo_url as "profilePhotoUrl", address, country, can_receive_sms as "canReceiveSms",
  can_receive_voice_call as "canReceiveVoiceCall", associated_with_ivr as "associatedWithIvr", 
  wabaprof.status_name as "wabaProfileSetupStatus", business_manager_verified as "businessManagerVerified", 
  phone_verified as "phoneVerified"
    FROM waba_information wabainfo
    LEFT JOIN business_category bcat on wabainfo.business_category_id = bcat.business_category_id and bcat.is_active = true
    LEFT JOIN waba_profile_setup_status wabaprof on wabainfo.waba_profile_setup_status_id = wabaprof.waba_profile_setup_status_id and wabaprof.is_active 
  where wabainfo.user_id = $1 and wabainfo.is_active = true`
}

module.exports = {
  getBusinessCategory,
  getBusinessProfile
}
