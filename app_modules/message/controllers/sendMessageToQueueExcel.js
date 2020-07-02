const q = require('q')
const _ = require('lodash')
const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const __config = require('../../../config')
const rejectionHandler = require('../../../lib/util/rejectionHandler')
const __logger = require('../../../lib/logger')
const multer = require('multer')
const excelToJson = require('convert-excel-to-json')
const request = require('request')

const callSendToQueueApi = (formattedBody, authToken) => {
  const apiCalled = q.defer()
  const url = __config.base_url + __constants.INTERNAL_END_POINTS.sendMessageToQueue
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
  const bodyParam = []
  const headerParam = []
  const footerParam = []
  const formattedBody = {
    to: excelSingleData.to.toString(),
    channels: [
      'whatsapp'
    ],
    whatsapp: {
      from: excelSingleData.from.toString(),
      contentType: 'template',
      template: {
        templateId: excelSingleData.templateId,
        language: {
          policy: 'deterministic',
          code: excelSingleData.languageCode
        }
      }
    }
  }
  _.each(excelSingleData, (val, key) => {
    // console.log('key ->', key, 'val ->', val)
    if (key !== 'from' && key !== 'to' && key !== 'templateId' && key !== 'languageCode') {
      excelSingleData[key] = val.toString()
      const arrOfkey = key.split('_')
      let obj = {}
      // console.log('arrrrr of 1', arrOfkey[1])
      if (arrOfkey[1] === 'text') {
        obj = {
          type: 'text',
          text: val
        }
      }
      if (arrOfkey[1] === 'media' && arrOfkey[2] === 'type') {
        obj = {
          type: 'media',
          media: {
            type: val,
            url: excelSingleData[arrOfkey[0] + '_' + arrOfkey[1] + '_url' + '_' + arrOfkey[3]]
          }
        }
      }
      // console.log('before switch and case', obj)
      if (!_.isEmpty(obj)) {
        switch (arrOfkey[0]) {
          case 'bodyParameter':
            // console.log('in switch case bod', obj, key)
            bodyParam.push(obj)
            break
          case 'headerParameter':
            // console.log('in switch case head', obj, key)
            headerParam.push(obj)
            break
          case 'footerParameter':
            // console.log('in switch case foot', obj, key)
            footerParam.push(obj)
        }
      }
    }
  })
  if (bodyParam.length > 0 || headerParam.length > 0 || footerParam.length > 0) {
    formattedBody.whatsapp.template.components = []
    if (bodyParam.length > 0) {
      formattedBody.whatsapp.template.components.push({
        type: 'body',
        parameters: bodyParam
      })
    }
    if (headerParam.length > 0) {
      formattedBody.whatsapp.template.components.push({
        type: 'header',
        parameters: headerParam
      })
    }
    if (footerParam.length > 0) {
      formattedBody.whatsapp.template.components.push({
        type: 'footer',
        parameters: footerParam
      })
    }
  }
  reqbody.resolve(formattedBody)
  return reqbody.promise
}

const validateSingleReq = excelSingleData => {
  const isValid = q.defer()
  console.log('single validate', excelSingleData)
  const errorData = []
  if (!excelSingleData.from || isNaN(+excelSingleData.from)) errorData.push('please provide "from" of type number')
  if (!excelSingleData.to || isNaN(+excelSingleData.to)) errorData.push('please provide "to" of type number')
  if (!excelSingleData.templateId || typeof excelSingleData.templateId !== 'string') errorData.push('please provide "templateId" of type string')
  if (!excelSingleData.languageCode || typeof excelSingleData.languageCode !== 'string' || excelSingleData.languageCode.length !== 2) errorData.push('please provide "languageCode" of type string having legth 2')
  // console.log('errrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr', isNaN(+excelSingleData.to), errorData)
  if (errorData.length > 0) {
    isValid.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: errorData })
    return isValid.promise
  }
  _.each(excelSingleData, (val, key) => {
    // console.log('key ->', key, 'val ->', val)
    if (key !== 'from' && key !== 'to' && key !== 'templateId' && key !== 'languageCode') {
      if (!val) {
        errorData.push('please provide ' + key + ' of type string')
      } else {
        excelSingleData[key] = val.toString()
        const arrOfkey = key.split('_')
        if (arrOfkey[1] === 'media') {
          if (!excelSingleData[arrOfkey[0] + '_' + arrOfkey[1] + '_type' + '_' + arrOfkey[3]]) errorData.push('please provide "' + arrOfkey[0] + '_' + arrOfkey[1] + '_type' + '_' + arrOfkey[3] + '" of type string')
          if (!excelSingleData[arrOfkey[0] + '_' + arrOfkey[1] + '_url' + '_' + arrOfkey[3]]) errorData.push('please provide "' + arrOfkey[0] + '_' + arrOfkey[1] + '_url' + '_' + arrOfkey[3] + '" of type string')
        }
      }
    }
  })
  if (errorData.length > 0) {
    isValid.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: errorData })
    return isValid.promise
  } else {
    isValid.resolve(excelSingleData)
  }
  // console.log('safe to check ahead', errorData)
  return isValid.promise
}

const validateAndFormRequestBody = excelData => {
  // console.log('here to form reqbody and validate', excelData)
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
}).array('messagefile', 1)

const controller = (req, res) => {
  __logger.info('sendMessageToQueueExcel :: API to send message called', req.userConfig)
  if (!req.userConfig.tokenKey) {
    return res.send(__util.send(res, { type: __constants.RESPONSE_MESSAGES.NOT_AUTHORIZED, data: {} }))
  }
  upload(req, res, function (err, data) {
    if (err) {
      __logger.error('sendMessageToQueueExcel :: file upload API error', err)
      return res.send(__util.send(res, { type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {}, err: err.err || {} }))
    }
    if (!req.files || (req.files && !req.files[0])) {
      return res.send(__util.send(res, { type: __constants.RESPONSE_MESSAGES.PROVIDE_FILE, data: {} }))
    } else {
      __logger.info('sendMessageToQueueExcel :: file uploaded')
      convertToJson(req.files)
        .then(jsonData => validateAndFormRequestBody(jsonData))
        .then(reqBody => {
          // console.log('req body for api =>', reqBody)
          const invalidReq = _.filter(reqBody, { valid: false })
          if (invalidReq.length > 0) {
            return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: _.map(invalidReq, 'err') })
          } else {
            return callSendToQueueApi(reqBody, req.userConfig.tokenKey)
          }
        })
        .then(data => res.send(data))
        .catch(err => {
          __logger.error('sendMessageToQueueExcel :: file upload API error', err)
          res.send(__util.send(res, { type: err.type, err: err.err }))
        })
    }
  })
}

module.exports = controller
