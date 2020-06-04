const __logger = require('../../../lib/logger')
const __constants = require('../../../config/constants')
const __util = require('../../../lib/util')
const __db = require('../../../lib/db')
const queryProvider = require('../queryProvider')

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
  __logger.info('Get Templates Info API Called', req.params)

  __db.postgresql.__query(queryProvider.getTemplateInfo(), [req.user.user_id, req.params.templateId])
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

module.exports = { getTemplateList, getTemplateInfo }
