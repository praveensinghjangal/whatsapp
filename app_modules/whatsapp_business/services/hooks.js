const q = require('q')
const integrationService = require('../../../app_modules/integration')
const __constants = require('../../../config/constants')
const __config = require('../../../config')
const __logger = require('../../../lib/logger')
const HttpService = require('../../../lib/http_service')
const __db = require('../../../lib/db')

class InternalFunctions {
  setWebhookOfProvider (wabaNumber, providerId, maxTpsToProvider, userId) {
    const webHookApplied = q.defer()
    __logger.info('set Webhook Of Provider --> function called', wabaNumber, providerId)
    const wabaAccountService = new integrationService.WabaAccount(providerId, maxTpsToProvider, userId)
    let incomingMessage = __config.provider_config[providerId].incomingMessage
    let messageStatus = __config.provider_config[providerId].messageStatus
    if (__config.provider_config[providerId].name === 'facebook') {
      incomingMessage = incomingMessage + '/' + wabaNumber
      messageStatus = messageStatus + '/' + wabaNumber
    }
    __logger.info('set Webhook Of Provider --> fURL formed', incomingMessage, messageStatus)
    wabaAccountService.setWebhook(wabaNumber, incomingMessage, messageStatus)
      .then(data => {
        __logger.info('set Webhook Of Provider --> After setting hook', data)
        webHookApplied.resolve(data)
      })
      .catch(err => {
        __logger.error('setWebhookOfProvider -->error while setting webhook', err)
        webHookApplied.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return webHookApplied.promise
  }

  createQueuePerUser (userId, phoneNumber) {
    this.rabbitmqHeloWhatsapp = require('./../../../lib/db/rabbitmq_helo_whatsapp.js')
    const MQ = {}
    __constants.MQ['fbOutgoing_' + userId + '_' + phoneNumber] = JSON.parse(JSON.stringify(__constants.MQ.fbOutgoing))
    __constants.MQ['fbOutgoingSync_' + userId + '_' + phoneNumber] = JSON.parse(JSON.stringify(__constants.MQ.fbOutgoingSync))
    __constants.MQ['webhookHeloCampaign_' + userId + '_' + phoneNumber] = JSON.parse(JSON.stringify(__constants.MQ.webhookHeloCampaign))
    __constants.MQ['webhookQueue_' + userId + '_' + phoneNumber] = JSON.parse(JSON.stringify(__constants.MQ.webhookQueue))
    __constants.MQ['pre_process_message_campaign_' + userId + '_' + phoneNumber] = JSON.parse(JSON.stringify(__constants.MQ.pre_process_message_campaign))
    __constants.MQ['process_message_campaign_' + userId + '_' + phoneNumber] = JSON.parse(JSON.stringify(__constants.MQ.process_message_campaign))
    __constants.MQ['fbOutgoing_' + userId + '_' + phoneNumber].q_name = __constants.MQ.fbOutgoing.q_name + '_' + userId + '_' + phoneNumber
    __constants.MQ['fbOutgoingSync_' + userId + '_' + phoneNumber].q_name = __constants.MQ.fbOutgoingSync.q_name + '_' + userId + '_' + phoneNumber
    __constants.MQ['webhookHeloCampaign_' + userId + '_' + phoneNumber].q_name = __constants.MQ.webhookHeloCampaign.q_name + '_' + userId + '_' + phoneNumber
    __constants.MQ['webhookQueue_' + userId + '_' + phoneNumber].q_name = __constants.MQ.webhookQueue.q_name + '_' + userId + '_' + phoneNumber
    __constants.MQ['pre_process_message_campaign_' + userId + '_' + phoneNumber].q_name = __constants.MQ.pre_process_message_campaign.q_name + '_' + userId + '_' + phoneNumber
    __constants.MQ['process_message_campaign_' + userId + '_' + phoneNumber].q_name = __constants.MQ.process_message_campaign.q_name + '_' + userId + '_' + phoneNumber
    MQ['fbOutgoing_' + userId + '_' + phoneNumber] = JSON.parse(JSON.stringify(__constants.MQ.fbOutgoing))
    MQ['fbOutgoingSync_' + userId + '_' + phoneNumber] = JSON.parse(JSON.stringify(__constants.MQ.fbOutgoingSync))
    MQ['webhookHeloCampaign_' + userId + '_' + phoneNumber] = JSON.parse(JSON.stringify(__constants.MQ.webhookHeloCampaign))
    MQ['webhookQueue_' + userId + '_' + phoneNumber] = JSON.parse(JSON.stringify(__constants.MQ.webhookQueue))
    MQ['pre_process_message_campaign_' + userId + '_' + phoneNumber] = JSON.parse(JSON.stringify(__constants.MQ.pre_process_message_campaign))
    MQ['process_message_campaign_' + userId + '_' + phoneNumber] = JSON.parse(JSON.stringify(__constants.MQ.process_message_campaign))
    MQ['fbOutgoing_' + userId + '_' + phoneNumber].q_name = __constants.MQ.fbOutgoing.q_name + '_' + userId + '_' + phoneNumber
    MQ['fbOutgoingSync_' + userId + '_' + phoneNumber].q_name = __constants.MQ.fbOutgoingSync.q_name + '_' + userId + '_' + phoneNumber
    MQ['webhookHeloCampaign_' + userId + '_' + phoneNumber].q_name = __constants.MQ.webhookHeloCampaign.q_name + '_' + userId + '_' + phoneNumber
    MQ['webhookQueue_' + userId + '_' + phoneNumber].q_name = __constants.MQ.webhookQueue.q_name + '_' + userId + '_' + phoneNumber
    MQ['pre_process_message_campaign_' + userId + '_' + phoneNumber].q_name = __constants.MQ.pre_process_message_campaign.q_name + '_' + userId + '_' + phoneNumber
    MQ['process_message_campaign_' + userId + '_' + phoneNumber].q_name = __constants.MQ.process_message_campaign.q_name + '_' + userId + '_' + phoneNumber
    if (MQ && Object.keys(MQ).length > 0) {
      for (const queueIndex in MQ) {
        const queue = MQ[queueIndex]
        if (queue.createChannel) {
          __db.rabbitmqHeloWhatsapp.createChannelsForQueue(queue)
        }
      }
      return true
    } else {
      throw new Error('queue or exchange not define.')
    }
  }

  activateChatBot (wabaData, headers) {
    const chatBotActivated = q.defer()
    const http = new HttpService(60000)
    const inputRequest = {
      userId: wabaData.userId,
      chatBotActivated: true
    }
    __logger.info('calling chatbot toggle api', inputRequest, headers, __config.base_url + __constants.INTERNAL_END_POINTS.toggleChatbot)
    const reqHeaders = { authorization: headers.authorization, 'User-Agent': __constants.INTERNAL_CALL_USER_AGENT }
    http.Patch(inputRequest, __config.base_url + __constants.INTERNAL_END_POINTS.toggleChatbot, reqHeaders, 'body')
      .then(data => {
        __logger.info('post chatbot toggle apiresponse', data)
        const statusCode = data.code || 500
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
    this.internalFunctions.createQueuePerUser(wabaData.userId, wabaData.phoneCode + wabaData.phoneNumber)
  }

  trigger (wabaData, status, headers) {
    __logger.info('hooks trigger called', wabaData, status, headers)
    if (status === __constants.WABA_PROFILE_STATUS.accepted.statusCode) this.onAccepted(wabaData, headers)
  }
}
