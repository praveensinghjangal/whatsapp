const __logger = require('../../../lib/logger')
const __constants = require('../../../config/constants')
const __util = require('../../../lib/util')
const ValidatonService = require('../services/validation')
const DbServices = require('../services/dbData')

/**
 * @namespace -WhatsApp-Message-Controller-Transaction-Message-List-Status-
 * @description API’s related to whatsapp message.
 */

/**
 * @memberof -WhatsApp-Message-Controller-Transaction-Message-List-Status-
 * @name GetMessageStatusList
 * @path {GET} /chat/v1/messages/status/{messageStatus}/list
 * @description Bussiness Logic :- Use this API to get message status list - list of messages in a status
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
  <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/message-history/getMessageList|GetMessageStatusList}
 * @param {string}  startDate - startDate needs to be entered here.
 * @param {string}  endDate - endDate needs to be entered here
 * @param {string}  messageStatus - status of a Message
 * @param {string}  page - enter page number here
 * @param {number}  ItemsPerPage   - enter records per page
 * @response {string} ContentType=application/json - Response content type.
 * @response {array} metadata.data - In response we get array of json data consist of messageId,time and endConsumerNumber in each object.
 * @code {200} if the msg is success than it Returns messageId, time and endConsumerNumber
 * @author Javed K11 7th September, 2020
 * *** Last-Updated :- Arjun Bhole 23rd October, 2020 ***
 */

const getMessageStatusList = (req, res) => {
  __logger.info('Get Message Status List API Called', req.params, req.query)
  const dbServices = new DbServices()
  const validate = new ValidatonService()
  if (isNaN(req.query.page)) return __util.send(res, { type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, data: {}, err: 'Page value is required and it should be number' })
  if (isNaN(req.query.ItemsPerPage)) return __util.send(res, { type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, data: {}, err: 'ItemsPerPage value is required and it should be number' })
  const wabaPhoneNumber = req.user && req.user.wabaPhoneNumber ? req.user.wabaPhoneNumber : '0'
  const requiredPage = req.query.page ? +req.query.page : 1
  const ItemsPerPage = +req.query.ItemsPerPage
  const offset = ItemsPerPage * (requiredPage - 1)
  __logger.info('Get Offset value', offset)
  validate.checkstartDateAndendDate(req.query)
    .then(invalid => dbServices.getMessageStatusList(req.params.status, req.query.startDate, req.query.endDate, ItemsPerPage, offset, wabaPhoneNumber))
    .then(data => {
      __logger.info('data then 2', { data })
      const pagination = { totalPage: Math.ceil(data[1][0].totalCount / ItemsPerPage), currentPage: requiredPage }
      __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: { rows: data[0], pagination } })
    })
    .catch(err => {
      __logger.error('error::getMessageStatusList : ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

module.exports = getMessageStatusList
