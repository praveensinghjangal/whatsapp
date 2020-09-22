const q = require('q')
const __constants = require('../../config/constants')
const QRCode = require('qrcode')

const generateQrcodeByUrl = (url) => {
  const authenticatorData = q.defer()
  QRCode.toDataURL(url, (err, qrcode) => {
    if (err) authenticatorData.reject({ type: __constants.RESPONSE_MESSAGES.QRCODE_GEN_ERR, err: err })
    authenticatorData.resolve({ url, qrcode })
  })
  return authenticatorData.promise
}

module.exports = {
  generateQrcodeByUrl
}
