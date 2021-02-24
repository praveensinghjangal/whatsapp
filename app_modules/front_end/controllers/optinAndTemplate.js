const q = require('q')
const ValidatonService = require('../services/validation')
const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const HttpService = require('../../../lib/http_service')
const __config = require('../../../config')

/**
 * @namespace -GET-SET-OPTIN-&-Template-Controller-
 * @description This Controller frontend functionality like get optin & template and add update optin & template
 */

const getOptinText = authToken => {
  const apiCalled = q.defer()
  const http = new HttpService(60000)
  const headers = { Authorization: authToken }
  __logger.info('calling get business profile', headers)
  http.Get(__config.base_url + __constants.INTERNAL_END_POINTS.businessProfile, headers)
    .then(data => {
      __logger.info('get business profile api response', data)
      data = data.body || data
      if (data && data.code && data.code === 2000) {
        apiCalled.resolve(data.data.optinText || '')
      } else {
        apiCalled.reject({ type: __constants.RESPONSE_MESSAGES.WABA_ACCOUNT_NOT_EXISTS, err: data.error })
      }
    })
    .catch(err => apiCalled.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err }))
  return apiCalled.promise
}

const callSetTemplateId = (templateId, defaultmessageData, serviceFulfillmentMessage, continuationTransactionMessage, authToken) => {
  const apiCalled = q.defer()
  const http = new HttpService(60000)
  const inputRequest = {
    defaultMessage: defaultmessageData || '.',
    templateId: templateId,
    serviceFulfillmentMessage,
    continuationTransactionMessage
  }
  const headers = { Authorization: authToken }
  __logger.info('calling set metadata api', inputRequest, headers)
  http.Post(inputRequest, 'body', __config.chatAppUrl + __constants.CHAT_APP_ENDPOINTS.metadata, headers)
    .then(data => {
      __logger.info('post metadata api response', data)
      data = data.body || data
      if (data && data.code && data.code === 2000) {
        apiCalled.resolve(data)
      } else {
        apiCalled.reject({ type: __constants.RESPONSE_MESSAGES.META_DATA_NOT_SET, err: data.error })
      }
    })
    .catch(err => apiCalled.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err }))
  return apiCalled.promise
}

const getTemplateIdData = authToken => {
  const apiCalled = q.defer()
  const http = new HttpService(60000)
  const headers = { Authorization: authToken }
  __logger.info('calling get metadata', headers)
  http.Get(__config.chatAppUrl + __constants.CHAT_APP_ENDPOINTS.metadata, headers)
    .then(data => {
      __logger.info('get metadata api response', data)
      data = data.body || data
      __logger.info('datatatattatatatatat', { data })
      if (data && data.code && data.code === 2000) {
        apiCalled.resolve(data)
      } else {
        apiCalled.reject({ type: __constants.RESPONSE_MESSAGES.META_DATA_NOT_FOUND, err: data.error })
      }
    })
    .catch(err => apiCalled.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err }))
  return apiCalled.promise
}

const callSetOptinTextApi = (optinText, authToken) => {
  const apiCalled = q.defer()
  const http = new HttpService(60000)
  const inputRequest = {
    optinText: optinText
  }
  const headers = { Authorization: authToken }
  __logger.info('calling set optin text api', inputRequest, headers)
  http.Post(inputRequest, 'body', __config.base_url + __constants.INTERNAL_END_POINTS.addUpdateOptinText, headers)
    .then(data => {
      __logger.info('set optin api response', data)
      data = data.body || data
      __logger.info('datatatattatatatatat', { data })
      if (data && data.code && data.code === 2000) {
        apiCalled.resolve(data)
      } else {
        apiCalled.reject({ type: __constants.RESPONSE_MESSAGES.OPTIN_NOT_SET, err: data.error })
      }
    })
    .catch(err => apiCalled.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err }))
  return apiCalled.promise
}

/**
 * @memberof -GET-SET-OPTIN-&-Template-Controller-
 * @name GetOptinAndTemplate
 * @path {GET} /frontend/addUpdateOptinMessageAndTemplate
 * @description Bussiness Logic :- This API returns the template data and optin text
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=Success  - Response got successfully.
 * @response {string} metadata.data.templateId - Returns the template ID
 * @response {string} metadata.data.optinText - Returns the optin Text Data
 * @code {200} if the msg is success than return all the templateId, optinText in array of json.
 * @author Danish Galiyara 11th September, 2020
 * *** Last-Updated :- Arjun Bhole 23rd October,2020 ***
 */

const getOptinAndTemplate = (req, res) => {
  __logger.info('Get Optin And Template API called', req.body)
  const resData = {}
  getTemplateIdData(req.headers.authorization)
    .then(metaData => {
      __logger.info('metaData then 1', { metaData })
      resData.templateId = metaData.data.optinTemplateId
      return getOptinText(req.headers.authorization)
    })
    .then(optinText => {
      __logger.info('optinText then 2', { optinText })
      resData.optinText = optinText
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: resData })
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

/**
 * @memberof -GET-SET-OPTIN-&-Template-Controller-
 * @name AddUpdateOptinAndTemplate
 * @path {POST} /frontend/addUpdateOptinMessageAndTemplate
 * @description Bussiness Logic :- This API is a wrapper of setting up the templateId with their otpin text (it will update the data or insert the data)
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
 * @body {string}  templateId=register_thanks_converse - Provide the valid template Id
 * @body {string}  optinText=helloviva1 - Provide the valid optin text.
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=Success  -  templateId and optinText updated or added successfully.
 * @code {200} if the msg is success than your request is added or updated successfully.
 * @author Danish Galiyara 11th September, 2020
 * *** Last-Updated :- Arjun Bhole 23rd October,2020 ***
 */

const addUpdateOptinAndTemplate = (req, res) => {
  __logger.info('Add Update Optin And Template API called', req.body)
  const validate = new ValidatonService()
  validate.addUpdateOptinAndTemplate(req.body)
    .then(data => callSetOptinTextApi(req.body.optinText, req.headers.authorization))
    .then(data => getTemplateIdData(req.headers.authorization))
    .then(data => callSetTemplateId(req.body.templateId, data.data.chatDefaultMessage, data.data.serviceFulfillmentMessage, data.data.continuationTransactionMessage, req.headers.authorization))
    .then(data => __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: req.body }))
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

module.exports = { post: addUpdateOptinAndTemplate, get: getOptinAndTemplate }
