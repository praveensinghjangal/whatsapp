const __logger = require('../../lib/logger')
const DbService = require('../../app_modules/message/services/dbData')
const __constants = require('../../config/constants')
const q = require('q')
const qalllib = require('qalllib')
const tempaletName = require('../../lib/util/getTemplateAgainstId').getTemplateNameAgainstId

// const getTemplateNameAgainstId = (templateId) => {
//   console.log('9999999999999999999999999999999999999999999999999999999999999999999', templateId)
//   const getTemplateNameAgainstId = q.defer()
//   __logger.info('getTemplateNameAgainstId:')
//   const dbService = new DbService()
//   dbService.getTemplateNameAgainstId(templateId)
//     .then(data => {
//       console.log('5555555555555555555555555555555555555555555555555555555')
//       if (data.templateName) {
//         return getTemplateNameAgainstId.resolve(data.templateName)
//       } else {
//         return getTemplateNameAgainstId.resolve(null)
//       }
//     })
//     .catch(err => {
//       __logger.error('Error in getTemplateNameAgainstId :: ', err)
//       return getTemplateNameAgainstId.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
//     })
//   return getTemplateNameAgainstId.promise
// }

const upsertCounts = async singleUserDayStatusData => {
  const dataUpserted = q.defer()
  const dbService = new DbService()
  console.log('999999999999999999999999999999999999999999', singleUserDayStatusData)
  const dataObject = {
    wabaPhoneNumber: singleUserDayStatusData._id.wabaPhoneNumber,
    date: new Date(singleUserDayStatusData._id.day),
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
    // templateName: getTemplateNameAgainstId(singleUserDayStatusData._id.templateId),
    // deliveredPercentage : Math.round((parseInt(totalMessageSeen) + parseInt(totalMessageDelivered) + parseInt(totalMessageDeleted) + Number.EPSILON * 100)/parseInt(totalMessageSent)).toFixed(2)
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
        dataObject.totalMessageSent = singleStatus.count
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
  dataObject.deliveredPercentage = Math.round(dataObject.totalMessageSeen + dataObject.totalMessageDelivered + dataObject.totalMessageDeleted + Number.EPSILON * 100 / dataObject.totalMessageSent).toFixed(2) === 'Infinity' ? '0' : Math.round(dataObject.totalMessageSeen + dataObject.totalMessageDelivered + dataObject.totalMessageDeleted + Number.EPSILON * 100 / dataObject.totalMessageSent).toFixed(2)
  // dataObject.templateName = getTemplateNameAgainstId(dataObject.templateId)
  console.log('222222222222222222222222222222222222222222222222222222222222222', dataObject)
  dataObject.templateName = await tempaletName(dataObject.templateId)
  // getTemplateNameAgainstId(dataObject.templateId)
  // dataObject.templateName = data
  // .then((data)=>{
  //   console.log('1000000000000000000000000000000000',data)
  //   dataObject.templateName = data
  //   return dbService.addUpdateCountsAgainst(dataObject, {})
  // })
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
  // let wabaNumber
  // dbService.getActiveBusinessNumber()
  dbService.getNewTemplateDetailsAgainstAllUser()
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
// .then(async (data) => {
//   __logger.info('getNewTemplateDetailsAgainstAllUser ~function=getNewTemplateDetailsAgainstAllUser', data)
//   if (data) {
//     for (let i = 0; i < data.length; i++) {
//       const value = data[i]
//       let finalvalue = 0
//       if (value['count(state)']) {
//         finalvalue = value['count(state)']
//       }
//       if (!wabaData[value.business_number]) {
//         wabaData[value.business_number] = {
//           [value.state]: finalvalue,
//           templateId: value.templateId,
//           templateName: await getTemplateNameAgainstId(value.templateId)
//         }
//       } else {
//         wabaData[value.business_number][value.state] = finalvalue
//       }
//     }
//     return wabaData
//   }
//   return null
// })
// .then(() => {
//   __logger.info('data to be inserted into the table  the table ~function=InsertDataIntoSumarryReports', wabaData)
//   return dbService.insertTemplateStatusAgainstWaba(wabaData)
// })
// .then((data) => {
//   __logger.info('successfully inserted data into the table ~function=InsertDataIntoSumarryReports', data)
// })
module.exports = InsertDataIntoSumarryReports
