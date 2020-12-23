const __constants = require('../../config/constants')

const setTemplatesInRedisForWabaPhoneNumber = () => {
  return `select mt.message_template_id , mt.header_text,mt.header_type ,mt.body_text ,
  mt.footer_text,CONCAT(wi.phone_code, wi.phone_number) as phone_number,
  mt.first_localization_status,mt.second_localization_status,
  mtl.language_code as "first_language_code",mtl2.language_code as "second_language_code"
  from message_template mt
  join waba_information wi on mt.waba_information_id = wi.waba_information_id and wi.is_active = true
  join message_template_language mtl on mt.message_template_language_id = mtl.message_template_language_id and mtl.is_active = true
  left join message_template_language mtl2 on mt.second_message_template_language_id = mtl2.message_template_language_id and mtl2.is_active = true
  where mt.is_active = true and wi.phone_number = ?
  and message_template_status_id in ('${__constants.TEMPLATE_APPROVE_STATUS}','${__constants.TEMPLATE_PARTIAL_APPROVE_STATUS}')`
}

module.exports = {
  setTemplatesInRedisForWabaPhoneNumber
}
