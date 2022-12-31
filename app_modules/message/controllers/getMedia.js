const __logger = require('../../../lib/logger')
const __util = require('../../../lib/util')
const ValidatonService = require('../services/validation')
const integrationService = require('../../../app_modules/integration')

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

const getMedia = (req, res) => {
  __logger.info('getMedia: API Called req>param: ', { req: req.params })
  const userId = req.user && req.user.user_id ? req.user.user_id : '0'
  const maxTpsToProvider = req.user && req.user.maxTpsToProvider ? req.user.maxTpsToProvider : 10
  const messageService = new integrationService.Messaage(req.user.providerId, maxTpsToProvider, userId)
  const mediaId = req && req.params ? req.params.mediaId : ''
  const validate = new ValidatonService()
  validate.checkMediaIdExist(req.params)
    .then(() => messageService.getMedia(req.user.wabaPhoneNumber, mediaId))
    .then(mediaData => __util.send(res, { type: mediaData, data: mediaData.data }))
    .catch(err => {
      __logger.error('getMedia:: validate.checkMediaIdExist: catch:', err)
      return __util.send(res, { type: err.type, err: err.err || {} })
    })
}

module.exports = getMedia
