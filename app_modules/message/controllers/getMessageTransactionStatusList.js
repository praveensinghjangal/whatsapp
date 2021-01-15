const __logger = require('../../../lib/logger')
const __constants = require('../../../config/constants')
const __util = require('../../../lib/util')
const DbServices = require('../services/dbData')
const ValidatonService = require('../services/validation')
const q = require('q')
const integrationService = require('../../../app_modules/integration')

/**
 * @namespace -WhatsApp-Message-Controller-Transaction-Status-
 * @description API’s related to whatsapp message.
 */

/**
 * @memberof -WhatsApp-Message-Controller-Transaction-Status-
 * @name GetMessageTransactionstatusList
 * @path {GET} /chat/v1/messages/transaction/list
 * @description Bussiness Logic :- Use this API to get message transaction type list.
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
 <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/message-history/getMessageTransactionTypeList|GetMessageTransactionstatusList}
 * @param {string}  startDate - startDate needs to be entered here.
 * @param {string}  endDate - endDate needs to be entered here
 * @param {string}  transactionType - transactionType to be entered here i.e incoming or outgoing
 * @param {string}  page - enter page number here
 * @param {number}  ItemsPerPage   - enter records per page
 * @response {string} ContentType=application/json - Response content type.
 * @response {object} metadata.data - In response we get array of json data consist of messageId,time in each object.
 * @code {200} if the msg is success than it Returns list of message transaction type
..
 * @author Javed K11 9th September, 2020
 * *** Last-Updated :- Javed K11 9th September, 2020 ***
 */

const getMessageTransactionstatusList = (req, res) => {
  __logger.info('Get Message Transaction List API Called', req.query)
  const dbServices = new DbServices()
  const validate = new ValidatonService()
  const userId = req.user && req.user.user_id ? req.user.user_id : '0'
  if (isNaN(req.query.page)) return __util.send(res, { type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, data: {}, err: 'Page field is required with value as number' })
  if (isNaN(req.query.ItemsPerPage)) return __util.send(res, { type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, data: {}, err: 'ItemsPerPage field is required with value as number' })
  const requiredPage = req.query.page ? +req.query.page : 1
  const ItemsPerPage = +req.query.ItemsPerPage
  const offset = ItemsPerPage * (requiredPage - 1)
  const flag = req.query.transactionType ? req.query.transactionType.toLowerCase() : null
  const sort = req.query && req.query.sort ? req.query.sort : 'ASC'
  req.query.flag = flag
  validate.transactionValidator(req.query)
    .then(invalid => dbServices.getMessageTransactionList(userId, req.query.startDate, req.query.endDate, flag, ItemsPerPage, offset, sort))
    .then(data => processMessage(data, req, userId, flag))
    .then(data => {
      __logger.info('Data------> then 2')
      const pagination = { totalPage: Math.ceil(data[1][0].totalCount / ItemsPerPage), currentPage: requiredPage }
      __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: { rows: data[0], pagination } })
    })
    .catch(err => {
      __logger.error('error::getMessageTransactionList : ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

const processMessage = async (data, req, userId, flag) => {
  const messageProcessed = q.defer()
  const maxTpsToProvider = req.user && req.user.maxTpsToProvider ? req.user.maxTpsToProvider : 10
  const wabaAccountService = new integrationService.WabaAccount(req.user.providerId, maxTpsToProvider, userId)
  // console.log('processMessage---------------------->', data)

  if (data && flag === 'incoming') {
    // console.log('processMessage---------------------->', data)
    data[0] = await Promise.all(data[0].map(async incomingMsg => {
      // console.log('processMessage- message------------------>', message)
      // console.log('processMessage- message------------------>', incomingMsg.incomingMsgId)
      if (incomingMsg && incomingMsg.content && incomingMsg.content.contentType === 'media') {
        // console.log('incomingMsg---------------------->', incomingMsg.content)
        const media = await wabaAccountService.getMedia(req.user.wabaPhoneNumber, incomingMsg.content.media.mediaId)
        // console.log('media-------------------------->', typeof media.data)
        incomingMsg[incomingMsg.content.media.type] = media.data
        incomingMsg.contentType = incomingMsg.content.contentType
        incomingMsg.mediaType = incomingMsg.content.media.type
        delete incomingMsg.content
        return incomingMsg
      } else {
        incomingMsg.contentType = incomingMsg.content.contentType
        incomingMsg.message = incomingMsg.content.text
        delete incomingMsg.content
        return incomingMsg
      }
    })
    )
    // console.log('Final MEssages????????????????????', finalMessages)
    messageProcessed.resolve(data)
  } else {
    messageProcessed.resolve(data)
  }
  return messageProcessed.promise
}

module.exports = getMessageTransactionstatusList
