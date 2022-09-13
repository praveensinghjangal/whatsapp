const q = require('q')
const _ = require('lodash')
// const __db = require('../../lib/db')
const __constants = require('../../config/constants')
const __logger = require('../../lib/logger')
// const moment = require('moment')
const MessageReportsServices = require('../../app_modules/reports/services/dbData')

const createCampaignSummaryReport = () => {
  let campaignName
  const arrOfCamaignName = []
  const messageReportsServices = new MessageReportsServices()
  const statusUpdated = q.defer()
  const date = '2022-05-25'
  // const date = moment().format('YYYY-MM-DD')
  messageReportsServices.getCampaignName(date)
    .then(result => {
      result.forEach(element => {
        if ((element._id.campaignName !== null) || (!_.isEmpty(element._id.campaignName))) {
          const finalRecord = {
            campaignName: '',
            wabaPhoneNumber: '',
            totalSent: '',
            totalPreProcess: '',
            totalInprocess: '',
            totalResourceAllocated: '',
            totalForwarded: '',
            totalSeen: '',
            totalDeleted: '',
            totalAccepted: '',
            totalFailed: '',
            totalPending: '',
            totalRejected: '',
            totalRateLimit: '',
            deliveredMessage: '',
            delivereyPercentage: '',
            createdOn: ''
          }
          element.status.forEach(statusCount => {
            element[statusCount.name] = statusCount.count
          })
          campaignName = element
          var date = new Date()
          var totalSeen = campaignName[__constants.MESSAGE_STATUS.seen] === undefined ? '0' : campaignName[__constants.MESSAGE_STATUS.seen]
          var totalDeleted = campaignName[__constants.MESSAGE_STATUS.deleted] === undefined ? '0' : campaignName[__constants.MESSAGE_STATUS.deleted]
          var deliveredMessage = campaignName[__constants.MESSAGE_STATUS.delivered] === undefined ? '0' : campaignName[__constants.MESSAGE_STATUS.delivered]
          var totalDelivered = Math.round(((parseInt(totalSeen) + parseInt(deliveredMessage) + parseInt(totalDeleted)) * 100) / element.totalMessageSent).toFixed(2)

          finalRecord.campaignName = campaignName._id.campaignName
          finalRecord.wabaPhoneNumber = campaignName._id.wabaPhoneNumber
          finalRecord.totalSent = campaignName.totalMessageSent
          finalRecord.totalPreProcess = campaignName[__constants.MESSAGE_STATUS.preProcess] === undefined ? '0' : campaignName[__constants.MESSAGE_STATUS.preProcess]
          finalRecord.totalInprocess = campaignName[__constants.MESSAGE_STATUS.inProcess] === undefined ? '0' : campaignName[__constants.MESSAGE_STATUS.inProcess]
          finalRecord.totalResourceAllocated = campaignName[__constants.MESSAGE_STATUS.resourceAllocated] === undefined ? '0' : campaignName[__constants.MESSAGE_STATUS.resourceAllocated]
          finalRecord.totalForwarded = campaignName[__constants.MESSAGE_STATUS.forwarded] === undefined ? '0' : campaignName[__constants.MESSAGE_STATUS.forwarded]
          finalRecord.totalSeen = totalSeen
          finalRecord.totalDeleted = totalDeleted
          finalRecord.totalAccepted = campaignName[__constants.MESSAGE_STATUS.accepted] === undefined ? '0' : campaignName[__constants.MESSAGE_STATUS.accepted]
          finalRecord.totalFailed = campaignName[__constants.MESSAGE_STATUS.failed] === undefined ? '0' : campaignName[__constants.MESSAGE_STATUS.failed]
          finalRecord.totalPending = campaignName[__constants.MESSAGE_STATUS.pending] === undefined ? '0' : campaignName[__constants.MESSAGE_STATUS.pending]
          finalRecord.totalRejected = campaignName[__constants.MESSAGE_STATUS.rejected] === undefined ? '0' : campaignName[__constants.MESSAGE_STATUS.rejected]
          finalRecord.totalRateLimit = campaignName[__constants.MESSAGE_STATUS.rateLimit] === undefined ? '0' : campaignName[__constants.MESSAGE_STATUS.rateLimit]
          finalRecord.deliveredMessage = deliveredMessage
          finalRecord.delivereyPercentage = totalDelivered
          finalRecord.createdOn = date
          arrOfCamaignName.push(finalRecord)
        }
      })
    })
    .then(result => {
      if (arrOfCamaignName.length > 0) return messageReportsServices.updateCampaignCount(arrOfCamaignName)
      else return statusUpdated.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: 'SCHEDULER::getCampaignName::Inside scheduler fuction get campaign name' })
    })
    .then(() => {
      return __logger.info('SCHEDULER::Campaign Name worker run successfully')
    })
    .catch(err => {
      __logger.error('SCHEDULER::added campaign record using cron function::error: ', err)
      statusUpdated.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
    })
  return statusUpdated.promise
}
module.exports = createCampaignSummaryReport
