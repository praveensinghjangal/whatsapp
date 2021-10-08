const q = require('q')
const __config = require('../../../config')
const __logger = require('../../../lib/logger')
const __constants = require('../../../config/constants')
const request = require('request')
const integrationService = require('../../../app_modules/integration')

const checkOptinMessage = (content, optinText) => {
  __logger.info('checkOptinMessage::>>>>>>>>>>>>>..')
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

const checkOptinForFacebook = (content, optinText, servicProviderId, maxTpsToProvider, userId, wabaPhoneNumber, phoneNumber) => {
  const isOptin = q.defer()
  checkOptinMessage(content, optinText)
    .then((isoptin) => {
      if (isoptin) {
        const audienceService = new integrationService.Audience(servicProviderId, maxTpsToProvider, userId)
        if (phoneNumber.indexOf('+') === -1) {
          phoneNumber = `+${phoneNumber}`
        }
        audienceService.saveOptin(wabaPhoneNumber, [phoneNumber])
          .then(responseData => {
            if (responseData && responseData.data && responseData.data.length === 0) {
              // invalid phone number array is empty. Therefore it is a valid phone number
              isOptin.resolve(true)
            } else {
              isOptin.resolve(false)
            }
          })
          .catch(err => {
            isOptin.reject(err)
          })
      } else {
        isOptin.resolve(false)
      }
    })
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
  if (__config.provider_config[redisData.serviceProviderId].name === 'tyntec') {
    isOptinMessage = checkOptinMessage
  } else if (__config.provider_config[redisData.serviceProviderId].name === 'facebook') {
    isOptinMessage = checkOptinForFacebook
  }
  isOptinMessage(inputPayload.content, redisData.optinText, redisData.serviceProviderId, redisData.maxTpsToProvider, redisData.userAccountIdByProvider, audienceDataToBePosted[0].wabaPhoneNumber, audienceDataToBePosted[0].phoneNumber)
    .then(isoptin => {
      if (isoptin) {
        audienceDataToBePosted[0].optin = true
        audienceDataToBePosted[0].optinSourceId = __config.optinSource.message
        if (__config.provider_config[redisData.serviceProviderId].name === 'facebook') {
          audienceDataToBePosted[0].isFacebookVerified = true
        }
      } else {
        if (__config.provider_config[redisData.serviceProviderId].name === 'facebook') {
          audienceDataToBePosted[0].isFacebookVerified = false
        }
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
