const ValidatonService = require('../services/validation')
const OptinService = require('../services/dbData')
const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')

/**
 * @namespace -Whatsapp-Audience-Controller-Add-Update-Optin-Source-Data-
 * @description API’s related to whatsapp audience.
 */

/**
 * @memberof -Whatsapp-Audience-Controller-Add-Update-Optin-Source-Data-
 * @name AddUpdateOptinSourceData
 * @path {POST} /optin/source
 * @description Bussiness Logic :- API to add or update optin, To add optin do not pass optinId to update optin pass optin ID along with parameters to update.
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
 <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/audience/AddUpdateOptinSourceData|AddUpdateOptinSourceData}
 * @body {string}  optinId=f194da3d-0b62-405e-a512-95797f4bcf41 - Please provide the valid optin Id.
 * @body {string}  optinSource=test - please provide the valid source of optin.
 * @response {string} ContentType=application/json - Response content type.
 * @response {object} metadata.data - It will return the object containing optinSourceId and optinSource.
 * @code {200} if the msg is success than it Returns the Status of segment info completion.
 * @author Danish Galiyara 20th July, 2020
 * *** Last-Updated :- Arjun Bhole 10th December, 2020 ***
 */

const addUpdateOptinSourceData = (req, res) => {
  __logger.info('add update optin API called')
  const userId = req.user && req.user.user_id ? req.user.user_id : '0'
  const validate = new ValidatonService()
  const optinService = new OptinService()
  validate.checkAddOptinSourceData(req.body)
    .then(data => optinService.getOptinSourceDataById(req.body.optinSourceId))
    .then(optinData => {
      __logger.info('optinData::then 2', { optinData })
      if (optinData.optinSourceId) {
        return optinService.updateOptinSourceData(req.body, optinData, userId)
      } else {
        return optinService.addOptinSourceData(req.body, optinData)
      }
    })
    .then(data => {
      __logger.info('optinData::then 3')
      __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: data })
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

module.exports = { addUpdateOptinSourceData }
