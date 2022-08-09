const __logger = require('../../lib/logger')
// const __constants = require('../../config/constants')
// const __config = require('../../config')
// const keysToEncrypt = require('../../lib/logger/keysToEncrypt.json')
const DbService = require('../../app_modules/message/services/dbData')
// const AudienceService = require('../../app_modules/audience/services/dbData')
// const EmailService = require('../../lib/sendNotifications/email')
// const emailTemplates = require('../../lib/sendNotifications/emailTemplates')
// const conversationMisService = require('./misServiceOfConversation')
// const moment = require('moment')
// const rejectionHandler = require('../../lib/util/rejectionHandler')
// const _ = require('lodash')
// const { values } = require('lodash')
// const phoneCodeAndPhoneSeprator = require('../../lib/util/phoneCodeAndPhoneSeprator')

const InsertDataIntoSumarryReports = () => {
  const dbService = new DbService()
  // const date = moment().utc().subtract(0, 'days').format('YYYY-MM-DD')
  // const onedayBefore = moment().utc().subtract(360, 'days').format('YYYY-MM-DD')
  let wabaNumber
  const wabaData = {}
  // const states = Object.keys(__constants.MESSAGE_STATUS)
  // const queryParam = []
  // console.log('00000000000000000000000000000', onedayBefore, date)
  dbService.getActiveBusinessNumber()
    .then((data) => {
      if (data) {
        wabaNumber = data.wabaNumber.split(',')
        return dbService.getNewStateDataAgainstAllUser(wabaNumber)
      }
    })
    .then(data => {
      console.log('11111111111111111111111111111111111', data)
      if (data) {
        data.forEach((value, index) => {
          let finalvalue = 0
          if (value['count(state)']) {
            finalvalue = value['count(state)']
          }
          if (!wabaData[value.business_number]) {
            wabaData[value.business_number] = {
              [value.state]: finalvalue
            }
          } else {
            wabaData[value.business_number][value.state] = finalvalue
          }
        })
        console.log('wabaData===>', wabaData)
      }
    })
    .then(() => {
      return dbService.insertStatusAgainstWaba(wabaData)
    })
    .then((data) => {
      __logger.info('MIS mail sent ~function=messageStatusOnMail', data)
    })
    // .then(() => {
    //   const wabaNumbers = Object.keys(wabaData)
    //   for (let i = 0; i < wabaNumbers.length; i++) {
    //     const wabaNumber = wabaNumbers[i]
    //     queryParam.push([wabaNumber])
    //     for (let j = 0; j < states.length; j++) {
    //       const state = states[j]
    //       queryParam[queryParam.length - 1].push(wabaData[wabaNumber][state])
    //     }
    //   }
    //   console.log('333333333333333333333333333333333333', queryParam)
    // })
    .catch((error) => {
      console.log('error in sending mis ~function=messageStatusOnMail', error)
      __logger.error('error in sending mis ~function=messageStatusOnMail', { err: typeof error === 'object' ? error : { error: error.toString() } })
    })
}
module.exports = InsertDataIntoSumarryReports
