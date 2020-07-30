
const getWabaData = () => {
  return `select CONCAT(phone_code, phone_number) as "id",
  service_provider_id as "serviceProviderId",
  api_key as "apiKey",
  webhook_post_url as "webhookPostUrl",
  optin_text as "optinText"
  from waba_information
  where is_active = 1 and phone_number = ?`
}

const setTemplatesInRedisForWabaPhoneNumber = () => {
  return `select mt.message_template_id , mt.header_text ,mt.body_text ,
  mt.footer_text,CONCAT(wi.phone_code, wi.phone_number) as phone_number
  from message_template mt
  join waba_information wi on mt.waba_information_id = wi.waba_information_id and wi.is_active = true
  where mt.is_active = true and wi.phone_number = ?`
}

module.exports = {
  getWabaData,
  setTemplatesInRedisForWabaPhoneNumber
}
