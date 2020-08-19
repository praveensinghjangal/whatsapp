
const getEventDetailsFromIdentifierOrTopic = () => {
  return `select identifier_text as "identifierText",event, event_data as "eventData", identifier_text_name as identifierTextName , 'i' as "resultOf" from auot_message_flows amf 
  where is_active = true and waba_phone_number = ?
  and lower(identifier_text) = ?
  UNION
  select identifier_text as "identifierText", event, event_data, identifier_text_name , 't' from auot_message_flows amf 
  where is_active = true and waba_phone_number = ?
  and LOWER(flow_topic) = ? and parent_identifier_text is null and LOWER(event) != 'end'
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

const getIdentifierData = (wabaNumber, columnArray) => {
  // console.log('Column Arrt', columnArray)
  let query
  query = `select auot_message_flow_id as "auotMessageFlowId",identifier_text as "identifierText",identifier_text_name as "identifierTextName"
  from auot_message_flows amf 
  where is_active = true and waba_phone_number = ?`

  if (columnArray.length > 0) {
    columnArray.forEach((element, index) => {
      // console.log('Element', element)
      if (element === 'amf.flow_topic' && !columnArray.includes('amf.parent_identifier_text')) {
        query += ` AND ${element} = lower(?) AND parent_identifier_text is null`
      } else if (element === 'amf.flow_topic') {
        query += ` AND ${element} = lower(?)`
      } else {
        query += ` AND ${element} = ?`
      }
    })
    query += ' order by identifierText'
  }
  if (columnArray <= 0) {
    query = `select DISTINCT flow_topic as "flowTopic" 
    from auot_message_flows amf
    where is_active = true and waba_phone_number = ?`
  }
  // console.log('Query', query)
  return query
}

const getFlowDataByFlowId = () => {
  return `select identifier_text as "identifierText" ,event ,event_data as "eventData" ,
  flow_topic as "flowTopic" ,parent_identifier_text as "parentIdentifierText" ,
  identifier_text_name as "identifierTextName" 
  from auot_message_flows 
  where is_active = 1 and auot_message_flow_id = ?`
}

const getIdentifierDetailsByIdentifier = () => {
  return `select auot_message_flow_id as "auotMessageFlowId" ,event ,event_data as "eventData" ,
  flow_topic as "flowTopic" ,parent_identifier_text as "parentIdentifierText" ,
  identifier_text_name as "identifierTextName" 
  from auot_message_flows 
  where is_active = 1 and LOWER(identifier_text) = ? and waba_phone_number = ?`
}

const flowTopicExists = () => {
  return `select count(1) as "flowCount"
  from auot_message_flows
  where is_active = 1 
  and LOWER(flow_topic) = ? 
  and waba_phone_number = ?`
}

const addFlow = () => {
  return `insert into auot_message_flows(auot_message_flow_id,identifier_text,waba_phone_number,event,event_data,flow_topic,parent_identifier_text,identifier_text_name,created_by)
  values (?,?,?,?,?,?,?,?,?)`
}

const updateFlow = () => {
  return `update auot_message_flows 
  set identifier_text  = ?,event = ?,event_data = ?,flow_topic = ?, parent_identifier_text = ?,identifier_text_name = ?,updated_by = ?,updated_on=CURRENT_TIMESTAMP
  where is_active = 1 and auot_message_flow_id = ?`
}

module.exports = {
  getEventDetailsFromIdentifierOrTopic,
  getMoreMenuByParentIdentifier,
  addEventTransaction,
  getTransactionData,
  closeEventTransaction,
  getIdentifierData,
  getFlowDataByFlowId,
  getIdentifierDetailsByIdentifier,
  flowTopicExists,
  addFlow,
  updateFlow
}
