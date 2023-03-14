const q = require('q')
// const __logger = require('../../lib/logger')
const __constants = require('../../config/constants')
const DbService = require('../../app_modules/message/services/dbData')
const moment = require('moment')
const _ = require('lodash')
const EmailService = require('../../lib/sendNotifications/email')
const emailTemplates = require('../../lib/sendNotifications/emailTemplates')
const errorToTelegram = require('../../lib/errorHandlingMechanism/sendToTelegram')
const userIdToUserName = {}
const rejectionHandler = require('../../lib/util/rejectionHandler')

const preMonth = moment().utc().subtract(1, 'months').format('MMMM')
const __config = require('../../config')
const bodyCreator = (array) => {
  const merged = array.reduce((r, { wabaPhoneNumber, messageCountry, ...rest }) => {
    const key = `${wabaPhoneNumber}-${messageCountry}`
    r[key] = r[key] || { wabaPhoneNumber, messageCountry, ui: 0, bi: 0, rc: 0, na: 0 }
    r[key][rest.conversationCategory] = rest.conversationCategoryCount
    r[key].total = r[key].total ? r[key].total + rest.conversationCategoryCount : rest.conversationCategoryCount
    return r
  }, {})
  const arraydata = Object.values(merged)
  return arraydata
}

// handle no record for mis data as of now mis stops in case of no data but if there is 0 campagin the opt out data should go
const messageStatusOnMailForConversation = () => {
  const conversationMis = q.defer()
  const dbService = new DbService()
  // const date = moment().utc().subtract(1, 'days').format('YYYY-MM-DD')
  // const date = '2022-10-22'
  //   const dateWithTime = moment().utc().subtract(1, 'days').format('YYYY-MM-DD HH:mm:ssZ')
  //   const startOfMonth = moment(dateWithTime).utc().startOf('month').format('YYYY-MM-DD')
  //   const endOfMonth = moment(dateWithTime).utc().endOf('month').format('YYYY-MM-DD')
  const startOfMonth = moment().utc().subtract(1, 'months').startOf('month').format('YYYY-MM-DD')

  const endOfMonth = moment().utc().subtract(1, 'months').endOf('month').format('YYYY-MM-DD')

  let arrayofWabanumber
  let allUserData
  dbService.getActiveBusinessNumber()
    .then((data) => {
      if (data) {
        arrayofWabanumber = data.wabaNumber.split(',')
        return dbService.getconversationDataBasedOnWabaNumberAllData(arrayofWabanumber, startOfMonth, endOfMonth)
      } else {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: 'No active waba numbers in platform', data: {} })
      }
    })
    .then((dbResponse) => {
      allUserData = bodyCreator(dbResponse)
      return dbService.getWabaNameByPhoneNumber(arrayofWabanumber)
    })
    .then(dbresponse => {
      for (let i = 0; i < dbresponse.length; i++) {
        userIdToUserName[dbresponse[i].wabaPhoneNumber] = dbresponse[i].businessName
      }
      console.log('userIdToUserName', userIdToUserName)
    })
    .then(() => {
      allUserData = _.chain(allUserData).groupBy('wabaPhoneNumber').map((value, key) => ({ wabaPhoneNumber: key, messageCountry: value })).value()
      console.log('length', allUserData, allUserData.length)
      for (let i = 0; i < allUserData.length; i++) {
        if (allUserData[i].wabaPhoneNumber) {
          allUserData[i].businessName = userIdToUserName[allUserData[i].wabaPhoneNumber]
        }
      }
      allUserData = _.chain(allUserData).groupBy('businessName').map((value, key) => ({ businessName: key, wabaPhoneNumber: value })).value()
      console.log('data......', allUserData)
      const emailService = new EmailService(__config.emailProvider)
      const subject = `MIS Report for ${preMonth}`
      return emailService.sendEmail(__config.misEmailList, subject, emailTemplates.messageAndConvoMisMonth(allUserData))
    })
    .catch((error) => {
      const telegramErrorMessage = 'Monthy MIS report err ||(): error in Sending monthly MIS'
      errorToTelegram.send(error, telegramErrorMessage)
      console.log('errror', error)
      return conversationMis.reject({ type: error.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: error.err || error })
    })
  return conversationMis.promise
}
module.exports = messageStatusOnMailForConversation
