const ValidatonService = require('../services/validation')
const AudienceService = require('../services/dbData')
const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const q = require('q')
const rejectionHandler = require('../../../lib/util/rejectionHandler')
// const fetchTemplates = require('../../templates/controllers/fetchTemplates')
const HttpService = require('../../../lib/http_service')
const integrationService = require('../../../app_modules/integration')
const _ = require('lodash')

/**
 * @namespace -Whatsapp-Audience-Controller(Add/Update)-
 * @description API’s related to whatsapp audience.
 */

/**
 *  @name getApprovedTemplate
 * @description API bring the approved templated
 */
function getApprovedTemplate (authToken) {
  const http = new HttpService(60000)
  const templateData = q.defer()
  const header = {
    Authorization: authToken
  }
  http.Get('http://localhost:3000/helowhatsapp/api/templates?messageTemplateStatusId=1d9d14ca-d3ec-4bea-b3de-05fcb8ceabd9', header)
    .then(data => {
      if (data && data.data && data.data.length) {
        templateData.resolve(true)
      } else {
        templateData.resolve(false)
      }
      // return templateData.resolve(data)
    })
    .catch(err => {
      return templateData.reject(err)
    })
  return templateData.promise
}

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
  __logger.info('add update audience API called', req.body)
  __logger.info('add update audience API called', req.user)
  const userId = req.user && req.user.user_id ? req.user.user_id : '0'
  const authToken = req.headers.authorization
  const maxTpsToProvider = req.user && req.user.maxTpsToProvider ? req.user.maxTpsToProvider : 10
  getApprovedTemplate(authToken)
    .then(templatesExists => {
      if (!templatesExists) {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: __constants.RESPONSE_MESSAGES.EXPECT_ARRAY })
      }
      return markFacebookVerifiedOfValidNumbers(req.body, userId, req.user.wabaPhoneNumber, req.user.providerId, maxTpsToProvider)
    })
    .then(({ oldDataOfAudiences, newDataOfAudiences, verifiedAudiences }) => {
      return processRecordInBulk(userId, oldDataOfAudiences, newDataOfAudiences)
    })
    .then(data => {
      __logger.info('processRecordInBulk::', { data })
      __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: data })
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err || err })
    })
}

function updateAudienceData (inputData, oldAudienceData) {
  const audienceData = q.defer()
  const validate = new ValidatonService()
  const audienceService = new AudienceService()
  validate.updateAudience(inputData)
    .then(() => audienceService.updateAudienceDataService(inputData, oldAudienceData))
    .then(data => audienceData.resolve(data))
    .catch(err => {
      __logger.error('error: ', err)
      audienceData.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
    })
  return audienceData.promise
}

const singleRecordProcess = (data, userId, oldData = null) => {
  __logger.info('Inside singleRecordProcess :: ', { data }, userId)
  const dataSaved = q.defer()
  const validate = new ValidatonService()
  const audienceService = new AudienceService()
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
        return updateAudienceData(data, audienceData)
      } else {
        return audienceService.addAudienceDataService(data, audienceData)
      }
    })
    .then(data => dataSaved.resolve(data))
    .catch(err => {
      __logger.info('Err', err)
      dataSaved.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
    })
  return dataSaved.promise
}

const processRecordInBulk = (userId, oldDataOfAudiences, newDataOfAudiences) => {
  let p = q()
  const thePromises = []
  // if (!data.length || data.length > 10000) {
  if (!newDataOfAudiences.length) {
    return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: __constants.RESPONSE_MESSAGES.EXPECT_ARRAY })
  }
  newDataOfAudiences.forEach((singleObject, index) => {
    p = p.then(() => singleRecordProcess(singleObject, userId, oldDataOfAudiences[index]))
      .catch(err => err)
    thePromises.push(p)
  })
  return q.all(thePromises)
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
  __logger.info('inside markOptinByPhoneNumber', req.body)
  const userId = req.user && req.user.user_id ? req.user.user_id : '0'
  const input = req.body
  // TODO: if number is invalid then ? save optin as false and isFacebookVerified as false ? or just return the function from here
  input.optin = true
  input.channel = __constants.DELIVERY_CHANNEL.whatsapp
  const validate = new ValidatonService()
  validate.checkOptinInput(input)
    .then(data => singleRecordProcess(input, userId))
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
  if (!audiences.length) {
    return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: __constants.RESPONSE_MESSAGES.EXPECT_ARRAY })
  }
  const phoneNumbers = audiences.map(audienceObj => {
    return audienceObj.phoneNumber
  })
  const audiencesOnlyToBeUpdated = [] // these audiences will only be updated, and saveOptin api will not be called for these.
  const audiencesToBeVerified = []
  const phoneNumbersToBeVerified = []
  const audienceService = new AudienceService()
  audienceService.getAudienceTableDataByPhoneNumber(phoneNumbers, userId, wabaPhoneNumber)
    .then(audiencesData => {
      audiencesData.map(audience => {
        if (audience.isFacebookVerified) {
          audiencesOnlyToBeUpdated.push(audience)
        } else {
          audiencesToBeVerified.push({ ...audience, isFacebookVerified: true })
          phoneNumbersToBeVerified.push(`+${audience.phoneNumber}`)
        }
      })
      const audienceService = new integrationService.Audience(providerId, maxTpsToProvider, userId)
      return audienceService.saveOptin(wabaPhoneNumber, phoneNumbersToBeVerified)
    })
    .then(optinData => {
      const verifiedAudiences = [...audiencesToBeVerified]
      const invalidAudiences = []
      if (optinData && optinData.length !== 0) {
        // it means invalid numbers are present
        optinData.map(opt => {
          //  remove "opt.input" from verifiedAudiences and push them into invalidAudiences
          const audience = _.remove(verifiedAudiences, (aud) => {
            return aud.phoneNumber === opt.input
          })
          if (audience.length) {
            audience.map(aud => {
              invalidAudiences.push({ ...aud, isFacebookVerified: false })
            })
          }
        })
      }
      const oldAudiences = [...audiencesOnlyToBeUpdated, ...verifiedAudiences, ...invalidAudiences]
      const oldDataOfAudiences = []
      audiences = audiences.map(aud => {
        const found = _.find(oldAudiences, (a) => {
          return a.phoneNumber === aud.phoneNumber
        })
        if (found !== undefined) {
          // pushing the old data so that oldDataOfAudiences and newDataOfAudiences's data have same position in the array
          oldDataOfAudiences.push(found)
          return { ...aud, isFacebookVerified: found.isFacebookVerified }
        } else {
          return aud
        }
      })
      markAsVerified.resolve({ oldDataOfAudiences: oldDataOfAudiences, newDataOfAudiences: audiences, verifiedAudiences })
    })
    .catch(err => {
      markAsVerified.reject({ type: err.type, err: err.err || err })
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
    .then(data => singleRecordProcess(input, userId))
    .then(data => {
      __logger.info('markOptOutByPhoneNumber then 2')
      for (var key in data) {
        if (key !== 'optin') {
          delete data[key]
        }
      }
      __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: data })
    })
    .catch(err => __util.send(res, { type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err }))
}

module.exports = {
  addUpdateAudienceData,
  markOptinByPhoneNumberAndAddOptinSource,
  markOptOutByPhoneNumber
}
