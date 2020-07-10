const __logger = require('../../../lib/logger')
const __constants = require('../../../config/constants')
const __util = require('../../../lib/util')
const __db = require('../../../lib/db')

const queryProvider = require('../queryProvider')

const getAllPlans =
(req, res) => {
  __logger.info('Get Plan List API Called')

  __db.mysql.__query(__constants.HW_MYSQL_NAME, queryProvider.getPlanList(), [])
    .then(result => {
      if (result && result.affectedRows && result.affectedRows === 0) {
        __util.send(res, { type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, data: {} })
      } else {
        __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: result })
      }
    })
    .catch(err => {
      __logger.error('error in create user function: ', err)
      __util.send(res, { type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
    })
}

module.exports = {
  getAllPlans

}
