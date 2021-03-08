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
          activeRecords: result && result[0] && result[0].totalActiveUsers ? result[0].totalActiveUsers : 0,
          inActiveRecords: result && result[0] && result[0] && result[0].totalUsers && result[0].totalActiveUsers ? result[0].totalUsers - result[0].totalActiveUsers : 0
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
      let totalUsers = 0
      if (result && result.length > 0) {
        result.forEach(record => {
          totalUsers += record.statusCount
        })
      }
      return __util.send(res, {
        type: __constants.RESPONSE_MESSAGES.SUCCESS,
        data: { statusCount: result, totalRecords: totalUsers }
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
