const cron = require('node-cron')
const __db = require('../../lib/db')
const __logger = require('../../lib/logger')
const __constants = require('../../config/constants')
// const thirtyDaysReports = require('./thirtyDaysReports')
const conversationMisService = require('./userWiseConversationService')
const InsertTemplateSumarryReports = require('./templateServices')
const q = require('q')
const moment = require('moment')
const getCampaignCount = require('./getCampaignCount')
const errorToTelegram = require('../../lib/errorHandlingMechanism/sendToTelegram')

const updateCampaignSummaryReportsForLastThirtyDays = async () => {
  for (var i = 0; i < __constants.NUMBER_OF_DAYS; i++) {
    const currentDate = moment().subtract(i + 1, 'days').format('YYYY-MM-DD')
    __logger.info('start updateCampaignSummaryReportsForLastThirtyDays for the date', currentDate)
    const data = await getCampaignCount(currentDate)
    if (data === true) {
      __logger.info('success updateCampaignSummaryReportsForLastThirtyDays for the date :: ', currentDate)
    } else {
      const telegramErrorMessage = `function~updateCampaignSummaryReportsForLastThirtyDays error in date '${currentDate}'`
      errorToTelegram.send(`there is no camapign record ${currentDate}`, telegramErrorMessage)
    }
  }
}

const updateTemplateSummaryReportsForLastThirtyDays = async () => {
  const updateTemplateSummaryReports = q.defer()
  for (var i = 0; i < __constants.NUMBER_OF_DAYS; i++) {
    const currentDate = moment().subtract(i + 1, 'days').format('YYYY-MM-DD')
    __logger.info('start updateTemplateSummaryReportsForLastThirtyDays for the date', currentDate)
    const data = await InsertTemplateSumarryReports(currentDate)
    if (data === true) {
      __logger.info('success updateCampaignSummaryReportsForLastThirtyDays for the date :: ', currentDate)
    } else {
      const telegramErrorMessage = `function~updateCampaignSummaryReportsForLastThirtyDays error in date '${currentDate}'`
      errorToTelegram.send('error', telegramErrorMessage)
    }
  }
  return updateTemplateSummaryReports.promise
}

const updateConversationSummaryReportsForLastThirtyDays = async () => {
  const updateTemplateSummaryReports = q.defer()
  for (var i = 0; i < __constants.NUMBER_OF_DAYS; i++) {
    const currentDate = moment().subtract(i + 1, 'days').format('YYYY-MM-DD')
    __logger.info('start updateConversationSummaryReportsForLastThirtyDays for the date', currentDate)
    const data = await conversationMisService(currentDate)
    if (data === true) {
      __logger.info('success updateConversationSummaryReportsForLastThirtyDays for the date :: ', currentDate)
    } else {
      const telegramErrorMessage = `function~updateConversationSummaryReportsForLastThirtyDays error in date '${currentDate}'`
      errorToTelegram.send('error', telegramErrorMessage)
    }
  }
  return updateTemplateSummaryReports.promise
}
const task = {
  one: cron.schedule(__constants.DAILYUPDATECAMPAIGNSUMMARYWORKER, () => {
    updateCampaignSummaryReportsForLastThirtyDays()
  }, {
  }),
  two: cron.schedule(__constants.DAILYUPDATETEMPLATESUMMARY, () => {
    updateTemplateSummaryReportsForLastThirtyDays()
  }, {
  }),
  three: cron.schedule(__constants.DAILYUPDATECONVERSATIONSUMMARRY, () => {
    updateConversationSummaryReportsForLastThirtyDays()
  }, {
  })
}

class dailyReportsScheduler {
  startServer () {
    __logger.info('inside ~function=startServer. Starting WORKER=dailyReportsScheduler')
    __db.init()
      .then(async (start) => {
        task.one.start()
        task.two.start()
        task.three.start()
      })
      .catch(err => {
        console.log('dailyReportsScheduler main catch error ->', err)
        __logger.error('ERROR ~function=dailyReportsScheduler. dailyReportsScheduler::error: ', { err: typeof err === 'object' ? err : { err } })
        process.exit(1)
      })
    this.stop_gracefully = function () {
      task.one.destroy()
      __logger.error('inside ~function=stop_gracefully. stopping all resources gracefully')
    }
    process.on('SIGINT', this.stop_gracefully)
    process.on('SIGTERM', this.stop_gracefully)
  }
}

class Worker extends dailyReportsScheduler {
  start () {
    __logger.info((new Date()).toLocaleString() + '   >> Worker PID:', process.pid)
    super.startServer()
  }
}

module.exports.worker = new Worker()
