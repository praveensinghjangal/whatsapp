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
}

module.exports = DbService
