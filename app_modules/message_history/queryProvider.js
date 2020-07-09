
const addMessageHistoryData = () => {
  return `INSERT INTO message_history
  (message_id, service_provider_id, delivery_channel, status_time, state,
  end_consumer_number, business_number, is_active)
  VALUES($1, $2, $3, $4, $5, $6,$7, true)`
}

const getMessageTableDataWithId = () => {
  return `SELECT message_id as "messageId", service_provider_id as "serviceProviderId",
  delivery_channel as "deliveryChannel",status_time  as "statusTime", state, 
  end_consumer_number as "endConsumerNumber", business_number as  "businessNumber"
  FROM message_history mh
  where mh.message_id =$1 `
}

module.exports = {
  getMessageTableDataWithId,
  addMessageHistoryData
}
