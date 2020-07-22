const q = require('q')
const __config = require('../../../config')
const __constants = require('../../../config/constants')
const request = require('request')

const isTyntecOptinMessage = (content, optinText) => {
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
  const audienceData = q.defer()
  const url = __config.base_url + __constants.INTERNAL_END_POINTS.addupdateAudience
  const audienceDataToBePosted = [{
    phoneNumber: inputPayload.from,
    channel: __constants.DELIVERY_CHANNEL.whatsapp,
    optinSourceId: __config.optinMessageSource,
    name: inputPayload.whatsapp && inputPayload.whatsapp.senderName ? inputPayload.whatsapp.senderName : ''
  }]
  if (!audienceDataToBePosted.name) delete audienceDataToBePosted.name
  if (__config.provider_config[redisData.serviceProviderId].name === 'tyntec') {
    isOptinMessage = isTyntecOptinMessage
  }
  isOptinMessage(inputPayload.content, redisData.optinText)
    .then(isoptin => {
      audienceDataToBePosted[0].optin = isoptin
      const options = {
        url,
        body: audienceDataToBePosted,
        headers: { Authorization: __config.internalApiCallToken },
        json: true
      }
      console.log('all options', options)
      request.post(options, (err, httpResponse, body) => {
        console.log('hereeeeeeeeeeeeeeeeeeeeee', body)
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
