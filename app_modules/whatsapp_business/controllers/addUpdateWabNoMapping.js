const __util = require('../../../lib/util')
const __logger = require('../../../lib/logger')
const __constants = require('../../../config/constants')
const ValidatonService = require('../services/validation')
const WabaNoMappingForAudService = require('../services/wabaNoMappingForAud')

/**
 * @memberof -Whatsapp-Business-Account-(WABA)-Controller-
 * @name AddUpdateWabaNoMappingForAudience
 * @path {POST} /business/wabaNoMapping
 * @description Bussiness Logic :-This api is used to add or update waba no mapping for audience .
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
 <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/WABA/addupdateWabaNoMappingForAudience|AddupdateWabaNoMappingForAudience}
 * @body {string} wabaInformationId
 * @body {string} wabaPhoneNumber
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=Success  -  Returns result of waba no mapping transaction.
 * @code {200} if the msg is success than Returns result of waba no mapping transaction.
 * @author Arjun Bhole 2nd Dec, 2020
 * *** Last-Updated :- Arjun Bhole 2nd December, 2020 ***
 */

const addupdateWabaNoMappingForAudience = (req, res) => {
  __logger.info('Inside addupdateWabaNoMappingForAudience', req.user.user_id, req.body)
  const userId = req.user && req.user.user_id ? req.user.user_id : '0'
  const validate = new ValidatonService()
  const wabaNoMappingForAudService = new WabaNoMappingForAudService()
  validate.wabaNoMappingInputCheck(req.body)
    .then(data => {
      __logger.info(' then 1')
      return wabaNoMappingForAudService.checkWabaIdExist(req.body.wabaInformationId)
    })
    .then((result) => {
      __logger.info(' then 2', { result })
      if (result && !result.exists) {
        return wabaNoMappingForAudService.addAudWabaNoMappingData(req.body.wabaInformationId, req.body, {}, userId)
      } else {
        return wabaNoMappingForAudService.updateAudWabaNoMappingData(userId, req.body, result.record)
      }
    })
    .then(result => {
      __logger.info(' then 3')
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: { } })
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

module.exports = { addupdateWabaNoMappingForAudience }
