const q = require('q')
const integrationService = require('../../../app_modules/integration')
const __constants = require('../../../config/constants')
const __config = require('../../../config')
const __logger = require('../../../lib/logger')
const HttpService = require('../../../lib/http_service')

class InternalFunctions {
  setWebhookOfProvider (wabaNumber, providerId, maxTpsToProvider, userId) {
    const webHookApplied = q.defer()
    __logger.info('setWebhookOfProvider --> function called', wabaNumber, providerId)
    const wabaAccountService = new integrationService.WabaAccount(providerId, maxTpsToProvider, userId)
    const incomingMessage = __config.webHookUrl + __constants.WEB_HOOK_END_POINT.incomingMessage
    const nessageStatus = __config.webHookUrl + __constants.WEB_HOOK_END_POINT.messageStatus
    __logger.info('setWebhookOfProvider --> fURL formed', incomingMessage, nessageStatus)
    wabaAccountService.setWebhook(wabaNumber, incomingMessage, nessageStatus)
      .then(data => {
        __logger.info('setWebhookOfProvider --> After setting hook', data)
        webHookApplied.resolve(data)
      })
      .catch(err => {
        __logger.error('setWebhookOfProvider -->error while setting webhook', err)
        webHookApplied.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return webHookApplied.promise
  }

  activateChatBot (wabaData, headers) {
    const chatBotActivated = q.defer()
    const http = new HttpService(60000)
    const inputRequest = {
      businessName: wabaData.businessName,
      chatBotActivated: true
    }
    __logger.info('calling update waba profile data api', inputRequest, headers, __config.base_url + __constants.INTERNAL_END_POINTS.businessProfile)
    const reqHeaders = { authorization: headers.authorization }
    http.Post(inputRequest, 'body', __config.base_url + __constants.INTERNAL_END_POINTS.businessProfile, reqHeaders)
      .then(data => {
        __logger.info('post update waba profile data api response', data, data.body)
        const statusCode = data.statusCode || 500
        data = data.body || data
        if (data && data.code && data.code === 2000) {
          chatBotActivated.resolve(data)
        } else {
          chatBotActivated.reject({ status_code: statusCode, code: data.code, message: data.msg })
        }
      })
      .catch(err => {
        __logger.error('activateChatBot -->error while activating chat bot', err)
        chatBotActivated.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return chatBotActivated.promise
  }
}

// todo : add rules weather to do first time only on status or do every time when this function is called
module.exports = class Hooks {
  constructor () {
    this.internalFunctions = new InternalFunctions()
  }

  onAccepted (wabaData, headers) {
    __logger.info('onAccepted called', wabaData, headers)
    this.internalFunctions.setWebhookOfProvider(wabaData.phoneCode + wabaData.phoneNumber, wabaData.serviceProviderId, wabaData.maxTpsToProvider, wabaData.userId)
    this.internalFunctions.activateChatBot(wabaData, headers)
  }

  trigger (wabaData, status, headers) {
    __logger.info('hooks trigger called', wabaData, status, headers)
    if (status === __constants.WABA_PROFILE_STATUS.accepted.statusCode) this.onAccepted(wabaData, headers)
  }
}
