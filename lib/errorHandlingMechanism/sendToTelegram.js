const q = require('q')
const __constants = require('./../../config/constants')
const HttpService = require('./../http_service')
const __config = require('./../../config/index')
const __logger = require('./../logger')

const sendMessage = (message, botToken, telegramChatId) => {
  const apiCalled = q.defer()
  const http = new HttpService(60000)
  http.Get(__constants.TELEGRAM_API + botToken + __constants.TELEGRAM_ENDPOINTS.sendMessage + '?chat_id=' + telegramChatId + '&text=' + message)
    .then(data => {
      data = data.body || data
      __logger.warn('sendToTelegram: Message sent to telegram .....')
      if (data && data.ok && data.ok === true) {
        apiCalled.resolve(data)
      } else {
        apiCalled.reject({ type: __constants.RESPONSE_MESSAGES.ERROR_SENDING_MESSAGE, err: data })
      }
    })
    .catch(err => {
      __logger.error('sendToTelegram: error response of telegram: ', err)
      apiCalled.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
    })
  return apiCalled.promise
}

const errorToTelegram = (error, message) => sendMessage((typeof message === 'object' && JSON.stringify(message) ? message : "") + (typeof error === 'object' ? JSON.stringify(error) : (error.toString() || error)) + '\nEnvironment URL: ' + __config.base_url, __config.botToken, __config.telegramChatId)

module.exports = { send: errorToTelegram, sendMessage }
