const __util = require('../../../lib/util')
const __logger = require('../../../lib/logger')
const __constants = require('../../../config/constants')
const ValidatonService = require('../services/validation')
const WabaDataService = require('../services/wabDataService')

/**
 * @namespace -Whatsapp-Waba-Mapping-Controller(Add/Update)-
 * @description API’s related to whatsapp waba phone no mapping.
*/

/**
 * @memberof -Whatsapp-Waba-Mapping-Controller(Add/Update)-
 * @name AddUpdateWabaNoMapping
 * @path {POST} /audience/internal/waba
 * @description Bussiness Logic :-This api is used to add or update waba no mapping.
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
 <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/audience/addUpdateWabaNoMapping|AddUpdateWabaNoMapping}
 * @body {string} wabaInformationId
 * @body {string} wabaPhoneNumber
 * @body {string} userId
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=Success  -  Returns transaction result.
 * @code {200} if the msg is success then returns Status of waba phone no mapping.
 * @author Arjun Bhole 8th December, 2020
 * *** Last-Updated :- Arjun Bhole 8th December, 2020 ***
 */
const addUpdateWabaNoMapping = (req, res) => {
  __logger.info('Inside addUpdateWabaNoMapping', req.body)
  let userId = ''
  const validate = new ValidatonService()
  const wabaDataService = new WabaDataService()
  validate.wabaNoMappingInputCheck(req.body)
    .then(data => {
      userId = req.body.userId
      __logger.info(' then 1')
      return wabaDataService.checkWabaIdExist(req.body.wabaInformationId)
    })
    .then((result) => {
      __logger.info(' then 2', { result })
      if (result && !result.exists) {
        return wabaDataService.addWabaNoMappingData(req.body.wabaInformationId, req.body, {}, userId)
      } else {
        return wabaDataService.updateWabaNoMappingData(userId, req.body, result.record)
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

module.exports = { addUpdateWabaNoMapping }
