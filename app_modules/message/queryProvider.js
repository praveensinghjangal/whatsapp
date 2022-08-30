const __constants = require('../../config/constants')

const addMessageHistoryData = (date) => {
  const messageHistory = `message_history_${date}`
  return `INSERT INTO ${messageHistory} (message_id, service_provider_message_id,service_provider_id, delivery_channel, status_time, state,
  end_consumer_number,message_country, business_number, errors, custom_one, custom_two, custom_three , custom_four, conversation_id)
  VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
}

const getMessageTableDataWithId = (date) => {
  const messageHistory = `message_history_${date}`
  return `SELECT message_id as "messageId",
  delivery_channel as "deliveryChannel",status_time  as "statusTime", state, 
  end_consumer_number as "endConsumerNumber", business_number as  "businessNumber", custom_one as "customOne", custom_two  as "customTwo", custom_three as "customThree", custom_four as "customFour"
  FROM ${messageHistory}
  where message_id =? order by id desc`
}

const getMessageIdByServiceProviderMsgId = () => {
  return `select message_id as "messageId" , service_provider_message_id as "serviceProviderMessageId", business_number as "businessNumber", end_consumer_number as "endConsumerNumber",message_country as "countryName" , custom_one as "customOne", custom_two  as "customTwo", custom_three as "customThree", custom_four as "customFour", date
  from message_id_mapping_data
  where is_active = 1 and service_provider_message_id = ? limit 1`
}

const getMessageStatusCount = () => {
  return `SELECT mh.state, COUNT(1) AS "stateCount"
  FROM message_history mh
  WHERE mh.id IN (
    SELECT MAX(mh1.id)
    FROM message_history mh1
    where mh1.is_active = 1
    and mh1.business_number = ?
    and mh1.created_on BETWEEN  ? AND ?
    GROUP BY mh1.message_id)
  and mh.is_active = 1
    and mh.business_number =  ?
  and mh.created_on BETWEEN ? AND ?
  GROUP BY mh.state`
}

const getMessageStatusList = () => {
  return `select mh.message_id as "messageId",mh.status_time as time , mh.end_consumer_number as "endConsumerNumber"
from message_history mh
where mh.is_active = 1
and lower(mh.state) = ?
and mh.id IN (
  SELECT MAX(mh1.id)
  FROM message_history mh1
  where mh1.is_active = 1
  and mh1.created_on BETWEEN ? AND ?
  and mh1.business_number = ?
  GROUP BY mh1.message_id)
and mh.created_on BETWEEN ? AND ? 
and mh.business_number = ?
order by mh.created_on desc limit ? offset ?;
select count(1) as "totalCount"
from message_history mh
where mh.is_active = 1
and lower(mh.state) = ?
and mh.id IN (
  SELECT MAX(mh1.id)
  FROM message_history mh1
  where mh1.is_active = 1
  and mh1.created_on  BETWEEN ? AND ? 
  and mh1.business_number = ?
  GROUP BY mh1.message_id)
and mh.created_on  BETWEEN ? AND ? 
and mh.business_number = ?`
}

const getIncomingOutgoingMessageCount = (transactionType) => {
  let query = ''
  if (transactionType !== __constants.MESSAGE_TRANSACTION_TYPE[1]) {
    query += `SELECT count(distinct(viva_message_id)) as "incomingMessageCount"
    FROM incoming_message_payload
    where payload ->"$.to" = (select CONCAT(phone_code ,phone_number) 
      from waba_information where user_id = ? and is_active = 1)
    and created_on BETWEEN ? AND ?;`
  }
  if (transactionType !== __constants.MESSAGE_TRANSACTION_TYPE[0]) {
    query += `select count(1) as "count",message_type as "messageType"
    from service_provider_message_api_log spmal
    join waba_information wi on CONCAT(wi.phone_code ,wi.phone_number ) = spmal.request->>"$.payload.whatsapp.from" and wi.is_active = true
    where wi.user_id = ?
    and spmal.created_on BETWEEN ? AND ?
    group by spmal.message_type;`
  }
  return query
}

const getIncomingMessageTransaction = sort => {
  return `SELECT distinct(viva_message_id) as "messageId", created_on as "time",
  payload ->>"$.to" as "to", from_number as "from",
  payload ->>"$.content.contentType" as "contentType",
  payload ->>"$.whatsapp.senderName" as "senderName",
  payload ->>"$.content.media.type"  as "mediaType",
  payload ->>"$.content.media.mediaId" as "mediaId",
  payload ->>"$.content.text" as "message",
  payload ->>"$.content.location.latitude" as "latitude",
  payload ->>"$.content.location.longitude" as "longitude"
    FROM incoming_message_payload
    where payload ->"$.to" = (select CONCAT(phone_code ,phone_number) 
    from waba_information where user_id = ? and is_active = 1)
    and created_on BETWEEN ? AND ?
    order by created_on ${sort} limit ? offset ?;
    SELECT count(distinct(viva_message_id)) as "totalCount"
    FROM incoming_message_payload
    where payload ->"$.to" = (select CONCAT(phone_code ,phone_number) 
      from waba_information where user_id = ? and is_active = 1)
    and created_on BETWEEN ? AND ?;`
}

const getOutgoingMessageTransaction = () => {
  return `select mh.message_id as "messageId",mh.status_time as "time"
  from message_history mh 
  where mh.is_active = 1
  and mh.id IN (
   SELECT MAX(mh1.id)
   FROM message_history mh1
   where mh1.is_active = 1
   and mh1.business_number = ?
   and mh1.created_on BETWEEN ? AND ?
   GROUP BY mh1.message_id)
  and mh.business_number = ?
  and mh.created_on BETWEEN ? AND ?
  order by mh.created_on limit ? offset ?;
  select count(1) as "totalCount"
  from message_history mh 
  where mh.is_active = 1
  and mh.id IN (
   SELECT MAX(mh1.id)
   FROM message_history mh1
   where mh1.is_active = 1
   and mh1.business_number = ?
   and mh1.created_on BETWEEN ? AND ?
   GROUP BY mh1.message_id)
  and mh.business_number = ?
  and mh.created_on BETWEEN ? AND ?;`
}

const getOutgoingTransactionListBySearchFilters = (endUserNumberRequired) => {
  return `  
  select mh.message_id as "messageId",mh.status_time as "time", mh.state as "status"
 from message_history mh 
 where mh.is_active = 1
 and mh.id IN (
  SELECT MAX(mh1.id)
  FROM message_history mh1
  where mh1.is_active = 1
  and mh1.business_number = ?
  and mh1.created_on BETWEEN ? AND ?
  ${endUserNumberRequired ? 'and mh1.end_consumer_number = ?' : ''}  
  GROUP BY mh1.message_id)
 and mh.business_number = ?
 and mh.created_on BETWEEN ? AND ?
 ${endUserNumberRequired ? 'and mh.end_consumer_number = ?' : ''} 
 order by mh.created_on desc limit ? offset ?;
 select count(1) as "totalCount"
 from message_history mh 
 where mh.is_active = 1
 and mh.id IN (
  SELECT MAX(mh1.id)
  FROM message_history mh1
  where mh1.is_active = 1
  and mh1.business_number = ?
  and mh1.created_on BETWEEN ? AND ?
  ${endUserNumberRequired ? 'and mh1.end_consumer_number = ?' : ''}  
  GROUP BY mh1.message_id)
 and mh.business_number = ?
 and mh.created_on BETWEEN ? AND ?
 ${endUserNumberRequired ? 'and mh.end_consumer_number = ?' : ''}  
 ;`
}
const getVivaMsgIdByserviceProviderMsgId = () => {
  return `SELECT message_id 
  FROM message_id_mapping_data where service_provider_message_id = ? and is_active = true limit 1`
}

const addMessageHistoryDataInBulk = (date) => {
  const messageHistory = `message_history_${date}`
  return `INSERT INTO ${messageHistory} (message_id, service_provider_message_id,service_provider_id, delivery_channel, status_time, state,
  end_consumer_number,message_country, business_number, errors, custom_one, custom_two, custom_three , custom_four)
  VALUES ? `
}

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
  and message_template_status_id in ('${__constants.TEMPLATE_APPROVE_STATUS}','${__constants.TEMPLATE_PARTIAL_APPROVE_STATUS}') and mt.message_template_id in (?)   `
}

const createMessageHistoryTable = (date) => {
  const messageHistory = `message_history_${date}`
  return ` CREATE TABLE ${messageHistory} (
    id  bigint unsigned NOT NULL AUTO_INCREMENT,
    message_id  varchar(50) NOT NULL,
    service_provider_id  varchar(50) NOT NULL,
    delivery_channel  varchar(50) NOT NULL,
    status_time  timestamp NOT NULL,
    state  varchar(100) NOT NULL,
    end_consumer_number  varchar(50) DEFAULT NULL,
    message_country varchar(50) DEFAULT NULL,
    business_number  varchar(50) DEFAULT NULL,
    created_on  timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    is_active  tinyint(1) DEFAULT '1',
    service_provider_message_id  varchar(250) DEFAULT NULL,
    errors  json DEFAULT NULL,
    custom_one  varchar(50) DEFAULT NULL,
    custom_two  varchar(50) DEFAULT NULL,
    custom_three  varchar(50) DEFAULT NULL,
    custom_four  varchar(50) DEFAULT NULL,
    conversation_id varchar(100) DEFAULT NULL NULL,
    PRIMARY KEY (id)) `
}

const addMessageIdMappingData = () => {
  return `INSERT INTO message_id_mapping_data
  (message_id, service_provider_message_id, end_consumer_number,message_country, business_number, custom_one, custom_two, custom_three, custom_four, date)
  VALUES (?,?,?,?,?,?,?,?,?)`
}

const addMessageHistoryDataInMis = () => {
  return `INSERT INTO message_history (message_id, service_provider_message_id,service_provider_id, delivery_channel, status_time, state,
  end_consumer_number,message_country, business_number, errors, custom_one, custom_two, custom_three , custom_four, conversation_id)
  VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
}

const addMessageHistoryDataInBulkInMis = () => {
  return `INSERT INTO message_history (message_id, service_provider_message_id,service_provider_id, delivery_channel, status_time, state,
  end_consumer_number,message_country, business_number, errors, custom_one, custom_two, custom_three , custom_four)
  VALUES ? `
}

const checkConversationLogExists = () => {
  return `select conversation_id as "conversationId"
  from billing_conversation bc 
  where conversation_id = ?`
}

const addConversationLog = () => {
  return 'insert into billing_conversation' +
  '(billing_conversation_id, conversation_id, `from`, `to`, conversation_category, conversation_expires_on, created_by)' +
  'VALUES (?,?,?,?,?,?,?)'
}

const getMisRelatedData = () => {
  return `SELECT COUNT(b.conversation_category) as conversationCategoryCount, b.conversation_category as conversationCategory, DATE_FORMAT(b.created_on, '%Y-%m-%d') as createdOn,
  b.from as wabaPhoneNumber
  FROM billing_conversation b
  where b.created_on between ? and ?
  and   b.created_on not between concat(Date(now()),' 00:00:00') and concat(Date(now()),' 23:59:59')
  GROUP BY b.conversation_category ,b.from, DATE(b.created_on)`
}

const getWabaNameByWabaNumber = () => {
  return 'select CONCAT(phone_code ,phone_number) as wabaPhoneNumber , business_name as businessName from waba_information wi where phone_number in (?)'
}

const getDataOnBasisOfWabaNumberFromBillingCoversation = () => {
  return `SELECT COUNT(b.conversation_category) as conversationCategoryCount, b.conversation_category as conversationCategory
  FROM billing_conversation b
  where b.created_on between ? and ? and b.from = ?
  GROUP BY b.conversation_category`
}

const getTemplateCategoryId = () => {
  return `select mt.message_template_id,mt.message_template_category_id
  ,CONCAT(wi.phone_code, wi.phone_number) as phone_number
   from message_template mt
  join waba_information wi on mt.waba_information_id = wi.waba_information_id and wi.is_active = true
  where mt.is_active = true and wi.phone_number = ?
   and mt.message_template_id = ?`
}

module.exports = {
  getDataOnBasisOfWabaNumberFromBillingCoversation,
  getMessageTableDataWithId,
  addMessageHistoryData,
  getMessageIdByServiceProviderMsgId,
  getMessageStatusCount,
  getMessageStatusList,
  getIncomingOutgoingMessageCount,
  getIncomingMessageTransaction,
  getOutgoingMessageTransaction,
  getOutgoingTransactionListBySearchFilters,
  getVivaMsgIdByserviceProviderMsgId,
  addMessageHistoryDataInBulk,
  setTemplatesInRedisForWabaPhoneNumber,
  createMessageHistoryTable,
  addMessageIdMappingData,
  addMessageHistoryDataInMis,
  addMessageHistoryDataInBulkInMis,
  addConversationLog,
  checkConversationLogExists,
  getMisRelatedData,
  getWabaNameByWabaNumber,
  getTemplateCategoryId
}
