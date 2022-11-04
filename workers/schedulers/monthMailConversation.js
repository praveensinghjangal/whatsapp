const cron = require('node-cron')
const __db = require('../../lib/db')
const __logger = require('../../lib/logger')
const main = require('./processCountService')
//const emailTemplatesMonths = require('../../lib/sendNotifications/emailTemplatesMonths')
const __constants = require('../../config/constants')
const conversationMisService = require('./monthMailConversationService')
//30 6 2 * * -> for monthly report

// const task = {
//   mis: cron.schedule(__constants.PROCESS_COUNT_SCHEDULER_TIME, () => {
//     main()
//   }, {
//     timezone: 'Asia/Kolkata'
//   })
// }
const task = {
  // mis: cron.schedule('* * * * *', () => {
  mis: cron.schedule(__constants.MIS_MONTHLY_CONVERSATION, () => {
    conversationMisService()
  }, {
    timezone: 'Asia/Kolkata'
  })
}

class monthMailConversation {
  startServer () {
    __logger.info('inside ~function=startServer. Starting WORKER=monthMailConversation')
    __db.init()
      .then(async (start) => {
        task.mis.start()
        //conversationMisService()
      })
      .catch(err => {
        console.log('Process Catch Main Function Error :- ', err)
        __logger.info('~function=monthMailConversation. Catch Main Function Error  ', { err: typeof err === 'object' ? err : { err } })
        process.exit(1)
      })
    this.stop_gracefully = function () {
      task.mis.destroy()
      __logger.info('inside ~function=stop_gracefully. stopping all resources gracefully')
    }
    process.on('SIGINT', this.stop_gracefully)
    process.on('SIGTERM', this.stop_gracefully)
  }
}

class Worker extends monthMailConversation {
  start () {
    __logger.info((new Date()).toLocaleString() + '   >> Worker PID:', process.pid)
    super.startServer()
  }
}

module.exports.worker = new Worker()
