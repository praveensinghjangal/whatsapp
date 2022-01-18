const __logger = require('../../../lib/logger')
const __util = require('../../../lib/util')
const ValidatonService = require('../services/validation')
const integrationService = require('../../../app_modules/integration')
const RedisService = require('../../../lib/redis_service/redisService')
const __constants = require('../../../config/constants')

/**
 * @namespace -WhatsApp-Message-Controller-Media-
 * @description API’s related to whatsapp message.
 */

/**
 * @memberof -WhatsApp-Message-Controller-Media-
 * @name GetMediaByPhoneNumber
 * @path {GET} /media/:mediaId/phoneNumber/:phoneNumber
 * @description Bussiness Logic :- Use this API to get media data by phoneNumber and media Id
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
 <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/message/getMedia|GetMediaById}
 * @param {string}  mediaId - mediaId needs to be entered here.
 * @response {string} ContentType=application/json - Response content type.
 * @response {object} data - In response we get raw media data.
 * @code {200} if the msg is success then it returns media
..
 * @author Vasim Gujrati 10th January, 2022
 * *** Last-Updated :- Vasim Gujrati 10th January, 2022 ***
 */

const getMediaByPhoneNumber = (req, res) => {
  const validate = new ValidatonService()
  const redisService = new RedisService()
  __logger.info('getMediaByPhoneNumber::req.params: ', req.params)
  validate.getMediaByPhoneNumber(req.params)
    .then(() => redisService.getWabaDataByPhoneNumber(req.params.phoneNumber))
    .then((data) => {
      const messageService = new integrationService.Messaage(data.serviceProviderId, data.maxTpsToProvider, data.userId)
      return messageService.getMedia(req.params.phoneNumber, req.params.mediaId)
    })
    .then(mediaData => __util.send(res, { type: mediaData, data: mediaData.data }))
    .catch(err => {
      __logger.error('getMediaByPhoneNumber::error: ', err)
      return __util.send(res, { type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
    })
}

module.exports = getMediaByPhoneNumber
