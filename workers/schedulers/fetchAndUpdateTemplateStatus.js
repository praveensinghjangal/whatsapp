var cron = require('node-cron')
const __db = require('../../lib/db')
const __logger = require('../../lib/logger')
const __config = require('../../config')
const fetchAndUpdateTemplateStatus = require('../../app_modules/integration/schedulers/fetchAndUpdateTemplateStatus')

class FetchAndUpdateTemplateStatus {
  startServer () {
    __db.init()
      .then(result => {
        var task = cron.schedule(__config.schedulers.updateTemplateStatus.time, () => {
          fetchAndUpdateTemplateStatus()
            .then(data => __logger.info('FetchAndUpdateTemplateStatus: SCHEDULER :: udateTicketStatus :: FINISHED ::', data)
            )
            .catch(err => __logger.info('FetchAndUpdateTemplateStatus: SCHEDULER :: udateTicketStatus :: FINISHED WITH ERROR ::', err))
        }, {
          scheduled: true,
          timezone: __config.schedulers.updateTemplateStatus.timeZone
        })
        task.start()
      })
      .catch(err => {
        __logger.error('FetchAndUpdateTemplateStatus: main catch: ', err)
        process.exit(1)
      })

    this.stop_gracefully = function () {
      __logger.info('stopping all resources gracefully')
      __db.close(function () { })
      process.exit(0)
    }
    process.on('SIGINT', this.stop_gracefully)
    process.on('SIGTERM', this.stop_gracefully)
  }
}

class Worker extends FetchAndUpdateTemplateStatus {
  start () {
    __logger.info('fetchAndUpdateTemplateStatus:' + (new Date()).toLocaleString() + '   >> Worker PID:', process.pid)
    super.startServer()
  }
}

module.exports.worker = new Worker()
