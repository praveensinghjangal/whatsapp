const cron = require('node-cron')
const __db = require('../../lib/db')
const __logger = require('../../lib/logger')
const conversationMisService = require('./userWiseConversationService')
const __constants = require('../../config/constants')
// const DbService = require('../../app_modules/message/services/dbData')
const moment = require('moment')

const task = {
  one: cron.schedule(__constants.CONVERSATION_REPORTS_SCHEDULER_TIME, () => {
    var currentDate = moment().format('YYYY-MM-DD')
    conversationMisService(currentDate)
  })
}

class conversationMisReports {
  startServer () {
    __logger.info('inside ~function=startServer. Starting WORKER=conversationMisReports')
    __db.init()
      .then(async (start) => {
        // messageStatusOnMail()
        task.one.start()
      })
      .catch(err => {
        console.log('conversationMisReports main catch error ->', err)
        __logger.error('ERROR ~function=conversationMisReports. conversationMisReports::error: ', { err: typeof err === 'object' ? err : { err } })
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

class Worker extends conversationMisReports {
  start () {
    __logger.info((new Date()).toLocaleString() + '   >> Worker PID:', process.pid)
    super.startServer()
  }
}

module.exports.worker = new Worker()
