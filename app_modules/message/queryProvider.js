const __constants = require('../../config/constants')

const addMessageHistoryData = (messageId) => {
  return `INSERT INTO message_history
  (message_id, service_provider_message_id,service_provider_id, delivery_channel, status_time, state,
  end_consumer_number, business_number)
  VALUES (?,?,?,?,?,?,?,?)`
}

const getMessageTableDataWithId = () => {
  return `SELECT message_id as "messageId",
  delivery_channel as "deliveryChannel",status_time  as "statusTime", state, 
  end_consumer_number as "endConsumerNumber", business_number as  "businessNumber"
  FROM message_history
  where message_id =? order by id desc`
}

const getMessageIdByServiceProviderMsgId = () => {
  return `select message_id as "messageId" , service_provider_id as  "serviceProviderId", business_number as "businessNumber", end_consumer_number as "endConsumerNumber" 
  from message_history
  where is_active = 1 and service_provider_message_id = ? limit 1`
}

const getMessageStatusCount = () => {
  return `SELECT mh.state, COUNT(1) AS "stateCount"
  FROM message_history mh
  join waba_information wi on CONCAT(wi.phone_code ,wi.phone_number ) = mh.business_number and wi.is_active = true
  WHERE mh.id IN (
    SELECT MAX(mh1.id)
    FROM message_history mh1
    join waba_information wi1 on CONCAT(wi1.phone_code ,wi1.phone_number ) = mh1.business_number and wi1.is_active = true
    where mh1.is_active = 1
    and wi1.user_id = ?
    and mh1.created_on BETWEEN ? AND ?
    GROUP BY mh1.message_id)
  and mh.is_active = 1
  and wi.user_id = ?
  and mh.created_on BETWEEN ? AND ?
  GROUP BY mh.state`
}

const getMessageStatusList = () => {
  return `select mh.message_id as "messageId",mh.status_time as time , mh.end_consumer_number as "endConsumerNumber"
  from message_history mh
  join waba_information wi on CONCAT(wi.phone_code ,wi.phone_number ) = mh.business_number and wi.is_active = true
  where mh.is_active = 1
  and lower(mh.state) = ?
  and mh.id IN (
    SELECT MAX(mh1.id)
    FROM message_history mh1
    join waba_information wi1 on CONCAT(wi1.phone_code ,wi1.phone_number ) = mh1.business_number and wi1.is_active = true
    where mh1.is_active = 1
    and mh1.created_on BETWEEN ? AND ?
    and wi1.user_id = ?
    GROUP BY mh1.message_id)
  and mh.created_on BETWEEN ? AND ? 
  and wi.user_id = ?
  order by mh.created_on desc limit ? offset ?;
  select count(1) as "totalCount"
  from message_history mh
  join waba_information wi on CONCAT(wi.phone_code ,wi.phone_number ) = mh.business_number and wi.is_active = true
  where mh.is_active = 1
  and lower(mh.state) = ?
  and mh.id IN (
    SELECT MAX(mh1.id)
    FROM message_history mh1
    join waba_information wi1 on CONCAT(wi1.phone_code ,wi1.phone_number ) = mh1.business_number and wi1.is_active = true
    where mh1.is_active = 1
    and mh1.created_on BETWEEN ? AND ?
    and wi1.user_id = ?
    GROUP BY mh1.message_id)
  and mh.created_on BETWEEN ? AND ? 
  and wi.user_id = ?`
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
    query += `select count(distinct(mh.message_id)) as "outgoingMessageCount"
    from message_history mh 
    join waba_information wi on CONCAT(wi.phone_code ,wi.phone_number ) = mh.business_number and wi.is_active = true
    where mh.is_active = 1
    and mh.id IN (
     SELECT MAX(mh1.id)
     FROM message_history mh1
     join waba_information wi1 on CONCAT(wi1.phone_code ,wi1.phone_number ) = mh1.business_number and wi1.is_active = true
     where mh1.is_active = 1
     and wi1.user_id = ?
     and mh1.created_on BETWEEN ? AND ?
     GROUP BY mh1.message_id)
    and wi.user_id = ?
    and mh.created_on BETWEEN ? AND ?;`
  }
  return query
}

const getIncomingMessageTransaction = () => {
  return `SELECT distinct(viva_message_id) as "messageId", created_on as "time"
    FROM incoming_message_payload
    where payload ->"$.to" = (select CONCAT(phone_code ,phone_number) 
      from waba_information where user_id = ? and is_active = 1)
    and created_on BETWEEN ? AND ?
    order by created_on limit ? offset ?;
    SELECT count(distinct(viva_message_id)) as "totalCount"
    FROM incoming_message_payload
    where payload ->"$.to" = (select CONCAT(phone_code ,phone_number) 
      from waba_information where user_id = ? and is_active = 1)
    and created_on BETWEEN ? AND ?; `
}

const getOutgoingMessageTransaction = () => {
  return `select mh.message_id as "messageId",mh.status_time as "time"
  from message_history mh 
  join waba_information wi on CONCAT(wi.phone_code ,wi.phone_number ) = mh.business_number and wi.is_active = true
  where mh.is_active = 1
  and mh.id IN (
   SELECT MAX(mh1.id)
   FROM message_history mh1
   join waba_information wi1 on CONCAT(wi1.phone_code ,wi1.phone_number ) = mh1.business_number and wi1.is_active = true
   where mh1.is_active = 1
   and wi1.user_id = ?
   and mh1.created_on BETWEEN ? AND ?
   GROUP BY mh1.message_id)
  and wi.user_id = ?
  and mh.created_on BETWEEN ? AND ?
  order by mh.created_on limit ? offset ?;
  select count(1) as "totalCount"
  from message_history mh 
  join waba_information wi on CONCAT(wi.phone_code ,wi.phone_number ) = mh.business_number and wi.is_active = true
  where mh.is_active = 1
  and mh.id IN (
   SELECT MAX(mh1.id)
   FROM message_history mh1
   join waba_information wi1 on CONCAT(wi1.phone_code ,wi1.phone_number ) = mh1.business_number and wi1.is_active = true
   where mh1.is_active = 1
   and wi1.user_id = ?
   and mh1.created_on BETWEEN ? AND ?
   GROUP BY mh1.message_id)
  and wi.user_id = ?
  and mh.created_on BETWEEN ? AND ?;`
}

module.exports = {
  getMessageTableDataWithId,
  addMessageHistoryData,
  getMessageIdByServiceProviderMsgId,
  getMessageStatusCount,
  getMessageStatusList,
  getIncomingOutgoingMessageCount,
  getIncomingMessageTransaction,
  getOutgoingMessageTransaction
}
