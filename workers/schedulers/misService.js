const __logger = require('../../lib/logger')
const __constants = require('../../config/constants')
const __config = require('../../config')
// const keysToEncrypt = require('../../lib/logger/keysToEncrypt.json')
const DbService = require('../../app_modules/message/services/dbData')
const AudienceService = require('../../app_modules/audience/services/dbData')
const EmailService = require('../../lib/sendNotifications/email')
const emailTemplates = require('../../lib/sendNotifications/emailTemplates')
const conversationMisService = require('./misServiceOfConversation')
const moment = require('moment')
const _ = require('lodash')

// handle no record for mis data as of now mis stops in case of no data but if there is 0 campagin the opt out data should go
const messageStatusOnMail = () => {
  const dbService = new DbService()
  const audienceService = new AudienceService()
  const date = moment().utc().subtract(1, 'days').format('YYYY-MM-DD')
  const dateWithTime = moment().utc().subtract(1, 'days').format('YYYY-MM-DD HH:mm:ssZ')
  const startDate = moment().utc().subtract(2, 'days').format('YYYY-MM-DD')
  const startOfMonth = moment(dateWithTime).utc().startOf('month').format('YYYY-MM-DD')
  const endOfMonth = moment(dateWithTime).utc().endOf('month').format('YYYY-MM-DD')
  const attachments = []
  let passingObjectToMailer = {}
  const userIdToUserName = {}
  let messageCountTemplate = ''

  dbService.messageStatusCountByDate(startOfMonth, endOfMonth)
    .then(allUserData => {
      __logger.info('data fetched from DB ~function=messageStatusOnMail', allUserData)
      const arrayofWabanumber = []
      const lastDayData = _.filter(allUserData, { date: date }) // → [1, 2]
      const lastDayAllUserCount = []
      let lastDayTotalMessageCount = 0
      const lastDayTotalStatusCount = {
        inProcess: 0,
        resourceAllocated: 0,
        forwarded: 0,
        deleted: 0,
        seen: 0,
        delivered: 0,
        accepted: 0,
        failed: 0,
        pending: 0,
        rejected: 0,
        inProcessPercent: 0,
        resourceAllocatedPercent: 0,
        forwardedPercent: 0,
        deletedPercent: 0,
        seenPercent: 0,
        deliveredPercent: 0,
        acceptedPercent: 0,
        failedPercent: 0,
        pendingPercent: 0,
        rejectedPercent: 0
      }
      const mtdTotalStatusCount = JSON.parse(JSON.stringify(lastDayTotalStatusCount))
      lastDayData.forEach(userCountData => {
        lastDayTotalMessageCount = lastDayTotalMessageCount + userCountData.total
        lastDayAllUserCount.push([
          userCountData.wabaPhoneNumber,
          [userCountData.inProcess, Math.round(((userCountData.inProcess / userCountData.total) * 100 + Number.EPSILON) * 100) / 100],
          [userCountData.resourceAllocated, Math.round(((userCountData.resourceAllocated / userCountData.total) * 100 + Number.EPSILON) * 100) / 100],
          [userCountData.forwarded, Math.round(((userCountData.forwarded / userCountData.total) * 100 + Number.EPSILON) * 100) / 100],
          [userCountData.deleted, Math.round(((userCountData.deleted / userCountData.total) * 100 + Number.EPSILON) * 100) / 100],
          [userCountData.seen, Math.round(((userCountData.seen / userCountData.total) * 100 + Number.EPSILON) * 100) / 100],
          [userCountData.delivered, Math.round(((userCountData.delivered / userCountData.total) * 100 + Number.EPSILON) * 100) / 100],
          [userCountData.accepted, Math.round(((userCountData.accepted / userCountData.total) * 100 + Number.EPSILON) * 100) / 100],
          [userCountData.failed, Math.round(((userCountData.failed / userCountData.total) * 100 + Number.EPSILON) * 100) / 100],
          [userCountData.pending, Math.round(((userCountData.pending / userCountData.total) * 100 + Number.EPSILON) * 100) / 100],
          [userCountData.rejected, Math.round(((userCountData.rejected / userCountData.total) * 100 + Number.EPSILON) * 100) / 100],
          userCountData.total])
        lastDayTotalStatusCount.inProcess = lastDayTotalStatusCount.inProcess + userCountData.inProcess
        lastDayTotalStatusCount.resourceAllocated = lastDayTotalStatusCount.resourceAllocated + userCountData.resourceAllocated
        lastDayTotalStatusCount.forwarded = lastDayTotalStatusCount.forwarded + userCountData.forwarded
        lastDayTotalStatusCount.deleted = lastDayTotalStatusCount.deleted + userCountData.deleted
        lastDayTotalStatusCount.seen = lastDayTotalStatusCount.seen + userCountData.seen
        lastDayTotalStatusCount.delivered = lastDayTotalStatusCount.delivered + userCountData.delivered
        lastDayTotalStatusCount.accepted = lastDayTotalStatusCount.accepted + userCountData.accepted
        lastDayTotalStatusCount.failed = lastDayTotalStatusCount.failed + userCountData.failed
        lastDayTotalStatusCount.pending = lastDayTotalStatusCount.pending + userCountData.pending
        lastDayTotalStatusCount.rejected = lastDayTotalStatusCount.rejected + userCountData.rejected
      })
      lastDayTotalStatusCount.inProcessPercent = Math.round(((lastDayTotalStatusCount.inProcess / lastDayTotalMessageCount) * 100 + Number.EPSILON) * 100) / 100 || 0
      lastDayTotalStatusCount.resourceAllocatedPercent = Math.round(((lastDayTotalStatusCount.resourceAllocated / lastDayTotalMessageCount) * 100 + Number.EPSILON) * 100) / 100 || 0
      lastDayTotalStatusCount.forwardedPercent = Math.round(((lastDayTotalStatusCount.forwarded / lastDayTotalMessageCount) * 100 + Number.EPSILON) * 100) / 100 || 0
      lastDayTotalStatusCount.deletedPercent = Math.round(((lastDayTotalStatusCount.deleted / lastDayTotalMessageCount) * 100 + Number.EPSILON) * 100) / 100 || 0
      lastDayTotalStatusCount.seenPercent = Math.round(((lastDayTotalStatusCount.seen / lastDayTotalMessageCount) * 100 + Number.EPSILON) * 100) / 100 || 0
      lastDayTotalStatusCount.deliveredPercent = Math.round(((lastDayTotalStatusCount.delivered / lastDayTotalMessageCount) * 100 + Number.EPSILON) * 100) / 100 || 0
      lastDayTotalStatusCount.acceptedPercent = Math.round(((lastDayTotalStatusCount.accepted / lastDayTotalMessageCount) * 100 + Number.EPSILON) * 100) / 100 || 0
      lastDayTotalStatusCount.failedPercent = Math.round(((lastDayTotalStatusCount.failed / lastDayTotalMessageCount) * 100 + Number.EPSILON) * 100) / 100 || 0
      lastDayTotalStatusCount.pendingPercent = Math.round(((lastDayTotalStatusCount.pending / lastDayTotalMessageCount) * 100 + Number.EPSILON) * 100) / 100 || 0
      lastDayTotalStatusCount.rejectedPercent = Math.round(((lastDayTotalStatusCount.rejected / lastDayTotalMessageCount) * 100 + Number.EPSILON) * 100) / 100 || 0

      const mtdAllUserCount = []
      let mtdTotalMessageCount = 0
      const allUserGrouped = _.groupBy(allUserData, item => item.wabaPhoneNumber)
      __logger.info('data fetched from DB ~function=messageStatusOnMail---- allUserGrouped', allUserGrouped)
      _.each(allUserGrouped, (singleUserData, key) => {
        const UserAllDayDataArr = [key, [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], 0]
        singleUserData.forEach(userCountData => {
          const removePhoneCodeFromWaba = userCountData.wabaPhoneNumber.substring(2, userCountData.wabaPhoneNumber.length)
          if (arrayofWabanumber.indexOf(removePhoneCodeFromWaba) === -1) arrayofWabanumber.push(removePhoneCodeFromWaba)
          mtdTotalMessageCount = mtdTotalMessageCount + userCountData.total
          mtdTotalStatusCount.inProcess = mtdTotalStatusCount.inProcess + userCountData.inProcess
          mtdTotalStatusCount.resourceAllocated = mtdTotalStatusCount.resourceAllocated + userCountData.resourceAllocated
          mtdTotalStatusCount.forwarded = mtdTotalStatusCount.forwarded + userCountData.forwarded
          mtdTotalStatusCount.deleted = mtdTotalStatusCount.deleted + userCountData.deleted
          mtdTotalStatusCount.seen = mtdTotalStatusCount.seen + userCountData.seen
          mtdTotalStatusCount.delivered = mtdTotalStatusCount.delivered + userCountData.delivered
          mtdTotalStatusCount.accepted = mtdTotalStatusCount.accepted + userCountData.accepted
          mtdTotalStatusCount.failed = mtdTotalStatusCount.failed + userCountData.failed
          mtdTotalStatusCount.pending = mtdTotalStatusCount.pending + userCountData.pending
          mtdTotalStatusCount.rejected = mtdTotalStatusCount.rejected + userCountData.rejected

          UserAllDayDataArr[1][0] = UserAllDayDataArr[1][0] + userCountData.inProcess
          UserAllDayDataArr[2][0] = UserAllDayDataArr[2][0] + userCountData.resourceAllocated
          UserAllDayDataArr[3][0] = UserAllDayDataArr[3][0] + userCountData.forwarded
          UserAllDayDataArr[4][0] = UserAllDayDataArr[4][0] + userCountData.deleted
          UserAllDayDataArr[5][0] = UserAllDayDataArr[5][0] + userCountData.seen
          UserAllDayDataArr[6][0] = UserAllDayDataArr[6][0] + userCountData.delivered
          UserAllDayDataArr[7][0] = UserAllDayDataArr[7][0] + userCountData.accepted
          UserAllDayDataArr[8][0] = UserAllDayDataArr[8][0] + userCountData.failed
          UserAllDayDataArr[9][0] = UserAllDayDataArr[9][0] + userCountData.pending
          UserAllDayDataArr[10][0] = UserAllDayDataArr[10][0] + userCountData.rejected
          UserAllDayDataArr[11] = UserAllDayDataArr[11] + userCountData.total
        })
        UserAllDayDataArr[1][1] = Math.round(((UserAllDayDataArr[1][0] / UserAllDayDataArr[11]) * 100 + Number.EPSILON) * 100) / 100
        UserAllDayDataArr[2][1] = Math.round(((UserAllDayDataArr[2][0] / UserAllDayDataArr[11]) * 100 + Number.EPSILON) * 100) / 100
        UserAllDayDataArr[3][1] = Math.round(((UserAllDayDataArr[3][0] / UserAllDayDataArr[11]) * 100 + Number.EPSILON) * 100) / 100
        UserAllDayDataArr[4][1] = Math.round(((UserAllDayDataArr[4][0] / UserAllDayDataArr[11]) * 100 + Number.EPSILON) * 100) / 100
        UserAllDayDataArr[5][1] = Math.round(((UserAllDayDataArr[5][0] / UserAllDayDataArr[11]) * 100 + Number.EPSILON) * 100) / 100
        UserAllDayDataArr[6][1] = Math.round(((UserAllDayDataArr[6][0] / UserAllDayDataArr[11]) * 100 + Number.EPSILON) * 100) / 100
        UserAllDayDataArr[7][1] = Math.round(((UserAllDayDataArr[7][0] / UserAllDayDataArr[11]) * 100 + Number.EPSILON) * 100) / 100
        UserAllDayDataArr[8][1] = Math.round(((UserAllDayDataArr[8][0] / UserAllDayDataArr[11]) * 100 + Number.EPSILON) * 100) / 100
        UserAllDayDataArr[9][1] = Math.round(((UserAllDayDataArr[9][0] / UserAllDayDataArr[11]) * 100 + Number.EPSILON) * 100) / 100
        UserAllDayDataArr[10][1] = Math.round(((UserAllDayDataArr[10][0] / UserAllDayDataArr[11]) * 100 + Number.EPSILON) * 100) / 100
        mtdAllUserCount.push(UserAllDayDataArr)
      })
      mtdTotalStatusCount.inProcessPercent = Math.round(((mtdTotalStatusCount.inProcess / mtdTotalMessageCount) * 100 + Number.EPSILON) * 100) / 100
      mtdTotalStatusCount.resourceAllocatedPercent = Math.round(((mtdTotalStatusCount.resourceAllocated / mtdTotalMessageCount) * 100 + Number.EPSILON) * 100) / 100
      mtdTotalStatusCount.forwardedPercent = Math.round(((mtdTotalStatusCount.forwarded / mtdTotalMessageCount) * 100 + Number.EPSILON) * 100) / 100
      mtdTotalStatusCount.deletedPercent = Math.round(((mtdTotalStatusCount.deleted / mtdTotalMessageCount) * 100 + Number.EPSILON) * 100) / 100
      mtdTotalStatusCount.seenPercent = Math.round(((mtdTotalStatusCount.seen / mtdTotalMessageCount) * 100 + Number.EPSILON) * 100) / 100
      mtdTotalStatusCount.deliveredPercent = Math.round(((mtdTotalStatusCount.delivered / mtdTotalMessageCount) * 100 + Number.EPSILON) * 100) / 100
      mtdTotalStatusCount.acceptedPercent = Math.round(((mtdTotalStatusCount.accepted / mtdTotalMessageCount) * 100 + Number.EPSILON) * 100) / 100
      mtdTotalStatusCount.failedPercent = Math.round(((mtdTotalStatusCount.failed / mtdTotalMessageCount) * 100 + Number.EPSILON) * 100) / 100
      mtdTotalStatusCount.pendingPercent = Math.round(((mtdTotalStatusCount.pending / mtdTotalMessageCount) * 100 + Number.EPSILON) * 100) / 100
      mtdTotalStatusCount.rejectedPercent = Math.round(((mtdTotalStatusCount.rejected / mtdTotalMessageCount) * 100 + Number.EPSILON) * 100) / 100
      passingObjectToMailer = { lastDayAllUserCount, lastDayTotalStatusCount, lastDayTotalMessageCount, mtdAllUserCount, mtdTotalStatusCount, mtdTotalMessageCount }
      return dbService.getWabaNameByWabaNumber(arrayofWabanumber)
    })
    .then(dbresponse => {
      for (let i = 0; i < dbresponse.length; i++) {
        userIdToUserName[dbresponse[i].wabaPhoneNumber] = dbresponse[i].businessName
      }
      return audienceService.getAllOptOutUser(startDate, date)
    })
    .then(optoutData => {
      const allUserGrouped = _.groupBy(optoutData, item => item.wabaPhoneNumber)
      _.each(allUserGrouped, (singleUserData, key) => {
        const attachmentObj = { filename: (userIdToUserName[key] || key) + '.txt', content: '' }
        _.each(singleUserData, singleNumData => { attachmentObj.content += singleNumData.phoneNumber + '\n' })
        attachmentObj.content = attachmentObj.content.trim()
        attachments.push(attachmentObj)
      })
      return emailTemplates.misTemplates(passingObjectToMailer.lastDayAllUserCount, passingObjectToMailer.lastDayTotalStatusCount, passingObjectToMailer.lastDayTotalMessageCount, passingObjectToMailer.mtdAllUserCount, passingObjectToMailer.mtdTotalStatusCount, passingObjectToMailer.mtdTotalMessageCount, userIdToUserName)
    })
    .then(msgCountTemp => {
      __logger.info('msgCountTemp got msg count data~function=messageStatusOnMail', msgCountTemp)
      messageCountTemplate = msgCountTemp
      return conversationMisService()
    })
    .then(messageConvoData => {
      __logger.info('messageConvoData got convo data~function=messageStatusOnMail', messageConvoData)
      const emailService = new EmailService(__config.emailProvider)
      const subject = __constants.WHATSAPP_SUMMARY_SUBJECT.split('(').join(passingObjectToMailer.lastDayTotalMessageCount).split(')').join(messageConvoData.lastDayCount).split('[').join(date).split(']').join(date)
      let FormedEmailTemplate = emailTemplates.convoAndMessageMisContaioner()
      FormedEmailTemplate = FormedEmailTemplate.split('{{MIS_MESSAGE}}').join(messageCountTemplate).split('{{MIS_CONVERSATION}}').join(messageConvoData.template)
      return emailService.sendEmail(__config.misEmailList, subject, FormedEmailTemplate, attachments)
    })
    .then(isMailSent => {
      __logger.info('MIS mail sent ~function=messageStatusOnMail', isMailSent)
    })
    .catch((error) => {
      console.log('error in sending mis ~function=messageStatusOnMail', error)
      __logger.error('error in sending mis ~function=messageStatusOnMail', { err: typeof error === 'object' ? error : { error: error.toString() } })
    })
}
module.exports = messageStatusOnMail
