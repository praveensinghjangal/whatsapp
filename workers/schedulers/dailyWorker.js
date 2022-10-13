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
const updateSummaryReportsForLastThirtyDays = () => {
  const updateTemplateSummaryReports = q.defer()
  for (var i = 0; i < __constants.DAYWORKER; i++) {
    const currentDate = moment().subtract(i + 1, 'days').format('YYYY-MM-DD')
    conversationMisService(currentDate)
    InsertTemplateSumarryReports(currentDate)
    getCampaignCount(currentDate)
  }
  return updateTemplateSummaryReports.promise
}

const task = {
  one: cron.schedule(__constants.DAILYSUMMARYWORKER, () => {
    updateSummaryReportsForLastThirtyDays()
      .then(() => {
        return __logger.info('sucessfully run updateSummaryReportsForLastThirtyDays worker')
      })
      .catch((error) => {
        return __logger.error('inside ~function=', { err: typeof error === 'object' ? error : { error: error.toString() } })
      })
  }, {
  })
}

class dailyReportsScheduler {
  startServer () {
    __logger.info('inside ~function=startServer. Starting WORKER=dailyReportsScheduler')
    __db.init()
      .then(async (start) => {
        // task.one.start()
        updateSummaryReportsForLastThirtyDays()
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
