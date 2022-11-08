const q = require('q')
const __logger = require('../../lib/logger')
const __constants = require('../../config/constants')
// const _ = require('lodash')
const DbService = require('../../app_modules/message/services/dbData')
const moment = require('moment')
const rejectionHandler = require('../../lib/util/rejectionHandler')
const conversationMisService = (currentDate) => {
  const dbService = new DbService()
  // var currentDate = moment().format('YYYY-MM-DD')
  const conversationMisServiceReports = q.defer()
  const previousDateWithTime = moment(currentDate).utc().subtract(1, 'days').format('YYYY-MM-DDT18:30:00.000[Z]')
  const currentdateWithTime = moment(currentDate).utc().subtract(0, 'days').format('YYYY-MM-DDT18:29:59.999[Z]')
  let wabaNumber
  const wabaData = {}
  dbService.getActiveBusinessNumber()
    .then((data) => {
      if (data) {
        wabaNumber = data.wabaNumber.split(',')
        return dbService.getconversationDataBasedOnWabaNumber(wabaNumber, previousDateWithTime, currentdateWithTime)
      } else {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: 'No active waba numbers in platform', data: {} })
      }
    })
    .then((data) => {
      if (data && data.length > 0) {
        // for (let i = 0; i < data.length; i++) {
        //   const value = data[i]
        //   let finalvalue = 0
        //   let countryName1 = 0
        //   let finalDate
        //   if (value.conversationCategoryCount) {
        //     finalvalue = value.conversationCategoryCount
        //   } else {
        //     finalvalue = 0
        //   }
        //   if (value.summaryDate) {
        //     finalDate = value.summaryDate
        //   } else {
        //     finalDate = null
        //   }
        //   if (value.messageCountry) {
        //     countryName1 = value.messageCountry
        //   } else countryName1 = null
        //   if (!wabaData[value.wabaPhoneNumber]) {
        //     wabaData[value.wabaPhoneNumber] = {
        //       [value.conversationCategory]: finalvalue,
        //       countryName: countryName1,
        //       summaryDate: finalDate
        //     }
        //   } else {
        //     wabaData[value.wabaPhoneNumber][value.conversationCategory] = finalvalue
        //   }
        // }
        data.map(element => {
          let finalvalue = 0
          let countryName1 = 0
          finalvalue = element.conversationCategoryCount || 0
          countryName1 = element.messageCountry ?? null
          if (!wabaData[`${element.wabaPhoneNumber}_${countryName1}`]) {
            wabaData[`${element.wabaPhoneNumber}_${countryName1}`] = {
              wabaNumber: element.wabaPhoneNumber,
              [element.conversationCategory]: finalvalue,
              countryName: countryName1,
              summaryDate: moment(currentdateWithTime).format('YYYY-MM-DD')
            }
          } else {
            wabaData[`${element.wabaPhoneNumber}_${countryName1}`][element.conversationCategory] = finalvalue
          }
        })
        return wabaData
      } else {
        return conversationMisServiceReports.resolve(false)
      }
    })
    .then((data) => {
      if (data) {
        return dbService.insertConversationDataAgainstWaba(wabaData)
      }
    })
    .then((data) => {
      __logger.info('successfully inserted data into the table ~function=InsertDataIntoSumarryReports')
      conversationMisServiceReports.resolve(true)
    })
    .catch((err) => {
      // conversationMisServiceReports.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      __logger.error('error in while inserting template summary ~function=InsertDataIntoSumarryReports', { err: typeof error === 'object' ? err : { error: err.toString() } })
      conversationMisServiceReports.resolve(false)
    })
  return conversationMisServiceReports.promise
}
module.exports = conversationMisService
