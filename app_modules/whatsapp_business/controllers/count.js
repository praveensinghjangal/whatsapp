const BusinessAccountService = require('../services/businesAccount')
const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const _ = require('lodash')

/**
 * @memberof -Whatsapp-Business-Account-(WABA)-Controller-
 * @name getWabaAccountActiveInactiveCount
 * @path {get} /activity/status/count
 * @description Bussiness Logic :- This API returns waba business account which are active or inactive based on last 30 days transaction.
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
 <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/WABA/getWabaAccountActiveInactiveCount|getWabaAccountActiveInactiveCount}
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=Success  -  In response we get object containing the active and inActive waba count.
 * @code {200} if the msg is success than Returns object.
 * @author Arjun Bhole 9th March, 2021
 * *** Last-Updated :- Arjun Bhole 9th March, 2021 ***
 */

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

/**
 * @memberof -Whatsapp-Business-Account-(WABA)-Controller-
 * @name getWabaStatusCount
 * @path {get} /status/count
 * @description Bussiness Logic :- This API returns waba business account count.
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
 <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/WABA/getWabaStatusCount|getWabaStatusCount}
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=Success  -  In response we get array of object containing the waba status count.
 * @code {200} if the msg is success than Returns array of object containing the status name and status count in each object.
 * @author Arjun Bhole 9th March, 2021
 * *** Last-Updated :- Arjun Bhole 9th March, 2021 ***
 */

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
          result.statusCount.push({ templateCount: 0, statusName: singleStatus.displayName })
        } else {
          result.statusCount.push({ templateCount: recordData.statusCount, statusName: singleStatus.displayName })
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
