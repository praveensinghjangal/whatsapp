
const q = require('q')
const __constants = require('./../../config/constants')
const HttpService = require('./../http_service')
const __config = require('./../../config/index')
const __logger = require('./../logger')

const errorToTelegram = (error, message) => {
    const apiCalled = q.defer()
    const http = new HttpService(60000)
    http.Get(__constants.TELEGRAM_API + __config.botToken + __constants.TELEGRAM_ENDPOINTS.sendMessage + '?chat_id' + __config.telegram_chat_id + '&text' + {error, message})
      .then(data => {
        data = data.body || data
        __logger.info('response of telegram >>>>>>>>>>>>>>>>>>>>>>>>..', data)
        if (data && data.code && data.code === 2000) {
          apiCalled.resolve(data)
        } else {
          apiCalled.reject({ type: __constants.RESPONSE_MESSAGES.META_DATA_NOT_FOUND, err: data.error })
        }
      })
      .catch(err => {
        __logger.info('Error in calling  telegram API >>>>>>>>>>>>>>>>>>>>>>>>..', err)
        apiCalled.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return apiCalled.promise
  }

  module.exports = { send: errorToTelegram}
