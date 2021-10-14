const __logger = require('../../../lib/logger')
const __util = require('../../../lib/util')
// const ValidatonService = require('../services/validation')
const integrationService = require('../../../app_modules/integration')
const __constants = require('../../../config/constants')

/**
 * @namespace -WhatsApp-Message-Controller-Media-
 * @description API’s related to whatsapp message.
 */

/**
 * @memberof -WhatsApp-Message-Controller-Media-
 * @name GetMediaById
 * @path {GET} /chat/v1/messages/:mediaId
 * @description Bussiness Logic :- Use this API to get media by id
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
 <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/message/getMedia|GetMediaById}
 * @param {string}  mediaId - mediaId needs to be entered here.
 * @response {string} ContentType=application/json - Response content type.
 * @response {object} data - In response we get raw media data.
 * @code {200} if the msg is success then it returns media
..
 * @author Arjun Bhole 20th January, 2021
 * *** Last-Updated :- Danish Galiyara 21st January, 2021 ***
 */

const getProfilePic = (req, res) => {
  __logger.info('Get Media API Called', req.params)
  const userId = req.user && req.user.user_id ? req.user.user_id : '0'
  const maxTpsToProvider = req.user && req.user.maxTpsToProvider ? req.user.maxTpsToProvider : 10
  const wabaAccountService = new integrationService.WabaAccount(req.user.providerId, maxTpsToProvider, userId)
  wabaAccountService.getProfilePic(req.user.wabaPhoneNumber)
    .then(mediaData => {
      __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: mediaData })
    })
    .catch(err => {
      __logger.error('save optin::error: ', err)
      return __util.send(res, { type: err.type, err: err.err || {} })
    })
}

module.exports = getProfilePic
