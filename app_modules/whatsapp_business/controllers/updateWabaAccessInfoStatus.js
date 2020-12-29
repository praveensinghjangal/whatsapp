const __util = require('../../../lib/util')
const __logger = require('../../../lib/logger')
const rejectionHandler = require('../../../lib/util/rejectionHandler')
const __constants = require('../../../config/constants')
const WabaStatusService = require('../services/wabaStatusEngine')
const ValidatonService = require('../services/validation')
const BusinessAccountService = require('../services/businesAccount')

/**
 * @memberof -Whatsapp-Business-Account-(WABA)-Controller-
 * @name updateWabaAccessInfoStatus
 * @path {PUT} /business/profile/status
 * @description Bussiness Logic :- This API changes the profile status.
 * when the access info is in submitted status
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
 <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/WABA/status|UpdateAccessInfoStatus}
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=Success  -  Returns wabaProfileSetupStatusId as Pending For Approval.
 * @code {200} if the msg is success than Returns business access info updated status.
 * @author Arjun Bhole 20th November, 2020
 * *** Last-Updated :- Danish Galiyara 21st December, 2020 ***
 */
const updateWabaAccessInfoStatus = (req, res) => {
  __logger.info('updateWabaAccessInfoStatus API called', req.body)
  const recordUpdatingUserId = req.user && req.user.user_id ? req.user.user_id : 0
  const validate = new ValidatonService()
  const businessAccountService = new BusinessAccountService()
  const wabaStatusService = new WabaStatusService()
  let queryResult
  validate.addUpdateBusinessAccessInfoInputCheck(req.body)
    .then(() => businessAccountService.checkUserIdExist(req.body.userId))
    .then(result => {
      queryResult = result.record
      if (!result.exists) {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {}, data: {} })
      } else {
        return validate.isAddUpdateBusinessAccessInfoComplete(result.record)
      }
    })
    .then(result => {
      const reqBody = {
        wabaProfileSetupStatusId: req.body && req.body.wabaProfileSetupStatusId ? req.body.wabaProfileSetupStatusId : null,
        phoneCode: queryResult.phoneCode,
        phoneNumber: queryResult.phoneNumber,
        accessInfoRejectionReason: req.body && req.body.accessInfoRejectionReason ? req.body.accessInfoRejectionReason : null
      }
      if (result && result.complete && reqBody.wabaProfileSetupStatusId !== queryResult.wabaProfileSetupStatusId && wabaStatusService.canUpdateWabaStatus(reqBody.wabaProfileSetupStatusId, queryResult.wabaProfileSetupStatusId)) {
        return businessAccountService.updateBusinessData(reqBody, queryResult, recordUpdatingUserId)
      } else {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.WABA_PROFILE_STATUS_CANNOT_BE_CHANGED, data: {}, err: {} })
      }
    })
    .then(result => {
      __logger.info('After inserting or updating', result)
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: { result } })
    })
    .catch(err => {
      __logger.error('error updateWabaAccessInfoStatus: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

module.exports = { updateWabaAccessInfoStatus }
