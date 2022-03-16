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

/**
 * @namespace -WhatsApp-Message-Controller-ExcelFile-
 * @description API’s related to whatsapp message.
 */

const callSendToQueueApi = (formattedBody, authToken) => {
  const apiCalled = q.defer()
  const url = __config.base_url + __constants.INTERNAL_END_POINTS.sendMessageToQueue
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
      __logger.info('err', err)
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
    if (key !== 'from' && key !== 'to' && key !== 'templateId' && key !== 'languageCode') {
      excelSingleData[key] = val.toString()
      const arrOfkey = key.split('_')
      let obj = {}
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
      // __logger.info('before switch and case', obj)
      if (!_.isEmpty(obj)) {
        switch (arrOfkey[0]) {
          case 'bodyParameter':
            // __logger.info('in switch case bod', obj, key)
            bodyParam.push(obj)
            break
          case 'headerParameter':
            // __logger.info('in switch case head', obj, key)
            headerParam.push(obj)
            break
          case 'footerParameter':
            // __logger.info('in switch case foot', obj, key)
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
  __logger.info('single validate', { excelSingleData })
  const errorData = []
  if (!excelSingleData.from || isNaN(+excelSingleData.from)) errorData.push('please provide "from" of type number')
  if (!excelSingleData.to || isNaN(+excelSingleData.to)) errorData.push('please provide "to" of type number')
  if (!excelSingleData.templateId || typeof excelSingleData.templateId !== 'string') errorData.push('please provide "templateId" of type string')
  if (!excelSingleData.languageCode || typeof excelSingleData.languageCode !== 'string' || excelSingleData.languageCode.length !== 2) errorData.push('please provide "languageCode" of type string having legth 2')
  // __logger.info('errrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr', isNaN(+excelSingleData.to), errorData)
  if (errorData.length > 0) {
    isValid.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: errorData })
    return isValid.promise
  }
  _.each(excelSingleData, (val, key) => {
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
  // __logger.info('safe to check ahead', {errorData})
  return isValid.promise
}

const validateAndFormRequestBody = excelData => {
  // __logger.info('here to form reqbody and validate', {excelData})
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
  var filetypes = /^(xls[x]?)$/ // regex to check file is xlx or xlxs
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

/**
 * @memberof -WhatsApp-Message-Controller-ExcelFile-
 * @name UploadWhatsAppMessageExcel
 * @path {POST} /chat/v1/messages/whatsapp/excel
 * @description Bussiness Logic :- This API is used to send bulk template message using excel, it will only convert excel into json and call send message API <br/>
 * Excel file with template parameters download sample file using
   this link https://drive.google.com/file/d/1453P-r7xcay4XEUSQPOD5BddspNKYqTK/view?usp=sharing
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
  <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/message/whatsappexcelsendmessage|UploadWhatsAppMessageExcel}
 * @body {form-data} messagefile - Upload the file in form-data request, assign key as messagefile and value as uploaded xlsx file.
 * @code {200} if the msg is success than the message data uploaded successfully.
 * @author Danish Galiyara 2nd July, 2020
 * *** Last-Updated :- Javed kh11 6th October, 2020 ***
 */

const upload = multer({
  fileFilter: filter
}).array('messagefile', 1)

const controller = (req, res) => {
  __logger.info('sendMessageToQueueExcel :: API to send message called', req.userConfig)
  if (!req.userConfig || !req.userConfig.tokenKey) {
    return __util.send(res, { type: __constants.RESPONSE_MESSAGES.NOT_AUTHORIZED, data: {} })
  }
  upload(req, res, function (err, data) {
    if (err) {
      __logger.error('sendMessageToQueueExcel :: file upload API error', err)
      return __util.send(res, { type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {}, err: err.err || {} })
    }
    if (!req.files || (req.files && !req.files[0])) {
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.PROVIDE_FILE, data: {} })
    } else {
      __logger.info('sendMessageToQueueExcel :: file uploaded')
      convertToJson(req.files)
        .then(jsonData => validateAndFormRequestBody(jsonData))
        .then(reqBody => {
          __logger.info('req body for api => then 2', { reqBody })
          const invalidReq = _.filter(reqBody, { valid: false })
          if (invalidReq.length > 0) {
            return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: _.map(invalidReq, 'err') })
          } else {
            return callSendToQueueApi(reqBody, req.userConfig.authToken)
          }
        })
        .then(data => res.send(data))
        .catch(err => {
          __logger.error('sendMessageToQueueExcel :: file upload API error', err)
          __util.send(res, { type: err.type, err: err.err })
        })
    }
  })
}

module.exports = controller
