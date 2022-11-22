const q = require('q')
const multer = require('multer')
const __constants = require('../../../config/constants')
const __util = require('../../../lib/util')
const __logger = require('../../../lib/logger')
const fs = require('fs')
const UserService = require('../services/dbData')
const ValidatonService = require('../services/validation')
const rejectionHandler = require('../../../lib/util/rejectionHandler')
const HttpService = require('../../../lib/http_service')
const __config = require('../../../config')
const _ = require('lodash')
const { FileStream } = require('../../../lib/util/fileStream')
const http = new HttpService(60000)
// this file not in use
/**
 * @namespace -Agreement-Controller-
 * @description In this Conroller, API’s related to agreement for using vivaconnect helo-whatsapp platform
 */

const uploadFileFtp = (filePath) => {
  __logger.info('Calling Upload File Ftp Api ----')
  const fileUpload = q.defer()
  const url = __config.heloOssWrapperUrl + __constants.INTERNAL_END_POINTS.heloOssUpload
  const headers = {
    Authorization: __config.heloOssWrapperToken,
    'Content-Type': 'multipart/form-data',
    'User-Agent': __constants.INTERNAL_CALL_USER_AGENT
  }
  __logger.info('oss req obj', { url, headers })
  http.Post({ object: fs.createReadStream(filePath) }, 'formData', url, headers)
    .then(apiResponse => {
      __logger.info('helo-oss api response---', apiResponse.body)
      if (apiResponse.body.code === __constants.RESPONSE_MESSAGES.SUCCESS.code) {
        __logger.info('success', apiResponse.body)
        fileUpload.resolve(apiResponse.body)
      } else {
        __logger.info('fail', apiResponse.body)
        fileUpload.reject({ type: __constants.RESPONSE_MESSAGES.UPLOAD_FAILED, data: {} })
      }
    })
    .catch(err => {
      __logger.error('error in uploading file to ftp -->', err)
      fileUpload.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
    })
  return fileUpload.promise
}

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

const updateAgreementStatus = (reqBody, authToken) => {
  __logger.info('calling updateAgreementStatus api ::>>>>>>>>>>>>>>>>>.')
  const url = __config.base_url + __constants.INTERNAL_END_POINTS.updateAgreementStatus
  __logger.info('reqBody updateAgreementStatus :: >>>>>>>>>>>>>>>>>>>>>>>>', reqBody)
  const options = {
    url,
    body: reqBody,
    headers: { Authorization: authToken, 'User-Agent': __constants.INTERNAL_CALL_USER_AGENT },
    json: true
  }
  return http.Patch(options.body, options.url, options.headers)
}

function responseHandler (code) {
  switch (code) {
    case 3000:
      return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {}, data: {} })
    case 3064:
      return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.AGREEMENT_STATUS_CANNOT_BE_UPDATED, err: {}, data: {} })
    case 4000:
      return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: {}, data: {} })
    case 4004:
      return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.NOT_FOUND, err: {}, data: {} })
    default:
      return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: {}, data: {} })
  }
}
const savFileDataInDataBase = (userId, fileName, filePath, agreementStatusId, autToken) => {
  const fileSaved = q.defer()
  __logger.info('Save file data function ', userId, fileName, filePath, agreementStatusId)
  const reqBody = {
    agreementStatusId: agreementStatusId,
    userId: userId,
    fileName,
    filePath
  }
  updateAgreementStatus(reqBody, autToken)
    .then(result => {
      __logger.info('update Agreement Status result ', { result })
      if (result && result.code === 2000) {
        fileSaved.resolve(true)
      } else {
        return responseHandler((result && result.code) ? result.code : 0)
      }
    })
    .catch(err => {
      __logger.error('update Agreement data function error -->', err)
      fileSaved.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err })
    })
  return fileSaved.promise
}

/**
 * @memberof -Agreement-Controller-
 * @name UploadAgreement
 * @path {POST} /users/agreement
 * @description Bussiness Logic :- This API is used to upload the signed agreement
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
 * @body {form-data} agreement=sample.pdf - Upload the file in form-data request, assign key as agreement and value as uploaded pdf
 * @code {200} if the msg is success than agreement uploaded successfully.
 * @author Danish Galiyara 25th May, 2020
 * *** Last-Updated :- Danish Galiyara 2nd July, 2020 ***
 */

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
      const fileStream = new FileStream()
      uploadFileFtp(req.files[0].path)
        .then(response => {
          __logger.info('response from upload function', response)
          const ftpUploadUrl = response && response.data && response.data.url ? response.data.url.split(':action').join('view') : ''
          return savFileDataInDataBase(req.user.user_id, req.files[0].filename, ftpUploadUrl, __constants.AGREEMENT_STATUS.pendingForApproval.statusCode, req.headers.authorization)
        })
        .then(data => {
          __logger.info('file to be deleted =====================================', __constants.PUBLIC_FOLDER_PATH + '/agreements/' + req.files[0].filename)
          fileStream.deleteFile(__constants.PUBLIC_FOLDER_PATH + '/agreements/' + req.files[0].filename, req.files[0].filename)
          return res.send(__util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: { agreementStatusId: __constants.AGREEMENT_STATUS.pendingForApproval.statusCode, statusName: __constants.AGREEMENT_STATUS.pendingForApproval.displayName } }))
        })
        .catch(err => {
          __logger.error('file upload API error', err)
          return res.send(__util.send(res, { type: err.type, err: err.err }))
        })
    }
  })
}

/**
 * @memberof -Agreement-Controller-
 * @name GetAgreement
 * @path {GET} /users/agreement
 * @description Bussiness Logic :- This API is regarding download the signed agreement.
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
  <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/agreement/downloadsignedagreement|GetAgreement}
 * @code {200} if the msg is success than Download signed agreement Latest uploaded document wil be download.
 * @author Danish Galiyara 25th May, 2020
 * *** Last-Updated :- Arjun Bhole 23th October, 2020 ***
 */

const getAgreement = (req, res) => {
  __logger.info('Inside getAgreement', req.user.user_id)
  const userId = req.user && req.user.user_id ? req.user.user_id : 0
  const userService = new UserService()
  userService.getAgreementInfoByUserId(userId)
    .then(data => {
      if (!data) {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {}, data: {} })
      }
      if (data && (data.agreementStatusId === __constants.AGREEMENT_STATUS.pendingForDownload.statusCode || data.agreementStatusId === __constants.AGREEMENT_STATUS.pendingForUpload.statusCode)) {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.AGREEMENT_FILE_CANNOT_BE_VIEWED, err: {}, data: {} })
      } else {
        return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: { fileUrl: data.filePath } })
      }
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type || __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: err.err || err })
    })
}

/**
 * @memberof -Agreement-Controller-
 * @name GenerateAgreement
 * @path {GET} /users/agreement/generate
 * @description Bussiness Logic :- This API Generate Agreement of Helo Whatsapp
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
 <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/agreement/generateagreement|GenerateAgreement}
 * @code {200} if the msg is success than A pdf file will be downloaded.
 * @author Danish Galiyara 26th May, 2020
 * *** Last-Updated :- Danish Galiyara 26th May, 2020 ***
 */

const generateAgreement = (req, res) => {
  __logger.info('Inside Generate Agreement', req.user.user_id)
  return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: { fileUrl: __constants.SAMPLE_AGREEMENT_URL }, err: {} })
}

/**
 * @memberof -Agreement-Controller-
 * @name getAgreementListByStatusId
 * @path {GET} /users/agreement/list
 * @description Bussiness Logic :- This API returns list of agreement using agreement status id.
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
  <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/agreement/getAgreementListByStatusId|GetAgreementListByStatusId}
 * @param {string}  agreementStatus - Enter agreement status Id here
 * @param {number}  page - Enter page number here
 * @param {number}  ItemsPerPage - Enter records per page
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=Success  - Response got successfully.
 * @response {object} metadata.data - In response we get array of json data consisting of user firstName and created_on
  * @code {200} if the msg is success than returns list of agreement details.
 * @author Javed Khan 2nd February, 2021
 * *** Last-Updated :- Javed Khan 2nd February, 2021 ***
 */

const getAgreementListByStatusId = (req, res) => {
  __logger.info('called api to getAgreementByStatusId:: ', req.query)
  const userService = new UserService()
  const validate = new ValidatonService()
  if (isNaN(req.query.page)) return __util.send(res, { type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, data: {}, err: 'Page field is required with value as number' })
  if (isNaN(req.query.ItemsPerPage)) return __util.send(res, { type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, data: {}, err: 'ItemsPerPage field is required with value as number' })
  if (+req.query.ItemsPerPage <= 0) return __util.send(res, { type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, data: {}, err: 'ItemsPerPage field value should be greater than zero' })
  const requiredPage = req.query.page ? +req.query.page : 1
  const ItemsPerPage = +req.query.ItemsPerPage
  const offset = ItemsPerPage * (requiredPage - 1)
  __logger.info('Get Offset & ItemsPerPage value', offset, ItemsPerPage)
  validate.checkAgreementStatusId(req.query)
    .then(isvalid => userService.getAgreementByStatusId(req.query.agreementStatus, ItemsPerPage, offset))
    .then(dbData => {
      __logger.info('dbData result', dbData[1][0])
      const pagination = { totalPage: Math.ceil(dbData[1][0].totalCount / ItemsPerPage), currentPage: requiredPage }
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: { rows: dbData[0], pagination } })
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

/**
 * @memberof -Agreement-Controller-
 * @name GetAgreementById
 * @path {GET} /users/agreement/:userId
 * @description Bussiness Logic :- This API returns agreement file based on the user id.
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
 * <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/agreement/getAgreementInfoById|getAgreementInfoById}
 * @param {string} userId  b2aacfbc-12da-4748-bae9-b4ec26e37840 - Please provide valid userId.
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=Success  -  In response we get object as json data consist of agreementStatus, userId, uploadedOn, updatedOn.
 * @code {200} if the msg is success than Returns agreementStatus, userId, uploadedOn, updatedOn.
 * @author Danish Galiyara 24th February, 2021
 * *** Last-Updated :- Danish Galiyara 24th February, 2021 ***
 */

const getAgreementByUserId = (req, res) => {
  const userId = req.params && req.params.userId ? req.params.userId : 0
  __logger.info('Inside getAgreement', userId)
  const userService = new UserService()
  userService.getAgreementInfoByUserId(userId)
    .then(data => {
      if (!data) {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {}, data: {} })
      }
      if (data && (data.agreementStatusId === __constants.AGREEMENT_STATUS.pendingForDownload.statusCode || data.agreementStatusId === __constants.AGREEMENT_STATUS.pendingForUpload.statusCode)) {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.AGREEMENT_FILE_CANNOT_BE_VIEWED, err: {}, data: {} })
      } else {
        return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: { fileUrl: data.filePath } })
      }
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type || __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: err.err || err })
    })
}

/**
 * @memberof -Agreement-Controller-
 * @name EvaluateAgreement
 * @path {GET} /users/agreement/evaluate
 * @description Bussiness Logic :- This API updates the agreement status.
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
 * <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/agreement/evaluateAgreement|evaluateAgreement}
 * @param {string} agreementStatus  b2aacfbc-12da-4748-bae9-b4ec26e37840 - Please provide valid agreement status Id here.
 * @body {string}  userId - Provide the correct userId for whom the agreement status has to be changed.
 * @body {string}  rejectionReason - Provide the rejection reason when the agreement is rejected.
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=Success  -  In response we get object as json data consist of agreementStatusId.
 * @code {200} if the msg is success than Returns agreementStatusId.
 * @author Arjun Bhole 17th February, 2021
 * *** Last-Updated :- Arjun Bhole 16th February, 2021 ***
 */

const evaluateAgreement = (req, res) => {
  const inputData = {
    agreementStatusId: (req.query.agreementStatus === __constants.AGREEMENT_EVALUATION_RESPONSE[0]) ? __constants.AGREEMENT_STATUS.approved.statusCode : __constants.AGREEMENT_STATUS.rejected.statusCode,
    userId: req.body.userId,
    rejectionReason: (req.body && req.body.rejectionReason) ? req.body.rejectionReason : ''
  }
  if (req.query && req.query.agreementStatus === __constants.AGREEMENT_EVALUATION_RESPONSE[0]) {
    inputData.rejectionReason = null
  }
  updateAgreementStatus(inputData, req.headers.authorization)
    .then((data) => {
      __logger.info('Query Data', data)
      res.send(data)
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

/**
 * @memberof -Agreement-Controller-
 * @name getAgreementList
 * @path {GET} /users/agreement/list
 * @description Bussiness Logic :- This API returns list of agreement.
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
  <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/agreement/getAgreementList|GetAgreementList}
 * @param {string}  agreementStatus - Enter agreement status Id here
 * @param {number}  page - Enter page number here
 * @param {number}  ItemsPerPage - Enter records per page
 * @param {string}  startDate - Enter start date
 * @param {string}  endDate - Enter end date
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=Success  - Response got successfully.
 * @response {object} metadata.data - In response we get array of json data consisting of user userAgreementFileId,statusName,reviewer,userId,firstName,agreementStatusId,rejectionReason
  * @code {200} if the msg is success than returns list of agreement details.
 * @author Arjun Bhole 23rd February, 2021
 * *** Last-Updated :- Danish Galiyara 25th February, 2021 ***
 */
const getAgreementList = (req, res) => {
  __logger.info('Get Agreement Record List API Called', req.query)
  const errArr = []
  if (isNaN(req.query.page)) errArr.push('please provide page in query param of type integer')
  if (isNaN(req.query.itemsPerPage)) errArr.push('please provide itemsPerPage in query param of type integer')
  if (errArr.length > 0) return __util.send(res, { type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: errArr })

  const requiredPage = req.query.page ? +req.query.page : 1
  const itemsPerPage = req.query ? +req.query.itemsPerPage : 5
  const offset = itemsPerPage * (requiredPage - 1)
  const validate = new ValidatonService()
  validate.getAgreementListValidator(req.query)
    .then(valRes => {
      const userService = new UserService()
      const inputArray = []
      const columnArray = []
      const valArray = []
      if (req.query && req.query.startDate && req.query.endDate) inputArray.push({ colName: 'uaf.updated_on', value: [req.query.startDate, req.query.endDate], type: 'between' })
      if (req.query && req.query.agreementStatusId) inputArray.push({ colName: 'uaf.agreement_status_id', value: req.query.agreementStatusId, type: 'default' })
      if (req.query && req.query.fullName) inputArray.push({ colName: 'lower(CONCAT(u.first_name,u.last_name))', value: req.query.fullName.toLowerCase().replace(/\s/g, ''), type: 'like' })
      _.each(inputArray, function (input) {
        if (input.value !== undefined && input.value !== null) { // done so because false expected in some values
          columnArray.push({ colName: input.colName, type: input.type })
          valArray.push(input.value)
        }
      })
      return userService.getAllAgreement(columnArray, offset, itemsPerPage, valArray.flat())
    })
    .then(result => {
      __logger.info(' then 3')
      const pagination = { totalPage: Math.ceil(result[0][0].totalFilteredRecord / itemsPerPage), currentPage: requiredPage, totalFilteredRecord: result[0][0].totalFilteredRecord, totalRecord: result[1][0].totalRecord }
      _.each(result[0], singleObj => {
        singleObj.reviewer = singleObj.agreementStatusId === __constants.AGREEMENT_STATUS.approved.statusCode || singleObj.agreementStatusId === __constants.AGREEMENT_STATUS.rejected.statusCode ? singleObj.agreementStatusId : null
        delete singleObj.totalFilteredRecord
      })
      __logger.info('pagination       ----->', pagination)
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: { rows: result[0], pagination } })
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

/**
 * @memberof -Agreement-Controller-
 * @name getAgreementList
 * @path {GET} /users/agreement/status
 * @description Bussiness Logic :- This API returns list of agreement status.
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
  <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/agreement/getAgreementList|GetAgreementStatusList}
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=Success  - Response got successfully.
 * @response {object} metadata.data - In response we get array of json data consisting of agreementStatusId, statusName
  * @code {200} if the msg is success than returns list of agreement status.
 * @author Danish Galiyara 25tyh February, 2021
 * *** Last-Updated :- Danish Galiyara 3rd March, 2021 ***
 */
const getAgreementStatusList = (req, res) => {
  __logger.info('inside function to get template status list')
  const userService = new UserService()
  userService.getAgreementStatusList()
    .then(dbData => {
      __logger.info('db result', dbData)
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: dbData })
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

module.exports = { uploadAgreement, getAgreement, generateAgreement, getAgreementListByStatusId, getAgreementByUserId, evaluateAgreement, getAgreementList, getAgreementStatusList }
