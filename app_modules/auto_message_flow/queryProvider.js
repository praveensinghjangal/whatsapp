
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
  and lower(parent_identifier_text) = ?`
}

module.exports = {
  getEventDetailsFromIdentifierOrTopic,
  getMoreMenuByParentIdentifier
}
