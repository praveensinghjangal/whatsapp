const getUserDetailsByEmail = () => {
  return `select user_id, hash_password,salt_key, email_verified, phone_verified, tnc_accepted,role_name
  from users u
  join user_role ur on ur.user_role_id = u.user_role_id and ur.is_active = true 
  where lower(u.email) = lower(?) and u.is_active = true`
}

const createUser = () => {
  return `insert into users ( email, hash_password, user_id,salt_key,signup_source,created_by,tnc_accepted,token_key,user_account_type_id,user_role_id) values 
  (?,?,?,?,?,?,?,?,?,?)`
}

// Account Profile Queries

const getUserDetailsByUserIdForAccountProfile = () => {
  return `select user_id from users 
  where user_id = ? and is_active = true`
}

const getUserAccountProfile = () => {
  return `select user_id as "accountId",email as "accountManagerName",token_key as "tokenKey",email,type_name as "accountType" ,city, state, country, address_line_1 as "addressLine1",address_line_2 as "addressLine2", contact_number as "contactNumber",phone_code as "phoneCode", postal_code as "postalCode", first_name as "firstName",last_name as "lastName" 
  from users u
  left join user_account_type uat on u.user_account_type_id = uat.user_account_type_id and uat.is_active = true
  WHERE u.user_id = ? and u.is_active = true`
}

const updateUserAccountProfile = () => {
  return `update users set city= ?, state= ?, country= ?, address_line_1= ?,address_line_2= ?,
  contact_number= ?, phone_code= ?, postal_code = ?,first_name= ?,last_name= ?, updated_on=now(),account_manager_name= ?,user_account_type_id= ?,updated_by= ? WHERE user_id= ? and is_active = true`
}

// Billing Profile

const getBillingProfile = () => {
  return `select billing_name as "billingName",city, state, country, address_line_1 as "addressLine1"
  ,address_line_2 as "addressLine2",contact_number as "contactNumber",phone_code as  "phoneCode",
  postal_code as  "postalCode", pan_card as "panCard", gst_or_tax_no as "gstOrTaxNo", pd.plan_name as "planActivated",
  date_format(bi.created_on,'%d/%m/%Y') as "accoutCreatedOn"
  from billing_information bi
  left join plan_details pd on
  bi.plan_id  = pd.plan_id and pd.is_active =true and bi.is_active = true
  WHERE user_id = ? `
}

const createBusinessBillingProfile = () => {
  return `insert into billing_information
  (user_id, billing_name, city, state, country, address_line_1, address_line_2,
    contact_number, phone_code, postal_code, pan_card, gst_or_tax_no,billing_information_id,
    created_by)
    VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
}

const updateBusinessBillingProfile = () => {
  return `update billing_information
  set city=?, state=?, country=?, address_line_1=?,address_line_2=?,contact_number=?,
  phone_code=?, postal_code =?,pan_card=?, gst_or_tax_no=?,billing_name=?,
  updated_by= ? ,updated_on=now() WHERE user_id=? and is_active = true`
}

const updateIsActiveStatusBusinessProfile = () => {
  return `update billing_information
  set is_active=?,updated_on=now(),updated_by=? WHERE user_id=? and is_active = true`
}

const getBillingProfileWithBusinessInfoId = () => {
  return `select billing_information_id, billing_name as "billingName",city, state, country, address_line_1 as "addressLine1",address_line_2 as "addressLine2",contact_number as "contactNumber",phone_code as  "phoneCode", postal_code as  "postalCode", pan_card as "panCard", gst_or_tax_no as "gstOrTaxNo" 
  from billing_information 
  WHERE user_id = ? and is_active = true`
}

const getAccountType = () => {
  return `select user_account_type_id, type_name
  from user_account_type 
  WHERE is_active = true`
}

const getVerifiedAndCodeDataByUserId = () => {
  return `select uvc.id as user_verification_code_id , u.phone_verified ,u.email_verified,
    u.email ,u.first_name ,u.phone_code, u.contact_number
    from users u 
    left join user_verification_code uvc on u.user_id = uvc.user_id and lower(uvc.code_type) = lower(?) and uvc.is_consumed = false and uvc.is_active = true
    where u.user_id = ?
    and u.is_active = true`
}

const addVerificationCode = () => {
  return `insert into user_verification_code (user_id,code,code_type,expires_in,created_by) values
  (?,?,?,?,?)`
}

const updateVerificationCode = () => {
  return `update user_verification_code
  set is_active = false , updated_by = ?, updated_on = now()
  where user_id  = ? and lower(code_type) = ?
  and is_consumed = false and is_active = true`
}

const getCodeData = () => {
  return `select expires_in,created_on from user_verification_code
  where user_id  = ? and code = ? and code_type = ? and is_consumed = false
  and is_active = true`
}

const setTokenConsumed = () => {
  return `update user_verification_code 
  set is_consumed = true, updated_by = ?, updated_on = now()
  where user_id  = ? and code = ? and code_type = ? and is_consumed = false
  and is_active = true`
}

const markUserEmailVerified = () => {
  return `update users 
  set email_verified = true, updated_by = ?, updated_on = now() 
  where user_id = ? and is_active = true`
}

const markbusinessNumberVerified = () => {
  return `update waba_information 
  set phone_verified = true, updated_by = ?, updated_on = now() 
  where user_id = ? and is_active = true`
}

const markUserSmsVerified = () => {
  return `update users 
  set phone_verified = true, updated_by = ?, updated_on = now() 
  where user_id = ? and is_active = true`
}

const saveUserAgreement = () => {
  return `insert into user_agreement_files (user_agreement_files_id ,user_id ,file_name ,file_path,created_by)
  values (?,?,?,?,?)`
}

const getLatestAgreementByUserId = () => {
  return `select file_path from user_agreement_files
  where user_id = ? and is_active = true 
  order by created_on desc limit 1`
}

const getVerifiedAndCodeDataByUserIdForBusinessNumber = () => {
  return `select uvc.id as user_verification_code_id , wi.phone_verified , wi.business_name ,
  wi.phone_code, wi.phone_number
    from waba_information wi 
    left join user_verification_code uvc on wi.user_id = uvc.user_id and lower(uvc.code_type) = lower(?) and uvc.is_consumed = false and uvc.is_active = true
    where wi.user_id = ?
    and wi.is_active = true`
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
  getLatestAgreementByUserId,
  getVerifiedAndCodeDataByUserIdForBusinessNumber,
  markbusinessNumberVerified
}
