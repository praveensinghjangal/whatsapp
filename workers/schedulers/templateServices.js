const __logger = require('../../lib/logger')
const DbService = require('../../app_modules/message/services/dbData')
const __constants = require('../../config/constants')
const q = require('q')
const qalllib = require('qalllib')
const tempaletName = require('../../lib/util/getTemplateAgainstId').getTemplateNameAgainstId
const moment = require('moment')

const upsertCounts = async singleUserDayStatusData => {
  const date = moment().format('YYYY-MM-DD')
  const dataUpserted = q.defer()
  const dbService = new DbService()
  console.log('999999999999999999999999999999999999999999', singleUserDayStatusData)
  const dataObject = {
    wabaPhoneNumber: singleUserDayStatusData._id.wabaPhoneNumber,
    templateDate: new Date(singleUserDayStatusData._id.day),
    date: date,
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
  console.log('888888888888888888888888888888888888888888888888888888888888', dataObject)
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
  dataObject.deliveredPercentage = Math.round(dataObject.totalMessageSeen + dataObject.totalMessageDelivered + dataObject.totalMessageDeleted + Number.EPSILON * 100 / dataObject.totalMessageSent).toFixed(2) === 'Infinity' ? '0' : Math.round(dataObject.totalMessageSeen + dataObject.totalMessageDelivered + dataObject.totalMessageDeleted + Number.EPSILON * 100 / dataObject.totalMessageSent).toFixed(2)
  // dataObject.templateName = getTemplateNameAgainstId(dataObject.templateId)
  console.log('222222222222222222222222222222222222222222222222222222222222222', dataObject)
  dataObject.templateName = await tempaletName(dataObject.templateId)
  console.log('+++++++++++++++++++++++++++++++++++++++++++', dataObject)
  dbService.addUpdateCountsAgainst(dataObject)
    .then(upserted => {
      console.log('upserted ++++++++++++++++++++++++++++++++++++++++++', upserted)
      return dataUpserted.resolve(upserted)
    })
    .catch((error) => {
      console.log('!@#$%^&*()!@#$%^&*(!@#$%^&*(!@#$%^&*()!@#$%^&*(', error)
      dataUpserted.reject(error)
    })
  return dataUpserted.promise
}

const InsertDataIntoSumarryReports = () => {
  const dbService = new DbService()
  const currentDate = moment().format('YYYY-MM-DD')
  dbService.getNewTemplateDetailsAgainstAllUser(currentDate)
    .then(allUserData => {
      console.log('66666666666666666666666666666666666666666666666666666', allUserData)
      return qalllib.qASyncWithBatch(upsertCounts, allUserData, __constants.BATCH_SIZE_FOR_SEND_TO_QUEUE, [])
    })
    .then(processed => {
      console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$', processed)
      if (processed && processed.reject && processed.reject.length === 0) {
        __logger.info('successfully processed data ~function=processCounts', processed)
      } else {
        __logger.info('processed data with errors ~function=processCounts', processed)
      }
    })
    .catch((error) => {
      console.log('-------------------------------', error)
      console.log('error in while inserting template summary ~function=InsertDataIntoSumarryReports', error)
      __logger.error('error in while inserting template summary ~function=InsertDataIntoSumarryReports', { err: typeof error === 'object' ? error : { error: error.toString() } })
    })
    .done()
}
module.exports = InsertDataIntoSumarryReports
