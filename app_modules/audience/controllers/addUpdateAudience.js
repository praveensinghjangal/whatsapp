const ValidatonService = require('../services/validation')
const AudienceService = require('../services/dbData')
const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const __config = require('../../../config')
const __logger = require('../../../lib/logger')
const q = require('q')
const rejectionHandler = require('../../../lib/util/rejectionHandler')
// const fetchTemplates = require('../../templates/controllers/fetchTemplates')
const HttpService = require('../../../lib/http_service')
const integrationService = require('../../../app_modules/integration')
const _ = require('lodash')
const qalllib = require('qalllib')
const RedisService = require('../../../lib/redis_service/redisService')
const rabbitmqHeloWhatsapp = require('../../../lib/db').rabbitmqHeloWhatsapp
const validUrl = require('../../../lib/util/url')
// const { template } = require('lodash')

/**
 * @namespace -Whatsapp-Audience-Controller(Add/Update)-
 * @description API’s related to whatsapp audience.
 */

/**
 * @memberof -Whatsapp-Audience-Controller(Add/Update)-
 * @name AddUpdateAudienceData
 * @path {POST} /audience
 * @description Bussiness Logic :- API to add or update audience.To add audience, do not pass audienceID to update template pass audience ID along with parameters to update.
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
  <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/audience/AddUpdateAudienceData|AddUpdateAudienceData}
 * @body {string}  phoneNumber
 * @body {string}  channel=whatsapp
 * @body {boolean}  optin=true
 * @body {string}  optinSourceId
 * @body {string}  segmentId
 * @body {string}  chatFlowId=null
 * @body {string}  name
 * @body {string}  email
 * @body {string}  gender
 * @body {string}  country
 * @response {string} ContentType=application/json - Response content type.
 * @response {object} metadata.data - It will return the object containing audience id and other details.
 * @code {200} if the msg is success than it Returns Status of audience info completion.
 * @author Arjun Bhole 9th July, 2020
 * *** Last-Updated :- Arjun Bhole 23th October, 2020 ***
 */
const addUpdateAudienceData = (req, res) => {
  const userId = req.user && req.user.user_id ? req.user.user_id : '0'
  const authToken = req.headers.authorization
  const maxTpsToProvider = req.user && req.user.maxTpsToProvider ? req.user.maxTpsToProvider : 10
  let optinTemplateId = ''
  if (req.body && req.body.length > __constants.ADD_UPDATE_TEMPLATE_LIMIT) {
    return __util.send(res, { type: __constants.RESPONSE_MESSAGES.UPDATE_TEMPLATE_LIMIT_EXCEEDED, err: {} })
  }
  if (!req.body.length) {
    return __util.send(res, { type: __constants.RESPONSE_MESSAGES.AUDIENCE_REQUIRED })
  }
  const redisService = new RedisService()
  redisService.getOptinTemplateId(req.user.wabaPhoneNumber, authToken)
    .then(data => {
      if (data && data.optinTemplateId) {
        optinTemplateId = data.optinTemplateId
        return markFacebookVerifiedOfValidNumbers(req.body, userId, req.user.wabaPhoneNumber, req.user.providerId, maxTpsToProvider)
      }
      return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.APPROVED_TEMPLATE_NOT_FOUND, err: {}, data: {} })
    })
    .then(({ newDataOfAudiences, mappingOfOldAndNewDataBasedOnPhoneNumber, verifiedAudiences }) => {
      if (verifiedAudiences.length) {
        return processInBulkAndSendSuccessOptin(userId, newDataOfAudiences, mappingOfOldAndNewDataBasedOnPhoneNumber, verifiedAudiences, authToken, req.user.wabaPhoneNumber, optinTemplateId, req.userConfig.audienceWebhookUrl)
      } else {
        return processRecordInBulk(userId, newDataOfAudiences, mappingOfOldAndNewDataBasedOnPhoneNumber, req.userConfig.audienceWebhookUrl)
      }
    })
    .then(data => {
      __logger.info('processRecordInBulk response::', { data })
      __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: data })
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
    })
}

function processInBulkAndSendSuccessOptin (userId, newDataOfAudiences, mappingOfOldAndNewDataBasedOnPhoneNumber, verifiedAudiences, authToken, wabaPhoneNumber, optinTemplateId, audienceWebhookUrl) {
  const deferred = q.defer()
  __logger.info('Inside processInBulkAndSendSuccessOptin')
  processRecordInBulk(userId, newDataOfAudiences, mappingOfOldAndNewDataBasedOnPhoneNumber, audienceWebhookUrl)
    .then(processResponse => {
      // processResponse is an array of audiences that got updated.
      return sendOptinSuccessMessageToVerifiedAudiences(verifiedAudiences, processResponse, newDataOfAudiences, authToken, wabaPhoneNumber, optinTemplateId)
    })
    .then(resp => {
      deferred.resolve(resp)
    }).catch(err => {
      deferred.reject(err)
    })
  return deferred.promise
}

const getTemplateBodyForOptinMessage = (to, countryCode, from, templateId) => {
  return {
    to: to,
    channels: [
      'whatsapp'
    ],
    countryCode: countryCode,
    whatsapp: {
      contentType: 'template',
      from: from,
      template: {
        templateId: templateId,
        language: {
          policy: 'deterministic',
          code: 'en'
        }
      }
    }
  }
}

const sendOptinSuccessMessageToVerifiedAudiences = (verifiedAudiences, updatedAudiences, newDataOfAudiences, authToken, wabaPhoneNumber, optinTemplateId) => {
  // verified audiences should be present in updatedAudiences.
  const apiCalled = q.defer()
  __logger.info('inside sendOptinSuccessMessageToVerifiedAudiences', { verifiedAudiences, updatedAudiences })
  // get optin template id..
  const listOfBodies = []
  verifiedAudiences.forEach(verifiedAud => {
    const found = _.find(updatedAudiences, (aud) => {
      return aud.phoneNumber === verifiedAud.phoneNumber
    })
    if (found !== undefined || (found && Object.keys(found).length !== 0)) {
      if (!verifiedAud.isIncomingMessage) {
        const body = getTemplateBodyForOptinMessage(verifiedAud.phoneNumber, found.countryCode, wabaPhoneNumber, optinTemplateId)
        listOfBodies.push(body)
      }
    }
  })
  if (listOfBodies.length === 0) {
    // dont send message
    apiCalled.resolve({ resolve: [], reject: [] })
    return apiCalled.promise
  }
  const batchesOfBodies = _.chunk(listOfBodies, __constants.CHUNK_SIZE_FOR_SEND_SUCCESS_OPTIN_MESSAGE)
  qalllib.qASyncWithBatch(sendOptinMessage, batchesOfBodies, __constants.BATCH_SIZE_FOR_SEND_SUCCESS_OPTIN_MESSAGE, authToken)
    .then(data => {
      if (data.reject.length) {
        return apiCalled.reject(data.reject[0])
      }
      // let resolvedData = []
      // data.resolve.map(res => {
      //   resolvedData = [...resolvedData, res]
      // })
      // return apiCalled.resolve(resolvedData)

      return apiCalled.resolve(updatedAudiences)
    }).catch(err => {
      return apiCalled.reject(err)
    })
    .done()
  return apiCalled.promise
}

const sendOptinMessage = (body, authToken) => {
  const apiCalled = q.defer()
  __logger.info('inside sendOptinMessage. It calls sendMessageToQueue api ', body)
  const http = new HttpService(60000)
  const url = __config.base_url + __constants.INTERNAL_END_POINTS.sendMessageToQueue
  const headers = { 'Content-Type': 'application/json', Authorization: authToken, 'User-Agent': __constants.INTERNAL_CALL_USER_AGENT }
  http.Post(body, 'body', url, headers)
    .then(data => {
      return apiCalled.resolve(data.body)
    })
    .catch(err => {
      return apiCalled.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
    })
  return apiCalled.promise
}

function updateAudienceData (inputData, oldAudienceData) {
  const audienceData = q.defer()
  __logger.info('Inside updateAudienceData', { inputData, oldAudienceData })
  const validate = new ValidatonService()
  const audienceService = new AudienceService()
  validate.updateAudience(inputData)
    .then(() => audienceService.updateAudienceDataService(inputData, oldAudienceData))
    .then(data => audienceData.resolve(data))
    .catch(err => {
      __logger.error('error in updateAudience Data: ', err)
      audienceData.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
    })
  return audienceData.promise
}

const singleRecordProcess = (data, userId, oldData = null, audienceWebhookUrl) => {
  __logger.info('Inside singleRecordProcess :: ', { data }, userId)
  const dataSaved = q.defer()
  let addUpdateData
  const validate = new ValidatonService()
  const audienceService = new AudienceService()
  let sendWebhook = false
  validate.addAudience(data)
    .then(data => {
      if (oldData) {
        const old = q.defer()
        old.resolve([oldData])
        return old.promise
      }
      return audienceService.getAudienceTableDataByPhoneNumber([data.phoneNumber], userId, data.wabaPhoneNumber)
    })
    .then(audiencesData => {
      const audienceData = audiencesData[0]
      __logger.info('audienceData:: then 2', { audienceData })
      data.userId = userId
      if (audienceData.audienceId) {
        if (data && data.optin === true) sendWebhook = true
        return updateAudienceData(data, audienceData)
      } else {
        sendWebhook = true
        return audienceService.addAudienceDataService(data, audienceData)
      }
    })
    .then(responseData => {
      addUpdateData = responseData
      data.audienceWebhookUrl = audienceWebhookUrl
      let planPriority

      if (!validUrl.isValid(audienceWebhookUrl) || !sendWebhook) {
        return true
      } else {
        return rabbitmqHeloWhatsapp.sendToQueue(__constants.MQ.audience_webhook, JSON.stringify(data), planPriority)
      }
    })
    .then(data => {
      return dataSaved.resolve(addUpdateData)
    })
    .catch(err => {
      __logger.info('Err', err)
      dataSaved.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
    })
  return dataSaved.promise
}

const processRecordInBulk = (userId, newDataOfAudiences, mappingOfOldAndNewDataBasedOnPhoneNumber, audienceWebhookUrl) => {
  const p = q.defer()
  __logger.info('Inside processRecordInBulk')
  if (!newDataOfAudiences.length) {
    p.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_AUDIENCE, err: {} })
    return p.promise
  }

  // qalllib
  qalllib.qASyncWithBatch(singleRecordProcessForQalllib, newDataOfAudiences, __constants.BATCH_SIZE_FOR_ADD_UPDATE_AUDIENCES, userId, mappingOfOldAndNewDataBasedOnPhoneNumber, audienceWebhookUrl)
    .then(data => {
      if (data.reject.length) {
        return p.reject(data.reject)
      }
      return p.resolve(data.resolve)
    }).catch(err => {
      return p.reject(err)
    })
    .done()
  return p.promise
}

const singleRecordProcessForQalllib = (singleObject, userId, mappingOfOldAndNewDataBasedOnPhoneNumber, audienceWebhookUrl) => {
  const oldData = mappingOfOldAndNewDataBasedOnPhoneNumber[singleObject.phoneNumber].old
  return singleRecordProcess(singleObject, userId, oldData, audienceWebhookUrl)
}

/**
 * @memberof -Whatsapp-Audience-Controller(Add/Update)-
 * @name MarkOptinByPhoneNumberAndAddOptinSource
 * @path {POST} /audience/optin
 * @description Bussiness Logic :- Update optin Status and add optin source id.
 *   API to update optin;
     To update optinSourceId pass optin source ID along with parameters to update
     following are the optin source list :-
     1) Captured via any form/check-box/t&c - 154e25f4-44cd-4a48-984d-dbdce569d2c1
     2) When received by direct optin message on Whatsapp - 28614254-12c6-4f44-aa3c-20cf9e9589cb
     3) Optin added using API - 7ccc5ca2-4a8e-4a97-9b49-c5e258bbf649
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
  <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/audience/markOptinByPhoneNumberAndAddOptinSource|MarkOptinByPhoneNumberAndAddOptinSource}
 * @body {string}  phoneNumber=99999999999 - Provide the valid phone number.
 * @body {string}  optinSourceId=5ad4bfa0-4dd1-433b-a88b-ace8197f8c38 - Provide the valid optin source id
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=Success  - Response got successfully.
 * @response {string} metadata.data.optinSourceId - It will return the object containing optinSourceId and optin.
 * @code {200} if the msg is success than it Returns Status of segment info completion.
 * @author Arjun Bhole 31th July, 2020
 * *** Last-Updated :- Arjun Bhole 23th October, 2020 ***
 */

const markOptinByPhoneNumberAndAddOptinSource = (req, res) => {
  const wabaPhoneNumber = req.user.wabaPhoneNumber
  __logger.info('inside markOptinByPhoneNumberAndAddOptinSource', req.body)
  const userId = req.user && req.user.user_id ? req.user.user_id : '0'
  const maxTpsToProvider = req.user && req.user.maxTpsToProvider ? req.user.maxTpsToProvider : 10
  let oldAudienceData = null
  let optinTemplateId = ''
  const input = req.body
  const authToken = req.headers.authorization
  input.optin = true
  input.channel = __constants.DELIVERY_CHANNEL.whatsapp
  const validate = new ValidatonService()
  validate.checkOptinInput(input)
    .then(data => {
      const redisService = new RedisService()
      return redisService.getOptinTemplateId(req.user.wabaPhoneNumber, authToken)
    })
    .then(data => {
      if (data && data.optinTemplateId) {
        optinTemplateId = data.optinTemplateId
        const audienceService = new AudienceService()
        return audienceService.getAudienceTableDataByPhoneNumber([req.body.phoneNumber], userId, req.user.wabaPhoneNumber)
      } else {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.APPROVED_TEMPLATE_NOT_FOUND, err: {} })
      }
    }).then(audiencesData => {
      if (audiencesData.length === 0) {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.AUDIENCE_REQUIRED, err: __constants.RESPONSE_MESSAGES.NOT_FOUND })
      }

      const optinCalled = q.defer()
      const phoneNumbersToBeVerified = []

      oldAudienceData = audiencesData[0]
      if (oldAudienceData.isFacebookVerified || oldAudienceData.isFacebookVerified === 1) {
      } else {
        phoneNumbersToBeVerified.push(`+${oldAudienceData.phoneNumber}`)
      }
      if (phoneNumbersToBeVerified.length === 0) {
        // already verified
        optinCalled.resolve([])
        return optinCalled.promise
      } else {
        const audienceService = new integrationService.Audience(req.user.providerId, maxTpsToProvider, userId)
        return audienceService.saveOptin(req.user.wabaPhoneNumber, phoneNumbersToBeVerified)
      }
    }).then(optinData => {
      const invalidContacts = optinData.filter(contact => {
        if (contact.status !== __constants.FACEBOOK_RESPONSES.valid.displayName) {
          return true
        }
        return false
      })
      if (invalidContacts && invalidContacts.length !== 0) {
        const notVerified = q.defer()
        // its an invalid number
        input.isFacebookVerified = false
        input.optin = false
        notVerified.resolve([])
        return notVerified.promise
      } else {
        input.isFacebookVerified = true
        input.optin = true
        // send the message
        const listOfBodies = []
        const body = getTemplateBodyForOptinMessage(req.body.phoneNumber, __constants.DEFAULT_COUNTRY_CODE, wabaPhoneNumber, optinTemplateId)
        listOfBodies.push(body)
        // sending message
        return sendOptinMessage(listOfBodies, authToken)
      }
    })
    .then(data => singleRecordProcess(input, userId, oldAudienceData, req.userConfig.audienceWebhookUrl))
    .then(data => {
      __logger.info('markOptinByPhoneNumberAndAddOptinSource then 2')
      for (var key in data) {
        if (key !== 'optin' && key !== 'optinSourceId') {
          delete data[key]
        }
      }
      __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: data })
    })
    .catch(err => __util.send(res, { type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err }))
}

const markFacebookVerifiedOfValidNumbers = (audiences, userId, wabaPhoneNumber, providerId, maxTpsToProvider) => {
  const markAsVerified = q.defer()
  __logger.info('Inside function markFacebookVerifiedOfValidNumbers', { audiences })
  const phoneNumbers = audiences.map(audienceObj => {
    return audienceObj.phoneNumber
  })
  const phoneNumbersToBeVerified = []
  const audienceService = new AudienceService()
  let oldAudiencesData = []
  audienceService.getAudienceTableDataByPhoneNumber(phoneNumbers, userId, wabaPhoneNumber)
    .then(audiencesData => {
      // audiencesData => data that needs to be updated (ie. they're already present in db)
      oldAudiencesData = []
      // adding the new data(to be added in db) in oldAudiencesData
      const reqBodyArray = [...audiences]
      // input body
      reqBodyArray.forEach(bodyAud => {
        // db data
        const found = _.find(audiencesData, (aud) => (bodyAud.phoneNumber === aud.phoneNumber))
        const isDbDataPresent = !!((found !== undefined) || (found && Object.keys(found).length !== 0))
        // "optin" key exists in req body
        if ('optin' in bodyAud) {
          // audience wants to opt in
          if (bodyAud.optin) {
            // aud is present in db
            if (isDbDataPresent) {
              if (found.isFacebookVerified || found.isFacebookVerified === 1) {
                // do nothing, since its already verified
                oldAudiencesData.push({ ...found, isFacebookVerified: true, optin: true })
              } else {
                // verfy it
                oldAudiencesData.push({ ...found, isFacebookVerified: false, optin: true })
                phoneNumbersToBeVerified.push(`+${found.phoneNumber}`)
              }
              // not present in db and needs optin
            } else {
              oldAudiencesData.push({ ...bodyAud, isFacebookVerified: false, optin: true })
              phoneNumbersToBeVerified.push(`+${bodyAud.phoneNumber}`)
            }
            // audience doesnt want to optin / want to remove optin
          } else {
            if (isDbDataPresent) {
              oldAudiencesData.push({ ...found, isFacebookVerified: false, optin: false })
            } else {
              oldAudiencesData.push({ ...bodyAud, isFacebookVerified: false, optin: false })
            }
          }
          // "optin" key is not present in the body. So check db data.
        } else {
          // aud is already present in db.
          if (isDbDataPresent) {
            if (found.optin) {
              if (found.isFacebookVerified || found.isFacebookVerified === 1) {
                oldAudiencesData.push({ ...found, isFacebookVerified: true, optin: true })
              } else {
                // db optin is true and is not verified yet, then send a message
                oldAudiencesData.push({ ...found, isFacebookVerified: false, optin: true })
                phoneNumbersToBeVerified.push(`+${found.phoneNumber}`)
              }
            } else {
              // if optin in db is false, do nothing.
              oldAudiencesData.push({ ...found, isFacebookVerified: false, optin: false })
            }
          } else {
            // if db data is not present, push it into array. optin=> set to false because optin not sepecified in body and aud is new.
            // oldAudiencesData.push({ ...bodyAud, isFacebookVerified: false, optin: false })
            oldAudiencesData.push({ ...bodyAud, isFacebookVerified: false, optin: false })
            // phoneNumbersToBeVerified.push(`+${bodyAud.phoneNumber}`)
          }
        }
      })
      const audienceService = new integrationService.Audience(providerId, maxTpsToProvider, userId)
      return audienceService.saveOptin(wabaPhoneNumber, phoneNumbersToBeVerified)
    })
    .then(optinData => {
      const newDataOfAudiences = []
      let mappingOfOldAndNewDataBasedOnPhoneNumber = {}
      const verifiedAudiences = []
      const invalidAudiences = []
      for (let i = 0; i < oldAudiencesData.length; i++) {
        const oldAud = oldAudiencesData[i]
        const newAud = _.find(audiences, aud => {
          return aud.phoneNumber === oldAud.phoneNumber
        })
        let optinValue
        if (optinData && optinData.length !== 0) {
          optinValue = _.find(optinData, (opt) => {
            return opt.input === `+${oldAud.phoneNumber}`
          })
        }
        if (optinValue) {
          // phone number was sent for verification. it means, optin=> true & isFacebookVerified=> false previously.
          if (optinValue.status !== __constants.FACEBOOK_RESPONSES.valid.displayName) {
            // invalid number
            invalidAudiences.push({ ...oldAud, isFacebookVerified: false, optin: oldAud.optin, isIncomingMessage: newAud.isIncomingMessage })
            mappingOfOldAndNewDataBasedOnPhoneNumber = { ...mappingOfOldAndNewDataBasedOnPhoneNumber, [oldAud.phoneNumber]: { new: { ...newAud, isFacebookVerified: false, optin: oldAud.optin }, old: { ...oldAud, isFacebookVerified: false, isIncomingMessage: newAud.isIncomingMessage } } }
            newDataOfAudiences.push({ ...newAud, isFacebookVerified: false, optin: oldAud.optin })
          } else {
            verifiedAudiences.push({ ...oldAud, isFacebookVerified: true, optin: oldAud.optin, isIncomingMessage: newAud.isIncomingMessage })
            newDataOfAudiences.push({ ...newAud, isFacebookVerified: true, optin: oldAud.optin })
            mappingOfOldAndNewDataBasedOnPhoneNumber = { ...mappingOfOldAndNewDataBasedOnPhoneNumber, [oldAud.phoneNumber]: { new: { ...newAud, isFacebookVerified: true, optin: oldAud.optin }, old: { ...oldAud, isFacebookVerified: true, isIncomingMessage: newAud.isIncomingMessage } } }
          }
        } else {
          newDataOfAudiences.push({ ...newAud, isFacebookVerified: oldAud.isFacebookVerified, optin: oldAud.optin })
          mappingOfOldAndNewDataBasedOnPhoneNumber = { ...mappingOfOldAndNewDataBasedOnPhoneNumber, [oldAud.phoneNumber]: { new: { ...newAud, isFacebookVerified: oldAud.isFacebookVerified, optin: oldAud.optin }, old: { ...oldAud, isFacebookVerified: oldAud.isFacebookVerified, optin: oldAud.optin, isIncomingMessage: newAud.isIncomingMessage } } }
        }
      }
      markAsVerified.resolve({ newDataOfAudiences: newDataOfAudiences, mappingOfOldAndNewDataBasedOnPhoneNumber, verifiedAudiences })
    })
    .catch(err => {
      markAsVerified.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
    })
  return markAsVerified.promise
}

/**
 * @memberof -Whatsapp-Audience-Controller(Add/Update)-
 * @name MarkOptOutByPhoneNumber
 * @path {POST} /audience/optout
 * @description Bussiness Logic :- Update optin status by phone number.API to update optin by phone Number.

 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
  <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/audience/markOptOutByPhoneNumber|MarkOptOutByPhoneNumber}
 * @body {string}  phoneNumber=99999999999 - Provide the valid phone number.
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=Success  - Response got successfully.
 * @response {sstring} metadata.data.optin - It will return the value optin as "false".
 * @code {200} if the msg is success than it Returns Status of segment info completion.
 * @author Arjun Bhole 31st July, 2020
 * *** Last-Updated :- Arjun Bhole 23th October, 2020 ***
 */

const markOptOutByPhoneNumber = (req, res) => {
  __logger.info('inside markOptOutByPhoneNumber')

  const userId = req.user && req.user.user_id ? req.user.user_id : '0'
  const input = req.body
  input.channel = __constants.DELIVERY_CHANNEL.whatsapp
  input.optin = false

  const validate = new ValidatonService()
  validate.checkPhoneNumberExistService(input)
    .then(data => {
      let oldData
      return singleRecordProcess(input, userId, oldData, req.userConfig.audienceWebhookUrl)
    })
    .then(data => {
      __logger.info('markOptOutByPhoneNumber then 2')
      for (var key in data) {
        if (key !== 'optin') {
          delete data[key]
        }
      }
      __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: data })
    })
    .catch(err => {
      return __util.send(res, { type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
    })
}

module.exports = {
  addUpdateAudienceData,
  markOptinByPhoneNumberAndAddOptinSource,
  markOptOutByPhoneNumber
}
