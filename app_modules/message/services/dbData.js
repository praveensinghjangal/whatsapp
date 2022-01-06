const q = require('q')
const _ = require('lodash')
const moment = require('moment')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const __db = require('../../../lib/db')
const queryProvider = require('../queryProvider')
const ValidatonService = require('../services/validation')
const noTableFoundHandler = require('../../../lib/util/noTableFoundHandler')
const { Base64 } = require('../../../lib/util/encodeDecode')
const __config = require('../../../config')

class MessgaeHistoryService {
  getMessageHistoryTableDataWithId (messageId, date) {
    __logger.info('getMessageHistoryTableDataWithId::>>>>>>>>>>>>')
    __logger.info('inside get message history by id service', typeof messageId)
    const messageHistoryData = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getMessageTableDataWithId(date), [messageId])
      .then(result => {
        __logger.info('Query Result', { result })
        if (result && result.length > 0) {
          messageHistoryData.resolve(result)
        } else {
          messageHistoryData.resolve(null)
        }
      })
      .catch(err => {
        __logger.error('error in get audience by id function: ', err)
        return noTableFoundHandler(messageHistoryData, err)
      })
    return messageHistoryData.promise
  }

  addMessageIdMappingData (insertBulkMessage) {
    const messageHistoryDataAdded = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.addMessageIdMappingData(), insertBulkMessage)
      .then(result => {
        __logger.info('Add Result then 4', { result })
        if (result && result.affectedRows && result.affectedRows > 0) {
          messageHistoryDataAdded.resolve(true)
        } else {
          messageHistoryDataAdded.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: {} })
        }
      })
      .catch(err => {
        messageHistoryDataAdded.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return messageHistoryDataAdded.promise
  }

  getMessageIdByServiceProviderMsgId (serviceProviderMessageId) {
    __logger.info('getMessageIdByServiceProviderMsgId::>>>>>>>>>>>>', serviceProviderMessageId)
    const messageHistoryData = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getMessageIdByServiceProviderMsgId(), [serviceProviderMessageId])
      .then(result => {
        __logger.info('Query Result', { result })
        if (result && result.length > 0) {
          const base64 = new Base64()
          const str = result[0].messageId.split('-').slice(-1)[0]
          const date = base64.decode(str || '')
          messageHistoryData.resolve({ messageId: result[0].messageId, businessNumber: result[0].businessNumber, endConsumerNumber: result[0].endConsumerNumber, customOne: result[0].customOne || null, customTwo: result[0].customTwo || null, customThree: result[0].customThree || null, customFour: result[0].customFour || null, date })
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
    __logger.info('addMessageHistoryDataService::>>>>>>>>>33>>>', dataObj)
    const messageHistoryDataAdded = q.defer()
    const validate = new ValidatonService()
    let msgId = ''
    let bnNum = ''
    let ecNum = ''
    const custom = {}
    let tempDate
    __logger.info('Add message history service called', dataObj)
    validate.addMessageHistory(dataObj)
      .then(valres => {
        __logger.info('valres then 1', { valres })
        if (!dataObj.messageId) {
          return this.getMessageIdByServiceProviderMsgId(dataObj.serviceProviderMessageId)
        } else {
          return { messageId: dataObj.messageId }
        }
      })
      .then(dbData => {
        tempDate = dbData.date
        __logger.info('dbData then 2', { dataObj })
        msgId = dbData.messageId
        bnNum = dbData.businessNumber ? dbData.businessNumber : dataObj.businessNumber
        ecNum = dbData.endConsumerNumber ? dbData.endConsumerNumber : dataObj.endConsumerNumber
        const queryParam = []
        custom.customOne = dbData.customOne || dataObj.customOne || null
        custom.customTwo = dbData.customTwo || dataObj.customTwo || null
        custom.customThree = dbData.customThree || dataObj.customThree || null
        custom.customFour = dbData.customFour || dataObj.customFour || null
        const messageHistoryData = {
          messageId: msgId,
          serviceProviderMessageId: dataObj.serviceProviderMessageId,
          serviceProviderId: __config.service_provider_id.facebook,
          deliveryChannel: dataObj.deliveryChannel ? dataObj.deliveryChannel : __constants.DELIVERY_CHANNEL.whatsapp,
          statusTime: moment.utc(dataObj.statusTime).format('YYYY-MM-DDTHH:mm:ss'),
          state: dataObj.state,
          endConsumerNumber: ecNum,
          businessNumber: bnNum,
          errors: dataObj.errors ? JSON.stringify(dataObj.errors) : '[]',
          customOne: custom.customOne,
          customTwo: custom.customTwo,
          customThree: custom.customThree,
          customFour: custom.customFour
        }
        _.each(messageHistoryData, val => queryParam.push(val))
        __db.mysql.query(__constants.HW_MYSQL_MIS_NAME, queryProvider.addMessageHistoryDataInMis(), queryParam)
        return queryParam
      })
      .then(queryParamArr => __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.addMessageHistoryData(dataObj.date || tempDate), queryParamArr))
      .then(result => {
        __logger.info('Add Result then 4', { result })
        if (result && result.affectedRows && result.affectedRows > 0) {
          messageHistoryDataAdded.resolve({ dataAdded: true, messageId: msgId, businessNumber: bnNum, endConsumerNumber: ecNum, custom })
        } else {
          messageHistoryDataAdded.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: {} })
        }
      })
      .catch(err => {
        if (err && err.message && typeof err.message === 'string' && err.message.slice(err.message.length - 13) === "doesn't exist") {
          this.retryByCreating(dataObj, [{ date: dataObj.date || tempDate || null }])
            .then(result => {
              messageHistoryDataAdded.resolve(result)
            })
            .catch(err => {
              messageHistoryDataAdded.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
            })
        } else {
          messageHistoryDataAdded.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
        }
      })
    return messageHistoryDataAdded.promise
  }

  retryByCreating (paramsOne, paramsTwo, bulk) {
    const messageHistoryDataAdded = q.defer()
    const func = bulk ? 'addMessageHistoryDataInBulk' : 'addMessageHistoryDataService'
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.createMessageHistoryTable(paramsTwo[0].date), null)
      .then(result => {
        if (result) {
          return this[func](paramsOne, paramsTwo)
        } else {
          messageHistoryDataAdded.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: {} })
        }
      })
      .then(data => messageHistoryDataAdded.resolve(data))
      .catch((err) => {
        if (err && err.message && typeof err.message === 'string' && err.message.slice(err.message.length - 14) === 'already exists') {
          this[func](paramsOne, paramsTwo)
            .then(result => {
              messageHistoryDataAdded.resolve(result)
            })
            .catch(err => {
              messageHistoryDataAdded.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
            })
        } else {
          messageHistoryDataAdded.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
        }
      })
    return messageHistoryDataAdded.promise
  }

  addMessageHistoryDataInBulk (msgInsertData, dataObj) {
    __logger.info('addMessageHistoryDataService::>>>>>>>>>>>>23', dataObj)
    const messageHistoryDataAdded = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_MIS_NAME, queryProvider.addMessageHistoryDataInBulkInMis(), [msgInsertData])
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.addMessageHistoryDataInBulk(dataObj[0].date), [msgInsertData])
      .then(result => {
        if (result && result.affectedRows && result.affectedRows > 0) {
          messageHistoryDataAdded.resolve(dataObj)
        } else {
          messageHistoryDataAdded.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: {} })
        }
      })
      .catch(err => {
        if (err && err.message && typeof err.message === 'string' && err.message.slice(err.message.length - 13) === "doesn't exist") {
          this.retryByCreating(msgInsertData, dataObj, true)
            .then(result => {
              messageHistoryDataAdded.resolve(result)
            })
            .catch(err => {
              messageHistoryDataAdded.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
            })
        } else {
          messageHistoryDataAdded.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
        }
      })
    return messageHistoryDataAdded.promise
  }

  getMessageCount (wabaPhoneNumber, startDate, endDate) {
    __logger.info('getMessageCount::>>>>>>>>>>>>')
    const messageStatus = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_MIS_NAME, queryProvider.getMessageStatusCount(), [wabaPhoneNumber, startDate, endDate, wabaPhoneNumber, startDate, endDate])
      .then(result => {
        __logger.info('result', { result })
        if (result && result.length > 0) {
          __logger.info('dbData---', { result })
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

  getMessageStatusList (status, startDate, endDate, ItemsPerPage, offset, wabaPhoneNumber) {
    __logger.info('getMessageStatusList::>>>>>>>>>>>>')
    const messageStatus = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_MIS_NAME, queryProvider.getMessageStatusList(), [status, startDate, endDate, wabaPhoneNumber, startDate, endDate, wabaPhoneNumber, ItemsPerPage, offset, status, startDate, endDate, wabaPhoneNumber, startDate, endDate, wabaPhoneNumber])
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
    __logger.info('getIncomingOutgoingMessageCount::>>>>>>>>>>>>')
    const messageStatus = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getIncomingOutgoingMessageCount(flag), [userId, startDate, endDate, userId, startDate, endDate])
      .then(result => {
        if (result && result.length > 0) {
          const dataCount = { outgoingMessageCount: { session: 0, template: 0, total: 0 }, incomingMessageCount: 0 }
          if (flag === __constants.MESSAGE_TRANSACTION_TYPE[0]) {
            dataCount.incomingMessageCount = result[0].incomingMessageCount
          } else {
            let outgoingTotal = 0
            let loopObj = result
            if (flag !== __constants.MESSAGE_TRANSACTION_TYPE[1]) {
              dataCount.incomingMessageCount = result[0][0].incomingMessageCount
              loopObj = result[1]
            }
            _.each(loopObj, singleRow => {
              dataCount.outgoingMessageCount[singleRow.messageType] = singleRow.count
              outgoingTotal += singleRow.count
            })
            dataCount.outgoingMessageCount.total = outgoingTotal
          }
          dataCount.totalMessageCount = dataCount.outgoingMessageCount.total + dataCount.incomingMessageCount
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

  getMessageTransactionList (userId, startDate, endDate, flag, ItemsPerPage, offset, sort, wabaPhoneNumber) {
    __logger.info('getMessageTransactionList::>>>>>>>>>>>>')
    const messageStatus = q.defer()
    let qry = ''
    let qryParam = []
    let connection
    if (flag === __constants.MESSAGE_TRANSACTION_TYPE[0]) {
      connection = __constants.HW_MYSQL_NAME
      qry = queryProvider.getIncomingMessageTransaction(sort)
      qryParam = [userId, startDate, endDate, ItemsPerPage, offset, userId, startDate, endDate]
    } else if (flag === __constants.MESSAGE_TRANSACTION_TYPE[1]) {
      connection = __constants.HW_MYSQL_MIS_NAME
      qry = queryProvider.getOutgoingMessageTransaction()
      qryParam = [wabaPhoneNumber, startDate, endDate, wabaPhoneNumber, startDate, endDate, ItemsPerPage, offset, wabaPhoneNumber, startDate, endDate, wabaPhoneNumber, startDate, endDate]
    }
    __db.mysql.query(connection, qry, qryParam)
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

  getOutgoingTransactionListBySearchFilters (wabaPhoneNumber, startDate, endDate, ItemsPerPage, offset, endUserNumber) {
    __logger.info('getOutgoingTransactionListBySearchFilters::>>>>>>>>>>>>', endUserNumber)
    const messageStatus = q.defer()
    let queryParams = [wabaPhoneNumber, startDate, endDate]
    if (endUserNumber) queryParams.push(endUserNumber)
    queryParams = queryParams.concat(queryParams) // duplicated values of array for inner query for max msgId
    queryParams.push(ItemsPerPage, offset) // added offset and item per page
    queryParams = queryParams.concat(queryParams) // duplicated values of array for count query
    queryParams.splice(queryParams.length - 2, 2) //  removed offset and item per page from count query
    __db.mysql.query(__constants.HW_MYSQL_MIS_NAME, queryProvider.getOutgoingTransactionListBySearchFilters(!!endUserNumber), queryParams)
      .then(result => {
        if (result && result[0] && result[0].length > 0) {
          __logger.info('Res----', result)
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

  getVivaMsgIdByserviceProviderMsgId (rmqObject) {
    const messageId = q.defer()
    __logger.info('inside getVivaMsgIdByserviceProviderMsgId')
    const msgIdDbCheck = rmqObject.messageId || null
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getVivaMsgIdByserviceProviderMsgId(), [msgIdDbCheck])
      .then(result => {
        if (result && result[0] && result[0].message_id) {
          messageId.resolve({ messageId: result[0].message_id })
        } else {
          __logger.info('NO_RECORDS_FOUND >>>>>>>>> getVivaMsgIdByserviceProviderMsgId db call')
          messageId.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {} })
        }
      })
      .catch(err => {
        __logger.error('error in getVivaMsgIdByserviceProviderMsgId db call:', err)
        messageId.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return messageId.promise
  }
}

module.exports = MessgaeHistoryService
