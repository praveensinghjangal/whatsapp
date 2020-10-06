const q = require('q')
const HttpService = require('../http_service')
const __constants = require('../../config/constants')
const __config = require('../../config')
const __logger = require('../logger')

class Sms {
  webcpSend (template, phoneNumber) {
    const smsSent = q.defer()
    const webcpConfig = __config.webcpSmsProvider
    if (!webcpConfig.sendSms) {
      smsSent.resolve(true)
      return smsSent.promise
    }
    const http = new HttpService(6000)
    const encodedMessage = encodeURIComponent(template)
    const url = webcpConfig.apiUrl.split('{{1}}').join(webcpConfig.username).split('{{2}}').join(webcpConfig.password)
      .split('{{3}}').join(phoneNumber).split('{{4}}').join(encodedMessage)
      .split('{{5}}').join(webcpConfig.senderId).split('{{6}}').join(webcpConfig.cdmaHeader)
    __logger.info('calling WEBCP SMS API', { url })
    http.Post({}, 'body', url, {})
      .then(data => {
        __logger.info('post WEBCP SMS API response', data)
        data = data.body || data
        if (data && data.toLowerCase().search('messagesent') >= 0) {
          smsSent.resolve(data)
        } else {
          smsSent.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: data.error })
        }
      })
      .catch(err => smsSent.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err }))
    return smsSent.promise
  }
}
module.exports = Sms
