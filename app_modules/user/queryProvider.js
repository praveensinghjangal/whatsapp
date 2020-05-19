const getUserDetailsByEmail = () => {
  return `select user_id, hash_password as hash_password,salt_key from users 
  where email = $1 and is_active = true`
}

const createUser = () => {
  return `insert into users ( email, hash_password, user_id,salt_key,signup_source,created_by) values 
  ($1,$2,$3,$4,$5,$6)`
}

// Account Profile Queries

const getUserDetailsByUserIdForAccountProfile = () => {
  return `select user_id from users 
  where user_id = $1 and is_active = true`
}

const getUserAccountProfile = () => {
  return `select email, city, state, country, address_line_1,address_line_2, contact_number,
   phone_code, postal_code from users WHERE user_id = $1 and is_active = true`
}

const updateUserAccountProfile = () => {
  return `update users set city=$1, state=$2, country=$3, address_line_1=$4,address_line_2=$5,
  contact_number=$6, phone_code=$7, postal_code =$8, updated_by=$9 WHERE user_id=$10 and is_active = true`
}

// Billing Profile

const getUserDetailsByUserIdForBusiness = () => {
  return `select user_id from business_information 
  where user_id = $1 and is_active = true`
}

const getBillingProfile = () => {
  return `select  business_name,city, state, country, address_line_1,address_line_2,
  contact_number, phone_code, postal_code,pan_card, gst_or_tax_no 
  from business_information WHERE user_id = $1 and is_active = true`
}

const createBusinessBillingProfile = () => {
  return `insert into business_information
  (user_id, business_name, city, state, country, address_line_1, address_line_2,
    contact_number, phone_code, postal_code, pan_card, gst_or_tax_no,business_information_id,
    created_by,token_expiry_in_seconds)
    VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`
}

const updateBusinessBillingProfile = () => {
  return `update business_information
  set city=$1, state=$2, country=$3, address_line_1=$4,address_line_2=$5,contact_number=$6,
  phone_code=$7, postal_code =$8,pan_card=$9, gst_or_tax_no=$10,business_name=$11,
  updated_by= $12 WHERE user_id=$13 and is_active = true`
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

module.exports = {
  getUserDetailsByEmail,
  createUser,
  getUserDetailsByUserIdForAccountProfile,
  getUserAccountProfile,
  updateUserAccountProfile,
  createBusinessBillingProfile,
  updateBusinessBillingProfile,
  getBillingProfile,
  getUserDetailsByUserIdForBusiness,
  getVerifiedAndCodeDataByUserId,
  addVerificationCode,
  updateVerificationCode,
  getCodeData,
  setTokenConsumed,
  markUserEmailVerified,
  markUserSmsVerified
}
