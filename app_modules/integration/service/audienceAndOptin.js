const q = require('q')
const __config = require('../../../config')
const __logger = require('../../../lib/logger')
const __constants = require('../../../config/constants')
const request = require('request')
const setUserConfig = require('../../../middlewares/setUserConfig')
const checkOptinMessage = (content, optinText) => {
  __logger.info('checkOptinMessage::>>>>>>>>>>>>>..')
  const isOptin = q.defer()
  if (content && content.contentType === 'text' && content.text && optinText) {
    content.text = content.text.trim()
    if (content.text.length === optinText.length && content.text.toLowerCase() === optinText.toLowerCase()) {
      isOptin.resolve(true)
    } else {
      isOptin.resolve(false)
    }
  } else {
    isOptin.resolve(false)
  }
  return isOptin.promise
}

let isOptinMessage = () => {
  const isOptin = q.defer()
  isOptin.resolve(false)
  return isOptin.promise
}

function addAudienceAndOptin (inputPayload, redisData) {
  __logger.info('addAudienceAndOptin::>>>>>>>>>>>>>..')
  const audienceData = q.defer()
  const url = __config.base_url + __constants.INTERNAL_END_POINTS.addupdateAudience
  const audienceDataToBePosted = [{
    phoneNumber: inputPayload.from,
    channel: __constants.DELIVERY_CHANNEL.whatsapp,
    name: inputPayload.whatsapp && inputPayload.whatsapp.senderName ? inputPayload.whatsapp.senderName : '',
    isIncomingMessage: true,
    wabaPhoneNumber: redisData.id
  }]
  if (!audienceDataToBePosted[0].name) delete audienceDataToBePosted[0].name
  const providers = ['tyntec', 'facebook']
  if (providers.indexOf(__config.provider_config[redisData.serviceProviderId].name) !== -1) {
    isOptinMessage = checkOptinMessage
  }
  isOptinMessage(inputPayload.content, redisData.optinText)
    .then(isoptin => {
      if (isoptin) {
        audienceDataToBePosted[0].optin = true
        audienceDataToBePosted[0].optinSourceId = __config.optinSource.message
      }
      // const authService = new SetUserConfig()
      return setUserConfig.getUserData(redisData.userId)
    }).then(data => {
      const apiToken = data.authToken

      const options = {
        url,
        body: audienceDataToBePosted,
        headers: { Authorization: apiToken },
        json: true
      }
      __logger.info('addAudienceAndOptin::optionssssssssssssssssssssss', options)
      request.post(options, (err, httpResponse, body) => {
        if (err) {
          audienceData.reject(err)
        } else {
          audienceData.resolve(true)
        }
      })
    })
    .catch(err => audienceData.reject(err))
  return audienceData.promise
}

module.exports = addAudienceAndOptin
