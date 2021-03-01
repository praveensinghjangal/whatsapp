const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const HttpService = require('../../../lib/http_service')
const __config = require('../../../config')
const ValidatonService = require('../services/validation')

const templateFlowApproval = (req, res) => {
  __logger.info('templateFlowApproval mechnism wrapper API')
  const validate = new ValidatonService()
  req.body.id = (req && req.params && req.params.id) ? req.params.id : null
  req.body.evaluation = (req && req.params && req.params.evaluation) ? req.params.evaluation : null
  validate.templateFlowApproval(req.body)
    .then(data => {
      let url
      const http = new HttpService(60000)
      switch (req.body.type) {
        case __constants.STATIC:
          url = __config.base_url + __constants.INTERNAL_END_POINTS.templateApproval
          url = url.split(':templateId').join(req.body.id || '').split(':evaluationResult').join(req.body.evaluation || '')
          break
        case __constants.INTERACTIVE:
          url = __config.chatAppUrl + __constants.CHAT_APP_ENDPOINTS.evaluationResult
          url = url.split(':flowTopicId').join(req.body.id || '').split(':evaluationResponse').join(req.body.evaluation || '')
          break
        default:
          __util.send(res, { type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, data: {}, err: 'URL is invalid' })
      }
      const headers = {
        Authorization: req.headers.authorization
      }
      return http.Patch(req.body, url, headers)
    })
    .then(data => {
      res.send(data)
    })
    .catch(err => {
      return __util.send(res, {
        type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR,
        err: err.err || err
      })
    })
}

const templateFlowlist = (req, res) => {
  __logger.info('templateFlowlist wrapper API')
  const validate = new ValidatonService()
  validate.templateFlowList(req.query)
    .then(data => {
      let url
      const http = new HttpService(60000)
      switch (req.query.type) {
        case __constants.STATIC:
          url = __config.base_url + __constants.INTERNAL_END_POINTS.templateList
          break
        case __constants.INTERACTIVE:
          url = __config.chatAppUrl + __constants.CHAT_APP_ENDPOINTS.flowList
          break
        default:
          __util.send(res, { type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, data: {}, err: 'URL is invalid' })
      }
      url += '?' + req.originalUrl.split('?')[1]
      const headers = {
        Authorization: req.headers.authorization
      }
      return http.Get(url, headers)
    })
    .then(data => {
      res.send(data)
    })
    .catch(err => {
      return __util.send(res, {
        type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR,
        err: err.err || err
      })
    })
}

const templateFlowInfo = (req, res) => {
  __logger.info('templateFlowInfo wrapper API')
  const validate = new ValidatonService()
  validate.templateFlowInfo(req.query)
    .then(data => {
      if (req.query && req.query.type === __constants.STATIC && !req.query.userId) {
        return __util.send(res, {
          type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST,
          err: 'If type is static then provide a valid userId'
        })
      }
      let url
      const http = new HttpService(60000)
      switch (req.query.type) {
        case __constants.STATIC:
          url = __config.base_url + __constants.INTERNAL_END_POINTS.templateInfo
          url = url.split(':userId').join(req.query.userId || '').split(':templateId').join(req.query.templateId || '')
          break
        case __constants.INTERACTIVE:
          url = __config.chatAppUrl + __constants.CHAT_APP_ENDPOINTS.flowInfo
          url += '?' + req.originalUrl.split('?')[1]
          break
        default:
          __util.send(res, { type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, data: {}, err: 'URL is invalid' })
      }
      const headers = {
        Authorization: req.headers.authorization
      }
      return http.Get(url, headers)
    })
    .then(data => {
      res.send(data)
    })
    .catch(err => {
      return __util.send(res, {
        type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR,
        err: err.err || err
      })
    })
}

module.exports = {
  templateFlowApproval,
  templateFlowlist,
  templateFlowInfo
}
