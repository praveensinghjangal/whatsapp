const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const __db = require('../../../lib/db')
const rejectionHandler = require('../../../lib/util/rejectionHandler')
const queryProvider = require('../queryProvider')

// Get Account Type
const getAcountType = (req, res) => {
  __logger.info('Inside getAcountType', req.user)
  __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getAccountType(), [])
    .then(results => {
      __logger.info('Then 1', { results })
      if (results && results.length > 0) {
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

// Update Account Type todo
const updateAcountType = (req, res) => {
  __logger.info('Inside updateAcountType')
}

module.exports = { getAcountType, updateAcountType }
