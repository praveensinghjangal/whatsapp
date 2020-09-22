const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const WabaService = require('../../whatsapp_business/services/businesAccount')
// const RedisService = require('../../../lib/redis_service/redisService')
const qrCodeService = require('../../../lib/util/qrCode')

const getOptinUrl = (req, res) => {
  __logger.info('getOptinUrl::>>>>>>>>>>>>>>>>>>>>..')
  const userId = req.user ? req.user.user_id : 0

  console.log('USerId,', userId)
  const wabaService = new WabaService()
  wabaService.getWabaNumberAndOptinTextFromUserId(userId)
    .then((data) => {
    //   console.log('Data in getOptinUrl', data)
      const url = `${__constants.OPTIN_URL}/${data.wabaPhoneNumber}?text=${data.optinText}`
      return qrCodeService.generateQrcode(url)
    })
    .then((data) => {
      __logger.info('qrCode generated-----', data)
      const url = data.url
      const qrCode = data.qrcode
      return __util.send(res, {
        type: __constants.RESPONSE_MESSAGES.SUCCESS,
        data: { url, qrCode }
      })
    }).catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

module.exports = {
  getOptinUrl
}
