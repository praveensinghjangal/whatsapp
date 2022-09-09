const q = require('q')
const _ = require('lodash')
const __db = require('../../lib/db')
const __constants = require('../../config/constants')
const __logger = require('../../lib/logger')
const moment = require('moment')

const getCampaignName = () => {
  const date = moment().format('YYYY-MM-DD')
  const promises = q.defer()
  __logger.info('SCHEDULER::getCampaignName::Inside scheduler fuction get campaign name')

  var findParam = [{
    $match: {
      createdOn: { $gte: new Date(`${date}T00:00:00.000`), $lte: new Date(`${date}T23:59:59.999`) }
    }
  },
  {
    $group: {
      _id: { currentStatus: '$currentStatus', campaignName: '$customOne', wabaPhoneNumber: '$wabaPhoneNumber' },
      sc: { $sum: 1 }
    }
  },
  {
    $group: {
      _id: { wabaPhoneNumber: '$_id.wabaPhoneNumber', campaignName: '$_id.campaignName' },
      totalMessageSent: { $sum: '$sc' },
      status: {
        $push: {
          name: '$_id.currentStatus',
          count: '$sc'
        }
      }
    }
  },
  { $sort: { total: -1 } }]
  __db.mongo.__custom_aggregate(__constants.DB_NAME, __constants.ENTITY_NAME.MESSAGES, findParam)
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

const updateCampaignCount = (data) => {
  const promises = q.defer()
  __logger.info('SCHEDULER::updateCampaignCount::Inside scheduler fuction get campaign name')
  __db.mongo.__campaignBulkInsert(__constants.DB_NAME, __constants.ENTITY_NAME.CAMPAIGNAME_SUMMARY_REPORT, data)
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
  const finalRecord = {
    campaignName: '',
    wabaPhoneNumber: '',
    totalSent: '',
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
  const statusUpdated = q.defer()
  getCampaignName()
    .then(result => {
      result.forEach(element => {
        if ((element._id.campaignName !== null) || (!_.isEmpty(element._id.campaignName))) {
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
      if (arrOfCamaignName.length > 0) updateCampaignCount(arrOfCamaignName)
      else return statusUpdated.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: 'SCHEDULER::getCampaignName::Inside scheduler fuction get campaign name' })
      return statusUpdated.resolve(true)
    })
    .catch(err => {
      __logger.error('SCHEDULER::added campaign record using cron function::error: ', err)
      statusUpdated.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
    })
  return statusUpdated.promise
}
