const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const BusinessAccountService = require('../services/businesAccount')

/**
 * @namespace -Whatsapp-Business-Account-(WABA)-Information-Internal-API-Controller-
 * @description This Controller consist of API's related to whatsapp business account (WABA) information of registered user
 */

/**
 * @memberof -Whatsapp-Business-Account-(WABA)-Information-Internal-API-Controller-
 * @name GetWabaNumberFromUserId
 * @path {GET} /business/internal/wabaPhoneNumber
 * @description Bussiness Logic :- This API returns waba number from user id.
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
  <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/WABA/getWabaNumberFromUserId|GetWabaNumberFromUserId}
 * @param {string}  userId=3234  - user id needs to be entered here.
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=Success  -  Returns Waba Number in ressponse.
 * @code {200} if the msg is success than Returns Waba Number in ressponse.
 * @author Danish Galiyara 18th August, 2020
 * *** Last-Updated :- Ajun Bhole 23th October, 2020 ***
 */

const getWabaNumberFromUserId = (req, res) => {
  __logger.info('getWabaNumberFromUserId:>>>>>>>>>>>>>')
  if (!req.query.userId) {
    return __util.send(res, { type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Please provide userId' })
  }
  const businessAccountService = new BusinessAccountService()
  businessAccountService.getWabaNumberFromUserId(req.query.userId)
    .then(result => {
      __logger.info('Final Result then 1')
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: result })
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

const getWabaDataFromDb = (req, res) => {
  __logger.info('Inside getWabaDataFromDb')
  if (!req.query.wabaNumber) {
    return __util.send(res, { type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Please provide wabaNumber' })
  }
  const businessAccountService = new BusinessAccountService()
  businessAccountService.getWabaDataFromDb(req.query.wabaNumber)
    .then(result => {
      __logger.info('Final Result then')
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: result })
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

/**
 * @memberof -Whatsapp-Business-Account-(WABA)-Information-Internal-API-Controller-
 * @name GetUserIdAndApiKeyFromWabaNumber
 * @path {GET} /business/internal/getUserIdAndApiKeyFromWabaNumber
 * @description Bussiness Logic :- This API Gets user id and token key from waba number.
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
 <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/WABA/getUserIdAndApiKeyFromWabaNumber|GetUserIdAndApiKeyFromWabaNumber}
 * @param wabaNumber=9999999999 - wabaNumber needs to be entered here.
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=Success  -  returns userid and apikey in response.
 * @code {200} if the msg is success than it return user id and apikey in reponse
 * @author Arjun Bhole 26th August, 2020
 * *** Last-Updated :- Arjun Bhole 28th August, 2020 ***
 */

const getUserIdAndApiKeyFromWabaNumber = (req, res) => {
  __logger.info('Inside getWabaDataFromDb', req.query.wabaNumber)
  if (!req.query.wabaNumber) {
    return __util.send(res, { type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Please provide wabaNumber' })
  }
  const businessAccountService = new BusinessAccountService()
  businessAccountService.getUserIdAndTokenKeyByWabaNumber(req.query.wabaNumber)
    .then(result => {
      __logger.info('Final Result then')
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: result })
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

module.exports = {
  getWabaNumberFromUserId,
  getWabaDataFromDb,
  getUserIdAndApiKeyFromWabaNumber
}
