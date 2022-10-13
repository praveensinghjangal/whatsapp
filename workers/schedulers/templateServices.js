const __logger = require('../../lib/logger')
const DbService = require('../../app_modules/message/services/dbData')
const __constants = require('../../config/constants')
const q = require('q')
const qalllib = require('qalllib')
const tempaletName = require('../../lib/util/getTemplateAgainstId').getTemplateNameAgainstId
const moment = require('moment')
const upsertCounts = async (singleUserDayStatusData, currentDate) => {
  const dataUpserted = q.defer()
  const dbService = new DbService()
  const dataObject = {
    wabaPhoneNumber: singleUserDayStatusData._id.wabaPhoneNumber,
    summaryDate: currentDate,
    createdOn: new Date(),
    templateId: singleUserDayStatusData._id.templateId,
    totalMessageSent: 0,
    totalMessagePreProcess: 0,
    totalMessageInProcess: 0,
    totalMessageResourceAllocated: 0,
    totalMessageForwarded: 0,
    totalMessageDeleted: 0,
    totalMessageSeen: 0,
    totalMessageDelivered: 0,
    totalMessageAccepted: 0,
    totalMessageFailed: 0,
    totalMessagePending: 0,
    totalMessageRejected: 0,
    total: singleUserDayStatusData.total,
    deliveredPercentage: 0,
    templateName: null
  }
  singleUserDayStatusData.status.forEach(singleStatus => {
    switch (singleStatus.name) {
      case __constants.MESSAGE_STATUS.preProcess:
        dataObject.totalMessagePreProcess = singleStatus.count
        break
      case __constants.MESSAGE_STATUS.inProcess:
        dataObject.totalMessageInProcess = singleStatus.count
        break
      case __constants.MESSAGE_STATUS.resourceAllocated:
        dataObject.totalMessageResourceAllocated = singleStatus.count
        break
      case __constants.MESSAGE_STATUS.forwarded:
        dataObject.totalMessageForwarded = singleStatus.count
        break
      case __constants.MESSAGE_STATUS.deleted:
        dataObject.totalMessageDeleted = singleStatus.count
        break
      case __constants.MESSAGE_STATUS.seen:
        dataObject.totalMessageSeen = singleStatus.count
        break
      case __constants.MESSAGE_STATUS.delivered:
        dataObject.totalMessageDelivered = singleStatus.count
        break
      case __constants.MESSAGE_STATUS.accepted:
        dataObject.totalMessageAccepted = singleStatus.count
        break
      case __constants.MESSAGE_STATUS.failed:
        dataObject.totalMessageFailed = singleStatus.count
        break
      case __constants.MESSAGE_STATUS.pending:
        dataObject.totalMessagePending = singleStatus.count
        break
      case __constants.MESSAGE_STATUS.rejected:
        dataObject.totalMessageRejected = singleStatus.count
        break
    }
  })
  dataObject.totalMessageSent = dataObject.total
  // doubt
  dataObject.deliveredPercentage = Math.round((((dataObject.totalMessageSeen + dataObject.totalMessageDelivered + dataObject.totalMessageDeleted) / dataObject.totalMessageSent) * 100 + Number.EPSILON) * 100) / 100
  // dataObject.templateName = getTemplateNameAgainstId(dataObject.templateId)
  dataObject.templateName = await tempaletName(dataObject.templateId)
  dbService.addUpdateCountsAgainst(dataObject)
    .then(upserted => {
      return dataUpserted.resolve(upserted)
    })
    .catch((error) => {
      __logger.error('addUpdateCountsAgainst  error', error)
      dataUpserted.reject(error)
    })
  return dataUpserted.promise
}

const InsertDataIntoSumarryReports = (currentDate) => {
  const dbService = new DbService()
  // var currentDate = '2022-09-23'
  // var currentDate = moment().format('YYYY-MM-DD')
  const InsertDataIntoTemplateSumarryReports = q.defer()
  const currentFromDate = moment(currentDate).subtract(1, 'days').format('YYYY-MM-DDT18:30:00.000[Z]')
  const currentEndDate = moment(currentDate).subtract(0, 'days').format('YYYY-MM-DDT18:29:59.999[Z]')
  dbService.getNewTemplateDetailsAgainstAllUser(currentFromDate, currentEndDate)
    .then(allUserData => {
      return qalllib.qASyncWithBatch(upsertCounts, allUserData, __constants.BATCH_SIZE_FOR_SEND_TO_QUEUE, currentDate)
    })
    .then(processed => {
      if (processed && processed.reject && processed.reject.length === 0) {
        __logger.info('successfully processed data ~function=upsertCounts')
        InsertDataIntoTemplateSumarryReports.resolve(true)
      } else {
        __logger.info('unsuccessfull yprocessed data with errors ~function=upsertCounts')
        InsertDataIntoTemplateSumarryReports.resolve(false)
      }
    })
    .catch((error) => {
      __logger.error('error in while inserting template summary ~function=InsertDataIntoSumarryReports', { err: typeof error === 'object' ? error : { error: error.toString() } })
      InsertDataIntoTemplateSumarryReports.resolve(false)
    })
  return InsertDataIntoTemplateSumarryReports.promise
}
module.exports = InsertDataIntoSumarryReports
