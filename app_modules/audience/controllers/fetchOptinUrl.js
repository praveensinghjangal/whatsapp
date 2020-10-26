const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const __config = require('../../../config')
const __logger = require('../../../lib/logger')
const WabaService = require('../../whatsapp_business/services/businesAccount')
// const RedisService = require('../../../lib/redis_service/redisService')
const qrCodeService = require('../../../lib/util/qrCode')

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
