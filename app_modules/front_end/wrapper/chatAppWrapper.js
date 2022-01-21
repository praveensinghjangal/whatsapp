const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const HttpService = require('../../../lib/http_service')
const __config = require('../../../config')

const getCategory = (req, res) => {
  const http = new HttpService(60000)
  const headers = {
    Authorization: req.headers.authorization
  }
  __logger.info('calling get getCategory of chat api', headers)
  http.Get(__config.chatAppUrl + __constants.CHAT_APP_ENDPOINTS.categories, headers)
    .then(data => res.send(data))
    .catch(err => {
      return __util.send(res, {
        type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR,
        err: err.err || err
      })
    })
}

const getFlow = (req, res) => {
  const http = new HttpService(60000)
  const headers = {
    Authorization: req.headers.authorization
  }
  __logger.info('calling get getFlow of chat api', headers)
  let url = __config.chatAppUrl + __constants.CHAT_APP_ENDPOINTS.getFlow
  url = url.split(':flowTopicId').join(req.params.flowTopicId || '')
  http.Get(url, headers)
    .then(data => res.send(data))
    .catch(err => {
      return __util.send(res, {
        type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR,
        err: err.err || err
      })
    })
}

const getIdentifier = (req, res) => {
  const http = new HttpService(60000)
  const headers = {
    Authorization: req.headers.authorization
  }
  __logger.info('calling get getIdentifier of chat api', headers)
  let url = __config.chatAppUrl + __constants.CHAT_APP_ENDPOINTS.getIdentifier
  url = url.split(':flowTopicId').join(req.params.flowTopicId || '').split(':identifierText').join(req.params.identifierText || '')
  http.Get(url, headers)
    .then(data => res.send(data))
    .catch(err => {
      return __util.send(res, {
        type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR,
        err: err.err || err
      })
    })
}

const deleteEntireFlow = (req, res) => {
  const http = new HttpService(60000)
  const headers = {
    Authorization: req.headers.authorization
  }
  __logger.info('calling get deleteEntireFlow of chat api', headers)
  let url = __config.chatAppUrl + __constants.CHAT_APP_ENDPOINTS.getFlow
  url = url.split(':flowTopicId').join(req.params.flowTopicId || '')
  http.Delete(url, headers)
    .then(data => res.send(data))
    .catch(err => {
      return __util.send(res, {
        type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR,
        err: err.err || err
      })
    })
}

const deleteIdentifier = (req, res) => {
  const http = new HttpService(60000)
  const headers = {
    Authorization: req.headers.authorization
  }
  __logger.info('calling get deleteIdentifier of chat api', headers)
  let url = __config.chatAppUrl + __constants.CHAT_APP_ENDPOINTS.getIdentifier
  url = url.split(':flowTopicId').join(req.params.flowTopicId || '').split(':identifierText').join(req.params.identifierText || '')
  http.Delete(url, headers)
    .then(data => res.send(data))
    .catch(err => {
      return __util.send(res, {
        type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR,
        err: err.err || err
      })
    })
}

const flow = (req, res) => {
  const http = new HttpService(60000)
  const headers = {
    Authorization: req.headers.authorization
  }
  __logger.info('calling post flow api of chat api')
  http.Post(req.body, 'body', __config.chatAppUrl + __constants.CHAT_APP_ENDPOINTS.flow, headers)
    .then(data => res.send(data.body))
    .catch(err => {
      return __util.send(res, {
        type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR,
        err: err.err || err
      })
    })
}
const sendMessage = (req, res) => {
  const http = new HttpService(60000)
  const headers = {
    Authorization: __config.chatAppToken
  }
  __logger.info('calling post sendMessage api of chat api')

  http.Post(req.body, 'body', __config.chatAppUrl + __constants.CHAT_APP_ENDPOINTS.sendMessage, headers)
    .then(data => res.send(data.body))
    .catch(err => {
      return __util.send(res, {
        type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR,
        err: err.err || err
      })
    })
}

const invoke = (req, res) => {
  const http = new HttpService(60000)
  const headers = {
    Authorization: __config.chatAppToken
  }
  __logger.info('calling post invoke api of chat api')

  http.Post(req.body, 'body', __config.chatAppUrl + __constants.CHAT_APP_ENDPOINTS.invoke, headers)
    .then(data => res.send(data.body))
    .catch(err => {
      return __util.send(res, {
        type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR,
        err: err.err || err
      })
    })
}

const getMenuBasedTemplateList = (req, res) => {
  const http = new HttpService(60000)
  const headers = {
    Authorization: req.headers.authorization
  }
  __logger.info('calling  getMenuBasedTemplateList of chat api', headers)
  http.Get(__config.chatAppUrl + __constants.CHAT_APP_ENDPOINTS.menuBasedTemplates, headers)
    .then(data => res.send(data))
    .catch(err => {
      return __util.send(res, {
        type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR,
        err: err.err || err
      })
    })
}

const evaluationResult = (req, res) => {
  const http = new HttpService(60000)
  const headers = {
    Authorization: req.headers.authorization
  }
  __logger.info('calling patch evaluationResult of chat api', headers)
  let url = __config.chatAppUrl + __constants.CHAT_APP_ENDPOINTS.evaluationResult
  url = url.split(':flowTopicId').join(req.params.flowTopicId || '').split(':evaluationResponse').join(req.params.evaluationResponse || '')
  http.Patch(req.body, url, headers)
    .then(data => res.send(data))
    .catch(err => {
      return __util.send(res, {
        type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR,
        err: err.err || err
      })
    })
}

const activeTemplate = (req, res) => {
  const http = new HttpService(60000)
  const headers = {
    Authorization: req.headers.authorization
  }
  __logger.info('calling patch activeTemplate of chat api', headers)
  let url = __config.chatAppUrl + __constants.CHAT_APP_ENDPOINTS.activeTemplate
  url = url.split(':flowTopicId').join(req.params.flowTopicId || '').split(':active').join(req.params.active || '')
  http.Patch(req.body, url, headers)
    .then(data => res.send(data))
    .catch(err => {
      return __util.send(res, {
        type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR,
        err: err.err || err
      })
    })
}

const templateFlowStatus = (req, res) => {
  const http = new HttpService(60000)
  const headers = {
    Authorization: req.headers.authorization
  }
  __logger.info('calling get getFlow of chat api', headers)
  const url = __config.chatAppUrl + __constants.CHAT_APP_ENDPOINTS.templateFlowStatus
  http.Get(url, headers)
    .then(data => res.send(data))
    .catch(err => {
      return __util.send(res, {
        type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR,
        err: err.err || err
      })
    })
}

module.exports = {
  getCategory,
  getFlow,
  getIdentifier,
  deleteEntireFlow,
  deleteIdentifier,
  flow,
  sendMessage,
  getMenuBasedTemplateList,
  evaluationResult,
  activeTemplate,
  templateFlowStatus,
  invoke
}
