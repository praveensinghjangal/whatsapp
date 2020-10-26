const q = require('q')
const ValidatonService = require('../services/validation')
const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const HttpService = require('../../../lib/http_service')
const __config = require('../../../config')

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

const callSetTemplateId = (templateId, defaultmessageData, authToken) => {
  const apiCalled = q.defer()
  const http = new HttpService(60000)
  const inputRequest = {
    defaultMessage: defaultmessageData || '.',
    templateId: templateId
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

const addUpdateOptinAndTemplate = (req, res) => {
  __logger.info('Add Update Optin And Template API called', req.body)
  const validate = new ValidatonService()
  validate.addUpdateOptinAndTemplate(req.body)
    .then(data => callSetOptinTextApi(req.body.optinText, req.headers.authorization))
    .then(data => getTemplateIdData(req.headers.authorization))
    .then(data => callSetTemplateId(req.body.templateId, data.data.chatDefaultMessage, req.headers.authorization))
    .then(data => __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: req.body }))
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

module.exports = { post: addUpdateOptinAndTemplate, get: getOptinAndTemplate }
