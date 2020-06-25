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
      return formatAndReturnTemplateCount(data)
    })
    .then(data => {
      __logger.info('then 2')
      templateCountByStatus.push(data)
      return __db.postgresql.__query(queryProvider.getTempalteUsedCountByWaba(), [userId])
    })
    .then(data => {
      __logger.info(' then 3', data)
      templateCountByStatus[0].push(data.rows[0])
      finalCount = templateCountByStatus[0]
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: finalCount })
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

function formatAndReturnTemplateCount (data) {
  __logger.info('formatAndReturnTemplateCount', data)
  const isDone = q.defer()

  const result = []
  if (data.rows && data.rows.length === 0) {
    __logger.info('Length-------------------------- 0')

    __constants.TEMPLATE_STATUS.forEach(templateStatus => {
      result.push({
        templateCount: 0,
        statusName: templateStatus
      })
    })
    result.push({
      allocatedTemplateCount: data.rows.length
    })
  }

  if (data.rows && data.rows.length === 1) {
    __logger.info('Length-------------------------- 1')
    result.push({
      allocatedTemplateCount: data.rows[0].templates_allowed
    })
    __constants.TEMPLATE_STATUS.forEach(status => {
      __logger.info('Status ', status)
      __logger.info('data.rows[0].status_name ', data.rows[0].status_name)
      if (data.rows[0].status_name !== status) {
        result.push({
          templateCount: 0,
          statusName: status
        })
      } else {
        result.push({
          templateCount: data.rows[0].count,
          statusName: status
        })
      }
    })
  }

  if (data.rows && data.rows.length > 1) {
    __logger.info('Length-------------------------- >1')

    result.push({
      allocatedTemplateCount: data.rows[0].templates_allowed
    })

    data.rows.forEach(record => {
      if (!__constants.TEMPLATE_STATUS.includes(record.status_name)) {
        result.push({
          templateCount: 0,
          statusName: record.status_name
        })
      } else {
        result.push({
          templateCount: record.count,
          statusName: record.status_name
        })
      }
    })
  }

  isDone.resolve(result)
  __logger.info('Result ', result)

  return isDone.promise
}

module.exports = { getTemplateCount }
