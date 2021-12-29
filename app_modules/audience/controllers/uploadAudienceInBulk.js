const __logger = require('../../../lib/logger')
const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const q = require('q')
const __config = require('../../../config')
const multer = require('multer')
const excelToJson = require('convert-excel-to-json')
const request = require('request')
const rejectionHandler = require('../../../lib/util/rejectionHandler')
const _ = require('lodash')

/**
 * @namespace -Whatsapp-Audience-Controller-Upload-excel-to-upload-audience-data-
 * @description API’s related to whatsapp audience.
 */

const callAddUpdateAudienceApi = (formattedBody, authToken) => {
  const apiCalled = q.defer()
  const url = __config.base_url + __constants.INTERNAL_END_POINTS.addupdateAudience
  __logger.info('sendMessageToQueueExcel :: callSendToQueueApi formattedBody>>>>>>>>>>>>>>>>>>>>>>>>', formattedBody)
  const options = {
    url,
    body: formattedBody,
    headers: { Authorization: authToken, 'User-Agent': __constants.INTERNAL_CALL_USER_AGENT },
    json: true
  }
  // Calling another api for sending messages
  request.post(options, (err, httpResponse, body) => {
    if (err) {
      return apiCalled.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
    }
    return apiCalled.resolve(body)
  })
  return apiCalled.promise
}

const formReqBody = excelSingleData => {
  const reqbody = q.defer()

  const formattedBody = {
    phoneNumber: excelSingleData.phoneNumber.toString(),
    channel: __constants.DELIVERY_CHANNEL.whatsapp,
    optin: true,
    optinSourceId: excelSingleData.optinSource.split(':')[1],
    name: excelSingleData.name,
    email: excelSingleData.email,
    gender: excelSingleData.gender,
    country: excelSingleData.country
  }

  reqbody.resolve(formattedBody)
  return reqbody.promise
}

const validateSingleReq = excelSingleData => {
  const isValid = q.defer()
  const errorData = []
  if (!excelSingleData.phoneNumber) errorData.push('please provide "phoneNumber" of type number')
  if (!excelSingleData.optinSource && typeof excelSingleData.optinSource !== 'string' && excelSingleData.optinSource < 1) errorData.push('please provide "optinSource" of type string ')
  if (!excelSingleData.name || typeof excelSingleData.name !== 'string' || excelSingleData.name.length < 1) errorData.push('please provide "name" of type string having minimum length 1')
  if (!excelSingleData.email || typeof excelSingleData.email !== 'string' || excelSingleData.email.length < 1) errorData.push('please provide "email" of type string having minimum length 1')
  if (!excelSingleData.gender || typeof excelSingleData.gender !== 'string' || excelSingleData.gender.length < 1) errorData.push('please provide "gender" of type string having minimum length 1')
  if (!excelSingleData.country || typeof excelSingleData.country !== 'string' || excelSingleData.country.length < 1) errorData.push('please provide "country" of type string having minimum length 1')

  _.each(excelSingleData, (val, key) => {
    if (key !== 'phoneNumber' && key !== 'optinSource' && key !== 'name' && key !== 'email' && key !== 'gender' && key !== 'country') {
      if (!val) {
        errorData.push('please provide ' + key + ' of type string')
      }
    }
  })

  // __logger.info('Error Data', errorData)
  if (errorData.length > 0) {
    isValid.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: errorData })
    // return isValid.promise
  } else {
    isValid.resolve(excelSingleData)
  }
  __logger.info('safe to check ahead', errorData)
  return isValid.promise
}

const validateAndFormRequestBody = excelData => {
  __logger.info('here to form reqbody and validate', { excelData })
  let p = q()
  const thePromises = []
  excelData.forEach(singleObject => {
    p = p.then(() => validateSingleReq(singleObject))
      .then(validData => formReqBody(singleObject))
      .catch(err => {
        if (err && typeof err === 'object') err.valid = false
        return err
      })
    thePromises.push(p)
  })
  return q.all(thePromises)
}

const convertToJson = (file) => {
  const jsonData = q.defer()
  const result = excelToJson({
    source: file[0].buffer,
    header: {
      rows: 1
    },
    columnToKey: {
      '*': '{{columnHeader}}'
    },
    sheetStubs: true
  })
  jsonData.resolve(result.Sheet1)
  return jsonData.promise
}

const filter = function (req, file, cb) {
  var filetypes = /^(xls[x]?)$/
  let fileExt = file.originalname.split('.')
  fileExt = fileExt[fileExt.length - 1]
  var extname = filetypes.test(fileExt.toLowerCase())
  // __logger.info('file mime type filter  -->', extname)
  if (extname) {
    return cb(null, true)
  } else {
    const err = { type: __constants.RESPONSE_MESSAGES.INVALID_FILE_TYPE, err: 'File upload only supports the following filetypes - xls, xlsx' }
    __logger.error('filter error', err)
    cb(err)
  }
}

const upload = multer({
  fileFilter: filter
}).array('optinFile', 1)

/**
 * @memberof -Whatsapp-Audience-Controller-Upload-excel-to-upload-audience-data-
 * @name UploadAudienceData
 * @path {PATCH} /audience/optin/excel
 * @description Bussiness Logic :- This API to upload bulk audience data using excel.
 * Excel file with template parameters download sample file using
   this link https://drive.google.com/file/d/1mKZTv84jgts9MijTp5-5ZUZ80xynD1M2/view?usp=sharing
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
  <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/audience/uploadAudienceData|UploadAudienceData}
 * @body {form-data} optinFile=@/home/parvez/Arjun/Projects/OptinExcel.xlsx - Upload the file in form-data request, assign key as optinFile and value as uploaded xlsx file.
 * @code {200} if the msg is success than the audience data uploaded successfully.
 * @author Arjun Bhole 22nd July, 2020
 * *** Last-Updated :- Arjun Bhole 23rd October, 2020 ***
 */

const uploadAudienceData = (req, res) => {
  __logger.info('inside uploadAudienceData::>>>>>>>>>>>>>>')
  upload(req, res, function (err, data) {
    if (err) {
      __logger.error('sendAudieneDataToExcel :: file upload API error', err)
      return res.send(__util.send(res, { type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {}, err: err.err || {} }))
    }
    if (!req.files || (req.files && !req.files[0])) {
      return res.send(__util.send(res, { type: __constants.RESPONSE_MESSAGES.PROVIDE_FILE, data: {} }))
    } else {
      __logger.info('sendAudieneDataToExcel :: file uploaded')
      convertToJson(req.files)
        .then(jsonData => validateAndFormRequestBody(jsonData))
        .then(reqBody => {
          __logger.info('req body for api => then 2', { reqBody })
          const invalidReq = _.filter(reqBody, { valid: false })
          if (invalidReq.length > 0) {
            return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: _.map(invalidReq, 'err') })
          } else {
            return callAddUpdateAudienceApi(reqBody, req.headers.authorization)
          }
        })
        .then(data => res.send(data))
        .catch(err => {
          __logger.error('sendAudieneDataToExcel :: file upload API error', err)
          res.send(__util.send(res, { type: err.type, err: err.err }))
        })
    }
  })
}

module.exports = { uploadAudienceData }
