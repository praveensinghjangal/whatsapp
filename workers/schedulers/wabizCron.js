const cron = require('node-cron')
const __db = require('../../lib/db')
const __logger = require('../../lib/logger')
const __constants = require('../../config/constants')
const checkWabizUrlConfig = require('./wabizUrlConfig')

const task = {
  one: cron.schedule(__constants.MIS_SCHEDULER_TIME, () => {
    checkWabizUrlConfig()
      .then(() => {
        return __logger.info('checkWabizUrlConfig :: sucessfully Checked wabiz url pin back set')
      })
      .catch((error) => {
        return __logger.error('inside ~function=', { err: typeof error === 'object' ? error : { error: error.toString() } })
      })
  }, {
  })
}
class pinBackSetScheduler {
  startServer () {
    __logger.info('inside ~function=startServer. Starting WORKER=pinBackSetScheduler')
    __db.init()
      .then(async (start) => {
        task.one.start()
        // checkWabizUrlConfig()
      })
      .catch(err => {
        console.log('pinBackSetScheduler main catch error ->', err)
        __logger.error('ERROR ~function=pinBackSetScheduler. pinBackSetScheduler::error: ', { err: typeof err === 'object' ? err : { err } })
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

class Worker extends pinBackSetScheduler {
  start () {
    __logger.info((new Date()).toLocaleString() + '   >> Worker PID:', process.pid)
    super.startServer()
  }
}

module.exports.worker = new Worker()
