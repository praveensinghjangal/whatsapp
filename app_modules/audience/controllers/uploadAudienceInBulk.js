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

const callAddUpdateAudienceApi = (formattedBody, authToken) => {
  const apiCalled = q.defer()
  const url = __config.base_url + __constants.INTERNAL_END_POINTS.addupdateAudience
  __logger.info('sendMessageToQueueExcel :: callSendToQueueApi formattedBody>>>>>>>>>>>>>>>>>>>>>>>>', formattedBody)
  const options = {
    url,
    body: formattedBody,
    headers: { Authorization: authToken },
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
  //   console.log('single validate', excelSingleData)

  const errorData = []
  if (!excelSingleData.phoneNumber) errorData.push('please provide "phoneNumber" of type number')
  if (!excelSingleData.optinSource && typeof excelSingleData.optinSource !== 'string' && typeof excelSingleData.optinSource.length < 1) errorData.push('please provide "optinSource" of type string ')
  if (!excelSingleData.name || typeof excelSingleData.name !== 'string' || excelSingleData.name.length < 1) errorData.push('please provide "name" of type string having minimum length 1')
  if (!excelSingleData.email || typeof excelSingleData.email !== 'string' || excelSingleData.email.length < 1) errorData.push('please provide "email" of type string having minimum length 1')
  if (!excelSingleData.gender || typeof excelSingleData.gender !== 'string' || excelSingleData.gender.length < 1) errorData.push('please provide "gender" of type string having minimum length 1')
  if (!excelSingleData.country || typeof excelSingleData.country !== 'string' || excelSingleData.country.length < 1) errorData.push('please provide "country" of type string having minimum length 1')

  _.each(excelSingleData, (val, key) => {
    // console.log('key ->', key, 'val ->', val)
    if (key !== 'phoneNumber' && key !== 'optinSource' && key !== 'name' && key !== 'email' && key !== 'gender' && key !== 'country') {
      if (!val) {
        errorData.push('please provide ' + key + ' of type string')
      }
    }
  })

  //   console.log('Error Data', errorData)
  if (errorData.length > 0) {
    isValid.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: errorData })
    // return isValid.promise
  } else {
    isValid.resolve(excelSingleData)
  }
  // console.log('safe to check ahead', errorData)
  return isValid.promise
}

const validateAndFormRequestBody = excelData => {
//   console.log('here to form reqbody and validate', excelData)
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
  // console.log('file mime type filter  -->', extname)
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

const uploadAudienceData = (req, res) => {
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
          // console.log('req body for api =>', reqBody)
          const invalidReq = _.filter(reqBody, { valid: false })
          if (invalidReq.length > 0) {
            return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: _.map(invalidReq, 'err') })
          } else {
            return callAddUpdateAudienceApi(reqBody, process.env.INTERNAL_AUTH_TOKEN)
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
