const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const HttpService = require('../../../lib/http_service')
const __config = require('../../../config')
const request = require('request')
const fs = require('fs')
const multer = require('multer')
const __util = require('../../../lib/util')

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
}).array('object', 1)

const uploadFile = (req, res) => {
  __logger.info('In Upload File Function')
  upload(req, res, function (err, data) {
    if (err) {
      __logger.error('File Upload API Error', err)
      return res.send(__util.send(res, { type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {}, err: err.err || {} }))
    }
    if (!req.files || (req.files && !req.files[0])) {
      return res.send(__util.send(res, { type: __constants.RESPONSE_MESSAGES.PROVIDE_FILE, data: {} }))
    } else {
      __logger.info('File Uploaded', req.files)
      const http = new HttpService(60000)
      const url = __config.heloOssUrl + __constants.HELO_OSS_ENDPOINTS.upload
      const headers = {
        Authorization: __config.heloOssToken,
        'Content-Type': 'multipart/form-data'
      }
      __logger.info('oss req obj', { url, headers })
      http.Post({ object: fs.createReadStream(req.files[0].path) }, 'formData', url, headers)
        .then(response => {
          fs.unlink(req.files[0].path, err => {
            if (err) __logger.error(err)
            else {
              __logger.info('Deleted file:', req.files[0].path)
            }
          })
          if (response && response.body && response.body.data && response.body.data.url) {
            response.body.data.url = __config.heloOssWrapperUrl + __constants.INTERNAL_END_POINTS.heloOssBasePath + '/:action' + response.body.data.url.split(':action')[1]
          }
          res.send(response.body)
        })
        .catch(err => {
          res.send(err)
        })
    }
  })
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
