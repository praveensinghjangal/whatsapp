const __logger = require('../../../lib/logger')
const __constants = require('../../../config/constants')
const __util = require('../../../lib/util')
const __db = require('../../../lib/db')
const queryProvider = require('../queryProvider')

const getSampleTemplateList = (req, res) => {
  __logger.info('Get Sample Templates List API Called', req.query)

  const messageTemplateCategoryId = req.query.messageTemplateCategoryId
  const templateName = req.query.templateName

  __db.postgresql.__query(queryProvider.getSampleTemplateList(messageTemplateCategoryId, templateName), [])
    .then(result => {
      __logger.info('Result', result)
      if (result && result.rows && result.rows.length === 0) {
        return __util.send(res, { type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, data: {} })
      } else {
        return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: result.rows })
      }
    })
    .catch(err => {
      __logger.error('error in create user function: ', err)
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
    })
}

const getSampleTemplateInfo = (req, res) => {
  __logger.info('Get Sample Templates Info API Called', req.params)

  __db.postgresql.__query(queryProvider.getSampleTemplateInfo(), [req.params.id])
    .then(result => {
      if (result && result.rows && result.rows.length === 0) {
        return __util.send(res, { type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, data: {} })
      } else {
        return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: result.rows })
      }
    })
    .catch(err => {
      __logger.error('error in create user function: ', err)
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
    })
}

module.exports = { getSampleTemplateList, getSampleTemplateInfo }
