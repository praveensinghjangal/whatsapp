const getUserDetailsByEmail = () => {
  return `select user_id, hash_password as hash_password,salt_key, email_verified, phone_verified, tnc_accepted from users 
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
  return `select user_id as accountId,account_manager_name as accountManagerName,token_key as tokenKey,email,type_name as accountType ,city, state, country, address_line_1 as addressLine1,address_line_2 as addressLine2, contact_number as contactNumber,phone_code as phoneCode, postal_code as postalCode, first_name as firstName,last_name as lastName 
  from users u
  left join user_account_type uat on u.user_account_type_id = uat.account_type_id and uat.is_active = true
  WHERE u.user_id = $1 and u.is_active = true`
}

const updateUserAccountProfile = () => {
  return `update users set city=$1, state=$2, country=$3, address_line_1=$4,address_line_2=$5,
  contact_number=$6, phone_code=$7, postal_code =$8,first_name=$9,last_name=$10, updated_on=now(),account_manager_name=$11,user_account_type_id=$12,updated_by=$13 WHERE user_id=$14 and is_active = true`
}

// Billing Profile

const getUserDetailsByUserIdForBusiness = () => {
  return `select user_id from business_information 
  where user_id = $1 and is_active = true`
}

const getBillingProfile = () => {
  return `select business_name as businessName,city, state, country, address_line_1 as addressLine1,address_line_2 as addressLine2,contact_number as contactNumber,phone_code as  phoneCode, postal_code as  postalCode, pan_card as panCard, gst_or_tax_no as gstOrTaxNo 
  from business_information 
  WHERE user_id = $1 and is_active = true`
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

const updateIsActiveStatusBusinessProfile = () => {
  return `update business_information
  set is_active=$1,updated_on=now(),updated_by=$2 WHERE user_id=$3 and is_active = true`
}

const getBillingProfileWithBusinessInfoId = () => {
  return `select business_information_id, business_name as businessName,city, state, country, address_line_1 as addressLine1,address_line_2 as addressLine2,contact_number as contactNumber,phone_code as  phoneCode, postal_code as  postalCode, pan_card as panCard, gst_or_tax_no as gstOrTaxNo 
  from business_information 
  WHERE user_id = $1 and is_active = true`
}

module.exports = { getUserDetailsByEmail, createUser, getUserDetailsByUserIdForAccountProfile, getUserAccountProfile, updateUserAccountProfile, createBusinessBillingProfile, updateBusinessBillingProfile, getBillingProfile, getUserDetailsByUserIdForBusiness, updateIsActiveStatusBusinessProfile, getBillingProfileWithBusinessInfoId }
