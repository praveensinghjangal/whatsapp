const ValidatonService = require('../services/validation')
const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const util = require('util')
const q = require('q')
const moment = require('moment')
// const rejectionHandler = require('../../../lib/util/rejectionHandler')
// const HttpService = require('../../../lib/http_service')
// const __config = require('../../../config')
// const __db = require('../../../lib/db')
const MessageReportsServices = require('../services/dbData')
var rimraf = require('rimraf')
const fs = require('fs')
const rimRaf = util.promisify(rimraf)
var uuid4 = require('uuid4')
const json2csv = require('json2csv').parse
const path = require('path')
// const __config = require('../../../config')
const rabbitmqHeloWhatsapp = require('../../../lib/db').rabbitmqHeloWhatsapp
const DbService = require('../../message/services/dbData')
const checkFile = require('./zipFileExists')

/**
 * @memberof -GET-SET-OPTIN-&-Template-Controller-
 * @name AddUpdateOptinAndTemplate
 * @path {POST} /frontend/addUpdateOptinMessageAndTemplate
 * @description Bussiness Logic :- This API is a wrapper of setting up the templateId with their otpin text (it will update the data or insert the data)
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
 * @body {string}  templateId=register_thanks_converse - Provide the valid template Id
 * @body {string}  optinText=helloviva1 - Provide the valid optin text.
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=Success  -  templateId and optinText updated or added successfully.
 * @code {200} if the msg is success than your request is added or updated successfully.
 * @author Danish Galiyara 11th September, 2020
 * *** Last-Updated :- Arjun Bhole 23rd October,2020 ***
 */

const deliveryReport = (req, res) => {
  __logger.info('Get delivered message journey record based on consumer mobile number, campaign name, date, message id', req.body)
  const wabaPhoneNumber = req.user.wabaPhoneNumber ? req.user.wabaPhoneNumber : '0'
  let limit = ''
  let page = ''
  const validate = new ValidatonService()
  if (req.query && req.query.status) req.query.status = req.query.status.split(/\s*,\s*/)
  const messageReportsServices = new MessageReportsServices()
  validate.deliveryReport(req.query)
    .then(data => {
      limit = req.query.limit ? +req.query.limit : 10
      page = req.query.page ? +req.query.page : 1
      const offset = limit * (page - 1)
      if (req.query.messageId) return messageReportsServices.getDeliveryReportByMessageId(req.query.messageId, req.query.startDate, req.query.endDate, wabaPhoneNumber, limit, offset)
      if (req.query.consumerNumber) return messageReportsServices.getDeliveryReportByConsumerNumber(req.query.consumerNumber, req.query.startDate, req.query.endDate, wabaPhoneNumber, limit, offset)
      if (req.query.status) return messageReportsServices.getDeliveryReportByStatus(req.query.status, req.query.startDate, req.query.endDate, wabaPhoneNumber, limit, offset)
      if (req.query.campaignName) return messageReportsServices.getDeliveryReportByCampaignName(req.query.campaignName, req.query.startDate, req.query.endDate, wabaPhoneNumber, limit, offset)
      if (!req.query.messageId && !req.query.consumerNumber && !req.query.status) return messageReportsServices.getDeliveryReportByDate(req.query.startDate, req.query.endDate, wabaPhoneNumber, limit, offset)
    })
    .then(data => {
      if (data) {
        const pagination = { totalPage: Math.ceil(data[0].totalCount[0].count / limit), totalCount: data[0].totalCount[0].count, currentPage: page }
        return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: { rows: data[0].data, pagination } })
      } else {
        return __util.send(res, { type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, data: {}, err: [] })
      }
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

const campaignSummaryReport = (req, res) => {
  __logger.info('Get campaign summary record based on campaign name, date', req.body)
  const wabaPhoneNumber = req.user.wabaPhoneNumber ? req.user.wabaPhoneNumber : '0'
  let limit = ''
  let page = ''
  const validate = new ValidatonService()
  const messageReportsServices = new MessageReportsServices()
  validate.campaignSummaryReport(req.query)
    .then(data => {
      limit = req.query.limit ? +req.query.limit : 10
      page = req.query.page ? +req.query.page : 1
      const offset = limit * (page - 1)
      var startDate = moment(req.query.startDate).format('YYYY-MM-DD')
      var endDate = moment(req.query.endDate).format('YYYY-MM-DD')
      if (req.query.campaignName) return messageReportsServices.getCampaignSummaryReportByCampaignName(req.query.campaignName, startDate, endDate, wabaPhoneNumber, limit, offset)
      if (!req.query.campaignName) return messageReportsServices.getCampaignSummaryReportByDate(startDate, endDate, wabaPhoneNumber, limit, offset)
    })
    .then(data => {
      if (data) {
        const pagination = { totalPage: Math.ceil(data[0].totalCount[0].count / limit), totalCount: data[0].totalCount[0].count, currentPage: page }
        return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: { rows: data[0].data, pagination } })
      } else {
        return __util.send(res, { type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, data: {}, err: [] })
      }
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

const templateSummaryReport = (req, res) => {
  __logger.info('Get template summary record based on template name, template id, date', req.query)
  const wabaPhoneNumber = req.user.wabaPhoneNumber ? req.user.wabaPhoneNumber : '0'

  let limit = ''
  let page = ''
  const validate = new ValidatonService()
  const messageReportsServices = new MessageReportsServices()
  validate.templateSummaryReport(req.query)
    .then(data => {
      limit = req.query.limit ? +req.query.limit : 10
      page = req.query.page ? +req.query.page : 1
      const offset = limit * (page - 1)
      var startDate = moment(req.query.startDate).format('YYYY-MM-DD')
      var endDate = moment(req.query.endDate).format('YYYY-MM-DD')
      if (req.query.templateId) return messageReportsServices.getTemplateSummaryReportByTemplateId(req.query.templateId, startDate, endDate, wabaPhoneNumber, limit, offset)
      if (req.query.templateName) return messageReportsServices.getTemplateSummaryReportByTemplateName(req.query.templateName, startDate, endDate, wabaPhoneNumber, limit, offset)
      if (!req.query.templateId && !req.query.templateName) return messageReportsServices.getTemplateSummaryReportByDate(startDate, endDate, wabaPhoneNumber, limit, offset)
    })
    .then(data => {
      if (data) {
        const pagination = { totalPage: Math.ceil(data[0].totalCount[0].count / limit), totalCount: data[0].totalCount[0].count, currentPage: page }
        return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: { rows: data[0].data, pagination } })
      } else {
        return __util.send(res, { type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, data: {}, err: [] })
      }
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

const userConversationReport = (req, res) => {
  const userId = req.user && req.user.user_id ? req.user.user_id : '0'
  const wabaPhoneNumber = req.user.wabaPhoneNumber ? req.user.wabaPhoneNumber : '0'
  const messageReportsServices = new MessageReportsServices()
  const validate = new ValidatonService()
  let limit = ''
  let page = ''
  __logger.info('Get template summary record based on template name, template id, date', userId, req.body)
  validate.userConversationReport(req.body)
    .then(() => {
      limit = req.body.limit ? +req.body.limit : 10
      page = req.body.page ? +req.body.page : 1
      const offset = limit * (page - 1)
      var startDate = moment(req.body.startDate).format('YYYY-MM-DD')
      var endDate = moment(req.body.endDate).format('YYYY-MM-DD')
      if (req.body.countryName && req.body.countryName.length > 0) return messageReportsServices.getuserConversationReportCountBasedOncountryName(wabaPhoneNumber, req.body.countryName, startDate, endDate, limit, offset)
      else return messageReportsServices.getuserConversationReportCountBasedOnDate(wabaPhoneNumber, limit, offset, startDate, endDate)
    })
    .then((data) => {
      if (data) {
        // pagination
        const pagination = { totalPage: Math.ceil(data[0].totalCount[0].count / limit), totalCount: data[0].totalCount[0].count, currentPage: page }
        return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: { rows: data[0].data, pagination } })
      } else {
        return __util.send(res, { type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, data: {}, err: [] })
      }
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

const downloadCampaignSummary = (req, res) => {
  const userId = req.user && req.user.user_id ? req.user.user_id : '0'
  const wabaPhoneNumber = req.user.wabaPhoneNumber ? req.user.wabaPhoneNumber : '0'
  const messageReportsServices = new MessageReportsServices()
  const uuid = uuid4()
  let fullFilePath
  const filePath = __constants.FILEPATH + `/${uuid}`
  fs.mkdirSync(filePath)
  var startDate = moment(req.query.startDate).format('YYYY-MM-DD')
  var endDate = moment(req.query.endDate).format('YYYY-MM-DD')
  const validate = new ValidatonService()
  __logger.info('Get download CampaignSummary date', userId, req.query)
  validate.downloadSummary(req.query)
    .then(() => {
      return messageReportsServices.downloadCampaignSummary(wabaPhoneNumber, startDate, endDate)
    })
    .then((data) => {
      if (data) {
        fullFilePath = filePath + `/${startDate.slice(0, 10)}_${endDate.slice(0, 10)}.campaignSummary.csv`
        const result = json2csv(data, { header: true })

        return fs.writeFileSync(fullFilePath, result)
      } else {
        return __util.send(res, { type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, data: {}, err: [] })
      }
    })
    .then(() => {
      return res.download(fullFilePath)
    })
    .then(() => {
      return rimRaf(filePath)
    })
    .then(() => {
      return __logger.debug('delete campaignSummary file for createdFileCSV folder')
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

const downloadTemplateSummary = (req, res) => {
  const userId = req.user && req.user.user_id ? req.user.user_id : '0'
  const wabaPhoneNumber = req.user.wabaPhoneNumber ? req.user.wabaPhoneNumber : '0'
  const messageReportsServices = new MessageReportsServices()
  const uuid = uuid4()
  var startDate = moment(req.query.startDate).format('YYYY-MM-DD')
  var endDate = moment(req.query.endDate).format('YYYY-MM-DD')
  let fullFilePath
  const filePath = __constants.FILEPATH + `/${uuid}`
  fs.mkdirSync(filePath)
  const validate = new ValidatonService()
  __logger.info('Get template summary record based on template name, template id, date', userId, req.query)
  validate.downloadSummary(req.query)
    .then(() => {
      return messageReportsServices.downloadTemplateSummary(wabaPhoneNumber, startDate, endDate)
    })
    .then((data) => {
      if (data) {
        fullFilePath = filePath + `/${startDate.slice(0, 10)}_${endDate.slice(0, 10)}.templateSummary.csv`
        const result = json2csv(data, { header: true })
        return fs.writeFileSync(fullFilePath, result)
      } else {
        return __util.send(res, { type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, data: {}, err: [] })
      }
    })
    .then(() => {
      return res.download(fullFilePath)
    })
    .then(() => {
      return rimRaf(filePath)
    })
    .then(() => {
      return __logger.debug('delete templateSummary file for createdFileCSV folder')
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

const downloadUserConversationReport = (req, res) => {
  const userId = req.user && req.user.user_id ? req.user.user_id : '0'
  const wabaPhoneNumber = req.user.wabaPhoneNumber ? req.user.wabaPhoneNumber : '0'
  const messageReportsServices = new MessageReportsServices()
  const uuid = uuid4()
  var startDate = moment(req.query.startDate).format('YYYY-MM-DD')
  var endDate = moment(req.query.endDate).format('YYYY-MM-DD')
  let fullFilePath
  const filePath = __constants.FILEPATH + `/${uuid}`
  fs.mkdirSync(filePath)
  const validate = new ValidatonService()
  __logger.info('download User conversation report by date', userId, req.query)
  validate.downloadSummary(req.query)
    .then(() => {
      return messageReportsServices.downloadUserConversationSummary(wabaPhoneNumber, startDate, endDate)
    })
    .then((data) => {
      if (data) {
        fullFilePath = filePath + `/${startDate.slice(0, 10)}_${endDate.slice(0, 10)}.userConversationSummary.csv`
        const result = json2csv(data, { header: true })
        return fs.writeFileSync(fullFilePath, result)
      } else {
        return __util.send(res, { type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, data: {}, err: [] })
      }
    })
    .then(() => {
      return res.download(fullFilePath)
    })
    .then(() => {
      return rimRaf(filePath)
    })
    .then(() => {
      return __logger.debug('delete userConversationSummary file for createdFileCSV folder')
    })
    .catch(err => {
      return __util.send(res, { type: err.type, err: err.err })
    })
}

// const downloadDlrRequest = (req, res) => {
//   const validate = new ValidatonService()
//   const userId = req.user && req.user.user_id ? req.user.user_id : '0'
//   const dbService = new DbService()
//   const uuid = uuid4()
//   const wabaPhoneNumber = req.user.wabaPhoneNumber ? req.user.wabaPhoneNumber : '0'
//   let sendToQueueData
//   // const wabaPhoneNumber = req.user.wabaPhoneNumber ? req.user.wabaPhoneNumber : '0'
//   validate.downloadDlrRequest(req.query)
//     .then(validateData => {
//       validateData.userId = userId
//       validateData.wabaPhoneNumber = wabaPhoneNumber
//       const startDate = validateData.startDate.slice(0, 10)
//       const endDate = validateData.endDate.slice(0, 10)
//       // validateData.wabaPhoneNumber = '918080800808'
//       validateData.uniqueId = uuid
//       validateData.filename = `${startDate}_${endDate}_${validateData.wabaPhoneNumber}`
//       sendToQueueData = validateData
//       return dbService.updateDownloadFileAgainstWabaIdandUserId(validateData)
//     })
//     .then((data) => {
//       return rabbitmqHeloWhatsapp.sendToQueue(__constants.MQ.reportsDownloadConsumer, JSON.stringify(sendToQueueData))
//     })
//     .then(data => {
//       return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: __constants.DOWNLOAD_STATUS.inProcess })
//     })
//     .catch(err => {
//       return __util.send(res, { type: err.type, err: err.err })
//     })
// }

const downloadDlrRequest = (req, res) => {
  const validate = new ValidatonService()
  const userId = req.user && req.user.user_id ? req.user.user_id : '0'
  const dbService = new DbService()
  const uuid = uuid4()
  const wabaPhoneNumber = req.user.wabaPhoneNumber ? req.user.wabaPhoneNumber : '0'
  let sendToQueueData
  // const wabaPhoneNumber = req.user.wabaPhoneNumber ? req.user.wabaPhoneNumber : '0'
  validate.downloadDlrRequest(req.query)
    .then(validateData => {
      validateData.userId = userId
      validateData.wabaPhoneNumber = wabaPhoneNumber
      const startDate = validateData.startDate.slice(0, 10)
      const endDate = validateData.endDate.slice(0, 10)
      // validateData.wabaPhoneNumber = '918080800808'
      validateData.uniqueId = uuid
      validateData.filename = `${startDate}_${endDate}_${validateData.wabaPhoneNumber}`
      sendToQueueData = validateData
      return checkFile.zipFileExixts(validateData)
    })
    .then(data => {
      if (sendToQueueData.changeZipFile) return fs.unlinkSync(path.resolve(__dirname, `../../../app_modules/download/${sendToQueueData.filename}.zip`))
      else return dbService.updateDownloadFileAgainstWabaIdandUserId(sendToQueueData)
    })
    .then(data => {
      return rabbitmqHeloWhatsapp.sendToQueue(__constants.MQ.reportsDownloadConsumer, JSON.stringify(sendToQueueData))
    })
    .then(data => {
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: __constants.DOWNLOAD_STATUS.inProcess })
    })
    .catch(err => {
      return __util.send(res, { type: err.type, data: err.data, err: err.err })
    })
}

const getdownloadlist = (req, res) => {
  const validate = new ValidatonService()
  const userId = req.user && req.user.user_id ? req.user.user_id : '0'
  const wabaPhoneNumber = req.user.wabaPhoneNumber ? req.user.wabaPhoneNumber : '0'
  const dbService = new DbService()
  // const wabaPhoneNumber = req.user.wabaPhoneNumber ? req.user.wabaPhoneNumber : '0'
  validate.getdownloadlist(req.user)
    .then((data) => {
      return dbService.getdownloadlist(userId, wabaPhoneNumber)
    })
    .then(data => {
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: data })
    })
    .catch(err => {
      return __util.send(res, { type: err.type, err: err.err })
    })
}
const filesPresent = (pathName) => {
  //   dirname = pwd
  //    const directoryPath = '/home/shivamsingh/Desktop/Projects/platform-api/download'
  //    path_name = __dirname, `../public/reports/smpp/${system_id}/${year}/${month}/${day}`
  const filesPresentInPath = q.defer()
  if (fs.existsSync(pathName)) {
    console.log('44444444444444444444444444444444444444444')
    filesPresentInPath.resolve(true)
  } else {
    console.log('filesPresent existsSync')
    filesPresentInPath.resolve(false)
  }
  return filesPresentInPath.promise
}
const downloadDlr = (req, res) => {
  const validate = new ValidatonService()
  // const userId = req.user && req.user.user_id ? req.user.user_id : '0'
  // const dbService = new DbService()
  let download
  validate.downloadDlr(req.query)
    .then((validate) => {
      download = `${validate.path}.zip`
      return filesPresent(download)
    })
    .then((data) => {
      if (data) {
        return res.download(download)
      } else {
        return __util.send({ type: __constants.RESPONSE_MESSAGES.NOT_FOUND, err: 'File Not Found', data: {} })
      }
    })
    .catch(err => {
      return __util.send(res, { type: err.type, err: err.err })
    })
}
module.exports = { downloadDlr, downloadDlrRequest, deliveryReport, campaignSummaryReport, templateSummaryReport, userConversationReport, downloadCampaignSummary, downloadTemplateSummary, downloadUserConversationReport, getdownloadlist }
