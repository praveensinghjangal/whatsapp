const __logger = require('../../../lib/logger')
const __constants = require('../../../config/constants')
const __util = require('../../../lib/util')
const DbServices = require('../services/dbData')
const ValidatonService = require('../services/validation')

/**
 * @namespace -WhatsApp-Message-Controller-Transaction-Status-
 * @description API’s related to whatsapp message.
 */

/**
 * @memberof -WhatsApp-Message-Controller-Transaction-Status-
 * @name GetOutgoingTransactionListBySearchFilters
 * @path {GET} /chat/v1/messages/transaction/outgoing/list
 * @description Bussiness Logic :- Use this API to get list of messages for outgoing transactions with filter of template and session.
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
 <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/message-history/getOutgoingTransactionListBySearchFilters|GetOutgoingTransactionListBySearchFilters}
 * @param {string}  startDate - startDate needs to be entered here.
 * @param {string}  endDate - endDate needs to be entered here
 * @param {string}  endUserNumber - endUserNumber to be entered here i.e phone number
 * @param {string}  page - enter page number here
 * @param {number}  ItemsPerPage   - enter records per page
 * @response {string} ContentType=application/json - Response content type.
 * @response {object} metadata.data - In response we get array of json data consist of messageId,time in each object.
 * @code {200} if the msg is success than it Returns list of message transaction list
..
 * @author Javed Khan 27th January, 2021
 * *** Last-Updated :- Javed Khan 27th January, 2021 ***
 */

module.exports = (req, res) => {
  __logger.info('Get Outgoing Transaction List By Filters API Called:: ', req.query, req.user)
  const dbServices = new DbServices()
  const validate = new ValidatonService()
  const wabaPhoneNumber = req.user && req.user.wabaPhoneNumber ? req.user.wabaPhoneNumber : '0'
  if (isNaN(req.query.page)) return __util.send(res, { type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, data: {}, err: 'Page field is required with value as number' })
  if (isNaN(req.query.ItemsPerPage)) return __util.send(res, { type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, data: {}, err: 'ItemsPerPage field is required with value as number' })
  if (+req.query.ItemsPerPage <= 0) return __util.send(res, { type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, data: {}, err: 'ItemsPerPage field value should be greater than zero' })
  const requiredPage = req.query.page ? +req.query.page : 1
  const ItemsPerPage = +req.query.ItemsPerPage
  const offset = ItemsPerPage * (requiredPage - 1)
  validate.outgoingTransactionValidatorByFilters(req.query)
    .then(invalid => dbServices.getOutgoingTransactionListBySearchFilters(wabaPhoneNumber, req.query.startDate, req.query.endDate, ItemsPerPage, offset, req.query.endUserNumber))
    .then(data => {
      __logger.info('Data------> then 2')
      const pagination = { totalPage: Math.ceil(data[1][0].totalCount / ItemsPerPage), currentPage: requiredPage }
      __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: { rows: data[0], pagination } })
    })
    .catch(err => {
      __logger.error('error::getOutgoingTransactionListByFilters : ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}
