const __logger = require('../../../lib/logger')
const __config = require('../../../config')
const __constants = require('../../../config/constants')
const request = require('request')
const q = require('q')
const authorize = require('../../user/controllers/authorize').createAuthTokenByUserId
const WabaService = require('../../whatsapp_business/services/businesAccount')
const authToken = {}

const getAuthToken = wabaNumber => {
  // console.log('token -------------->', authToken[wabaNumber])
  const token = q.defer()
  if (authToken[wabaNumber]) {
    token.resolve(authToken[wabaNumber])
    return token.promise
  }
  const wabaService = new WabaService()
  wabaService.getUserIdFromWabaNumber(wabaNumber)
    .then(userId => authorize(userId))
    .then(data => {
      authToken[wabaNumber] = data
      return token.resolve(data)
    })
    .catch(err => {
      console.log('Error Token', err)
      token.resolve(err)
    })
  return token.promise
}

const sendMessage = (from, to, whatsappBody) => {
  const apiCalled = q.defer()
  getAuthToken(from)
    .then(token => {
      // __logger.info('Token', token)
      const apiReqBody = {
        to: to,
        channels: [
          'whatsapp'
        ],
        whatsapp: whatsappBody
      }
      apiReqBody.whatsapp.from = from
      const url = __config.base_url + __constants.INTERNAL_END_POINTS.sendMessageToQueue
      __logger.info('sendMessage :: callsendMessageApi formattedBody>>>>>>>>>>>>>>>>>>>>>>>>', apiReqBody)
      const options = {
        url,
        body: [apiReqBody],
        headers: { Authorization: token },
        json: true
      }
      // Calling another api for sending messages
      request.post(options, (err, httpResponse, body) => {
        __logger.info('Error Posting Data??????????????????////', err, body, httpResponse)
        if (body.msg === __constants.RESPONSE_MESSAGES.NOT_AUTHORIZED.message) {
          apiCalled.resolve({ success: false, output: { } })
        } else if (err) {
          __logger.info('Error OCurred??????????????????////', err)
          apiCalled.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: { } })
        } else {
          apiCalled.resolve({ success: true, output: body })
        }
      })
    })
    .catch(err => apiCalled.reject(err))
  return apiCalled.promise
}

module.exports = (from, to, whatsappBody) => {
  __logger.info('Inside send message to consumer :: >>>>>>>>>>>>>>>...', from, to, whatsappBody)
  const messageSent = q.defer()
  sendMessage(from, to, whatsappBody)
    .then(data => {
      __logger.info('Then Send mEssage', data)
      if (data.success) {
        return data.body
      } else {
        __logger.info('Re setting Waba Number Before>>>>>>>>>>>>>', authToken[from])
        authToken[from] = ''
        __logger.info('Re setting Waba Number After >>>>>>>>>>>>>', authToken[from])
        return sendMessage(from, to, whatsappBody)
      }
    })
    .then(data => messageSent.resolve(data.output))
    .catch(err => {
      __logger.info('Error ocurred>>>>>>>>>>>>>', err)
      messageSent.reject(err)
    })

  return messageSent.promise
}
