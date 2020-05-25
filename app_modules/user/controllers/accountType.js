const __util = require('../../../lib/util')
const __define = require('../../../config/define')
const constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const __db = require('../../../lib/db')
const queryProvider = require('../queryProvider')

// Get Account Type
const getAcountType = (req, res) => {
  __logger.info('Inside getAcountType', req.user.userId)
  const userType = constants.USER_TYPE.admin
  __db.postgresql.__query(queryProvider.getAccountType(), [userType])
    .then(results => {
      __logger.info('Then 1', results)

      if (results && results.rows.length > 0) {
        return __util.send(res, {
          type: __define.RESPONSE_MESSAGES.SUCCESS,
          data: results.rows
        })
      } else {
        return __util.send(res, { type: __define.RESPONSE_MESSAGES.NO_RECORDS_FOUND, data: {} })
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
