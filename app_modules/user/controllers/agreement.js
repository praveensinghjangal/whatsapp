const q = require('q')
const multer = require('multer')
const __constants = require('../../../config/constants')
const __util = require('../../../lib/util')
const UniqueId = require('../../../lib/util/uniqueIdGenerator')
const __db = require('../../../lib/db')
const queryProvider = require('../queryProvider')
const __logger = require('../../../lib/logger')
const fs = require('fs')
const path = require('path')

const Storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, __constants.PUBLIC_FOLDER_PATH + '/agreements')
  },
  filename: function (req, file, callback) {
    let fileExt = file.originalname.split('.')
    fileExt = '.' + fileExt[fileExt.length - 1]
    __logger.info('fileExt -->', fileExt)
    callback(null, 'Agreement_' + req.user.user_id + '_' + Date.now() + fileExt)
  }
})

const filter = function (req, file, cb) {
  var filetypes = /pdf/
  let fileExt = file.originalname.split('.')
  fileExt = fileExt[fileExt.length - 1]
  var mimetype = filetypes.test(file.mimetype)
  var extname = filetypes.test(fileExt.toLowerCase())
  __logger.info('file mime type filter  -->', mimetype, extname)
  if (mimetype && extname) {
    return cb(null, true)
  } else {
    const err = { type: __constants.RESPONSE_MESSAGES.INVALID_FILE_TYPE, err: 'File upload only supports the following filetypes - ' + filetypes }
    __logger.error('filter error', err)
    cb(err)
  }
}
const upload = multer({
  fileFilter: filter,
  storage: Storage
}).array('agreement', 1)

const savFileDataInDataBase = (userId, fileName, filePath) => {
  const fileSaved = q.defer()
  const uniqueId = new UniqueId()
  __logger.info('Save file data function ', userId, fileName, filePath)
  __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.saveUserAgreement(), [uniqueId.uuid(), userId, fileName, filePath, userId])
    .then(result => {
      __logger.info('Save file data function db result ', { result })
      if (result && result.affectedRows && result.affectedRows > 0) {
        fileSaved.resolve(true)
      } else {
        fileSaved.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
      }
    })
    .catch(err => {
      __logger.error('save file data function error -->', err)
      fileSaved.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
    })
  return fileSaved.promise
}

const uploadAgreement = (req, res) => {
  upload(req, res, function (err, data) {
    if (err) {
      __logger.error('file upload API error', err)
      return res.send(__util.send(res, { type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {}, err: err.err || {} }))
    }
    if (!req.files || (req.files && !req.files[0])) {
      return res.send(__util.send(res, { type: __constants.RESPONSE_MESSAGES.PROVIDE_FILE, data: {} }))
    } else {
      __logger.info('file uploaded', req.files)
      savFileDataInDataBase(req.user.user_id, req.files[0].filename, req.files[0].path)
        .then(data => res.send(__util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: { } })))
        .catch(err => {
          __logger.error('file upload API error', err)
          res.send(__util.send(res, { type: err.type, err: err.err }))
        })
    }
  })
}

const getAgreement = (req, res) => {
  __logger.info('Inside getAgreement', req.user.user_id)
  const userId = req.user && req.user.user_id ? req.user.user_id : 0
  __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getLatestAgreementByUserId(), [userId])
    .then(results => {
      __logger.info('Got result from db 1', { results })
      const baseFileName = path.basename(results[0].file_path)
      const finalPath = __constants.PUBLIC_FOLDER_PATH + '/agreements/' + baseFileName
      if (results && results.length > 0) {
        __logger.info('fileeeeeeeeeeeeeeeeeeee', results[0].file_path)
        __logger.info('File Path Exist', fs.existsSync(finalPath))
        if (fs.existsSync(finalPath)) {
          res.download(results[0].file_path)
        } else {
          return __util.send(res, { type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, data: {} })
        }
      } else {
        return __util.send(res, { type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, data: {} })
      }
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type || __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: err.err || err })
    })
}

const generateAgreement = (req, res) => {
  __logger.info('Inside generateAgreement', req.user.user_id)
  res.download(__constants.PUBLIC_FOLDER_PATH + '/agreements/agreement.pdf')
}

module.exports = { uploadAgreement, getAgreement, generateAgreement }
