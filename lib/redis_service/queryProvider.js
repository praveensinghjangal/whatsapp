const setTemplatesInRedisForWabaPhoneNumber = () => {
  return `select mt.message_template_id , mt.header_text ,mt.body_text ,
  mt.footer_text,CONCAT(wi.phone_code, wi.phone_number) as phone_number
  from message_template mt
  join waba_information wi on mt.waba_information_id = wi.waba_information_id and wi.is_active = true
  where mt.is_active = true and wi.phone_number = ? and message_template_status_id = '1d9d14ca-d3ec-4bea-b3de-05fcb8ceabd9'`
}

module.exports = {
  setTemplatesInRedisForWabaPhoneNumber
}
