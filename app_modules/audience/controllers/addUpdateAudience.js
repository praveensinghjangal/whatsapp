const ValidatonService = require('../services/validation')
const AudienceService = require('../services/dbData')
const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const q = require('q')
const rejectionHandler = require('../../../lib/util/rejectionHandler')

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
  __logger.info('add update audience API called', req.body)
  __logger.info('add update audience API called', req.user)
  const userId = req.user && req.user.user_id ? req.user.user_id : '0'

  processRecordInBulk(req.body, userId)
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

const singleRecordProcess = (data, userId) => {
  __logger.info('Inside singleRecordProcess :: ', { data }, userId)
  const dataSaved = q.defer()
  const validate = new ValidatonService()
  const audienceService = new AudienceService()
  validate.addAudience(data)
    .then(data => audienceService.getAudienceTableDataByPhoneNumber(data.phoneNumber, userId, data.wabaPhoneNumber))
    .then(audienceData => {
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

const processRecordInBulk = (data, userId) => {
  let p = q()
  const thePromises = []
  if (!data.length) {
    return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: __constants.RESPONSE_MESSAGES.EXPECT_ARRAY })
  }
  data.forEach(singleObject => {
    p = p.then(() => singleRecordProcess(singleObject, userId))
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
