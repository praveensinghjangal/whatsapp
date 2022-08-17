const __logger = require('../../lib/logger')
const DbService = require('../../app_modules/message/services/dbData')
const __constants = require('../../config/constants')
const q = require('q')
const getTemplateNameAgainstId = (templateId) => {
  const getTemplateNameAgainstId = q.defer()
  __logger.info('generateBackupCodes:')
  const dbService = new DbService()
  dbService.getTemplateNameAgainstId(templateId)
    .then(data => {
      if (data.templateName) {
        return getTemplateNameAgainstId.resolve(data.templateName)
      } else {
        return getTemplateNameAgainstId.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, data: {} })
      }
    })
    .catch(err => {
      __logger.error('Error in authorizeSmppApi :: ', err)
      return getTemplateNameAgainstId.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
    })
  return getTemplateNameAgainstId.promise
}

const InsertDataIntoSumarryReports = (currentDate) => {
  const dbService = new DbService()
  let wabaNumber
  const wabaData = {}
  dbService.getActiveBusinessNumber()
    .then((data) => {
      if (data) {
        wabaNumber = data.wabaNumber.split(',')
        return dbService.getNewTemplateDetailsAgainstAllUser(wabaNumber, currentDate)
      }
    })
    .then(async (data) => {
      __logger.info('getNewTemplateDetailsAgainstAllUser ~function=getNewTemplateDetailsAgainstAllUser', data)
      if (data) {
        for (let i = 0; i < data.length; i++) {
          const value = data[i]
          let finalvalue = 0
          if (value['count(state)']) {
            finalvalue = value['count(state)']
          }
          if (!wabaData[value.business_number]) {
            wabaData[value.business_number] = {
              [value.state]: finalvalue,
              templateId: value.templateId,
              templateName: await getTemplateNameAgainstId(value.templateId)
            }
          } else {
            wabaData[value.business_number][value.state] = finalvalue
          }
        }
        return wabaData
      }
      return null
    })
    .then(() => {
      __logger.info('data to be inserted into the table  the table ~function=InsertDataIntoSumarryReports', wabaData)
      return dbService.insertTemplateStatusAgainstWaba(wabaData)
    })
    .then((data) => {
      __logger.info('successfully inserted data into the table ~function=InsertDataIntoSumarryReports', data)
    })
    .catch((error) => {
      console.log('error in while inserting template summary ~function=InsertDataIntoSumarryReports', error)
      __logger.error('error in while inserting template summary ~function=InsertDataIntoSumarryReports', { err: typeof error === 'object' ? error : { error: error.toString() } })
    })
}
module.exports = InsertDataIntoSumarryReports
