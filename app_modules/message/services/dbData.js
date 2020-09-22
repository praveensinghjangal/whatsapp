const q = require('q')
const _ = require('lodash')
const moment = require('moment')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const __db = require('../../../lib/db')
const queryProvider = require('../queryProvider')
const ValidatonService = require('../services/validation')

class MessgaeHistoryService {
  getMessageHistoryTableDataWithId (messageId) {
    __logger.info('inside get message history by id service', typeof messageId)
    const messageHistoryData = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getMessageTableDataWithId(), [messageId])
      .then(result => {
        // console.log('Query Result', result)
        if (result && result.length > 0) {
          messageHistoryData.resolve(result)
        } else {
          messageHistoryData.resolve(null)
        }
      })
      .catch(err => {
        __logger.error('error in get audience by id function: ', err)
        messageHistoryData.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return messageHistoryData.promise
  }

  getMessageIdByServiceProviderMsgId (serviceProviderMessageId) {
    const messageHistoryData = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getMessageIdByServiceProviderMsgId(), [serviceProviderMessageId])
      .then(result => {
        console.log('Query Result', result)
        if (result && result.length > 0) {
          messageHistoryData.resolve({ messageId: result[0].messageId, serviceProviderId: result[0].serviceProviderId, businessNumber: result[0].businessNumber, endConsumerNumber: result[0].endConsumerNumber })
        } else {
          messageHistoryData.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {} })
        }
      })
      .catch(err => {
        __logger.error('error in get audience by id function: ', err)
        messageHistoryData.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return messageHistoryData.promise
  }

  addMessageHistoryDataService (dataObj) {
    const messageHistoryDataAdded = q.defer()
    const validate = new ValidatonService()
    let msgId = ''
    let bnNum = ''
    let ecNum = ''
    __logger.info('Add message history service called', dataObj)
    validate.addMessageHistory(dataObj)
      .then(valres => {
        if (!dataObj.messageId) {
          return this.getMessageIdByServiceProviderMsgId(dataObj.serviceProviderMessageId)
        } else {
          return { messageId: dataObj.messageId }
        }
      })
      .then(dbData => {
        msgId = dbData.messageId
        bnNum = dbData.businessNumber ? dbData.businessNumber : dataObj.businessNumber
        ecNum = dbData.endConsumerNumber ? dbData.endConsumerNumber : dataObj.endConsumerNumber
        const queryParam = []
        const messageHistoryData = {
          messageId: msgId,
          serviceProviderMessageId: dataObj.serviceProviderMessageId,
          serviceProviderId: dataObj.serviceProviderId ? dataObj.serviceProviderId : dbData.serviceProviderId,
          deliveryChannel: dataObj.deliveryChannel ? dataObj.deliveryChannel : __constants.DELIVERY_CHANNEL.whatsapp,
          statusTime: moment.utc(dataObj.statusTime).format('YYYY-MM-DDTHH:mm:ss'),
          state: dataObj.state,
          endConsumerNumber: ecNum,
          businessNumber: bnNum
        }
        _.each(messageHistoryData, val => queryParam.push(val))
        return queryParam
      })
      .then(queryParamArr => __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.addMessageHistoryData(), queryParamArr))
      .then(result => {
        // console.log('Add Result', result)
        if (result && result.affectedRows && result.affectedRows > 0) {
          messageHistoryDataAdded.resolve({ dataAdded: true, messageId: msgId, businessNumber: bnNum, endConsumerNumber: ecNum })
        } else {
          messageHistoryDataAdded.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: {} })
        }
      })
      .catch(err => messageHistoryDataAdded.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err }))
    return messageHistoryDataAdded.promise
  }

  getMessageCount (userId, startDate, endDate) {
    const messageStatus = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getMessageStatusCount(), [userId, startDate, endDate, userId, startDate, endDate])
      .then(result => {
        if (result && result.length > 0) {
          __logger.info('dbData---', result)
          messageStatus.resolve(result)
        } else {
          __logger.info('Failed to get Data')
          messageStatus.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {} })
        }
      })
      .catch(err => {
        __logger.error('error in get message status count function: ', err)
        messageStatus.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return messageStatus.promise
  }

  getMessageStatusList (status, startDate, endDate, ItemsPerPage, offset, userId) {
    const messageStatus = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getMessageStatusList(), [status, startDate, endDate, userId, startDate, endDate, userId, ItemsPerPage, offset, status, startDate, endDate, userId, startDate, endDate, userId])
      .then(result => {
        if (result && result.length > 0) {
          messageStatus.resolve(result)
        } else {
          __logger.info('Failed to get Data')
          messageStatus.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {} })
        }
      })
      .catch(err => {
        __logger.error('error in get message status list function: ', err)
        messageStatus.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return messageStatus.promise
  }

  getIncomingOutgoingMessageCount (userId, startDate, endDate, flag) {
    const messageStatus = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getIncomingOutgoingMessageCount(flag), [userId, startDate, endDate, userId, startDate, endDate, userId, startDate, endDate])
      .then(result => {
        if (result && result.length > 0) {
          let dataCount = {}
          if (flag) {
            dataCount = result[0]
          } else {
            dataCount = { incomingMessageCount: result[0][0].incomingMessageCount, outgoingMessageCount: result[1][0].outgoingMessageCount, totalMessageCount: result[0][0].incomingMessageCount + result[1][0].outgoingMessageCount }
          }
          __logger.info('Res----', result, dataCount)
          messageStatus.resolve(dataCount)
        } else {
          __logger.info('Failed to get Data')
          messageStatus.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {} })
        }
      })
      .catch(err => {
        __logger.error('error in get message transaction count function: ', err)
        messageStatus.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return messageStatus.promise
  }

  getMessageTransactionList (userId, startDate, endDate, flag, ItemsPerPage, offset) {
    const messageStatus = q.defer()
    let qry = ''
    let qryParam = []
    if (flag === __constants.MESSAGE_TRANSACTION_TYPE[0]) {
      qry = queryProvider.getIncomingMessageTransaction()
      qryParam = [userId, startDate, endDate, ItemsPerPage, offset, userId, startDate, endDate]
    } else if (flag === __constants.MESSAGE_TRANSACTION_TYPE[1]) {
      qry = queryProvider.getOutgoingMessageTransaction()
      qryParam = [userId, startDate, endDate, userId, startDate, endDate, ItemsPerPage, offset, userId, startDate, endDate, userId, startDate, endDate]
    }
    __db.mysql.query(__constants.HW_MYSQL_NAME, qry, qryParam)
      .then(result => {
        if (result && result.length > 0) {
          messageStatus.resolve(result)
        } else {
          __logger.info('Failed to get Data')
          messageStatus.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {} })
        }
      })
      .catch(err => {
        __logger.error('error in get outgoing message transaction list function: ', err)
        messageStatus.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return messageStatus.promise
  }
}

module.exports = MessgaeHistoryService
