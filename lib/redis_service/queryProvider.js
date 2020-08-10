
const getWabaData = () => {
  return `select CONCAT(wi.phone_code, wi.phone_number) as "id",
  wi.service_provider_id as "serviceProviderId",
  wi.api_key as "apiKey",
  wi.webhook_post_url as "webhookPostUrl",
  wi.optin_text as "optinText",
  pd.plan_priority as "planPriority",
  wi.chatbot_activated as "chatbotActivated",
  wi.chat_default_message as "chatDefaultMessage"
  from waba_information wi
  join billing_information bi on wi.user_id = bi.user_id and bi.is_active = 1
  join plan_details pd on pd.plan_id = bi.plan_id and pd.is_active = 1
  where wi.is_active = 1 and wi.phone_number = ?`
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
