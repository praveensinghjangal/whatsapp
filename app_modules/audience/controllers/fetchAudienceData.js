const __logger = require('../../../lib/logger')
const __constants = require('../../../config/constants')
const __util = require('../../../lib/util')
const AudienceService = require('../services/dbData')
const ValidatonService = require('../services/validation')
const __db = require('../../../lib/db')
const queryProvider = require('../queryProvider')
const _ = require('lodash')
const q = require('q')
const moment = require('moment')

/**
 * @namespace -Whatsapp-Audience-Controller-Fetch-Audience-Data-
 * @description API’s related to whatsapp audience.
 */

/**
 * @memberof -Whatsapp-Audience-Controller-Fetch-Audience-Data-
 * @name GetAudienceRecordById
 * @path {GET} /audience/{audienceId}
 * @description Bussiness Logic :- Use this API to get information of a audience record pass audienceId in path
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
   <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/audience/GetAudienceRecordById|GetAudienceRecordById}
 * @param {string} [audienceId=111] - Please provide audienceId in params.
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=Success  - Response got successfully.
 * @response {object} metadata.data - It will return the object containing all the audience information according to the audience Id.
 * @code {200} if the msg is success than Returns info of a audience record.
 * @author Arjun Bhole 9th July, 2020
 * *** Last-Updated :- Arjun Bhole 29th July, 2020 2020 ***
 */
const getAudienceRecordById = (req, res) => {
  __logger.info('Get Audience Info API Called', req.params)
  const audienceService = new AudienceService()
  const validate = new ValidatonService()
  validate.checkAudienceIdExistService(req.params)
    .then(data => audienceService.getAudienceTableDataWithId(req.user.user_id, req.params.audienceId))
    .then(result => {
      __logger.info('then 1', result)
      if (result) {
        return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: result })
      } else {
        return __util.send(res, { type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, data: {} })
      }
    })
    .catch(err => {
      __logger.error('error in create user function: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

/*
Not much clarity on veiwALl filter
*/
const getAudienceRecordList = (req, res) => {
  __logger.info('Get Audience Record List API Called', req.query)
  // if page then int , ItemsPerPage mandatory with type int
  if (isNaN(req.query.page)) return __util.send(res, { type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, data: {} })
  if (isNaN(req.query.ItemsPerPage)) return __util.send(res, { type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, data: {} })
  const userId = req.user && req.user.user_id ? req.user.user_id : '0'
  const startDate = req.query ? req.query.startDate : null
  const endDate = req.query ? req.query.endDate : null
  const requiredPage = req.query.page ? +req.query.page : 1
  const ItemsPerPage = req.query ? req.query.ItemsPerPage : 5
  const offset = ItemsPerPage * (requiredPage - 1)
  __logger.info('Get Offset value', offset)
  const {
    channel, optin, optinSourceId, tempOptin,
    segmentId, phoneNumber
  } = req.query
  const inputArray = [{ colName: 'aud.channel', value: channel },
    { colName: 'aud.optin_source_id', value: optinSourceId },
    { colName: 'aud.segment_id', value: segmentId },
    // { colName: 'aud.first_message', value: firstMessageActivation },
    { colName: 'aud.phone_number', value: phoneNumber },
    { colName: 'wi.user_id', value: userId }]
  if (optin) inputArray.push({ colName: 'aud.optin', value: optin === 'true' ? 1 : 0 })
  if (tempOptin) inputArray.push({ colName: '(last_message between now()- interval 24 HOUR and now())', value: tempOptin === 'true' ? 1 : 0 })

  const columnArray = []
  const valArray = []
  _.each(inputArray, function (input) {
    if (input.value !== undefined && input.value !== null) { // done so because false expected in some values
      columnArray.push(input.colName)
      valArray.push(input.value)
    }
  })
  __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getAudienceRecordList(columnArray, offset, ItemsPerPage, userId, startDate, endDate), valArray)
    .then(result => {
      __logger.info('Got audience list from db -->', { result })
      if ((result && result.length === 0) || result[0].length === 0) {
        return __util.send(res, { type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, data: {} })
      } else {
        const pagination = { totalPage: Math.ceil(result[0][0].totalFilteredRecord / ItemsPerPage), currentPage: requiredPage, totalFilteredRecord: result[0][0].totalFilteredRecord, totalRecord: result[1][0].totalRecord }
        _.each(result[0], singleObj => {
          singleObj.optin = singleObj.optin === 1
          singleObj.tempOptin = singleObj.tempOptin === 1
          delete singleObj.totalFilteredRecord
        })
        __logger.info('pagination       ----->', pagination)
        return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: { rows: result[0], pagination } })
      }
    })
    .catch(err => {
      __logger.error('error in create user function: ', err)
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
    })
}

function getOptinStatusByPhoneNumber (phoneNumber, wabaNumber) {
  const dataFetched = q.defer()

  __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getOptinByPhoneNumber(), [phoneNumber, wabaNumber])
    .then(result => {
      __logger.info('optin sssssssssssssssssssssssssss-> then 1', { result }, phoneNumber, wabaNumber)
      if (result && result.length === 0) {
        dataFetched.resolve({ optin: false, tempOptin: false })
      } else {
        result[0].optin = result[0].optin === 1
        const currentTime = moment().utc().format('YYYY-MM-DD HH:mm:ss')
        const expireyTime = moment(result[0].lastMessage).utc().add(24, 'hours').format('YYYY-MM-DD HH:mm:ss')
        // __logger.info('datatat ===>', expireyTime, currentTime, moment(currentTime).isBefore(expireyTime))
        result[0].tempOptin = moment(currentTime).isBefore(expireyTime)

        // result[0].tempOptin = moment().diff(moment(result[0].lastMessage), 'hours') <= 24
        // __logger.info('Result>>>>>>>>>>>>>>>>>.....', result[0])
        dataFetched.resolve({ optin: result[0].optin, tempOptin: result[0].tempOptin })
      }
    })
    .catch(err => {
      __logger.error('error in get audience by phone number function: ', err)
      dataFetched.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
    })

  return dataFetched.promise
}

module.exports = {
  getAudienceRecordById,
  getAudienceRecordList,
  getOptinStatusByPhoneNumber
}
