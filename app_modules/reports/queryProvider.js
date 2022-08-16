// const __constants = require('../../config/constants')

const getDeliveryReportByMessageId = () => {
  return `SELECT message_id as messageId, end_consumer_number as consumerNumber, JSON_ARRAYAGG(created_on) as createdOn, JSON_ARRAYAGG(state) as state, custom_one as campaignName, DATE_FORMAT(created_on, "%m/%d/%Y") as time
  FROM (
      SELECT DISTINCT message_id, state, custom_one, end_consumer_number, created_on
      FROM message_history mh
      where message_id = ? and business_number = ?
      order BY created_on desc) as messagedetails
  group BY messagedetails.message_id
  order by message_id limit ? offset ?;
  select count(DISTINCT message_id) as totalCount
  FROM message_history mh
  where message_id = ? and business_number = ?;`
}

const getDeliveryReportByConsumerNumber = () => {
  return `SELECT message_id as messageId, end_consumer_number as consumerNumber, JSON_ARRAYAGG(created_on) as createdOn, JSON_ARRAYAGG(state) as state, custom_one as campaignName, DATE_FORMAT(created_on, "%m/%d/%Y") as time
  FROM (
      SELECT DISTINCT message_id, state, custom_one, end_consumer_number, created_on
      FROM message_history mh
      where end_consumer_number = ? and business_number = ?
      order BY created_on desc) as messagedetails
  group BY messagedetails.message_id
  order by message_id limit ? offset ?;
  select count(DISTINCT message_id) as totalCount
  FROM message_history mh
  where end_consumer_number = ? and business_number = ?;`
}

const getDeliveryReportByCampaignName = () => {
  return `SELECT message_id as messageId, end_consumer_number as consumerNumber, JSON_ARRAYAGG(created_on) as createdOn, JSON_ARRAYAGG(state) as state, custom_one as campaignName, DATE_FORMAT(created_on, "%m/%d/%Y") as time
  FROM (
      SELECT DISTINCT message_id, state, custom_one, end_consumer_number, created_on
      FROM message_history mh
      where custom_one = ? and business_number = ?
      order BY created_on desc) as messagedetails
  group BY messagedetails.message_id
  order by message_id limit ? offset ?;
  select count(DISTINCT message_id) as totalCount
  FROM message_history mh
  where custom_one = ? and business_number = ?;`
}

const getDeliveryReportByDate = () => {
  return `SELECT message_id as messageId, end_consumer_number as consumerNumber, JSON_ARRAYAGG(created_on) as createdOn, JSON_ARRAYAGG(state) as state, custom_one as campaignName, DATE_FORMAT(created_on, "%m/%d/%Y") as time
  FROM (
      SELECT DISTINCT message_id, state, custom_one, end_consumer_number, created_on
      FROM message_history mh
      where created_on BETWEEN ? and ? and business_number = ?
      order BY created_on desc) as messagedetails
  group BY messagedetails.message_id
  order by message_id limit ? offset ?;
  select count(DISTINCT message_id) as totalCount
  FROM message_history mh
  where created_on BETWEEN ? and ? and business_number = ?;
  `
}

const getCampaignSummaryReportByCampaignName = () => {
  return `select campaign_name as 'campaignName', total_sent as 'totalSent', total_inprocess as 'totalInprocess', delivered_message as 'deliveredMessage', total_resourceallocated as 'totalResourceAllocated', total_forwarded as 'totalForwarded',
  total_accepted as 'totalAccepted', total_seen as 'totalSeen', deliverey_percentage as 'delivereyPercentage'
  from campaign_summary cs
  where campaign_name = ? and business_number = ?
  order by campaign_name limit ? offset ?;
  select count(DISTINCT campaign_name) as totalCount
  from campaign_summary cs
  where campaign_name = ? and business_number = ?;
  `
}

const getCampaignSummaryReportByDate = () => {
  return `select campaign_name as 'campaignName', total_sent as 'totalSent', total_inprocess as 'totalInprocess', delivered_message as 'deliveredMessage', total_resourceallocated as 'totalResourceAllocated', total_forwarded as 'totalForwarded',
  total_accepted as 'totalAccepted', total_seen as 'totalSeen', deliverey_percentage as 'delivereyPercentage'
  from campaign_summary cs
  where created_on BETWEEN ? and ? and business_number = ?
  order by campaign_name limit ? offset ?;
  select count(DISTINCT campaign_name) as totalCount
  from campaign_summary cs
  where created_on BETWEEN ? and ? and business_number = ?;`
}

const getTemplateSummaryReportByTemplateName = () => {

}

const getTemplateSummaryReportByDate = () => {

}

const getTemplateSummaryReportByTemplateId = () => {

}
const getusserWiseSummaryCount = () => {

}

module.exports = {
  getDeliveryReportByMessageId,
  getDeliveryReportByConsumerNumber,
  getDeliveryReportByCampaignName,
  getDeliveryReportByDate,
  getCampaignSummaryReportByCampaignName,
  getCampaignSummaryReportByDate,
  getTemplateSummaryReportByTemplateName,
  getTemplateSummaryReportByDate,
  getTemplateSummaryReportByTemplateId,
  getusserWiseSummaryCount
}
