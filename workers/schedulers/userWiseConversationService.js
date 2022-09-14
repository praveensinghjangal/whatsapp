// const q = require('q')
const __logger = require('../../lib/logger')
const __constants = require('../../config/constants')
// const _ = require('lodash')
const DbService = require('../../app_modules/message/services/dbData')
const moment = require('moment')
const rejectionHandler = require('../../lib/util/rejectionHandler')
// const e = require('connect-timeout')

// const _ = require('lodash')
// const phoneCodeAndPhoneSeprator = require('../../lib/util/phoneCodeAndPhoneSeprator')
// handle no record for mis data as of now mis stops in case of no data but if there is 0 campagin the opt out data should go
// const bodyCreator = (array) => {
//   const merged = array.reduce((r, { wabaPhoneNumber, ...rest }) => {
//     const key = `${wabaPhoneNumber}`
//     r[key] = r[key] || { wabaPhoneNumber, ui: 0, bi: 0, rc: 0, na: 0 }
//     r[key][rest.conversationCategory] = rest.conversationCategoryCount
//     r[key].total = r[key].total ? r[key].total + rest.conversationCategoryCount : rest.conversationCategoryCount
//    return r
//   }, {})
//   const arrayObject = merged
//   return arrayObject
// }
const conversationMisService = () => {
  const dbService = new DbService()
  const previousDateWithTime = moment().format('YYYY-MM-DD 00:00:00')
  // const previousDateWithTime = '2020-01-01 00:00:00'
  // const currentdateWithTime = '2022-09-09 23:59:59'
  const currentdateWithTime = moment().format('YYYY-MM-DD 23:59:59')
  const date = moment().format('YYYY-MM-DD')
  let wabaNumber
  const wabaData = {}
  dbService.getActiveBusinessNumber()
    .then((data) => {
      if (data) {
        wabaNumber = data.wabaNumber.split(',')
        console.log('1111111111111111111', wabaNumber, previousDateWithTime, currentdateWithTime)
        return dbService.getconversationDataBasedOnWabaNumber(wabaNumber, previousDateWithTime, currentdateWithTime)
      } else {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: 'No active waba numbers in platform', data: {} })
      }
    })
    .then((data) => {
      if (data && data.length > 0) {
        for (let i = 0; i < data.length; i++) {
          const value = data[i]
          let finalvalue = 0
          let countryName1 = 0
          if (value.conversationCategoryCount) {
            finalvalue = value.conversationCategoryCount
          }
          if (value.messageCountry) {
            countryName1 = value.messageCountry
          } else countryName1 = null
          if (!wabaData[value.wabaPhoneNumber]) {
            wabaData[value.wabaPhoneNumber] = {
              [value.conversationCategory]: finalvalue,
              countryName: countryName1
            }
          } else {
            wabaData[value.wabaPhoneNumber][value.conversationCategory] = finalvalue
          }
        }
        return wabaData
      } else {
        return false
      }
    })
    .then((data) => {
      console.log('111111111111111111111111111111100000000000000000000000', wabaData)
      __logger.info('data to be inserted into the table  the table ~function=InsertDataIntoSumarryReports', wabaData)
      if (data) {
        return dbService.insertConversationDataAgainstWaba(wabaData, date)
      }
    })
    .then((data) => {
      __logger.info('successfully inserted data into the table ~function=InsertDataIntoSumarryReports', data)
    })
    .catch((error) => {
      console.log('error in while inserting template summary ~function=InsertDataIntoSumarryReports', error)
      __logger.error('error in while inserting template summary ~function=InsertDataIntoSumarryReports', { err: typeof error === 'object' ? error : { error: error.toString() } })
    })
}
module.exports = conversationMisService
