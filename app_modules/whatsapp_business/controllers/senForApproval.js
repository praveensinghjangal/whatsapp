const __util = require('../../../lib/util')
const __logger = require('../../../lib/logger')
const rejectionHandler = require('../../../lib/util/rejectionHandler')
const __constants = require('../../../config/constants')
const WabaStatusService = require('../services/wabaStatusEngine')
const ValidatonService = require('../services/validation')
const BusinessAccountService = require('../services/businesAccount')

/**
 * @memberof -Whatsapp-Business-Account-(WABA)-Controller-
 * @name SendWabaAccessInfoForApproval
 * @path {PUT} /business/profile/submit
 * @description Bussiness Logic :- This API sends the business access info to support team for approval.
 * when the access info is in submitted status
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
 <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/WABA/submit|SendForApproval}
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=Success  -  Returns wabaProfileSetupStatusId as Pending For Approval.
 * @code {200} if the msg is success than Returns business access info updated status.
 * @author Arjun Bhole 20th November, 2020
 * *** Last-Updated :- Arjun Bhole 20th November, 2020 ***
 */
const sendWabaAccessInfoForApproval = (req, res) => {
  __logger.info('sendWabaAccessInfoForApproval API called', req.params)
  const userId = req.user ? req.user.user_id : ''
  const validate = new ValidatonService()
  const businessAccountService = new BusinessAccountService()
  const wabaStatusService = new WabaStatusService()
  let queryResult
  businessAccountService.checkUserIdExist(userId)
    .then(result => {
      __logger.info('checkUserIdExist result', result)
      queryResult = result
      if (!result.exists) {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {}, data: {} })
      } else {
        return validate.isAddUpdateBusinessAccessInfoComplete(result.record)
      }
    })
    .then(result => {
      __logger.info('isAddUpdateBusinessAccessInfoComplete', result)
      __logger.info('queryResult>>>>>>>>', queryResult)
      const newStatus = result && result.complete ? __constants.WABA_PROFILE_STATUS.submitted.statusCode : __constants.WABA_PROFILE_STATUS.profileIncomplete.statusCode
      if (result && wabaStatusService.canUpdateWabaStatus(newStatus, queryResult.record.wabaProfileSetupStatusId)) {
        const reqBody = {
          phoneCode: queryResult.record.phoneCode,
          phoneNumber: queryResult.record.phoneNumber,
          wabaProfileSetupStatusId: newStatus
        }
        return businessAccountService.updateBusinessData(reqBody, queryResult.record)
      } else {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.WABA_PROFILE_STATUS_CANNOT_BE_CHANGED, data: {}, err: result.err || {} })
      }
    })
    .then(result => {
      __logger.info('After inserting or updating', result)
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: { result } })
    })
    .catch(err => {
      __logger.error('error sendWabaAccessInfoForApproval: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

module.exports = { sendWabaAccessInfoForApproval }
