const cron = require('node-cron')
const __db = require('../../lib/db')
const __logger = require('../../lib/logger')
const InsertTemplateSumarryReports = require('./templateServices')
const __constants = require('../../config/constants')
// const DbService = require('../../app_modules/message/services/dbData')
// const moment = require('moment')

const task = {
  one: cron.schedule(__constants.REPORTS_SCHEDULER_TIME, () => {
    // const dbService = new DbService()
    // const currentDateAndTime = moment().format('DD/MM/YYYY HH:mm:ss')
    // const currentDate = moment().format('YYMMDD')
    InsertTemplateSumarryReports()
  })
}

class templateReports {
  startServer () {
    __logger.info('inside ~function=startServer. Starting WORKER=templateReports')
    __db.init()
      .then(async (start) => {
        task.one.start()
      })
      .catch(err => {
        console.log('templateReports main catch error ->', err)
        __logger.error('ERROR ~function=templateReports. templateReports::error: ', { err: typeof err === 'object' ? err : { err } })
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

class Worker extends templateReports {
  start () {
    __logger.info((new Date()).toLocaleString() + '   >> Worker PID:', process.pid)
    super.startServer()
  }
}

module.exports.worker = new Worker()
