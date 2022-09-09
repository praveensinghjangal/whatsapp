// const q = require('q')
const ValidatonService = require('../services/validation')
const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
// const HttpService = require('../../../lib/http_service')
// const __config = require('../../../config')
// const __db = require('../../../lib/db')
const MessageReportsServices = require('../services/dbData')
// const __config = require('../../../config')
const rabbitmqHeloWhatsapp = require('../../../lib/db').rabbitmqHeloWhatsapp

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
      limit = req.query.limit ? +req.query.limit : 5
      page = req.query.page ? +req.query.page : 1
      const offset = limit * (page - 1)
      if (req.query.messageId) return messageReportsServices.getDeliveryReportByMessageId(req.query.messageId, req.query.startDate, req.query.endDate, wabaPhoneNumber, limit, offset)
      else if (req.query.consumerNumber) return messageReportsServices.getDeliveryReportByConsumerNumber(req.query.consumerNumber, req.query.startDate, req.query.endDate, wabaPhoneNumber, limit, offset)
      else if (req.query.status) return messageReportsServices.getDeliveryReportByStatus(req.query.status, req.query.startDate, req.query.endDate, wabaPhoneNumber, limit, offset)
      else return messageReportsServices.getDeliveryReportByDate(req.query.startDate, req.query.endDate, wabaPhoneNumber, limit, offset)
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
      limit = req.query.limit ? +req.query.limit : 5
      page = req.query.page ? +req.query.page : 1
      const offset = limit * (page - 1)
      if (req.query.campaignName) return messageReportsServices.getCampaignSummaryReportByCampaignName(req.query.campaignName, req.query.startDate, req.query.endDate, wabaPhoneNumber, limit, offset)
      if (!req.query.campaignName) return messageReportsServices.getCampaignSummaryReportByDate(req.query.startDate, req.query.endDate, wabaPhoneNumber, limit, offset)
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
      limit = req.query.limit ? +req.query.limit : 5
      page = req.query.page ? +req.query.page : 1
      const offset = limit * (page - 1)
      if (req.query.templateId) return messageReportsServices.getTemplateSummaryReportByTemplateId(req.query.templateId, req.query.startDate, req.query.endDate, wabaPhoneNumber, limit, offset)
      else if (req.query.templateName) return messageReportsServices.getTemplateSummaryReportByTemplateName(req.query.templateName, req.query.startDate, req.query.endDate, wabaPhoneNumber, limit, offset)
      else return messageReportsServices.getTemplateSummaryReportByDate(req.query.startDate, req.query.endDate, wabaPhoneNumber, limit, offset)
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
const usserWiseSummaryReport = (req, res) => {
  const userId = req.user && req.user.user_id ? req.user.user_id : '0'
  const wabaPhoneNumber = req.user.wabaPhoneNumber ? req.user.wabaPhoneNumber : '0'
  __logger.info('Get template summary record based on template name, template id, date', userId, req.query)
  const messageReportsServices = new MessageReportsServices()
  const validate = new ValidatonService()
  let limit = ''
  let page = ''
  validate.usserWiseSummaryReport(req.query)
    .then(() => {
      limit = req.query.limit ? +req.query.limit : 5
      page = req.query.page ? +req.query.page : 1
      const offset = limit * (page - 1)

      if (req.query.countryName) {
        return messageReportsServices.getusserWiseSummaryCountBasedOncountryName(wabaPhoneNumber, req.query.countryName, limit, offset)
      } else if (req.query.startDate && req.query.startDate !== undefined && req.query.endDate && req.query.endDate !== undefined) {
        return messageReportsServices.getusserWiseSummaryCountBasedOnDate(wabaPhoneNumber, limit, offset, req.query.startDate, req.query.endDate)
      } else {
        return messageReportsServices.getusserWiseSummaryCount(wabaPhoneNumber, limit, offset)
      }
    })
    .then((data) => {
      if (data) {
        // pagination
        const pagination = { totalPage: Math.ceil(data[1][0].totalCount / limit), totalCount: data[1][0].totalCount, currentPage: page }
        return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: { rows: data[0], pagination } })
      } else {
        return __util.send(res, { type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, data: {}, err: [] })
      }
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
      limit = req.body.limit ? +req.body.limit : 5
      page = req.body.page ? +req.body.page : 1
      const offset = limit * (page - 1)
      if (req.body.countryName && req.body.countryName.length > 0) return messageReportsServices.getuserConversationReportCountBasedOncountryName(wabaPhoneNumber, req.body.countryName, req.body.startDate, req.body.endDate, limit, offset)
      else return messageReportsServices.getuserConversationReportCountBasedOnDate(wabaPhoneNumber, limit, offset, req.body.startDate, req.body.endDate)
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

const downloadDlr = (req, res) => {
  const validate = new ValidatonService()
  const userId = req.user && req.user.user_id ? req.user.user_id : '0'
  const wabaPhoneNumber = req.user.wabaPhoneNumber ? req.user.wabaPhoneNumber : '0'
  validate.downloadDlr(req.query)
    .then(validateData => {
      console.log('reeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', req.query)
      validateData.userId = userId
      validateData.wabaPhoneNumber = wabaPhoneNumber
      console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ validateData', validateData)
      return rabbitmqHeloWhatsapp.sendToQueue(__constants.MQ.reportsDownloadConsumer, JSON.stringify(validateData))
    })
    .then(data => {
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: data })
    })
    .catch(err => {
      return __util.send(res, { type: err.type, err: err.err })
    })
}
module.exports = { deliveryReport, campaignSummaryReport, templateSummaryReport, usserWiseSummaryReport, userConversationReport, downloadDlr }
