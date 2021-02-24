const q = require('q')
const multer = require('multer')
const __constants = require('../../../config/constants')
const __util = require('../../../lib/util')
const __logger = require('../../../lib/logger')
const fs = require('fs')
const path = require('path')
const UserService = require('../services/dbData')
const ValidatonService = require('../services/validation')
const rejectionHandler = require('../../../lib/util/rejectionHandler')
const HttpService = require('../../../lib/http_service')
const __config = require('../../../config')
const _ = require('lodash')

/**
 * @namespace -Agreement-Controller-
 * @description In this Conroller, API’s related to agreement for using vivaconnect helo-whatsapp platform
 */

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
  const http = new HttpService(60000)
  const url = __config.base_url + __constants.INTERNAL_END_POINTS.updateAgreementStatus
  __logger.info('reqBody updateAgreementStatus :: >>>>>>>>>>>>>>>>>>>>>>>>', reqBody)
  const options = {
    url,
    body: reqBody,
    headers: { Authorization: authToken },
    json: true
  }
  return http.Patch(options.body, options.url, options.headers)
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
      fileSaved.resolve(true)
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
      __logger.info('file uploaded', req.files, __constants.AGREEMENT_STATUS.pendingForApproval.statusCode)
      savFileDataInDataBase(req.user.user_id, req.files[0].filename, req.files[0].path, __constants.AGREEMENT_STATUS.pendingForApproval.statusCode, req.headers.authorization)
        .then(data => __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: { agreementStatusId: __constants.AGREEMENT_STATUS.pendingForApproval.statusCode, statusName: __constants.AGREEMENT_STATUS.pendingForApproval.displayName } }))
        .catch(err => {
          __logger.error('file upload API error', err)
          return __util.send(res, { type: err.type, err: err.err })
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
        const baseFileName = path.basename(data.filePath)
        const finalPath = __constants.PUBLIC_FOLDER_PATH + '/agreements/' + baseFileName
        __logger.info('fileeeeeeeeeeeeeeeeeeee', data.filePath)
        __logger.info('File Path Exist', fs.existsSync(finalPath))
        if (fs.existsSync(finalPath)) {
          res.download(data.filePath)
        } else {
          return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {}, data: {} })
        }
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
  __logger.info('Inside generateAgreement', req.user.user_id)
  res.download(__constants.PUBLIC_FOLDER_PATH + '/agreements/agreement.pdf')
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
 * @path {GET} /users/agreement/:agreementId
 * @description Bussiness Logic :- This API returns agreement info based on the agreement id.
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
 * <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/agreement/getAgreementInfoById|getAgreementInfoById}
 * @param {string} agreementId  b2aacfbc-12da-4748-bae9-b4ec26e37840 - Please provide valid agreementId here.
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=Success  -  In response we get object as json data consist of agreementStatus, userId, uploadedOn, updatedOn.
 * @code {200} if the msg is success than Returns agreementStatus, userId, uploadedOn, updatedOn.
 * @author Arjun Bhole 16th February, 2021
 * *** Last-Updated :- Arjun Bhole 16th February, 2021 ***
 */

const getAgreementInfoById = (req, res) => {
  __logger.info('api to get agreement info called', req.params)
  const userService = new UserService()
  const validate = new ValidatonService()
  const userId = req.user && req.user.user_id ? req.user.user_id : 0
  validate.checkAgreementId(req.params)
    .then(data => userService.getAgreementInfoById(req.params.agreementId, userId))
    .then(dbData => {
      __logger.info('Agreement Data', dbData)
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: dbData })
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
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
      if (data && data.code === 2000) {
        __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: { agreementStatusId: inputData.agreementStatusId } })
      } else {
        __util.send(res, { type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, data: data.data || null, err: data.error || null })
      }
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
 * @response {object} metadata.data - In response we get array of json data consisting of user userAgreementFileId, statusName,reviewerFirstName and reviewerLastName
  * @code {200} if the msg is success than returns list of agreement details.
 * @author Arjun Bhole 23rd February, 2021
 * *** Last-Updated :- Arjun Bhole 23rd February, 2021 ***
 */
const getAgreementList = (req, res) => {
  __logger.info('Get Agreement Record List API Called', req.query)
  const userService = new UserService()
  if (isNaN(req.query.page)) return __util.send(res, { type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, data: {} })
  if (isNaN(req.query.ItemsPerPage)) return __util.send(res, { type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, data: {} })
  const agreementStatusId = req.query ? req.query.agreementStatusId : null
  const startDate = req.query ? req.query.startDate : null
  const endDate = req.query ? req.query.endDate : null
  const requiredPage = req.query.page ? +req.query.page : 1
  const ItemsPerPage = req.query ? +req.query.ItemsPerPage : 5
  const offset = ItemsPerPage * (requiredPage - 1)
  const inputArray = []
  if (agreementStatusId) inputArray.push({ colName: 'uaf.agreement_status_id', value: agreementStatusId })

  const columnArray = []
  const valArray = []
  _.each(inputArray, function (input) {
    if (input.value !== undefined && input.value !== null) { // done so because false expected in some values
      columnArray.push(input.colName)
      valArray.push(input.value)
    }
  })

  userService.getAllAgreement(columnArray, offset, ItemsPerPage, startDate, endDate, valArray)
    .then(result => {
      __logger.info(' then 3')
      const pagination = { totalPage: Math.ceil(result[0][0].totalFilteredRecord / ItemsPerPage), currentPage: requiredPage, totalFilteredRecord: result[0][0].totalFilteredRecord, totalRecord: result[1][0].totalRecord }
      _.each(result[0], singleObj => {
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
module.exports = { uploadAgreement, getAgreement, generateAgreement, getAgreementListByStatusId, getAgreementInfoById, evaluateAgreement, getAgreementList }
