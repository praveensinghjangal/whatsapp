const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const __db = require('../../../lib/db')
const rejectionHandler = require('../../../lib/util/rejectionHandler')
const queryProvider = require('../queryProvider')

// Get Template Category
const getTemplateCategories = (req, res) => {
  __logger.info('Inside getTemplateCategory', req.user.userId)
  __db.mysql.__query(__constants.HW_MYSQL_NAME, queryProvider.getTemplateCategories(), [])
    .then(results => {
      // __logger.info('Then 1', results)
      if (results && results.affectedRows && results.affectedRows > 0) {
        return __util.send(res, {
          type: __constants.RESPONSE_MESSAGES.SUCCESS,
          data: results
        })
      } else {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {}, data: {} })
      }
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

module.exports = { getTemplateCategories }
