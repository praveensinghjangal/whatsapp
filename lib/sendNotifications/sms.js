const q = require('q')
const HttpService = require('../http_service')
const __constants = require('../../config/constants')
const __config = require('../../config')
const __logger = require('../logger')

class Sms {
  smppSend (template, phoneNumber) {
    const smsSent = q.defer()
    const http = new HttpService(6000)
    const inputRequest = {
      list: [
        {
          d: phoneNumber,
          s: __constants.SMPP_SMS.senderId,
          m: template
        }
      ]
    }
    const headers = { apikey: __config.smppSmsProvider.apiKey }
    __logger.info('calling SMPP SMS API', inputRequest, headers)
    http.Post(inputRequest, 'body', __config.smppSmsProvider.apiUrl, headers)
      .then(data => {
        __logger.info('post SMPP SMS API response', data)
        data = data.body || data
        if (data && data.code && data.code === 200) {
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
