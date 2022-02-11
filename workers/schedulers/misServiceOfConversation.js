const q = require('q')
const __logger = require('../../lib/logger')
const __constants = require('../../config/constants')
const DbService = require('../../app_modules/message/services/dbData')
const moment = require('moment')
const _ = require('lodash')

const bodyCreator = (array) => {
  const merged = array.reduce((r, { wabaPhoneNumber, createdOn, ...rest }) => {
    const key = `${wabaPhoneNumber}-${createdOn}`
    r[key] = r[key] || { wabaPhoneNumber, date: createdOn, ui: 0, bi: 0, rc: 0, na: 0 }
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
  const date = moment().utc().subtract(1, 'days').format('YYYY-MM-DD')
  const dateWithTime = moment().utc().subtract(1, 'days').format('YYYY-MM-DD HH:mm:ssZ')
  const startOfMonth = moment(dateWithTime).utc().startOf('month').format('YYYY-MM-DD')
  const endOfMonth = moment(dateWithTime).utc().endOf('month').format('YYYY-MM-DD')
  let passingObjectToMailer = {}
  dbService.getMisRelatedData(startOfMonth, endOfMonth)
    .then(responseFromDb => {
      const arrayofWabanumber = []
      __logger.info('data fetched from DB ~function=messageStatusOnMail', date)
      const allUserData = bodyCreator(responseFromDb)
      const lastDayData = _.filter(allUserData, { date: date }) // → [1, 2]
      const lastDayAllUserCount = []
      let lastDayTotalMessageCount = 0
      const lastDayTotalStatusCount = {
        ui: 0,
        bi: 0,
        rc: 0,
        na: 0,
        uiPercent: 0,
        biPercent: 0,
        rcPercent: 0,
        naPercent: 0
      }
      const mtdTotalStatusCount = JSON.parse(JSON.stringify(lastDayTotalStatusCount))
      lastDayData.forEach(userCountData => {
        lastDayTotalMessageCount = lastDayTotalMessageCount + userCountData.total
        lastDayAllUserCount.push([
          userCountData.wabaPhoneNumber,
          [userCountData.ui, Math.round(((userCountData.ui / userCountData.total) * 100 + Number.EPSILON) * 100) / 100],
          [userCountData.bi, Math.round(((userCountData.bi / userCountData.total) * 100 + Number.EPSILON) * 100) / 100],
          [userCountData.rc, Math.round(((userCountData.rc / userCountData.total) * 100 + Number.EPSILON) * 100) / 100],
          [userCountData.na, Math.round(((userCountData.na / userCountData.total) * 100 + Number.EPSILON) * 100) / 100],
          userCountData.total])
        lastDayTotalStatusCount.ui = lastDayTotalStatusCount.ui + userCountData.ui
        lastDayTotalStatusCount.bi = lastDayTotalStatusCount.bi + userCountData.bi
        lastDayTotalStatusCount.rc = lastDayTotalStatusCount.rc + userCountData.rc
        lastDayTotalStatusCount.na = lastDayTotalStatusCount.na + userCountData.na
      })
      lastDayTotalStatusCount.uiPercent = Math.round(((lastDayTotalStatusCount.ui / lastDayTotalMessageCount) * 100 + Number.EPSILON) * 100) / 100 || 0
      lastDayTotalStatusCount.biPercent = Math.round(((lastDayTotalStatusCount.bi / lastDayTotalMessageCount) * 100 + Number.EPSILON) * 100) / 100 || 0
      lastDayTotalStatusCount.rcPercent = Math.round(((lastDayTotalStatusCount.rc / lastDayTotalMessageCount) * 100 + Number.EPSILON) * 100) / 100 || 0
      lastDayTotalStatusCount.naPercent = Math.round(((lastDayTotalStatusCount.na / lastDayTotalMessageCount) * 100 + Number.EPSILON) * 100) / 100 || 0
      const mtdAllUserCount = []
      let mtdTotalMessageCount = 0
      const allUserGrouped = _.groupBy(allUserData, item => item.wabaPhoneNumber)
      __logger.info('data fetched from DB ~function=messageStatusOnMail---- allUserGrouped', allUserGrouped)
      _.each(allUserGrouped, (singleUserData, key) => {
        const UserAllDayDataArr = [key, [0, 0], [0, 0], [0, 0], [0, 0], 0]
        singleUserData.forEach(userCountData => {
          const removePhoneCodeFromWaba = userCountData.wabaPhoneNumber.substring(2, userCountData.wabaPhoneNumber.length)
          if (arrayofWabanumber.indexOf(removePhoneCodeFromWaba) === -1) arrayofWabanumber.push(removePhoneCodeFromWaba)
          mtdTotalMessageCount = mtdTotalMessageCount + userCountData.total
          mtdTotalStatusCount.ui = mtdTotalStatusCount.ui + userCountData.ui
          mtdTotalStatusCount.bi = mtdTotalStatusCount.bi + userCountData.bi
          mtdTotalStatusCount.rc = mtdTotalStatusCount.rc + userCountData.rc
          mtdTotalStatusCount.na = mtdTotalStatusCount.na + userCountData.na
          UserAllDayDataArr[1][0] = UserAllDayDataArr[1][0] + userCountData.ui
          UserAllDayDataArr[2][0] = UserAllDayDataArr[2][0] + userCountData.bi
          UserAllDayDataArr[3][0] = UserAllDayDataArr[3][0] + userCountData.rc
          UserAllDayDataArr[4][0] = UserAllDayDataArr[4][0] + userCountData.na
          UserAllDayDataArr[5] = UserAllDayDataArr[5] + userCountData.total
        })
        UserAllDayDataArr[1][1] = Math.round(((UserAllDayDataArr[1][0] / UserAllDayDataArr[5]) * 100 + Number.EPSILON) * 100) / 100
        UserAllDayDataArr[2][1] = Math.round(((UserAllDayDataArr[2][0] / UserAllDayDataArr[5]) * 100 + Number.EPSILON) * 100) / 100
        UserAllDayDataArr[3][1] = Math.round(((UserAllDayDataArr[3][0] / UserAllDayDataArr[5]) * 100 + Number.EPSILON) * 100) / 100
        UserAllDayDataArr[4][1] = Math.round(((UserAllDayDataArr[4][0] / UserAllDayDataArr[5]) * 100 + Number.EPSILON) * 100) / 100
        mtdAllUserCount.push(UserAllDayDataArr)
      })
      mtdTotalStatusCount.uiPercent = Math.round(((mtdTotalStatusCount.ui / mtdTotalMessageCount) * 100 + Number.EPSILON) * 100) / 100
      mtdTotalStatusCount.biPercent = Math.round(((mtdTotalStatusCount.bi / mtdTotalMessageCount) * 100 + Number.EPSILON) * 100) / 100
      mtdTotalStatusCount.rcPercent = Math.round(((mtdTotalStatusCount.rc / mtdTotalMessageCount) * 100 + Number.EPSILON) * 100) / 100
      mtdTotalStatusCount.naPercent = Math.round(((mtdTotalStatusCount.na / mtdTotalMessageCount) * 100 + Number.EPSILON) * 100) / 100
      passingObjectToMailer = { lastDayAllUserCount, lastDayTotalStatusCount, lastDayTotalMessageCount, mtdAllUserCount, mtdTotalStatusCount, mtdTotalMessageCount }
      return dbService.getWabaNameByWabaNumber(arrayofWabanumber)
    })
    .then(dbresponse => {
      const userIdToUserName = {}
      for (let i = 0; i < dbresponse.length; i++) {
        userIdToUserName[dbresponse[i].wabaPhoneNumber] = dbresponse[i].businessName
      }
      return conversationMis.resolve({
        statusData: passingObjectToMailer.lastDayAllUserCount,
        totalStatusCount: passingObjectToMailer.lastDayTotalStatusCount,
        totalMessageCount: passingObjectToMailer.lastDayTotalMessageCount,
        mtdStatusCount: passingObjectToMailer.mtdAllUserCount,
        mtdTotalStatusCount: passingObjectToMailer.mtdTotalStatusCount,
        mtdTotalMessageCount: passingObjectToMailer.mtdTotalMessageCount,
        lastDayCount: passingObjectToMailer.lastDayTotalMessageCount,
        userIdToUserNameConvo: userIdToUserName
      })
    })
    .catch((error) => {
      console.log('error in sending mis ~function=messageStatusOnMailForConversation', error)
      __logger.error('error in sending mis ~function=messageStatusOnMailForConversation', { err: typeof error === 'object' ? error : { error: error.toString() } })
      conversationMis.reject({ type: error.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: error.err || error })
    })
  return conversationMis.promise
}
module.exports = messageStatusOnMailForConversation
