const __logger = require('../../lib/logger')
const DbService = require('../../app_modules/message/services/dbData')

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
    .then((data) => {
      __logger.info('getNewTemplateDetailsAgainstAllUser ~function=getNewTemplateDetailsAgainstAllUser', data)
      if (data) {
        data.forEach((value, index) => {
          let finalvalue = 0
          if (value['count(state)']) {
            finalvalue = value['count(state)']
          }
          if (!wabaData[value.business_number]) {
            wabaData[value.business_number] = {
              [value.state]: finalvalue,
              templateId: value.templateId
            }
          } else {
            wabaData[value.business_number][value.state] = finalvalue
          }
        })
        console.log('wabaData===>', wabaData)
      }
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
