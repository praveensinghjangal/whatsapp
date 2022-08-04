const __logger = require('../../lib/logger')
// const __constants = require('../../config/constants')
// const __config = require('../../config')
// const keysToEncrypt = require('../../lib/logger/keysToEncrypt.json')
const DbService = require('../../app_modules/message/services/dbData')
// const AudienceService = require('../../app_modules/audience/services/dbData')
// const EmailService = require('../../lib/sendNotifications/email')
// const emailTemplates = require('../../lib/sendNotifications/emailTemplates')
// const conversationMisService = require('./misServiceOfConversation')
const moment = require('moment')
// const rejectionHandler = require('../../lib/util/rejectionHandler')
// const _ = require('lodash')
// const phoneCodeAndPhoneSeprator = require('../../lib/util/phoneCodeAndPhoneSeprator')

// handle no record for mis data as of now mis stops in case of no data but if there is 0 campagin the opt out data should go
const InsertDataIntoSumarryReports = () => {
  const dbService = new DbService()
  // const audienceService = new AudienceService()
  const date = moment().utc().subtract(0, 'days').format('YYYY-MM-DD')
  const onedayBefore = moment().utc().subtract(360, 'days').format('YYYY-MM-DD')
  //   const startDate = moment().utc().subtract(2, 'days').format('YYYY-MM-DD')
  //   const startOfMonth = moment(dateWithTime).utc().startOf('month').format('YYYY-MM-DD')
  //   const endOfMonth = moment(dateWithTime).utc().endOf('month').format('YYYY-MM-DD')
  // const attachments = []
  // const passingObjectToMailer = {}
  // const userIdToUserName = {}
  // let allUserDetails
  // const wabaNumber = []
  let wabaNumber
  // const overallData = {}
  console.log('00000000000000000000000000000', onedayBefore, date)
  dbService.getActiveBusinessNumber()
    .then(data => {
      console.log('11111111111111111111111111111111111', data)
      if (data) {
        wabaNumber = data.wabaNumber.split(',')
        // userId = data.wabaNumber.split(',')
        // wabaId = data.wabaNumber.split(',')
        // wabaName = data.wabaNumber.split(',')
        return dbService.getCountOfStatusOfWabaNumber(wabaNumber)
      }
      // } else {
      //   return rejectionHandler({ type: __constants.RESPONSE_MESSAGES., err: [messages.invalidCredentials] })
      // // console.log('111111111111111111111111111111111111', allUserData)
      // allUserData.map((data) => {
      //   wabaNumber.push(data.wabaPhoneNumber)
      // })
      // const uniquewabaNumber = [...new Set(wabaNumber)]
      // console.log('999999999999999999999', uniquewabaNumber)
      // allUserDetails = allUserData
      // return uniquewabaNumber
    })
    .then((data) => {
      console.log('2222222222222222222222222222222222222222222222', data)
      // data.map((value) => {
      //   // overallData = value.state
      // })
    })
    // .then((uniquewabaNumber) => {
    //   return dbService.getUserDetailsAgainstWabaNumber(uniquewabaNumber)
    // })
    // .then((data) => {
    //   console.log('88888888888888888888888888888888888888', data)
    //   console.log('99999999999999999999999999999999999999', allUserDetails)
    //   return dbService.addDataToUserWiseSummray(allUserDetails)
    // })
    .catch((error) => {
      console.log('error in sending mis ~function=messageStatusOnMail', error)
      __logger.error('error in sending mis ~function=messageStatusOnMail', { err: typeof error === 'object' ? error : { error: error.toString() } })
    })
}
module.exports = InsertDataIntoSumarryReports
