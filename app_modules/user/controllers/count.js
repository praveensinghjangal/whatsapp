const UserService = require('../services/dbData')
const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const _ = require('lodash')

/**
 * @namespace -Account-Count-Controller-
 * @description In this Conroller profile account count related API are build
 * such as getAccountCreatedTodayCount,getAgreementStatusCount
 */

/**
 * @memberof -Account-Count-Controller-
 * @name GetAccountCreatedTodayCount
 * @path {GET} /account/created/today
 * @description Bussiness Logic :- This API returns Profile account created on current day.
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
 *<br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/account/getAccountCreatedTodayCount|GetAccountCreatedTodayCount}
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=Success  - Response got successfully.
 * @response {object} metadata.data - Returns the object with count of the account created today.
 * @code {200} if the msg is success then returns the count of the account created on that current day.
 * @author Arjun Bhole 9th March, 2021
 * *** Last-Updated :- Arjun Bhole 9th March, 2021 ***
 */
// Get User Account Created Today Count
const getAccountCreatedTodayCount = (req, res) => {
  __logger.info('Get Account Created Today Count Called')
  const userService = new UserService()
  userService.getAccountCreatedTodayCount()
    .then(data => {
      __logger.info('then 1 get Account Created Today Count data', data)
      return __util.send(res, {
        type: __constants.RESPONSE_MESSAGES.SUCCESS,
        data: data
      })
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

/**
 * @memberof -Account-Count-Controller-
 * @name GetAgreementStatusCount
 * @path {GET} /agreement/status/count
 * @description Bussiness Logic :- This API returns agreement status count.
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
 *<br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/account/getAgreementStatusCount|GetAgreementStatusCount}
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=Success  - Response got successfully.
 * @response {object} metadata.data - Returns array of object with count of the agreement status.
 * @code {200} if the msg is success then returns the count of the agreement status.
 * @author Arjun Bhole 9th March, 2021
 * *** Last-Updated :- Arjun Bhole 9th March, 2021 ***
 */
// Get User Agreement Status Count
const getAgreementStatusCount = (req, res) => {
  __logger.info('Get Agreement Status Count Called')
  const userService = new UserService()
  userService.getAgreementStatusCount()
    .then(data => {
      __logger.info('then 1 get Agreement Status Count data', data)
      const result = {}
      let totalRecords = 0
      result.statusCount = []
      _.each(__constants.AGREEMENT_STATUS, singleStatus => {
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
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

module.exports = {
  getAccountCreatedTodayCount,
  getAgreementStatusCount
}
