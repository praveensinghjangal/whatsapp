const __logger = require('../../../lib/logger')
const __constants = require('../../../config/constants')
const __util = require('../../../lib/util')
const __db = require('../../../lib/db')
const queryProvider = require('../queryProvider')
const rejectionHandler = require('../../../lib/util/rejectionHandler')

// Services
const TemplateService = require('../services/template')
const ValidatonService = require('../services/validation')

/*
    Allocated Template - count of messageTemplateId per waba id
    Used Template - to be asked
    Approved Template- count of records where template status is approved
    Rejected Template- count of records where template status is rejected
  */
const getTemplateCount = (req, res) => {
  __logger.info('Get Templates Count API Called')
  const wabaInformationId = req.body.wabaInformationId
  const userId = req.user && req.user.user_id ? req.user.user_id : '0'

  const templateCountByStatus = []
  let finalCount
  const templateService = new TemplateService()
  const validate = new ValidatonService()
  validate.checkWabaId(req.body)
    .then(data => templateService.checkWabaIdExist(wabaInformationId))
    .then(result => {
    // __logger.info('Exists then 1', result)
      if (result.exists) {
        return { exists: true }
      } else {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {}, data: {} })
      }
    })
    .then(data => {
      __logger.info(' then 2', data)
      return __db.postgresql.__query(queryProvider.getTemplateCountByStatus(), [wabaInformationId, userId])
    })
    .then(data => {
      __logger.info(' then 3', data)

      if (data.rows.length > 0) {
        templateCountByStatus.push(data.rows)
        return __db.postgresql.__query(queryProvider.getTempalteAllocatedCountToWaba(), [wabaInformationId, userId])
      } else {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {}, data: {} })
      }
    })
    .then(data => {
      // __logger.info(' then 4', data)
      if (data.rows.length > 0) {
        templateCountByStatus[0].push(data.rows[0])
        return __db.postgresql.__query(queryProvider.getTempalteUsedCountByWaba(), [wabaInformationId, userId])
      } else {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {}, data: {} })
      }
    })
    .then(data => {
    // __logger.info(' then 5', data)
      templateCountByStatus[0].push(data.rows[0])
      finalCount = templateCountByStatus
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: finalCount })
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

module.exports = { getTemplateCount }
