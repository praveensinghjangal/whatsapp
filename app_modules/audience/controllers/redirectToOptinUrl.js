const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const RedisService = require('../../../lib/redis_service/redisService')

/**
 * @namespace -Whatsapp-Audience-Controller-Redirect-to-optin-Url-
 * @description API’s related to whatsapp audience.
 */

/**
 * @memberof -Whatsapp-Audience-Controller-Redirect-to-optin-Url-
 * @name RedirectToOptinUrl
 * @path {GET} /audience/optin/url/redirect/{wabaNumber}
 * @description Bussiness Logic :- This api redirects to getOptinUrl.
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
 <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/audience/RedirectToOptinUrl|RedirectToOptinUrl}
 * @param {string} [wabaNumber=123456567890] _ Please provided the valid WABA Number.
 * @code {200} if API worked successfully with the provided WABA number than its Redirects to getOptinUrl.
 * @author Javed Kl11 22ndSeptember, 2020
 * *** Last-Updated :- Javed Kl11 22ndSeptember, 2020 ***
 */

const redirectToOptinUrl = (req, res) => {
  __logger.info('redirectToOptinUrl: redirectToOptinUrl(): ', req.params.wabaNumber)
  const redisService = new RedisService()
  redisService.getWabaDataByPhoneNumber(req.params.wabaNumber)
    .then((data) => {
      __logger.info('got Optin text----', data.optinText)
      if (req.params.wabaNumber === '917666118800') {
        res.redirect('http://onetouchupgrades.in/one_touch/one_touch.html')
        return
      }
      res.redirect(`${__constants.WA_ME_URL}/${req.params.wabaNumber}?text=${data.optinText}`)
    })
    .catch(err => {
      __logger.error('redirectToOptinUrl: redirectToOptinUrl(): catch:', err)
      return res.status(403).send()
    })
}

module.exports = {
  redirectToOptinUrl
}
