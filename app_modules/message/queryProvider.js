const __constants = require('../../config/constants')

const addMessageHistoryData = (date) => {
  const messageHistory = `message_history_${date}`
  return `INSERT INTO ${messageHistory} (message_id, service_provider_message_id,service_provider_id, delivery_channel, status_time, state,
  end_consumer_number,message_country, business_number, errors, custom_one, custom_two, custom_three , custom_four, conversation_id, camp_name)
  VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
}

const getMessageTableDataWithId = (date) => {
  const messageHistory = `message_history_${date}`
  return `SELECT message_id as "messageId",
  delivery_channel as "deliveryChannel",status_time  as "statusTime", state, 
  end_consumer_number as "endConsumerNumber", business_number as  "businessNumber", custom_one as "customOne", custom_two  as "customTwo", custom_three as "customThree", custom_four as "customFour", camp_name as campName
  FROM ${messageHistory}
  where message_id =? order by id desc`
}

const getMessageIdByServiceProviderMsgId = () => {
  return `select message_id as "messageId" , service_provider_message_id as "serviceProviderMessageId", business_number as "businessNumber", end_consumer_number as "endConsumerNumber",message_country as "countryName" , custom_one as "customOne", custom_two  as "customTwo", custom_three as "customThree", custom_four as "customFour", date
  from message_id_mapping_data
  where is_active = 1 and service_provider_message_id = ? limit 1`
}

const getMessageStatusCount = () => {
  return `SELECT state, COUNT(1) AS "stateCount"
  FROM (
    SELECT
        mh.id AS idd,
        mh.state AS state,
        mh.created_on as DATE123,
        ROW_NUMBER() OVER (PARTITION BY mh.message_id  ORDER BY mh.id desc) AS nc
      FROM
        message_history mh where  mh.business_number = ? and
          mh.created_on BETWEEN ? AND ?
  ) t
  WHERE t.nc = 1 group by t.state`
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
  end_consumer_number,message_country, business_number, errors, custom_one, custom_two, custom_three , custom_four, camp_name)
  VALUES ? `
}

const setTemplatesInRedisForWabaPhoneNumber = () => {
  return `select mt.message_template_id, mt.header_text,mt.header_type ,mt.body_text,
  mt.footer_text, CONCAT(wi.phone_code, wi.phone_number) as phone_number,
  mt.first_localization_status,mt.second_localization_status,
  mtl.language_code as "first_language_code",mtl2.language_code as "second_language_code",
  mt.button_type, mt.button_data
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
    custom_one  varchar(150) DEFAULT NULL,
    custom_two  varchar(150) DEFAULT NULL,
    custom_three  varchar(150) DEFAULT NULL,
    custom_four  varchar(150) DEFAULT NULL,
    conversation_id varchar(100) DEFAULT NULL NULL,
    camp_name  varchar(100) DEFAULT NULL,
    PRIMARY KEY (id)) `
}

const addMessageIdMappingData = () => {
  return `INSERT INTO message_id_mapping_data
  (message_id, service_provider_message_id, end_consumer_number,message_country, business_number, custom_one, custom_two, custom_three, custom_four, date)
  VALUES (?,?,?,?,?,?,?,?,?,?)`
}

const addMessageHistoryDataInMis = () => {
  return `INSERT INTO message_history (message_id, service_provider_message_id,service_provider_id, delivery_channel, status_time, state,
  end_consumer_number,message_country, business_number, errors, custom_one, custom_two, custom_three , custom_four, conversation_id, camp_name)
  VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
}

const addMessageHistoryDataInBulkInMis = () => {
  return `INSERT INTO message_history (message_id, service_provider_message_id,service_provider_id, delivery_channel, status_time, state,
  end_consumer_number,message_country, business_number, errors, custom_one, custom_two, custom_three , custom_four, camp_name)
  VALUES ? `
}

const checkConversationLogExists = () => {
  return `select conversation_id as "conversationId"
  from billing_conversation bc 
  where conversation_id = ?`
}

const addConversationLog = () => {
  return 'insert into billing_conversation' +
  '(billing_conversation_id, conversation_id, `from`, `to`,message_country, conversation_category, conversation_expires_on, created_by)' +
  'VALUES (?,?,?,?,?,?,?,?)'
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
// const getUserDetailsAgainstWabaNumber = () => {
//   return `select  GROUP_CONCAT(wi.user_id) as userId, business_name as businessName
//   from waba_information wi where CONCAT(phone_code ,phone_number) IN (?)`
// }
// const addDataToUserWiseSummray = () => {
//   return `Insert into userwise_summary
//   (serial_no,user_id,waba_id,waba_name,
//   waba_number,Total_submission,Total_message_sent,Total_message_Inprocess,Total_message_Delivered,
//   Total_message_InFailed,Total_message_Rejected)
//   values (?,?,?,?,?,?,?,?,?,?,?,?)`
// }
const getActiveBusinessNumber = () => {
  return `select GROUP_CONCAT(phone_code ,phone_number) as wabaNumber , GROUP_CONCAT(user_id) as user_id,
  GROUP_CONCAT(waba_information_id) as wabaId, GROUP_CONCAT(business_name) as wabaName
  from waba_information
  where is_active = true`
}
// const getCountOfStatusOfWabaNumber = () => {
//   return `select business_number ,state,count(*)
//   from message_history_220802 where business_number in (?) group by 1,2;`
// }
// const getNewStateDataAgainstAllUser = (date) => {
//   const messageHistory = `message_history_${date}`
//   return `SELECT business_number, count(state), state , message_country as "messageCountry"
//   from
//   (SELECT business_number, state, message_id , message_country
//   FROM (
//     SELECT DISTINCT message_id, state, business_number, message_country
//     FROM ${messageHistory}
//     where  business_number in ('917666118833')
//     order BY status_time desc) as ids
//   group BY ids.message_id,message_country) as id
//   group by 1,3,4;`
// }
// const insertuserwiseDataAgainstWaba = () => {
//   return `INSERT into userwise_summary (waba_number,message_country,total_submission,total_message_sent,total_message_Inprocess,total_message_resourceAllocated,total_message_forwarded,total_message_deleted,
//   total_message_seen,total_message_delivered,total_message_accepted,total_message_failed,total_message_pending,total_message_rejected,Delivered_Percentage)
//   values ?
//   ON DUPLICATE KEY
//   UPDATE total_submission= values(total_submission),
//   total_message_sent = values(total_message_sent),
//   total_message_Inprocess = values(total_message_Inprocess),
//   total_message_resourceAllocated = values(total_message_resourceAllocated),
//   total_message_forwarded = values(total_message_forwarded),
//   total_message_deleted = values(total_message_deleted),
//   total_message_seen = values(total_message_seen),
//   total_message_delivered = values(total_message_delivered),
//   total_message_accepted = values(total_message_accepted),
//   total_message_failed = values(total_message_failed),
//   total_message_pending = values(total_message_pending),
//   total_message_rejected = values(total_message_rejected),
//   Delivered_Percentage = values(Delivered_Percentage),
//   updated_on = now();`
// }
// const checkTableExist = (date) => {
//   const messageHistory = `message_history_${date}`
//   return `SELECT @${messageHistory}`
// }
// not in use this function
// const getNewTemplateDetailsAgainstAllUser = (date) => {
//   const messageHistory = `message_history_${date}`
//   return `SELECT business_number, count(state), state, template_id  as "templateId"
//   from
//   (SELECT business_number, state, message_id, created_on , template_id
//   FROM (
//     SELECT DISTINCT message_id, state, business_number, created_on , template_id
//     FROM ${messageHistory}
//     where  business_number in (?)
//     order BY status_time desc) as ids
//   group BY ids.message_id) as id
//   group by 1, 3`
// }
// not in use
// const insertTemplateStatusAgainstWaba = () => {
//   return `INSERT into template_summary(waba_number,template_Id,template_name,total_submission,total_message_sent,total_message_Inprocess,total_message_resourceAllocated,total_message_forwarded,
//   total_message_deleted,total_message_seen,total_message_delivered,total_message_accepted, total_message_failed,total_message_pending,total_message_rejected,Delivered_Percentage)
//   values (?)
//   ON DUPLICATE KEY
//   UPDATE total_submission= values(total_submission),
//   total_message_sent = values(total_message_sent),
//   total_message_Inprocess = values(total_message_Inprocess),
//   total_message_resourceAllocated = values(total_message_resourceAllocated),
//   total_message_forwarded = values(total_message_forwarded),
//   total_message_deleted = values(total_message_deleted),
//   total_message_seen = values(total_message_seen),
//   total_message_delivered = values(total_message_delivered),
//   total_message_accepted = values(total_message_accepted),
//   total_message_failed = values(total_message_failed),
//   total_message_pending = values(total_message_pending),
//   total_message_rejected = values(total_message_rejected),
//   Delivered_Percentage = values(Delivered_Percentage),
//   updated_on = now();`
// }
const getTemplateNameAgainstId = () => {
  return `SELECT template_name As "templateName" From message_template
  where message_template_id = ? and is_active = true`
}
const getconversationDataBasedOnWabaNumber = () => {
  return `SELECT COUNT(b.conversation_category) as conversationCategoryCount, b.conversation_category as conversationCategory,
    b.from as wabaPhoneNumber,b.message_country as "messageCountry"
    FROM billing_conversation b
    where b.from in (?) and (b.created_on BETWEEN ? and ?) and b.is_active = TRUE
    GROUP BY b.conversation_category ,b.from, b.message_country`
}
// const insertConversationDataAgainstWaba = () => {
//   return `INSERT into conversation_summary (waba_number,country_name,user_initiated,business_initiated,referral_conversion,not_applicable,total_number)
//     values ?
//     ON DUPLICATE KEY
//     UPDATE business_initiated= values(business_initiated),
//     user_initiated = values(user_initiated),
//     referral_conversion = values(referral_conversion),
//     not_applicable = values(not_applicable),
//     total_number = values(total_number),
//     updated_on = now();`
// }

const getTemplateCategoryId = () => {
  return `select mt.message_template_id,mt.message_template_category_id, CONCAT(wi.phone_code, wi.phone_number) as phone_number, button_type, button_data
  from message_template mt
  join waba_information wi on mt.waba_information_id = wi.waba_information_id and wi.is_active = true
  where mt.is_active = true and wi.phone_number = ?
  and mt.message_template_id = ?`
}
const getTemplateIdandTemplateNameAgainstUser = () => {
  return `select DISTINCT message_template_id as "templateId", template_name as "templateName"  from message_template mt 
  left join waba_information wi on wi.waba_information_id = mt.message_template_id and wi.is_active = true
  left join users u on u.user_id = wi.user_id and u.user_id = ? and u.is_active = true
  where mt.is_active = true `
}

const getConversationDataBasedOnWabaNumberAllData = () => {
  return `SELECT COUNT(b.conversation_category) as conversationCategoryCount, b.conversation_category as conversationCategory,
  b.from as wabaPhoneNumber,b.message_country as "messageCountry"
  FROM billing_conversation b
  where b.from in (?) and b.created_on BETWEEN ? and ?
  GROUP BY b.conversation_category ,b.from, b.message_country`
}

const groupByIssue = () => {
  return "SET GLOBAL sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));"
}

const getWabaNameByPhoneNumber = () => {
  return 'select CONCAT(phone_code ,phone_number) as wabaPhoneNumber , business_name as businessName from waba_information wi where CONCAT(phone_code ,phone_number) in (?)'
}

const getMisRelatedIncomingData = () => {
  return `SELECT count(*) as "incomingMessageCount",  payload ->"$.to" as wabaPhoneNumber,DATE_FORMAT(created_on, '%Y-%m-%d') as date
  FROM incoming_message_payload
  where created_on BETWEEN  ? and ?
  group by payload ->"$.to",DATE(created_on);`
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
  getActiveBusinessNumber,
  getTemplateNameAgainstId,
  getconversationDataBasedOnWabaNumber,
  getTemplateCategoryId,
  getTemplateIdandTemplateNameAgainstUser,
  getConversationDataBasedOnWabaNumberAllData,
  groupByIssue,
  getWabaNameByPhoneNumber,
  getMisRelatedIncomingData
}
