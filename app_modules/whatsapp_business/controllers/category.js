const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const __db = require('../../../lib/db')
const rejectionHandler = require('../../../lib/util/rejectionHandler')
const queryProvider = require('../queryProvider')

// Get Business Category
const getBusinessCategory = (req, res) => {
  __logger.info('Inside getBusinessCategory', req.user.userId)
  __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getBusinessCategory(), [])
    .then(result => {
      __logger.info('Then 1')
      if (result && result.length > 0) {
        return __util.send(res, {
          type: __constants.RESPONSE_MESSAGES.SUCCESS,
          data: result
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

module.exports = { getBusinessCategory }
