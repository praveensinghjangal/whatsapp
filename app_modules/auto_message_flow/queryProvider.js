
const addMessageHistoryData = (messageId) => {
  return `INSERT INTO message_history
  (message_id, service_provider_message_id,service_provider_id, delivery_channel, status_time, state,
  end_consumer_number, business_number)
  VALUES (?,?,?,?,?,?,?,?)`
}

module.exports = {
  addMessageHistoryData
}
