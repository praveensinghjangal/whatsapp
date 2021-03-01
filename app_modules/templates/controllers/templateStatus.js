const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const _ = require('lodash')
const ValidatonService = require('../services/validation')
const TemplateService = require('../services/dbData')

/**
 * @memberof -Template-Controller-
 * @name GetAllTemplateWithStatus
 * @path {get} /templates/list
 * @description Bussiness Logic :- This API returns list of templates based on message_template_status.
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
 <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/templates/getTemplateListByStatusId|getTemplateListByStatusId}
 * @param {string} templateStatusId =c71a8387-80e0-468b-9ee3-abb5ec328176 - Please provide valid message_template_status_id here.
 * @param {number}  page - Enter page number here
 * @param {number}  ItemsPerPage - Enter records per page
 * @param {string}  startDate - Enter start date
 * @param {string}  endDate - Enter end date
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=Success  -  In response we get array of json data consist of messageTemplateId, templateName and type in each object.
 * @code {200} if the msg is success than Returns messageTemplateId, templateName and type.
 * @author Javed Khan 22nd January, 2021
 * *** Last-Updated :- Vasim Gujrati 24nd FEB, 2021 ***
 */
// Get Template List By StatusId
const getAllTemplateWithStatus = (req, res) => {
  __logger.info('Inside getTemplateListByStatusId', req.query)
  const validate = new ValidatonService()
  const templateService = new TemplateService()
  const errArr = []
  if (isNaN(req.query.page)) errArr.push('please provide page in query param of type integer')
  if (isNaN(req.query.itemsPerPage)) errArr.push('please provide itemsPerPage in query param of type integer')
  if (errArr.length > 0) {
    return __util.send(res, {
      type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST,
      err: errArr
    })
  }

  const templateStatusId = (req.query && req.query.statusId) ? req.query.statusId : null
  const startDate = req.query ? req.query.startDate : null
  const endDate = req.query ? req.query.endDate : null
  const requiredPage = req.query.page ? +req.query.page : 1
  const itemsPerPage = req.query ? +req.query.itemsPerPage : 5
  const offset = itemsPerPage * (requiredPage - 1)

  validate.getAllTemplateWithStatusValidator(req.query)
    .then(valRes => {
      const inputArray = []
      const columnArray = []
      const valArray = []
      if (templateStatusId) {
        inputArray.push({
          colName: 'mt.message_template_status_id',
          value: templateStatusId
        })
      }
      _.each(inputArray, function (input) {
        if (input.value !== undefined && input.value !== null) {
          columnArray.push(input.colName)
          valArray.push(input.value)
        }
      })
      return templateService.getAllTemplateWithStatus(columnArray, offset, itemsPerPage, startDate, endDate, valArray)
    })
    .then(result => {
      const pagination = {
        totalPage: Math.ceil(result[0][0].totalFilteredRecord / itemsPerPage),
        currentPage: requiredPage,
        totalFilteredRecord: result[0][0].totalFilteredRecord,
        totalRecord: result[1][0].totalRecord
      }
      _.each(result[0], singleObj => {
        delete singleObj.totalFilteredRecord
      })
      return __util.send(res, {
        type: __constants.RESPONSE_MESSAGES.SUCCESS,
        data: {
          rows: result[0],
          pagination
        }
      })
    })
    .catch(err => {
      __util.send(res, {
        type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR,
        err: err.err || err
      })
    })
}

/**
 * @memberof -Template-Controller-
 * @name GetTemplateStatusList
 * @path {get} /templates/statusList
 * @description Bussiness Logic :- This API returns all status of message template.
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
 <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/templates/getTemplateStatusList|getTemplateStatusList}
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=Success  -  In response we get array of json data consist of messageTemplateStatusId, statusName in each object.
 * @response {array} metadata.data - Array of all the message_template_status with its message_template_status_id and status_name.
 * @code {200} if the msg is success than Returns messageTemplateStatusId and statusName.
 * @author Javed Khan 22nd January, 2021
 * *** Last-Updated :- Javed Khan 22nd January, 2021 ***
 */
// GET Template Status List
const getTemplateStatusList = (req, res) => {
  __logger.info('inside function to get template status list')
  const templateService = new TemplateService()
  templateService.getTemplateStatusList()
    .then(dbData => {
      __logger.info('db result', dbData)
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: dbData })
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

module.exports = { getAllTemplateWithStatus, getTemplateStatusList }
