const BusinessAccountService = require('../services/businesAccount')
const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')

// Get Waba Account Active Inactive Count
const getWabaAccountActiveInactiveCount = (req, res) => {
  __logger.info('Get Waba Account Active Inactive Count Called')
  const businessAccountService = new BusinessAccountService()
  businessAccountService.getWabaAccountActiveInactiveCount()
    .then(result => {
      __logger.info('then 1 Waba Account Active Inactive Count data', result)
      return __util.send(res, {
        type: __constants.RESPONSE_MESSAGES.SUCCESS,
        data: {
          activeRecords: (result[0] && result[0][0] && result[0][0].totalActiveRecords) ? result[0][0].totalActiveRecords : 0,
          inActiveRecords: (result[1] && result[1][0] && result[1][0].totalRecords) ? result[1][0].totalRecords - result[0][0].totalActiveRecords : 0
        }
      })
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

// Get Waba Status Count
const getWabaStatusCount = (req, res) => {
  __logger.info('Get Waba Status Count Called')
  const businessAccountService = new BusinessAccountService()
  businessAccountService.getWabaStatusCount()
    .then(result => {
      __logger.info('then 1 Waba Status Count data', result)
      return __util.send(res, {
        type: __constants.RESPONSE_MESSAGES.SUCCESS,
        data: { statusCount: result[0], totalAccount: result[1][0].totalWabaAccount }
      })
    })
    .catch(err => {
      __logger.error('Get Waba Status error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

module.exports = {
  getWabaAccountActiveInactiveCount,
  getWabaStatusCount
}
