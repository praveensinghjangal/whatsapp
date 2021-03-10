const BusinessAccountService = require('../services/businesAccount')
const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const _ = require('lodash')

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
    .then(data => {
      __logger.info('then 1 Waba Status Count data', data)
      const result = {}
      let totalRecords = 0
      result.statusCount = []
      _.each(__constants.WABA_PROFILE_STATUS, singleStatus => {
        const recordData = _.find(data, obj => obj.statusName ? obj.statusName.toLowerCase() === singleStatus.displayName.toLowerCase() : false)
        if (!recordData) {
          result.statusCount.push({ statusCount: 0, statusName: singleStatus.displayName })
        } else {
          result.statusCount.push({ statusCount: recordData.statusCount, statusName: singleStatus.displayName })
        }
        totalRecords += (recordData && recordData.statusCount) ? recordData.statusCount : 0
      })
      return __util.send(res, {
        type: __constants.RESPONSE_MESSAGES.SUCCESS,
        data: { statusCount: result.statusCount, totalRecords: totalRecords }
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
