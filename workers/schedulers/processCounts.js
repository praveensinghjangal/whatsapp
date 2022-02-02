const cron = require('node-cron')
const __db = require('../../lib/db')
const __logger = require('../../lib/logger')
const main = require('./processCountService')
const __constants = require('../../config/constants')

const task = {
  mis: cron.schedule(__constants.PROCESS_COUNT_SCHEDULER_TIME, () => {
    main()
  }, {
    timezone: 'Asia/Kolkata'
  })
}

class ProcessCount {
  startServer () {
    __logger.info('inside ~function=startServer. Starting WORKER=ProcessCount')
    __db.init()
      .then(async (start) => {
        task.mis.start()
      })
      .catch(err => {
        console.log('Process Catch Main Function Error :- ', err)
        __logger.info('~function=ProcessCount. Catch Main Function Error  ', { err: typeof err === 'object' ? err : { err } })
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

class Worker extends ProcessCount {
  start () {
    __logger.info((new Date()).toLocaleString() + '   >> Worker PID:', process.pid)
    super.startServer()
  }
}

module.exports.worker = new Worker()
