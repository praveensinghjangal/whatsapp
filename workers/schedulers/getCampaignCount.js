const q = require('q')
const _ = require('lodash')
const __db = require('../../lib/db')
const __constants = require('../../config/constants')
const __logger = require('../../lib/logger')
const moment = require('moment')

const getCampaignName = () => {
  const date = moment().format('YYMMDD')
  const promises = q.defer()
  const query = `select count(distinct mh.message_id) as totalMessageSent ,mh.custom_one as campaignName, mh.business_number as businessNumber
  from message_history_${date} mh
  group by custom_one`

  __logger.info('SCHEDULER::getCampaignName::Inside scheduler fuction get campaign name')
  __db.mysql.query(__constants.HW_MYSQL_NAME, query, [])
    .then(result => {
      if (result && result.length > 0) {
        return promises.resolve(result)
      } else {
        return promises.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: 'SCHEDULER::getCampaignName::Inside scheduler fuction get campaign name' })
      }
    })
    .catch(err => {
      __logger.error('SCHEDULER::get campaign cron::get campaign name & total message cron ~getCampaignName  error: ', err)
      promises.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
    })
  return promises.promise
}

const getCampaignTotalCount = (arrOfCamaignName) => {
  const date = moment().format('YYMMDD')
  const promises = q.defer()
  const query = `SELECT custom_one as campaignName, count(state) as count, state
  from
  (SELECT custom_one, state, message_id, created_on
  FROM (
      SELECT DISTINCT message_id, state, custom_one, created_on
      FROM message_history_${date} mh
      where custom_one in (?)
      order BY created_on desc) as ids
  group BY ids.message_id) as id
  group by 1, 3 ;`

  __logger.info('SCHEDULER::getCampaignCount::Inside scheduler fuction get campaign name')
  __db.mysql.query(__constants.HW_MYSQL_NAME, query, [arrOfCamaignName])
    .then(result => {
      if (result && result.length > 0) {
        return promises.resolve(result)
      } else {
        return promises.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: 'SCHEDULER::getCampaignCount::Inside scheduler fuction get campaign name' })
      }
    })
    .catch(err => {
      __logger.error('SCHEDULER::get process count of campaign cron::get process count of campaign cron ~getCampaignCount  error: ', err)
      promises.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
    })
  return promises.promise
}

const updateCampaignCount = (data) => {
  const promises = q.defer()
  const query = `insert into campaign_summary(
      campaign_name,
      business_number,
      total_sent,
      total_inprocess,
       total_resourceallocated,
        total_forwarded,
         total_seen,
          total_deleted,
          total_accepted,
          total_failed,
          total_pending,
          total_rejected,
           total_ratelimit,
            delivered_message,
            deliverey_percentage,
            created_on)
    values ?
    ON DUPLICATE KEY 
    UPDATE total_sent= values(total_sent), total_inprocess = values(total_inprocess), total_resourceallocated = values(total_resourceallocated),total_forwarded=values(total_forwarded), total_seen = values(total_seen), total_deleted= values(total_deleted),total_accepted= values(total_accepted), total_failed=values(total_failed), total_pending=values(total_pending), total_rejected= values(total_rejected), total_ratelimit= values(total_ratelimit),delivered_message=values(delivered_message), deliverey_percentage = values(deliverey_percentage), created_on = created_on`

  __logger.info('SCHEDULER::updateCampaignCount::Inside scheduler fuction get campaign name')
  __db.mysqlMis.query(__constants.HW_MYSQL_MIS_NAME, query, [data])
    .then(result => {
      if (result && result.length > 0) {
        return promises.resolve(result)
      }
    })
    .catch(err => {
      console.log(err)
      __logger.error('SCHEDULER::update template cron::update template cron ~updateCampaignCount  error: ', err)
      promises.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
    })
  return promises.promise
}

module.exports = () => {
  let campaignName
  const arrOfCamaignName = []
  const finalRecord = []
  const statusUpdated = q.defer()
  getCampaignName()
    .then(result => {
      campaignName = result
      campaignName.forEach(element => {
        if (element.campaignName !== null) {
          arrOfCamaignName.push(element.campaignName)
        }
      })
      return getCampaignTotalCount(arrOfCamaignName)
    })
    .then(result => {
      var grouped = _.groupBy(result, 'campaignName')
      campaignName.forEach(element => {
        if (element.campaignName !== null) {
          var data = element.campaignName === null ? '1' : element.campaignName
          var grouped1 = _.groupBy(grouped[data], 'state')
          var totalSeen = grouped1[__constants.MESSAGE_STATUS.seen] === undefined ? '0' : grouped1[__constants.MESSAGE_STATUS.seen][0].count
          var totalDeleted = grouped1[__constants.MESSAGE_STATUS.deleted] === undefined ? '0' : grouped1[__constants.MESSAGE_STATUS.deleted][0].count
          var deliveredMessage = grouped1[__constants.MESSAGE_STATUS.delivered] === undefined ? '0' : grouped1[__constants.MESSAGE_STATUS.delivered][0].count
          var totalDelivered = Math.round(((parseInt(totalSeen) + parseInt(deliveredMessage) + parseInt(totalDeleted)) * 100) / element.totalMessageSent).toFixed(2)
          var arrdata = []
          arrdata.push(element.campaignName === null ? 'null' : element.campaignName)
          arrdata.push(element.businessNumber)
          arrdata.push(element.totalMessageSent)
          arrdata.push(grouped1[__constants.MESSAGE_STATUS.inProcess] === undefined ? '0' : grouped1[__constants.MESSAGE_STATUS.inProcess][0].count)
          arrdata.push(grouped1[__constants.MESSAGE_STATUS.resourceAllocated] === undefined ? '0' : grouped1[__constants.MESSAGE_STATUS.resourceAllocated][0].count)
          arrdata.push(grouped1[__constants.MESSAGE_STATUS.forwarded] === undefined ? '0' : grouped1[__constants.MESSAGE_STATUS.forwarded][0].count)
          arrdata.push(totalSeen)
          arrdata.push(totalDeleted)
          arrdata.push(grouped1[__constants.MESSAGE_STATUS.accepted] === undefined ? '0' : grouped1[__constants.MESSAGE_STATUS.accepted][0].count)
          arrdata.push(grouped1[__constants.MESSAGE_STATUS.failed] === undefined ? '0' : grouped1[__constants.MESSAGE_STATUS.failed][0].count)
          arrdata.push(grouped1[__constants.MESSAGE_STATUS.pending] === undefined ? '0' : grouped1[__constants.MESSAGE_STATUS.pending][0].count)
          arrdata.push(grouped1[__constants.MESSAGE_STATUS.rejected] === undefined ? '0' : grouped1[__constants.MESSAGE_STATUS.rejected][0].count)
          arrdata.push(grouped1[__constants.MESSAGE_STATUS.rateLimit] === undefined ? '0' : grouped1[__constants.MESSAGE_STATUS.rateLimit][0].count)
          arrdata.push(deliveredMessage)
          arrdata.push(totalDelivered)
          arrdata.push(moment().format('YYYY-MM-DD HH:mm:ss'))
          // finalRecord.campaignName = element.campaignName
          // finalRecord.businessNumber = element.businessNumber
          // finalRecord.totalSent = element.totalMessageSent
          // finalRecord.totalInprocess = grouped1[__constants.MESSAGE_STATUS.inProcess] === undefined ? '0' : grouped1[__constants.MESSAGE_STATUS.inProcess][0].count
          // finalRecord.totalResourceAllocated = grouped1[__constants.MESSAGE_STATUS.resourceAllocated] === undefined ? '0' : grouped1[__constants.MESSAGE_STATUS.resourceAllocated][0].count
          // finalRecord.totalForwarded = grouped1[__constants.MESSAGE_STATUS.forwarded] === undefined ? '0' : grouped1[__constants.MESSAGE_STATUS.forwarded][0].count
          // finalRecord.totalSeen = grouped1[__constants.MESSAGE_STATUS.seen] === undefined ? '0' : grouped1[__constants.MESSAGE_STATUS.seen][0].count
          // finalRecord.totalDeleted = grouped1[__constants.MESSAGE_STATUS.deleted] === undefined ? '0' : grouped1[__constants.MESSAGE_STATUS.deleted][0].count
          // finalRecord.totalAccepted = grouped1[__constants.MESSAGE_STATUS.accepted] === undefined ? '0' : grouped1[__constants.MESSAGE_STATUS.accepted][0].count
          // finalRecord.totalFailed = grouped1[__constants.MESSAGE_STATUS.failed] === undefined ? '0' : grouped1[__constants.MESSAGE_STATUS.failed][0].count
          // finalRecord.totalPending = grouped1[__constants.MESSAGE_STATUS.pending] === undefined ? '0' : grouped1[__constants.MESSAGE_STATUS.pending][0].count
          // finalRecord.totalRejected = grouped1[__constants.MESSAGE_STATUS.rejected] === undefined ? '0' : grouped1[__constants.MESSAGE_STATUS.rejected][0].count
          // finalRecord.totalRateLimit = grouped1[__constants.MESSAGE_STATUS.rateLimit] === undefined ? '0' : grouped1[__constants.MESSAGE_STATUS.rateLimit][0].count
          // finalRecord.deliverdMessage = grouped1[__constants.MESSAGE_STATUS.delivered] === undefined ? '0' : grouped1[__constants.MESSAGE_STATUS.delivered][0].count
          // finalRecord.totalDeliverd = parseInt(finalRecord.totalSeen) + parseInt(finalRecord.deliverdMessage) + parseInt(finalRecord.totalDeleted)
          // finalRecord.totalUndelivered = parseInt(finalRecord.totalInprocess) + parseInt(finalRecord.totalResourceAllocated) + parseInt(finalRecord.totalForwarded) + parseInt(finalRecord.totalAccepted) + parseInt(finalRecord.totalFailed) + parseInt(finalRecord.totalPending) + parseInt(finalRecord.totalFailed) + parseInt(finalRecord.totalRejected) + parseInt(finalRecord.totalRateLimit)
          finalRecord.push(arrdata)
        }
      })
    })
    .then(result => {
      updateCampaignCount(finalRecord)
      return statusUpdated.resolve(true)
    })
    .catch(err => {
      __logger.error('SCHEDULER::added campaign record using cron function::error: ', err)
      statusUpdated.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
    })
  return statusUpdated.promise
}
