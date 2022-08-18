// const q = require('q')
const __logger = require('../../lib/logger')
// const __constants = require('../../config/constants')
const DbService = require('../../app_modules/message/services/dbData')
// const moment = require('moment')
// const _ = require('lodash')
// const phoneCodeAndPhoneSeprator = require('../../lib/util/phoneCodeAndPhoneSeprator')
// handle no record for mis data as of now mis stops in case of no data but if there is 0 campagin the opt out data should go
function groupByMultipleFields (data, ...fields) {
  if (fields.length === 0) return
  let newData = {}
  const [field] = fields
  newData = groupBySingleField(data, field)
  const remainingFields = fields.slice(1)
  if (remainingFields.length > 0) {
    Object.keys(newData).forEach((key) => {
      newData[key] = groupByMultipleFields(newData[key], ...remainingFields)
    })
  }
  return newData
  function groupBySingleField (data, field) {
    return data.reduce((acc, val) => {
      const rest = Object.keys(val).reduce((newObj, key) => {
        if (key !== field) {
          newObj[key] = val[key]
        }
        return newObj
      }, {})
      if (acc[val[field]]) {
        acc[val[field]].push(rest)
      } else {
        ;
        acc[val[field]] = [rest]
      }
      return acc
    }, {})
  }
}
const conversationMisService = () => {
  const dbService = new DbService()
  // const previousDateWithTime = moment().format('YYYY-MM-DD 00:00:00')
  const previousDateWithTime = '2022-03-09 00:00:00'
  const currentdateWithTime = '2022-03-09 23:59:59'
  // const currentdateWithTime = moment().format('YYYY-MM-DD HH:mm:ss')
  let wabaNumber
  let wabaData
  dbService.getActiveBusinessNumber()
    .then((data) => {
      if (data) {
        wabaNumber = data.wabaNumber.split(',')
        console.log('1111111111111111111', wabaNumber, previousDateWithTime, currentdateWithTime)
        return dbService.getconversationDataBasedOnWabaNumber(wabaNumber, previousDateWithTime, currentdateWithTime)
      }
    })
    .then((data) => {
      __logger.info('getNewTemplateDetailsAgainstAllUser ~function=getNewTemplateDetailsAgainstAllUser', data)
      if (data) {
        console.log('0000000000000000000000000000000000000000000', data)
        data.forEach((value, index) => {
          if (value.conversationCategory) {
            wabaData = JSON.stringify(groupByMultipleFields(data, 'messageCountry', 'wabaPhoneNumber'))
          }
        })
        // for (let i = 0; i < data.length; i++) {
        //   const value = data[i]
        //   let finalvalue = 0
        //   if (value.conversationCategoryCount) {
        //     finalvalue = value.conversationCategoryCount
        //   }
        //   if (!wabaData[value.wabaPhoneNumber]) {
        //     wabaData[value.wabaPhoneNumber] = {
        //       [value.conversationCategory]: finalvalue
        //     }
        //   } else {
        //     wabaData[value.wabaPhoneNumber][value.conversationCategory] = finalvalue
        //   }
      }
    })
    .then(() => {
      console.log('11111111111111111111111111111111111111111', wabaData)
      __logger.info('data to be inserted into the table  the table ~function=InsertDataIntoSumarryReports', wabaData)
      return dbService.insertConversationDataAgainstWaba(JSON.parse(wabaData))
      // return dbService.insertTemplateStatusAgainstWaba(wabaData)
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
