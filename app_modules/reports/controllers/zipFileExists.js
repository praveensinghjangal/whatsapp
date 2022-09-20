const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const q = require('q')
const fs = require('fs')
const MessageReportsServices = require('../services/dbData')
const path = require('path')

const zipFileExixts = (file) => {
  __logger.info('inside getTemplateSummaryReportByTemplateId', file)
  const messageReportsServices = new MessageReportsServices()
  const doesZipFileExixts = q.defer()
  if (file && file.changeZipFile) {
    doesZipFileExixts.resolve(messageReportsServices.updateDownloadDlr(file))
  } else {
    if (fs.existsSync(path.resolve(__dirname, `../../../${__constants.FILEPATH}/${file.filename}.zip`))) {
      doesZipFileExixts.reject({ type: __constants.RESPONSE_MESSAGES.RECORD_EXIST, data: __constants.DOWNLOAD_STATUS.fileExists })
    } else {
      doesZipFileExixts.resolve({ changeZipFile: false })
    }
  }
  return doesZipFileExixts.promise
}

module.exports = {
  zipFileExixts
}
