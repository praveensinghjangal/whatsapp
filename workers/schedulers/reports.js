const cron = require('node-cron')
const __db = require('../../lib/db')
const __logger = require('../../lib/logger')
// const messageStatusOnMail = require('./misService')
const InsertDataIntoSumarryReports = require('./reportServices')
const __constants = require('../../config/constants')

const task = {
  one: cron.schedule(__constants.REPORTS_SCHEDULER_TIME, () => {
    InsertDataIntoSumarryReports()
  }, {
  })
}

class reportsScheduler {
  startServer () {
    __logger.info('inside ~function=startServer. Starting WORKER=misScheduler')
    __db.init()
      .then(async (start) => {
        // messageStatusOnMail()
        task.one.start()
      })
      .catch(err => {
        console.log('misScheduler main catch error ->', err)
        __logger.error('ERROR ~function=misScheduler. misScheduler::error: ', { err: typeof err === 'object' ? err : { err } })
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
