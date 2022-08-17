// const __constants = require('../../config/constants')

const getDeliveryReportByMessageId = () => {
  return `SELECT message_id as messageId, end_consumer_number as consumerNumber, JSON_ARRAYAGG(created_on) as createdOn, JSON_ARRAYAGG(state) as state, custom_one as campaignName, DATE_FORMAT(created_on, "%m/%d/%Y") as time
  FROM (
      SELECT DISTINCT message_id, state, custom_one, end_consumer_number, created_on
      FROM message_history mh
      where( message_id = ? or end_consumer_number = ?) and (created_on BETWEEN ? and ?) and business_number = ? 
      order BY created_on desc) as messagedetails
  group BY messagedetails.message_id
  order by message_id limit ? offset ?;
  select count(DISTINCT message_id) as totalCount
  FROM message_history mh
  where( message_id = ? or end_consumer_number = ? ) and (created_on BETWEEN ? and ?) and business_number = ?;`
}

// const getDeliveryReportByConsumerNumber = () => {
//   return `SELECT message_id as messageId, end_consumer_number as consumerNumber, JSON_ARRAYAGG(created_on) as createdOn, JSON_ARRAYAGG(state) as state, custom_one as campaignName, DATE_FORMAT(created_on, "%m/%d/%Y") as time
//   FROM (
//       SELECT DISTINCT message_id, state, custom_one, end_consumer_number, created_on
//       FROM message_history mh
//       where end_consumer_number = ? and business_number = ?
//       order BY created_on desc) as messagedetails
//   group BY messagedetails.message_id
//   order by message_id limit ? offset ?;
//   select count(DISTINCT message_id) as totalCount
//   FROM message_history mh
//   where end_consumer_number = ? and business_number = ?;`
// }

// const getDeliveryReportByCampaignName = () => {
//   return `SELECT message_id as messageId, end_consumer_number as consumerNumber, JSON_ARRAYAGG(created_on) as createdOn, JSON_ARRAYAGG(state) as state, custom_one as campaignName, DATE_FORMAT(created_on, "%m/%d/%Y") as time
//   FROM (
//       SELECT DISTINCT message_id, state, custom_one, end_consumer_number, created_on
//       FROM message_history mh
//       where custom_one = ? and business_number = ?
//       order BY created_on desc) as messagedetails
//   group BY messagedetails.message_id
//   order by message_id limit ? offset ?;
//   select count(DISTINCT message_id) as totalCount
//   FROM message_history mh
//   where custom_one = ? and business_number = ?;`
// }

// const getDeliveryReportByDate = () => {
//   return `SELECT message_id as messageId, end_consumer_number as consumerNumber, JSON_ARRAYAGG(created_on) as createdOn, JSON_ARRAYAGG(state) as state, custom_one as campaignName, DATE_FORMAT(created_on, "%m/%d/%Y") as time
//   FROM (
//       SELECT DISTINCT message_id, state, custom_one, end_consumer_number, created_on
//       FROM message_history mh
//       where created_on BETWEEN ? and ? and business_number = ?
//       order BY created_on desc) as messagedetails
//   group BY messagedetails.message_id
//   order by message_id limit ? offset ?;
//   select count(DISTINCT message_id) as totalCount
//   FROM message_history mh
//   where created_on BETWEEN ? and ? and business_number = ?;
//   `
// }

const getCampaignSummaryReportByCampaignName = () => {
  return `select campaign_name as 'campaignName', total_sent as 'totalSent', total_inprocess as 'totalInprocess', delivered_message as 'deliveredMessage', total_resourceallocated as 'totalResourceAllocated', total_forwarded as 'totalForwarded',
  total_accepted as 'totalAccepted', total_seen as 'totalSeen', total_deleted as totalDeleted, total_failed as totalFailed, total_pending as totalPending, total_rejected as totalRejected, deliverey_percentage as 'delivereyPercentage'
  from campaign_summary cs
  where campaign_name = ? and (created_on BETWEEN ? and ?) and business_number = ?
  order by campaign_name limit ? offset ?;
  select count(DISTINCT campaign_name) as totalCount
  from campaign_summary cs
  where campaign_name = ? and (created_on BETWEEN ? and ?) and business_number = ?;
  `
}

const getCampaignSummaryReportByDate = () => {
  return `select campaign_name as 'campaignName', total_sent as 'totalSent', total_inprocess as 'totalInprocess', delivered_message as 'deliveredMessage', total_resourceallocated as 'totalResourceAllocated', total_forwarded as 'totalForwarded',
  total_accepted as 'totalAccepted', total_seen as 'totalSeen', total_deleted as totalDeleted, total_failed as totalFailed, total_pending as totalPending, total_rejected as totalRejected, deliverey_percentage as 'delivereyPercentage'
  from campaign_summary cs
  where (created_on BETWEEN ? and ?) and business_number = ?
  order by campaign_name limit ? offset ?;
  select count(DISTINCT campaign_name) as totalCount
  from campaign_summary cs
  where (created_on BETWEEN ? and ?) and business_number = ?;`
}

// const getTemplateSummaryReportByTemplateName = () => {
//   return `SELECT waba_number as "wabaNumber",template_name as "templateName", message_country as "messageCountry",total_submission as totalSubmission,total_message_sent as "totalMessageSent",total_message_Inprocess as "totalMessageInProcess",total_message_resourceAllocated as "totalMessageResourceAllocated",total_message_forwarded as "totalMessageForwarded",total_message_deleted as "totalMessageDeleted" ,
//   total_message_seen as "totalMessageSeen",total_message_delivered as "totalMessageDelivered",total_message_accepted as "totalMessageAccepted", total_message_failed as "totalMessageFailed", total_message_pending as "totalMessagePending", total_message_rejected as "totalMessageRejected"
//   Delivered_Percentage as "deliveredPercentage" FROM template_summary where waba_number = ? and  template_name = ?
//   ORDER BY created_on DESC limit ? offset ?;
//   select count(1) as totalCount
//   from template_summary where waba_number = ?`
// }

// const getTemplateSummaryReportByDate = () => {
//   return `SELECT waba_number as "wabaNumber", message_country as "messageCountry",total_submission as totalSubmission,total_message_sent as "totalMessageSent",total_message_Inprocess as "totalMessageInProcess",total_message_resourceAllocated as "totalMessageResourceAllocated",total_message_forwarded as "totalMessageForwarded",total_message_deleted as "totalMessageDeleted" ,
//   total_message_seen as "totalMessageSeen",total_message_delivered as "totalMessageDelivered",total_message_accepted as "totalMessageAccepted", total_message_failed as "totalMessageFailed", total_message_pending as "totalMessagePending", total_message_rejected as "totalMessageRejected"
//   Delivered_Percentage as "deliveredPercentage" FROM template_summary where waba_number = ? and created_on BETWEEN ? AND ?
//   ORDER BY created_on DESC limit ? offset ?;
//   select count(1) as totalCount
//   from template_summary where waba_number = ? and created_on BETWEEN ? AND ?`
// }

const getTemplateSummaryReportByTemplateId = () => {
  return `SELECT waba_number as "wabaNumber",template_name as tempalteName,template_Id as "templateId",total_submission as totalSubmission,total_message_sent as "totalMessageSent",total_message_Inprocess as "totalMessageInProcess",total_message_resourceAllocated as "totalMessageResourceAllocated",total_message_forwarded as "totalMessageForwarded",total_message_deleted as "totalMessageDeleted" ,
  total_message_seen as "totalMessageSeen",total_message_delivered as "totalMessageDelivered",total_message_accepted as "totalMessageAccepted", total_message_failed as "totalMessageFailed", total_message_pending as "totalMessagePending", total_message_rejected as "totalMessageRejected",
  Delivered_Percentage as "deliveredPercentage" FROM template_summary where (template_Id = ? or template_name = ? ) and (created_on BETWEEN ? and ?) and waba_number = ? 
  ORDER BY created_on DESC limit ? offset ?;
  select count(template_Id) as totalCount
  from template_summary where (template_Id = ? or template_name = ? ) and (created_on BETWEEN ? and ?) and waba_number = ?;`
}
const getusserWiseSummaryCount = () => {
  return `SELECT waba_number as "wabaNumber", message_country as "messageCountry",total_submission as totalSubmission,total_message_sent as "totalMessageSent",total_message_Inprocess as "totalMessageInProcess",total_message_resourceAllocated as "totalMessageResourceAllocated",total_message_forwarded as "totalMessageForwarded",total_message_deleted as "totalMessageDeleted" ,
  total_message_seen as "totalMessageSeen",total_message_delivered as "totalMessageDelivered",total_message_accepted as "totalMessageAccepted", total_message_failed as "totalMessageFailed", total_message_pending as "totalMessagePending", total_message_rejected as "totalMessageRejected" 
  Delivered_Percentage as "deliveredPercentage" FROM userwise_summary where waba_number = ? 
  ORDER BY created_on DESC limit ? offset ?;
  select count(1) as totalCount
  from userwise_summary where waba_number = ?`
}
const getusserWiseSummaryCountBasedOncountryName = () => {
  return `SELECT waba_number as "wabaNumber", message_country as "messageCountry",total_submission as totalSubmission,total_message_sent as "totalMessageSent",total_message_Inprocess as "totalMessageInProcess",total_message_resourceAllocated as "totalMessageResourceAllocated",total_message_forwarded as "totalMessageForwarded",total_message_deleted as "totalMessageDeleted" ,
  total_message_seen as "totalMessageSeen",total_message_delivered as "totalMessageDelivered",total_message_accepted as "totalMessageAccepted", total_message_failed as "totalMessageFailed", total_message_pending as "totalMessagePending", total_message_rejected as "totalMessageRejected" 
  Delivered_Percentage as "deliveredPercentage" FROM userwise_summary where waba_number = ? and message_country = ?
  ORDER BY created_on DESC limit ? offset ?;
  select count(1) as totalCount
  from userwise_summary where waba_number = ? and message_country = ?`
}
const getusserWiseSummaryCountBasedOnDate = () => {
  return `SELECT waba_number as "wabaNumber", message_country as "messageCountry",total_submission as totalSubmission,total_message_sent as "totalMessageSent",total_message_Inprocess as "totalMessageInProcess",total_message_resourceAllocated as "totalMessageResourceAllocated",total_message_forwarded as "totalMessageForwarded",total_message_deleted as "totalMessageDeleted" ,
  total_message_seen as "totalMessageSeen",total_message_delivered as "totalMessageDelivered",total_message_accepted as "totalMessageAccepted", total_message_failed as "totalMessageFailed", total_message_pending as "totalMessagePending", total_message_rejected as "totalMessageRejected" 
  Delivered_Percentage as "deliveredPercentage" FROM userwise_summary where waba_number = ? and created_on BETWEEN ? AND ? 
  ORDER BY created_on DESC limit ? offset ?;
  select count(1) as totalCount
  from userwise_summary where waba_number = ? and created_on BETWEEN ? AND ?`
}

module.exports = {
  getDeliveryReportByMessageId,
  // getDeliveryReportByConsumerNumber,
  // getDeliveryReportByCampaignName,
  // getDeliveryReportByDate,
  getCampaignSummaryReportByCampaignName,
  getCampaignSummaryReportByDate,
  // getTemplateSummaryReportByTemplateName,
  // getTemplateSummaryReportByDate,
  getTemplateSummaryReportByTemplateId,
  getusserWiseSummaryCount,
  getusserWiseSummaryCountBasedOncountryName,
  getusserWiseSummaryCountBasedOnDate
}
