const q = require('q')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const __db = require('../../../lib/db')
const queryProvider = require('../queryProvider')
const UniqueId = require('../../../lib/util/uniqueIdGenerator')
const _ = require('lodash')

class DbService {
  constructor () {
    this.uniqueId = new UniqueId()
  }

  getEventDetailsFromIdentifierOrTopic (wabaNumber, text) {
    const eventDetails = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getEventDetailsFromIdentifierOrTopic(), [wabaNumber, text.toLowerCase(), wabaNumber, text.toLowerCase()])
      .then(result => {
        __logger.info('Qquery Result', result)
        eventDetails.resolve(result)
      })
      .catch(err => {
        __logger.error('error in get getEventDetailsFromIdentifierOrTopic: ', err)
        eventDetails.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return eventDetails.promise
  }

  getMoreMenuFromParentIdentifier (wabaNumber, text) {
    const eventDetails = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getMoreMenuByParentIdentifier(), [wabaNumber, text.toLowerCase()])
      .then(result => {
        __logger.info('Qquery Result', result)
        eventDetails.resolve(result)
      })
      .catch(err => {
        __logger.error('error in get getEventDetailsFromIdentifierOrTopic: ', err)
        eventDetails.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return eventDetails.promise
  }

  addEventTransaction (eventDetails) {
    __logger.info('Inserting new transaction')
    const transactionAdded = q.defer()
    const inputData = {
      auotMessageTranscationId: eventDetails.auotMessageTranscationId || this.uniqueId.uuid(),
      audiencePhoneNumber: eventDetails.audiencePhoneNumber,
      wabaPhoneNumber: eventDetails.wabaPhoneNumber,
      identifierText: eventDetails.identifierText,
      messageId: eventDetails.messageId || null,
      messageText: eventDetails.messageText || null,
      transactionStatus: eventDetails.transactionStatus || 1,
      eventData: JSON.stringify(eventDetails.eventData) || '{}'
    }

    const queryParam = []
    _.each(inputData, (val) => queryParam.push(val))
    __logger.info('Addddddddddd transaction->', inputData, queryParam)
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.addEventTransaction(), queryParam)
      .then(result => {
        if (result && result.affectedRows && result.affectedRows > 0) {
          transactionAdded.resolve(inputData)
        } else {
          transactionAdded.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
        }
      })
      .catch(err => {
        __logger.error('error: ', err)
        transactionAdded.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return transactionAdded.promise
  }

  getTransactionData (audienceNumber, wabaNumber) {
    const transactionDetails = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getTransactionData(__constants.FLOW_TRANSACTION_INTERVAL), [audienceNumber, wabaNumber])
      .then(result => {
        __logger.info('Qquery Result', result[0])
        if (result && result.length > 0) {
          return transactionDetails.resolve({ transactionFound: true, transactionData: result })
        } else {
          return transactionDetails.resolve({ transactionFound: false, transactionData: {} })
        }
      })
      .catch(err => {
        __logger.error('error in get getTransactionData: ', err)
        transactionDetails.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return transactionDetails.promise
  }

  closeTransaction (transactionId) {
    const transactionClosed = q.defer()
    __logger.info('updating transaction->', transactionId)
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.closeEventTransaction(), [transactionId])
      .then(result => {
        if (result && result.affectedRows && result.affectedRows > 0) {
          transactionClosed.resolve(transactionId)
        } else {
          transactionClosed.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
        }
      })
      .catch(err => {
        __logger.error('error: ', err)
        transactionClosed.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return transactionClosed.promise
  }

  getIdentifierData (wabaNumber, columnArr, valueArr) {
    valueArr.unshift(wabaNumber)
    const getIdentifierData = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getIdentifierData(wabaNumber, columnArr), valueArr)
      .then(data => {
        getIdentifierData.resolve(data)
      })
      .catch(err => getIdentifierData.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err }))
    return getIdentifierData.promise
  }

  getFlowDataByFlowId (auotMessageFlowId) {
    const flowData = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getFlowDataByFlowId(), [auotMessageFlowId])
      .then(result => {
        __logger.info('getFlowDataByFlowId Qquery Result', result[0])
        if (result && result.length > 0) {
          return flowData.resolve({ detailsFound: true, flowDetails: result[0] })
        } else {
          return flowData.resolve({ detailsFound: false, flowDetails: {} })
        }
      })
      .catch(err => {
        __logger.error('error in get getFlowDataByFlowId: ', err)
        flowData.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return flowData.promise
  }

  getIdentifierDetailsByIdentifier (identifierText, wabaNumber) {
    const identifierData = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getIdentifierDetailsByIdentifier(), [identifierText.toLowerCase(), wabaNumber])
      .then(result => {
        __logger.info('getIdentifierDetailsByIdentifier Qquery Result', result[0])
        if (result && result.length > 0) {
          return identifierData.resolve({ detailsFound: true, identifierDetails: result[0] })
        } else {
          return identifierData.resolve({ detailsFound: false, identifierDetails: {} })
        }
      })
      .catch(err => {
        __logger.error('error in get getIdentifierDetailsByIdentifier: ', err)
        identifierData.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return identifierData.promise
  }

  flowTopicExists (flowTopic, wabaNumber) {
    const exists = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.flowTopicExists(), [flowTopic, wabaNumber])
      .then(result => {
        __logger.info('flowTopicExists Qquery Result', result[0])
        return exists.resolve({ flowTopicExists: result[0].flowCount > 0 })
      })
      .catch(err => {
        __logger.error('error in get flowTopicExists: ', err)
        exists.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return exists.promise
  }

  addFlow (body, wabaNumber, userId) {
    const flowAdded = q.defer()
    const inputData = {
      auotMessageFlowId: this.uniqueId.uuid(),
      identifierText: body.identifierText.trim().toLowerCase(),
      wabaPhoneNumber: wabaNumber,
      event: body.event,
      eventData: JSON.stringify(body.eventData) || null,
      flowTopic: body.flowTopic.trim().toLowerCase(),
      parentIdentifierText: body.parentIdentifierText.trim().toLowerCase(),
      identifierTextName: body.identifierDisplayName,
      createdBy: userId
    }

    const queryParam = []
    _.each(inputData, (val) => queryParam.push(val))
    __logger.info('Addddddddddd flow->', inputData, queryParam)
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.addFlow(), queryParam)
      .then(result => {
        if (result && result.affectedRows && result.affectedRows > 0) {
          flowAdded.resolve(inputData)
        } else {
          flowAdded.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
        }
      })
      .catch(err => {
        __logger.error('error:: addFlow : ', err)
        flowAdded.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return flowAdded.promise
  }

  updateFlow (reqBody, oldData, userId) {
    const flowUpdated = q.defer()
    const updateData = {
      identifierText: reqBody.identifierText ? reqBody.identifierText.trim().toLowerCase() : oldData.identifierText,
      event: reqBody.event || oldData.event,
      eventData: JSON.stringify(reqBody.eventData) || (typeof oldData.eventData === 'object' ? JSON.stringify(oldData.eventData) : oldData.eventData),
      flowTopic: reqBody.flowTopic ? reqBody.flowTopic.trim().toLowerCase() : oldData.flowTopic,
      parentIdentifierText: reqBody.parentIdentifierText !== undefined ? (reqBody.parentIdentifierText === null ? null : reqBody.parentIdentifierText.trim().toLowerCase()) : oldData.parentIdentifierText,
      identifierTextName: reqBody.identifierDisplayName || oldData.identifierTextName,
      updatedBy: userId
    }
    const queryParam = []
    _.each(updateData, (val) => queryParam.push(val))
    queryParam.push(reqBody.auotMessageFlowId)
    __logger.info('updateeeeeee flow->', updateData, queryParam)
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.updateFlow(), queryParam)
      .then(result => {
        if (result && result.affectedRows && result.affectedRows > 0) {
          flowUpdated.resolve(updateData)
        } else {
          flowUpdated.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
        }
      })
      .catch(err => {
        __logger.error('error:: updateFlow : ', err)
        flowUpdated.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return flowUpdated.promise
  }
}

module.exports = DbService
