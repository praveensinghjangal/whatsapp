const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const HttpService = require('../../../lib/http_service')
const __config = require('../../../config')
const request = require('request')

const uploadFile = (req, res) => {
  __logger.info('in upload function', req.body)
  const http = new HttpService(60000)
  const headers = {
    Authorization: req.headers.authorization
  }
  http.post(headers)
}

const downloadFile = (req, res) => {
  __logger.info('in download function!', req.params)
  let url = __config.heloOssUrl + __constants.HELO_OSS_ENDPOINTS.download
  url = url.split(':action').join(req.params.action || '').split(':fileName').join(req.params.fileName || '')
  const attachment = req.params.action === 'download' ? 'attachment; ' : ''
  res.setHeader('content-disposition', attachment + 'filename=' + req.params.fileName)
  request(url).pipe(res)
}

module.exports = { uploadFile, downloadFile }
