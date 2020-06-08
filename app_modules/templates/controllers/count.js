const __logger = require('../../../lib/logger')
const __constants = require('../../../config/constants')
const __util = require('../../../lib/util')
const __db = require('../../../lib/db')
const queryProvider = require('../queryProvider')
const q = require('q')

/*
    Allocated Template - 5 by default
    Used Template - no of consumed templates
    Approved Template- count of records where template status is approved
    Rejected Template- count of records where template status is rejected
  */
const getTemplateCount = (req, res) => {
  __logger.info('Get Templates Count API Called')
  const userId = req.user && req.user.user_id ? req.user.user_id : '0'
  const templateCountByStatus = []
  let finalCount

  __db.postgresql.__query(queryProvider.getTemplateCountByStatus(), [userId])
    .then(data => {
      __logger.info(' then 1')
      return checkAndAddDefaultCount(data)
    })
    .then(data => {
      __logger.info(' then 2')
      templateCountByStatus.push(data)
      return __db.postgresql.__query(queryProvider.getTempalteAllocatedCountToWaba(), [userId])
    })
    .then(data => {
      __logger.info(' then 3')
      return checkAndAddDefaultAllocatedTemplateCount(data)
    })
    .then(data => {
      __logger.info('then 4')
      templateCountByStatus[0].push(data)
      return __db.postgresql.__query(queryProvider.getTempalteUsedCountByWaba(), [userId])
    })
    .then(data => {
      __logger.info(' then 5')
      templateCountByStatus[0].push(data.rows[0])
      finalCount = templateCountByStatus
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: finalCount })
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

/*
 Checks whether there's entry for approved and rejected
 if not add's default object
*/
function checkAndAddDefaultCount (inputData) {
  // __logger.info('Input data', inputData)
  // __logger.info('Input data row length', inputData.rows)
  const isDone = q.defer()
  let result = []
  if (inputData.rows.length === 0) {
    __logger.info('Input data row length 0')

    result =

      [
        {
          templateCount: 0,
          statusName: 'Rejected'
        },
        {
          templateCount: 0,
          statusName: 'Approved'
        }
      ]
  } else if (inputData.rows.length === 1) {
    __logger.info('Input data row length== 1')

    /*
      if the length is less than 2 then do the addition
      of the object
      else return the result as it is

    */

    result.push(inputData.rows[0])

    __constants.TEMPLATE_STATUS.forEach(status => {
      if (inputData.rows[0].statusName !== status) {
        result.push({
          templateCount: 0,
          statusName: status
        })
      }
    })
  } else {
    // __logger.info('Input data row length > 1')

    result = inputData.rows
  }

  isDone.resolve(result)
  // __logger.info('Default Result', result)
  return isDone.promise
}

/*
  Checks whether there's recroed with allocated template count
  if not add's default object
*/
function checkAndAddDefaultAllocatedTemplateCount (inputData) {
  const isDone = q.defer()
  let result = []

  if (inputData.rows.length > 0) {
    result = inputData.rows[0]
  } else {
    result = {
      allocatedTemplateCount: 0

    }
  }
  isDone.resolve(result)
  return isDone.promise
}

module.exports = { getTemplateCount }
