
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
  where message_id =? order by status_time desc`
}

const getMessageIdByServiceProviderMsgId = () => {
  return `select message_id as "messageId" from message_history
            where is_active = 1 and service_provider_message_id = ? limit 1`
}

module.exports = {
  getMessageTableDataWithId,
  addMessageHistoryData,
  getMessageIdByServiceProviderMsgId
}
