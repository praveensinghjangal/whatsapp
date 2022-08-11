const cron = require('node-cron')
const __db = require('../../lib/db')
const __logger = require('../../lib/logger')
// const messageStatusOnMail = require('./misService')
// const InsertDataIntoSumarryReports = require('./reportServices')
const InsertDataIntoSumarryReports = require('./templateReports')
const __constants = require('../../config/constants')
const DbService = require('../../app_modules/message/services/dbData')
// const moment = require('moment')

const task = {
  one: cron.schedule(__constants.REPORTS_SCHEDULER_TIME, () => {
    const dbService = new DbService()
    // const date = moment().format('YYMMDD')
    const date = '220106'
    // console.log('111111111111111111111111111111111111111111111', date)
    dbService.checkTableExist(date)
      .then((data) => {
        return InsertDataIntoSumarryReports()
      })
      .then((data) => {
        return __logger.info('sucessfully inserted data into the InsertDataIntoSumarryReports', data)
      })
      .catch((error) => {
        return __logger.error('inside ~function=', { err: typeof error === 'object' ? error : { error: error.toString() } })
      })
  }, {
  })
}

class reportsScheduler {
  startServer () {
    __logger.info('inside ~function=startServer. Starting WORKER=reportsScheduler')
    __db.init()
      .then(async (start) => {
        // messageStatusOnMail()
        task.one.start()
      })
      .catch(err => {
        console.log('reportsScheduler main catch error ->', err)
        __logger.error('ERROR ~function=reportsScheduler. reportsScheduler::error: ', { err: typeof err === 'object' ? err : { err } })
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

class Worker extends reportsScheduler {
  start () {
    __logger.info((new Date()).toLocaleString() + '   >> Worker PID:', process.pid)
    super.startServer()
  }
}

module.exports.worker = new Worker()
