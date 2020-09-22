const getUserDetailsByEmail = () => {
  return `select user_id, hash_password,salt_key, email_verified, phone_verified, tnc_accepted,role_name,is_tfa_enabled
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
  return `select u.user_id as "accountId",email as "accountManagerName",token_key as "tokenKey",email,
  type_name as "accountType" ,city, state, country, address_line_1 as "addressLine1",address_line_2 as "addressLine2",
  contact_number as "contactNumber",phone_code as "phoneCode", postal_code as "postalCode", first_name as "firstName",
  last_name as "lastName",tps, phone_verified as "phoneVerified", email_verified as "emailVerified", ut.tfa_type as "tfaType"
  from users u
  left join user_account_type uat on u.user_account_type_id = uat.user_account_type_id and uat.is_active = true
  left join users_tfa ut on u.user_id = ut.user_id and ut.is_active = true
  WHERE u.user_id = ? and u.is_active = true`
}

const updateUserAccountProfile = () => {
  return `update users set city= ?, state= ?, country= ?, address_line_1= ?,address_line_2= ?,
  contact_number= ?, phone_code= ?, postal_code = ?,first_name= ?,last_name= ?, updated_on=now(),account_manager_name= ?,user_account_type_id= ?,updated_by= ? WHERE user_id= ? and is_active = true`
}

const updateTokenInAccountProfile = () => {
  return `update users set token_key = ?, updated_on=now(),updated_by= ? 
  WHERE user_id= ? and is_active = true`
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

const getUserIdFromKey = () => {
  return `select user_id as "userId" from users
  where is_active  = 1 and token_key = ?`
}

const getPasswordTokenByEmail = () => {
  return `select rpt.reset_password_token_id , u.user_id, u.first_name
  from users u 
  left join reset_password_token rpt on u.user_id = rpt.user_id and rpt.is_consumed = false and rpt.is_active = true
  where u.email = ?
  and u.is_active = true`
}

const updateExistingPasswordTokens = () => {
  return `update reset_password_token
  set is_active = false , updated_by = ?, updated_on = now()
  where user_id  = ?
  and is_consumed = false and is_active = true`
}

const addPasswordToken = () => {
  return `insert into reset_password_token (user_id,token,expires_in,created_by) values
  (?,?,?,?)`
}

const getTokenDetailsFromToken = () => {
  return `select expires_in , user_id, created_on
  from reset_password_token 
  where token = ?
  and is_active = 1
  and is_consumed = 0`
}

const updatePassword = () => {
  return `update users 
  set hash_password = ?, salt_key = ?, updated_by = ?, updated_on = now()
  where user_id  = ?
  and is_active = 1`
}

const setPasswordTokeConsumed = () => {
  return `update reset_password_token 
  set is_consumed = 1, updated_by = ?, updated_on = now()
  where user_id  = ? and token = ? and is_consumed = false
  and is_active = true`
}

const getTfaData = () => {
  return `select ut.users_tfa_id as "userTfaId", ut.user_id as "userId", ut.authenticator_secret as "authenticatorSecret",
  ut.backup_codes as "backupCodes", ut.tfa_type as "tfaType",temp_authenticator_secret as "tempAuthenticatorSecret",
  temp_tfa_type as "tempTfaType"
  from users_tfa ut
  where ut.user_id  = ? and ut.is_active = 1`
}

const updateTfaData = () => {
  return `update users_tfa
  set authenticator_secret= ?,
  backup_codes= ?,
  tfa_type= ?,
  temp_authenticator_secret = null,
  temp_tfa_type = null,
  updated_on=now(),updated_by= ?
  WHERE users_tfa_id = ? and is_active = true`
}

const addTempTfaData = () => {
  return `insert into users_tfa (users_tfa_id,user_id,authenticator_secret,temp_tfa_type,created_by,backup_codes) values
  (?,?,?,?,?,'[]')`
}

const updateTempTfaData = () => {
  return `update users_tfa
  set temp_authenticator_secret = ?,
  temp_tfa_type = ?,
  updated_on=now(),updated_by= ?
  WHERE users_tfa_id = ? and is_active = true`
}

const resetTfaData = () => {
  return `update users_tfa
  set temp_authenticator_secret = null,
  temp_tfa_type = null,
  backup_codes = '[]',
  tfa_type= null,
  authenticator_secret = null,
  updated_on=now(),updated_by= ?
  WHERE users_tfa_id = ? and is_active = true`
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
  markbusinessNumberVerified,
  updateTokenInAccountProfile,
  getUserIdFromKey,
  getPasswordTokenByEmail,
  updateExistingPasswordTokens,
  addPasswordToken,
  getTokenDetailsFromToken,
  updatePassword,
  setPasswordTokeConsumed,
  getTfaData,
  updateTfaData,
  addTempTfaData,
  updateTempTfaData,
  resetTfaData
}
