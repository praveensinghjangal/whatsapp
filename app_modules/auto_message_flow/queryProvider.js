
const getEventDetailsFromIdentifierOrTopic = () => {
  return `select identifier_text as "identifierText",event, event_data as "eventData", identifier_text_name as identifierTextName , 'i' as "resultOf" from auot_message_flows amf 
  where is_active = true and waba_phone_number = ?
  and lower(identifier_text) = ?
  UNION
  select identifier_text as "identifierText", event, event_data, identifier_text_name , 't' from auot_message_flows amf 
  where is_active = true and waba_phone_number = ?
  and LOWER(flow_topic) = ? and parent_identifier_text is null
  order by identifierText`
}

const getMoreMenuByParentIdentifier = () => {
  return `select identifier_text as "identifierText",event, event_data as "eventData", identifier_text_name as identifierTextName
  from auot_message_flows amf 
  where is_active = true and waba_phone_number = ?
  and lower(parent_identifier_text) = ?
  order by identifierText`
}

const addEventTransaction = () => {
  return `insert into auot_message_transaction(auot_message_transcation_id,audience_phone_number,
  waba_phone_number,identifier_text,message_id,message_text,transaction_status,event_data)
  values(?,?,?,?,?,?,?,?)`
}

const getTransactionData = (interval) => {
  return `select auot_message_transcation_id as "auotMessageTranscationId",message_text as "messageText",event_data as "eventData"
  from auot_message_transaction amt
  where transaction_status  = 1
  and audience_phone_number = ?
  and waba_phone_number = ?
  and (created_on between now()- ${interval} and now())`
}
const closeEventTransaction = () => {
  return `update auot_message_transaction 
  set transaction_status = 0
  where auot_message_transcation_id  = ?`
}

module.exports = {
  getEventDetailsFromIdentifierOrTopic,
  getMoreMenuByParentIdentifier,
  addEventTransaction,
  getTransactionData,
  closeEventTransaction
}
