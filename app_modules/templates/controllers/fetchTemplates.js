const __logger = require('../../../lib/logger')
const __constants = require('../../../config/constants')
const __util = require('../../../lib/util')
const __db = require('../../../lib/db')
const rejectionHandler = require('../../../lib/util/rejectionHandler')

const queryProvider = require('../queryProvider')

// Services
const ValidatonService = require('../services/validation')

const getTemplateList = (req, res) => {
  __logger.info('Get Templates List API Called', req.query)

  const { messageTemplateStatusId } = req.query
  const params = [req.user.user_id]

  if (messageTemplateStatusId) {
    params.push(messageTemplateStatusId)
  }

  __db.postgresql.__query(queryProvider.getTemplateList(messageTemplateStatusId), params)
    .then(result => {
      if (result && result.rows && result.rows.length === 0) {
        __util.send(res, { type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, data: {} })
      } else {
        __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: result.rows })
      }
    })
    .catch(err => {
      __logger.error('error in create user function: ', err)
      __util.send(res, { type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
    })
}

const getTemplateInfo = (req, res) => {
  // __logger.info('Get Templates Info API Called', req.params)
  // __logger.info('Get Templates Info API Called', req.user.user_id)
  const validate = new ValidatonService()
  let finalResult

  __db.postgresql.__query(queryProvider.getTemplateInfo(), [req.user.user_id, req.params.templateId])
    .then(result => {
      __logger.info('then 1')
      if (result && result.rows && result.rows.length === 0) {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {}, data: {} })
      } else {
        finalResult = result.rows
        return validate.checkTemplateInfoStatus(result.rows[0])
      }
    })
    .then(data => {
      __logger.info('then 2')
      finalResult[0].complete = data.complete
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: finalResult })
    })
    .catch(err => {
      __logger.error('error in create user function: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

const getTemplateTypes = (req, res) => {
  __logger.info('Get Templates Type API Called')

  return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: __constants.TEMPLATE_TYPE })
}

module.exports = { getTemplateList, getTemplateInfo, getTemplateTypes }
