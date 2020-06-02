const getUserDetailsByEmail = () => {
  return `select user_id, hash_password,salt_key, email_verified, phone_verified, tnc_accepted from users 
  where email = $1 and is_active = true`
}

const createUser = () => {
  return `insert into users ( email, hash_password, user_id,salt_key,signup_source,created_by,tnc_accepted,token_key,user_account_type_id) values 
  ($1,$2,$3,$4,$5,$6,$7,$8,$9)`
}

// Account Profile Queries

const getUserDetailsByUserIdForAccountProfile = () => {
  return `select user_id from users 
  where user_id = $1 and is_active = true`
}

const getUserAccountProfile = () => {
  return `select user_id as "accountId",email as "accountManagerName",token_key as "tokenKey",email,type_name as "accountType" ,city, state, country, address_line_1 as "addressLine1",address_line_2 as "addressLine2", contact_number as "contactNumber",phone_code as "phoneCode", postal_code as "postalCode", first_name as "firstName",last_name as "lastName" 
  from users u
  left join user_account_type uat on u.user_account_type_id = uat.user_account_type_id and uat.is_active = true
  WHERE u.user_id = $1 and u.is_active = true`
}

const updateUserAccountProfile = () => {
  return `update users set city=$1, state=$2, country=$3, address_line_1=$4,address_line_2=$5,
  contact_number=$6, phone_code=$7, postal_code =$8,first_name=$9,last_name=$10, updated_on=now(),account_manager_name=$11,user_account_type_id=$12,updated_by=$13 WHERE user_id=$14 and is_active = true`
}

// Billing Profile

const getBillingProfile = () => {
  return `select billing_name as "billingName",city, state, country, address_line_1 as "addressLine1",address_line_2 as "addressLine2",contact_number as "contactNumber",phone_code as  "phoneCode", postal_code as  "postalCode", pan_card as "panCard", gst_or_tax_no as "gstOrTaxNo" 
  from billing_information 
  WHERE user_id = $1 and is_active = true`
}

const createBusinessBillingProfile = () => {
  return `insert into billing_information
  (user_id, billing_name, city, state, country, address_line_1, address_line_2,
    contact_number, phone_code, postal_code, pan_card, gst_or_tax_no,billing_information_id,
    created_by)
    VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`
}

const updateBusinessBillingProfile = () => {
  return `update billing_information
  set city=$1, state=$2, country=$3, address_line_1=$4,address_line_2=$5,contact_number=$6,
  phone_code=$7, postal_code =$8,pan_card=$9, gst_or_tax_no=$10,billing_name=$11,
  updated_by= $12 WHERE user_id=$13 and is_active = true`
}

const updateIsActiveStatusBusinessProfile = () => {
  return `update billing_information
  set is_active=$1,updated_on=now(),updated_by=$2 WHERE user_id=$3 and is_active = true`
}

const getBillingProfileWithBusinessInfoId = () => {
  return `select billing_information_id, billing_name as "billingName",city, state, country, address_line_1 as "addressLine1",address_line_2 as "addressLine2",contact_number as "contactNumber",phone_code as  "phoneCode", postal_code as  "postalCode", pan_card as "panCard", gst_or_tax_no as "gstOrTaxNo" 
  from billing_information 
  WHERE user_id = $1 and is_active = true`
}

const getAccountType = () => {
  return `select user_account_type_id, type_name
  from user_account_type 
  WHERE created_by = $1 and is_active = true`
}

const getVerifiedAndCodeDataByUserId = () => {
  return `select uvc.id as user_verification_code_id , u.phone_verified ,u.email_verified,
    u.email ,u.first_name ,u.phone_code, u.contact_number
    from users u 
    left join user_verification_code uvc on u.user_id = uvc.user_id and lower(uvc.code_type) = lower($2) and uvc.is_consumed = false and uvc.is_active = true
    where u.user_id = $1
    and u.is_active = true`
}

const addVerificationCode = () => {
  return `insert into user_verification_code (user_id,code,code_type,expires_in,created_by) values
  ($1,$2,$3,$4,$5)`
}

const updateVerificationCode = () => {
  return `update user_verification_code
  set is_active = false 
  where user_id  = $1 and lower(code_type) = $2
  and is_consumed = false and is_active = true`
}

const getCodeData = () => {
  return `select expires_in,created_on from user_verification_code
  where user_id  = $1 and code = $2 and code_type = $3 and is_consumed = false
  and is_active = true`
}

const setTokenConsumed = () => {
  return `update user_verification_code 
  set is_consumed = true, updated_by = $4, updated_on = now()
  where user_id  = $1 and code = $2 and code_type = $3 and is_consumed = false
  and is_active = true`
}

const markUserEmailVerified = () => {
  return `update users 
  set email_verified = true, updated_by = $2, updated_on = now() 
  where user_id = $1 and is_active = true`
}

const markUserSmsVerified = () => {
  return `update users 
  set phone_verified = true, updated_by = $2, updated_on = now() 
  where user_id = $1 and is_active = true`
}

const saveUserAgreement = () => {
  return `insert into user_agreement_files (user_agreement_files_id ,user_id ,file_name ,file_path,created_by)
  values ($1,$2,$3,$4,$5)`
}

const getLatestAgreementByUserId = () => {
  return `select file_path from user_agreement_files
  where user_id = $1 and is_active = true 
  order by created_on desc limit 1`
}

module.exports = {
  getUserDetailsByEmail,
  createUser,
  getUserDetailsByUserIdForAccountProfile,
  getUserAccountProfile,
  updateUserAccountProfile,
  createBusinessBillingProfile,
  updateBusinessBillingProfile,
  getBillingProfile,
  updateIsActiveStatusBusinessProfile,
  getBillingProfileWithBusinessInfoId,
  getAccountType,
  getVerifiedAndCodeDataByUserId,
  addVerificationCode,
  updateVerificationCode,
  getCodeData,
  setTokenConsumed,
  markUserEmailVerified,
  markUserSmsVerified,
  saveUserAgreement,
  getLatestAgreementByUserId
}
