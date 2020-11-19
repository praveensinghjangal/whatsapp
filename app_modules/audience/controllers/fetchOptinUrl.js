const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const __config = require('../../../config')
const __logger = require('../../../lib/logger')
const WabaService = require('../../whatsapp_business/services/businesAccount')
// const RedisService = require('../../../lib/redis_service/redisService')
const qrCodeService = require('../../../lib/util/qrCode')

/**
 * @namespace -Whatsapp-Audience-Controller-Fetch-Optin-URL-
 * @description API’s related to whatsapp audience.
 */

/**
 * @memberof -Whatsapp-Audience-Controller-Fetch-Optin-URL-
 * @name GetOptinUrl
 * @path {GET} /audience/optin/url
 * @description Bussiness Logic :- This api returns optin url and qrCode of the url.
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
 <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/audience/GetOptinUrl|GetOptinUrl}
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=Success  - Response got successfully.
 * @response {string} metadata.data.url - It will return the url something like https://wa.me/918080800808?text=helloviva1
  * @response {string} metadata.data.qrCode - It will return the QRCode in response.
 * @code {200} if the msg is success than return it will fetch Optin url by user Id.
 * @author Arjun Bhole 1st September, 2020
 * *** Last-Updated :- Arjun Bhole 23rd October, 2020 ***
 */

const getOptinUrl = (req, res) => {
  __logger.info('getOptinUrl::>>>>>>>>>>>>>>>>>>>>..')
  const userId = req.user ? req.user.user_id : 0
  let optinUrl = ''
  __logger.info('USerId,', userId)
  const wabaService = new WabaService()
  wabaService.getWabaNumberAndOptinTextFromUserId(userId)
    .then((data) => {
      __logger.info('Then 1,', userId)
      optinUrl = `${__constants.WA_ME_URL}/${data.wabaPhoneNumber}?text=${data.optinText}`
      return qrCodeService.generateQrcodeByUrl(__config.base_url + __constants.INTERNAL_END_POINTS.redirectToWameUrl + '/' + data.wabaPhoneNumber)
    })
    .then((data) => {
      __logger.info('qrCode generated----- then 2', { data })
      return __util.send(res, {
        type: __constants.RESPONSE_MESSAGES.SUCCESS,
        data: { url: optinUrl, qrCode: data.qrcode }
      })
    }).catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

module.exports = {
  getOptinUrl
}
