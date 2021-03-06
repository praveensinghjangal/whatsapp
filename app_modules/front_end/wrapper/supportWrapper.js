const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const HttpService = require('../../../lib/http_service')
const __config = require('../../../config')
const ValidatonService = require('../services/validation')
const request = require('request')
const multer = require('multer')
const fs = require('fs')

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
      res.send(err)
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
      res.send(err)
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
      res.send(err)
    })
}

const dltListOfUsers = (req, res) => {
  const http = new HttpService(60000)
  const url = __config.dltUrl + __constants.DLT_PANEL_ENDPOINTS.listOfUsers
  const headers = {
    Authorization: __config.dltSupportToken
  }
  __logger.info('dltListOfUsers wrapper API', url)
  http.Get(url, headers)
    .then(data => res.send(data))
    .catch(err => res.send(err))
}

const dltListOfPeids = (req, res) => {
  __logger.info('dltListOfPeids wrapper API')
  const http = new HttpService(60000)
  let url = __config.dltUrl + __constants.DLT_PANEL_ENDPOINTS.listOfPeids
  url += '?' + req.originalUrl.split('?')[1]
  const headers = {
    Authorization: __config.dltSupportToken
  }
  http.Get(url, headers)
    .then(data => res.send(data))
    .catch(err => res.send(err))
}

const dltUpdatePeids = (req, res) => {
  __logger.info('dltUpdatePeids wrapper API')
  const http = new HttpService(60000)
  const url = __config.dltUrl + __constants.DLT_PANEL_ENDPOINTS.updatePeid
  const headers = {
    Authorization: __config.dltSupportToken
  }
  http.Post(req.body, 'body', url, headers)
    .then(data => res.send(data.body))
    .catch(err => res.send(err))
}

const dltCreateTemplate = (req, res) => {
  __logger.info('createTemplate wrapper API')
  const http = new HttpService(60000)
  const url = __config.dltUrl + __constants.DLT_PANEL_ENDPOINTS.createTemplate
  const headers = {
    Authorization: __config.dltSupportToken
  }
  http.Post(req.body, 'body', url, headers)
    .then(data => res.send(data.body))
    .catch(err => res.send(err))
}

const dltListOfTemplates = (req, res) => {
  __logger.info('dltListOfTemplates wrapper API')
  const http = new HttpService(60000)
  let url = __config.dltUrl + __constants.DLT_PANEL_ENDPOINTS.listOfTemplates
  url += '?' + req.originalUrl.split('?')[1]
  const headers = {
    Authorization: __config.dltSupportToken
  }
  http.Get(url, headers)
    .then(data => res.send(data))
    .catch(err => res.send(err))
}

const dltConvertMessage = (req, res) => {
  __logger.info('dltConvertMessage wrapper API')
  const http = new HttpService(60000)
  let url = __config.dltUrl + __constants.DLT_PANEL_ENDPOINTS.convertMessage
  url += '?' + req.originalUrl.split('?')[1]
  const headers = {
    Authorization: __config.dltSupportToken
  }
  http.Get(url, headers)
    .then(data => res.send(data))
    .catch(err => res.send(err))
}

const dltChangePeidStatus = (req, res) => {
  __logger.info('dltUpdatePeids wrapper API')
  const http = new HttpService(60000)
  const url = __config.dltUrl + __constants.DLT_PANEL_ENDPOINTS.changePeidStatus
  const headers = {
    Authorization: __config.dltSupportToken
  }
  http.Post(req.body, 'body', url, headers)
    .then(data => res.send(data.body))
    .catch(err => res.send(err))
}

const dltVerifyMessage = (req, res) => {
  __logger.info('dltUpdatePeids wrapper API')
  const http = new HttpService(60000)
  const url = __config.dltUrl + __constants.DLT_PANEL_ENDPOINTS.verifyMessage
  const headers = {
    Authorization: __config.dltSupportToken
  }
  http.Post(req.body, 'body', url, headers)
    .then(data => res.send(data.body))
    .catch(err => res.send(err))
}

const downloadDltTemplate = (req, res) => {
  __logger.info('downloadDltTemplate api called')
  const url = __config.dltUrl + __constants.DLT_PANEL_ENDPOINTS.downloadTemplates
  const options = {
    method: 'GET',
    url: url,
    headers: {
      'Content-Type': 'application/json',
      Authorization: __config.dltSupportToken
    },
    qs: req.query
  }
  res.setHeader('content-disposition', 'filename=templates.xlsx')
  request(options)
    .pipe(res)
}

const Storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, __constants.PUBLIC_FOLDER_PATH + '/ossWrapper')
  },
  filename: function (req, file, callback) {
    callback(null, file.originalname)
  }
})

const upload = multer({
  storage: Storage
}).array('File', 1)

const bulkUploadTemplates = (req, res) => {
  __logger.info('bulkUploadTemplates api called')
  upload(req, res, function (err, data) {
    if (err) {
      __logger.error('File Upload API Error', err)
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {}, err: {} })
    }
    if (!req.files || (req.files && !req.files[0])) {
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.PROVIDE_FILE, data: {} })
    } else {
      __logger.info('File Uploaded', req.files)
      const http = new HttpService(60000)
      const url = __config.dltUrl + __constants.DLT_PANEL_ENDPOINTS.bulkUpload
      const headers = {
        Authorization: __config.dltSupportToken,
        'Content-Type': 'multipart/form-data'
      }
      __logger.info('dlt upload req obj', { url, headers })
      http.Post({ File: fs.createReadStream(req.files[0].path) }, 'formData', url, headers)
        .then(response => {
          fs.unlink(req.files[0].path, err => {
            if (err) console.log(err)
            else {
              console.log('\nDeleted file:', req.files[0].path)
            }
          })
          res.send(response.body)
        })
        .catch(err => {
          console.log('errrrrrrrrrrrrrr', err)
          res.send(err)
        })
    }
  })
}

const dltListOfPeidsOtherThanUser = (req, res) => {
  __logger.info('dltListOfPeids wrapper API')
  const http = new HttpService(60000)
  let url = __config.dltUrl + __constants.DLT_PANEL_ENDPOINTS.listOfPeidsOtherThanUser
  url += '?' + req.originalUrl.split('?')[1]
  const headers = {
    Authorization: __config.dltSupportToken
  }
  http.Get(url, headers)
    .then(data => res.send(data))
    .catch(err => res.send(err))
}

module.exports = {
  templateFlowApproval,
  templateFlowlist,
  templateFlowInfo,
  dltListOfUsers,
  dltListOfPeids,
  dltUpdatePeids,
  dltCreateTemplate,
  dltListOfTemplates,
  dltConvertMessage,
  dltChangePeidStatus,
  dltVerifyMessage,
  downloadDltTemplate,
  bulkUploadTemplates,
  dltListOfPeidsOtherThanUser
}