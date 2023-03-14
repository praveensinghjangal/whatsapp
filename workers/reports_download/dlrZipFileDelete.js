const q = require('q')
const __constants = require('../../config/constants')
const __logger = require('../../lib/logger')
const path = require('path')
const fs = require('fs')
const MessageReportsServices = require('../../app_modules/reports/services/dbData')

const dlrZipFileDelete = () => {
  let dlrRecord
  const messageReportsServices = new MessageReportsServices()
  const zipDelete = q.defer()
  messageReportsServices.findDlrZipFile()
    .then(data => {
      dlrRecord = data
      dlrRecord.map(element => {
        fs.unlinkSync(path.resolve(__dirname, `../../${element.path}.zip`))
      })
    })
    .then(data => {
      return messageReportsServices.deleteDlrrecord(dlrRecord)
    })
    .then(data => {
      return __logger.info('SCHEDULER::Delete Dlr report worker run successfully')
    })
    .catch(err => {
      __logger.error('SCHEDULER::dlr zip file delete using cron function::error: ', err)
      zipDelete.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
    })
  return zipDelete.promise
}
module.exports = dlrZipFileDelete
