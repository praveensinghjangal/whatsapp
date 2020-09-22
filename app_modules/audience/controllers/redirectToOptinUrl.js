const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const RedisService = require('../../../lib/redis_service/redisService')

const redirectToOptinUrl = (req, res) => {
  __logger.info('redirectToOptinUrl::>>>>>>>>>>>>>>>..', req.params.wabaNumber)
  const redisService = new RedisService()
  redisService.getWabaDataByPhoneNumber(req.params.wabaNumber)
    .then((data) => {
      __logger.info('got Optin text----', data.optinText)
      res.redirect(`${__constants.WA_ME_URL}/${req.params.wabaNumber}?text=${data.optinText}`)
    })
    .catch(err => {
      __logger.error('error: ', err)
      return res.status(403).send()
    })
}

module.exports = {
  redirectToOptinUrl
}
