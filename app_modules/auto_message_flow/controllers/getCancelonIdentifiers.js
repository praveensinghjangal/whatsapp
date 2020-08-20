const _ = require('lodash')
const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const DbServices = require('../services/dbData')
const RedisService = require('../../../lib/redis_service/redisService')
const redisService = new RedisService()
const dbServices = new DbServices()

module.exports = (req, res) => {
  __logger.info('getCancelonIdentifiers::get cancel transaction identifier  called')
  redisService.getWabaNumberByUserId(req.user.user_id)
    .then(redisData => dbServices.getCancelFlowIdentifierByWabaNumber(redisData.wabaPhoneNumber))
    .then(dbData => {
      __logger.info('getCancelonIdentifiers::got cancel response from db', dbData)
      if (dbData.dataFound) {
        __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: _.map(dbData.identifierText, 'identifierText') })
      } else {
        __util.send(res, { type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, data: [] })
      }
    })
    .catch(err => {
      __logger.error('error::getCancelonIdentifiers : ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}
