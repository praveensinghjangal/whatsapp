const getUserDetailsByEmail = () => {
  return `select user_id, hash_password as hash_password,salt_key from users 
  where email = $1 and is_active = true`
}

const createUser = () => {
  return `insert into users ( email, hash_password, user_id,salt_key,signup_source,created_by) values 
  ($1,$2,$3,$4,$5,$6)`
}

// Account Profile Queries

const getUserAccountProfile = () => {
  return `select email, city, state, country, address_line_1,address_line_2, contact_number,
   phone_code, postal_code from users WHERE user_id = $1 and is_active = true`
}

const updateUserAccountProfile = () => {
  return `update users set city=$1, state=$2, country=$3, address_line_1=$4,address_line_2=$5,
  contact_number=$6, phone_code=$7, postal_code =$8, updated_by=$9 WHERE user_id=$10`
}

// Billing Profile

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
  updated_by= $12 WHERE user_id=$13`
}

module.exports = { getUserDetailsByEmail, createUser, getUserAccountProfile, updateUserAccountProfile, createBusinessBillingProfile, updateBusinessBillingProfile, getBillingProfile }
