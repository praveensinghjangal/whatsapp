const __logger = require('../../lib/logger')
const DbService = require('../../app_modules/message/services/dbData')
function groupByMultipleFields (data, ...fields) {
  if (fields.length === 0) return
  let newData = {}
  const [field] = fields
  newData = groupBySingleField(data, field)
  const remainingFields = fields.slice(1)
  if (remainingFields.length > 0) {
    Object.keys(newData).forEach((key) => {
      newData[key] = groupByMultipleFields(newData[key], ...remainingFields)
    })
  }
  return newData
  function groupBySingleField (data, field) {
    return data.reduce((acc, val) => {
      const rest = Object.keys(val).reduce((newObj, key) => {
        if (key !== field) {
          newObj[key] = val[key]
        }
        return newObj
      }, {})
      if (acc[val[field]]) {
        acc[val[field]].push(rest)
      } else {
        ;
        acc[val[field]] = [rest]
      }
      return acc
    }, {})
  }
}

const InsertDataIntoUserSumarryReports = (currentDate) => {
  const dbService = new DbService()
  let wabaNumber
  let wabaData
  dbService.getActiveBusinessNumber()
    .then((data) => {
      if (data) {
        __logger.info('get new state data against all user  ~function=getNewStateDataAgainstAllUser', data)
        wabaNumber = data.wabaNumber.split(',')
        return dbService.getNewStateDataAgainstAllUser(wabaNumber, currentDate)
      }
    })
    .then(data => {
      console.log('@@#!$@^$%$#&$@$&!^$&@$', data)
      __logger.info('get new active state data against all user  ~function=getNewStateDataAgainstAllUser', data)
      if (data) {
        data.forEach((value, index) => {
          if (value['count(state)']) {
            wabaData = JSON.stringify(groupByMultipleFields(data, 'messageCountry', 'business_number'))
          }
        })
      }
      console.log('wabaData===>', wabaData)
    })
    .then(() => {
      console.log('11111111111111111111111111111111111111', wabaData)
      return dbService.insertStatusAgainstWaba(JSON.parse(wabaData))
    })
    .then((data) => {
      __logger.info('MIS mail sent ~function=messageStatusOnMail', data)
    })
    .catch((error) => {
      console.log('error in sending mis ~function=messageStatusOnMail', error)
      __logger.error('error in sending mis ~function=messageStatusOnMail', { err: typeof error === 'object' ? error : { error: error.toString() } })
    })
}
module.exports = InsertDataIntoUserSumarryReports
