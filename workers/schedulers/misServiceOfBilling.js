const q = require('q')
const __logger = require('../../lib/logger')
const __constants = require('../../config/constants')
const DbService = require('../../app_modules/message/services/dbData')
const moment = require('moment')
const _ = require('lodash')
const phoneCodeAndPhoneSeprator = require('../../lib/util/phoneCodeAndPhoneSeprator')

const messageStatusOnMailForBilling = () => {
  const billingMis = q.defer()
  const dbService = new DbService()
  const date = moment().utc().subtract(1, 'days').format('YYYY-MM-DD')
  const dateWithTime = moment().utc().subtract(1, 'days').format('YYYY-MM-DD HH:mm:ssZ')
  const startOfMonth = moment(dateWithTime).utc().startOf('month').format('YYYY-MM-DD')
  const endOfMonth = moment(dateWithTime).utc().endOf('month').format('YYYY-MM-DD')
  let passingObjectToMailer = {}
  dbService.getMisRelatedIncomingData(startOfMonth, endOfMonth)
    .then(responseFromDb => {
      const arrayofWabanumber = []
      __logger.info('data fetched from DB ~function=messageStatusOnMail', date)
      const lastDayData = _.filter(responseFromDb, { date: date }) // → [1, 2]

      const lastDayAllUserCount = []
      let lastDayTotalMessageCount = 0
      const lastDayTotalStatusCount = {
        incoming: 0,
        incomingPercent: 0
      }
      const mtdTotalStatusCount = JSON.parse(JSON.stringify(lastDayTotalStatusCount))
      lastDayData.forEach(userCountData => {
        lastDayTotalMessageCount = lastDayTotalMessageCount + userCountData.incomingMessageCount
        lastDayAllUserCount.push([
          userCountData.wabaPhoneNumber,
          [userCountData.incomingMessageCount, Math.round(((userCountData.incomingMessageCount / userCountData.incomingMessageCount) * 100 + Number.EPSILON) * 100) / 100],
          userCountData.incomingMessageCount])
        lastDayTotalStatusCount.incoming = lastDayTotalStatusCount.incoming + userCountData.incomingMessageCount
      })
      lastDayTotalStatusCount.incomingPercent = Math.round(((lastDayTotalStatusCount.incoming / lastDayTotalMessageCount) * 100 + Number.EPSILON) * 100) / 100 || 0
      const mtdAllUserCount = []
      let mtdTotalMessageCount = 0
      const allUserGrouped = _.groupBy(responseFromDb, item => item.wabaPhoneNumber)

      _.each(allUserGrouped, (singleUserData, key) => {
        const UserAllDayDataArr = [key, [0, 0], 0]
        singleUserData.forEach(userCountData => {
          const removePhoneCodeFromWaba = phoneCodeAndPhoneSeprator(userCountData.wabaPhoneNumber).phoneNumber
          if (arrayofWabanumber.indexOf(removePhoneCodeFromWaba) === -1) arrayofWabanumber.push(removePhoneCodeFromWaba)
          mtdTotalMessageCount = mtdTotalMessageCount + userCountData.incomingMessageCount
          mtdTotalStatusCount.incoming = mtdTotalStatusCount.incoming + userCountData.incomingMessageCount
          UserAllDayDataArr[1][0] = UserAllDayDataArr[1][0] + userCountData.incomingMessageCount
          UserAllDayDataArr[2] = UserAllDayDataArr[2] + userCountData.incomingMessageCount
        })
        UserAllDayDataArr[1][1] = Math.round(((UserAllDayDataArr[1][0] / UserAllDayDataArr[2]) * 100 + Number.EPSILON) * 100) / 100
        mtdAllUserCount.push(UserAllDayDataArr)
      })
      mtdTotalStatusCount.incomingPercent = Math.round(((mtdTotalStatusCount.incoming / mtdTotalMessageCount) * 100 + Number.EPSILON) * 100) / 100
      passingObjectToMailer = { lastDayAllUserCount, lastDayTotalStatusCount, lastDayTotalMessageCount, mtdAllUserCount, mtdTotalStatusCount, mtdTotalMessageCount }
      return dbService.getWabaNameByWabaNumber(arrayofWabanumber)
    })
    .then(dbresponse => {
      const userIdToUserName = {}
      for (let i = 0; i < dbresponse.length; i++) {
        userIdToUserName[dbresponse[i].wabaPhoneNumber] = dbresponse[i].businessName
      }
      return billingMis.resolve({
        billingStatusData: passingObjectToMailer.lastDayAllUserCount,
        totalBillingStatusCount: passingObjectToMailer.lastDayTotalStatusCount,
        totalBillingMessageCount: passingObjectToMailer.lastDayTotalMessageCount,
        mtdBillingStatusCount: passingObjectToMailer.mtdAllUserCount,
        mtdTotalBillingStatusCount: passingObjectToMailer.mtdTotalStatusCount,
        mtdTotalBillingMessageCount: passingObjectToMailer.mtdTotalMessageCount,
        lastDayBillingCount: passingObjectToMailer.lastDayTotalMessageCount,
        userIdToUserNameBilling: userIdToUserName
      })
    })
    .catch((error) => {
      console.log('error in sending mis ~function=messageStatusOnMailForBilling', error)
      __logger.error('error in sending mis ~function=messageStatusOnMailForBilling', { err: typeof error === 'object' ? error : { error: error.toString() } })
      billingMis.reject({ type: error.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: error.err || error })
    })
  return billingMis.promise
}
module.exports = messageStatusOnMailForBilling
