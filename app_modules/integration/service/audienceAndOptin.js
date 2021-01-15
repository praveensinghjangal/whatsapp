const q = require('q')
const __config = require('../../../config')
const __logger = require('../../../lib/logger')
const __constants = require('../../../config/constants')
const request = require('request')

const isTyntecOptinMessage = (content, optinText) => {
  __logger.info('isTyntecOptinMessage::>>>>>>>>>>>>>..')
  const isOptin = q.defer()
  if (content && content.contentType === 'text' && content.text && optinText) {
    content.text = content.text.trim()
    if (content.text.length === optinText.length && content.text.toLowerCase() === optinText) {
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
  if (!audienceDataToBePosted.name) delete audienceDataToBePosted.name
  if (__config.provider_config[redisData.serviceProviderId].name === 'tyntec') {
    isOptinMessage = isTyntecOptinMessage
  }
  isOptinMessage(inputPayload.content, redisData.optinText)
    .then(isoptin => {
      if (isoptin) {
        audienceDataToBePosted[0].optin = true
        audienceDataToBePosted[0].optinSourceId = __config.optinSource.message
      }
      const options = {
        url,
        body: audienceDataToBePosted,
        headers: { Authorization: __config.internalApiCallToken },
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
