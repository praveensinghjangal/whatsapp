const q = require('q')
const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const RedisService = require('../../../lib/redis_service/redisService')
const redisService = new RedisService()
const __logger = require('../../../lib/logger')
const ValidatonService = require('../services/validation')
const DbService = require('../services/dbData')
const rejectionHandler = require('../../../lib/util/rejectionHandler')

const updateFlow = (body, wabaNumber, userId) => {
  __logger.info('addUpdate API updateFlow called', body, wabaNumber)
  const updated = q.defer()
  const dbService = new DbService()
  let flowDatFuncGlobal = {}
  dbService.getFlowDataByFlowId(body.auotMessageFlowId)
    .then(flowData => {
      if (!flowData.detailsFound) {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {} })
      }
      flowDatFuncGlobal = flowData.flowDetails
      __logger.info('addUpdate API flowData from db', flowData)
      if (body.identifierText && body.identifierText.trim().toLowerCase() !== flowData.flowDetails.identifierText) {
        return dbService.getIdentifierDetailsByIdentifier(body.identifierText, wabaNumber)
      }
      return { identifierNotChanged: true }
    })
    .then(data => {
      __logger.info('After deciding if identifier changed', data)
      if (!data.identifierNotChanged && data.detailsFound) {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.IDENTIFIER_EXIST, err: {} })
      }
      //   console.log('time to check parent identifier')
      if (body.parentIdentifierText !== undefined) {
        if (body.parentIdentifierText && body.parentIdentifierText.trim().toLowerCase() !== flowDatFuncGlobal.parentIdentifierText) {
          return dbService.getIdentifierDetailsByIdentifier(body.parentIdentifierText, wabaNumber)
        }
        if (body.parentIdentifierText !== flowDatFuncGlobal.parentIdentifierText) {
          return { parentIdentifierIsNull: true }
        }
      }
      return { parentIdentifierNotChanged: true }
    })
    .then(data => {
      __logger.info('After deciding if parent identifier changed', data)
      if (!data.parentIdentifierNotChanged && !data.parentIdentifierIsNull && !data.detailsFound) {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.PARENT_IDENTIFIER_NOT_EXIST, err: {} })
      }
      __logger.info('all set will update now')
      return dbService.updateFlow(body, flowDatFuncGlobal, userId)
    })
    .then(update => updated.resolve(update))
    .catch(err => updated.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err }))
  return updated.promise
}

const insertFlow = (body, wabaNumber, userId) => {
  __logger.info('addUpdate API insertFlow called', body, wabaNumber)
  const added = q.defer()
  const dbService = new DbService()
  dbService.getIdentifierDetailsByIdentifier(body.identifierText, wabaNumber)
    .then(identifierData => { // no check for flow topic exists as new flow topic will be created from insert only
      __logger.info('addUpdate API identifierData from db', identifierData)
      if (identifierData.detailsFound) {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.IDENTIFIER_EXIST, err: {} })
      } else if (body.parentIdentifierText) { // if parent identifier present then flwo topic is of no use so thats why no check on flow topic exists if parent identifier exists
        return dbService.getIdentifierDetailsByIdentifier(body.parentIdentifierText, wabaNumber)
      } else {
        return { canInsert: true }
      }
    })
    .then(data => {
      __logger.info('check for parent identifier done', data)
      if (data.canInsert) {
        return true
      } else if (data.detailsFound) {
        return true
      } else {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.PARENT_IDENTIFIER_NOT_EXIST, err: {} })
      }
    })
    .then(canInsert => dbService.addFlow(body, wabaNumber, userId))
    .then(inserted => added.resolve(inserted))
    .catch(err => added.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err }))
  return added.promise
}

const addUpdateFlow = (req, res) => {
  __logger.info('addUpdateFlow API called', req.body)
  const validate = new ValidatonService()
  validate.addUpdateFlow(req.body)
    .then(data => redisService.getWabaNumberByUserId(req.user.user_id))
    .then(redisData => {
      if (req.body.auotMessageFlowId) {
        return updateFlow(req.body, redisData.wabaPhoneNumber, req.user.user_id)
      } else {
        return insertFlow(req.body, redisData.wabaPhoneNumber, req.user.user_id)
      }
    })
    .then(data => {
      __logger.info('update or insert done', data)

      __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data })
    })
    .catch(err => {
      __logger.error('error::addUpdateFlow : ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

module.exports = addUpdateFlow
