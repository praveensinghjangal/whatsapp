const q = require('q')
const moment = require('moment')
const qalllib = require('qalllib')
const __logger = require('../../lib/logger')
const __constants = require('../../config/constants')
const DbService = require('../../app_modules/message/services/dbData')

const upsertCounts = singleUserDayStatusData => {
  const dataUpserted = q.defer()
  const dbService = new DbService()
  const dataObject = {
    wabaPhoneNumber: singleUserDayStatusData._id.wabaPhoneNumber,
    date: new Date(singleUserDayStatusData._id.day),
    inProcess: 0,
    resourceAllocated: 0,
    forwarded: 0,
    deleted: 0,
    seen: 0,
    delivered: 0,
    accepted: 0,
    failed: 0,
    pending: 0,
    rejected: 0,
    total: singleUserDayStatusData.total
  }

  singleUserDayStatusData.status.forEach(singleStatus => {
    switch (singleStatus.name) {
      case __constants.MESSAGE_STATUS.preProcess:
        dataObject.preProcess = singleStatus.count
        break
      case __constants.MESSAGE_STATUS.inProcess:
        dataObject.inProcess = singleStatus.count
        break
      case __constants.MESSAGE_STATUS.resourceAllocated:
        dataObject.resourceAllocated = singleStatus.count
        break
      case __constants.MESSAGE_STATUS.forwarded:
        dataObject.forwarded = singleStatus.count
        break
      case __constants.MESSAGE_STATUS.deleted:
        dataObject.deleted = singleStatus.count
        break
      case __constants.MESSAGE_STATUS.seen:
        dataObject.seen = singleStatus.count
        break
      case __constants.MESSAGE_STATUS.delivered:
        dataObject.delivered = singleStatus.count
        break
      case __constants.MESSAGE_STATUS.accepted:
        dataObject.accepted = singleStatus.count
        break
      case __constants.MESSAGE_STATUS.failed:
        dataObject.failed = singleStatus.count
        break
      case __constants.MESSAGE_STATUS.pending:
        dataObject.pending = singleStatus.count
        break
      case __constants.MESSAGE_STATUS.rejected:
        dataObject.rejected = singleStatus.count
        break
    }
  })
  dbService.addUpdateCounts(dataObject, {})
    .then(upserted => dataUpserted.resolve(upserted))
    .catch((error) => dataUpserted.reject(error))
  return dataUpserted.promise
}

module.exports = () => {
  const dbService = new DbService()
  const startDate = moment().utc().subtract(31, 'days').format('YYYY-MM-DD')
  const endDate = moment().utc().subtract(1, 'days').format('YYYY-MM-DD')
  dbService.getAllUserStatusCountPerDay(startDate, endDate)
    .then(allUserData => qalllib.qASyncWithBatch(upsertCounts, allUserData, 5000))
    .then(processed => {
      if (processed && processed.reject && processed.reject.length === 0) {
        __logger.info('successfully processed data ~function=processCounts', processed)
      } else {
        __logger.info('processed data with errors ~function=processCounts', processed)
      }
    })
    .catch((error) => {
      console.log('error in processing counts ~function=processCounts', error)
      __logger.error('error in processing counts ~function=processCounts', error)
    })
}
