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
const UniqueId = require('../../../lib/util/uniqueIdGenerator')

class MessgaeHistoryService {
  getMessageHistoryTableDataWithId (messageId, date) {
    __logger.info('dbData: getMessageHistoryTableDataWithId():')
    const messageHistoryData = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getMessageTableDataWithId(date), [messageId])
      .then(result => {
        __logger.info('dbData: getMessageHistoryTableDataWithId(): Query Result:', { result })
        if (result && result.length > 0) {
          messageHistoryData.resolve(result)
        } else {
          messageHistoryData.resolve(null)
        }
      })
      .catch(err => {
        __logger.info('dbData: getMessageHistoryTableDataWithId(): catch:', err)
        return noTableFoundHandler(messageHistoryData, err)
      })
    return messageHistoryData.promise
  }

  addMessageIdMappingData (insertBulkMessage) {
    const messageHistoryDataAdded = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.addMessageIdMappingData(), insertBulkMessage)
      .then(result => {
        __logger.info('dbData: addMessageIdMappingData(): then 1:', { result })
        if (result && result.affectedRows && result.affectedRows > 0) {
          messageHistoryDataAdded.resolve(true)
        } else {
          __logger.error('dbData: addMessageIdMappingData(): then 1: Reject :: ')
          messageHistoryDataAdded.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: {} })
        }
      })
      .catch(err => {
        __logger.error('dbData: addMessageIdMappingData(): catch: ')
        messageHistoryDataAdded.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return messageHistoryDataAdded.promise
  }

  getMessageIdByServiceProviderMsgId (serviceProviderMessageId) {
    __logger.info('dbData: getMessageIdByServiceProviderMsgId():', serviceProviderMessageId)
    const messageHistoryData = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getMessageIdByServiceProviderMsgId(), [serviceProviderMessageId])
      .then(result => {
        __logger.info('dbData: getMessageIdByServiceProviderMsgId(): Query Result: ', result)
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
        __logger.error('dbData: getMessageIdByServiceProviderMsgId(): catch: ', err)
        messageHistoryData.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return messageHistoryData.promise
  }

  addMessageHistoryDataService (dataObj, object, isSecondAttemp = null) { // isSecondAttemp is populated with date on retry
    __logger.info('dbData: addMessageHistoryDataService():', dataObj)
    const messageHistoryDataAdded = q.defer()
    const validate = new ValidatonService()
    let msgId = ''
    let bnNum = ''
    let ecNum = ''
    let countryName = ''
    const custom = {}
    let campName = null
    let errors = null
    let tempDate
    validate.addMessageHistory(dataObj)
      .then(valres => {
        __logger.info('dbData: addMessageHistoryDataService(): then 1:', valres)
        if (!dataObj.messageId) {
          return this.getMessageIdByServiceProviderMsgId(dataObj.serviceProviderMessageId)
        } else {
          return { messageId: dataObj.messageId }
        }
      })
      .then(dbData => {
        __logger.info('dbData: addMessageHistoryDataService(): then 2:', dbData)
        tempDate = dbData.date
        msgId = dbData.messageId
        bnNum = dbData.businessNumber ? dbData.businessNumber : dataObj.businessNumber
        ecNum = dbData.endConsumerNumber ? dbData.endConsumerNumber : dataObj.endConsumerNumber
        countryName = dbData.countryName ? dbData.countryName : dataObj.countryName
        const queryParam = []
        custom.customOne = dbData.customOne || dataObj.customOne || null
        custom.customTwo = dbData.customTwo || dataObj.customTwo || null
        custom.customThree = dbData.customThree || dataObj.customThree || null
        custom.customFour = dbData.customFour || dataObj.customFour || null
        campName = dataObj.campName || null
        errors = dataObj.errors || []
        const internalErrorMsg = dataObj.errorMsg || null
        if (errors != null) {
          errors = internalErrorMsg ? errors.concat(internalErrorMsg) : errors
        } else if (internalErrorMsg) {
          errors = errors.concat(internalErrorMsg)
        }
        const messageHistoryData = {
          messageId: msgId,
          serviceProviderMessageId: dataObj.serviceProviderMessageId || null,
          serviceProviderId: __config.service_provider_id.facebook,
          deliveryChannel: dataObj.deliveryChannel ? dataObj.deliveryChannel : __constants.DELIVERY_CHANNEL.whatsapp,
          statusTime: moment.utc(dataObj.statusTime).format('YYYY-MM-DDTHH:mm:ss'),
          state: dataObj.state,
          endConsumerNumber: ecNum,
          countryName: countryName,
          businessNumber: bnNum,
          errors: JSON.stringify(errors),
          customOne: custom.customOne,
          customTwo: custom.customTwo,
          customThree: custom.customThree,
          customFour: custom.customFour,
          conversationId: dataObj.conversationId || null,
          campName: campName
        }
        _.each(messageHistoryData, val => queryParam.push(val))
        if (!isSecondAttemp) {
          const uniqueId = new UniqueId()
          __db.mysql.query(__constants.HW_MYSQL_MIS_NAME, queryProvider.addMessageHistoryDataInMis(), queryParam)
          const statusData = {
            senderPhoneNumber: ecNum,
            eventType: dataObj.state,
            eventId: uniqueId.uuid(),
            messageId: msgId,
            sendTime: new Date(),
            serviceProviderMessageId: dataObj.serviceProviderMessageId || ''
          }
          this.addStatusToMessage(statusData, msgId)
        }
        return queryParam
      })
      .then(queryParamArr => {
        return __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.addMessageHistoryData(dataObj.date || tempDate), queryParamArr)
      })
      .then(result => {
        __logger.info('dbData: addMessageHistoryDataService(): then 4:', result)
        if (result && result.affectedRows && result.affectedRows > 0) {
          messageHistoryDataAdded.resolve({ dataAdded: true, messageId: msgId, businessNumber: bnNum, endConsumerNumber: ecNum, custom, campName, errors })
        } else {
          messageHistoryDataAdded.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: {} })
        }
      })
      .catch(err => {
        __logger.error('dbData: addMessageHistoryDataService(): catch:', err)
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

  retryByCreating (paramsOne, paramsTwo, bulk, mongoBulkObject) {
    const messageHistoryDataAdded = q.defer()
    const func = bulk ? 'addMessageHistoryDataInBulk' : 'addMessageHistoryDataService'
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.createMessageHistoryTable(paramsTwo[0].date), null)
      .then(result => {
        if (result) {
          return this[func](paramsOne, paramsTwo, true, mongoBulkObject)
        } else {
          messageHistoryDataAdded.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: {} })
        }
      })
      .then(data => messageHistoryDataAdded.resolve(data))
      .catch((err) => {
        if (err && err.message && typeof err.message === 'string' && err.message.slice(err.message.length - 14) === 'already exists') {
          this[func](paramsOne, paramsTwo, false, mongoBulkObject)
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

  addMessageHistoryDataInBulk (msgInsertData, dataObj, isSecondAttemp = null, mongoBulkObject) {
    __logger.info('dbData: addMessageHistoryDataInBulk():', dataObj.length)
    const messageHistoryDataAdded = q.defer()
    if (!isSecondAttemp) {
      __logger.info('dbData: addMessageHistoryDataInBulk(' + (mongoBulkObject[0].campName ? mongoBulkObject[0].campName : '') + '): First Attempt....')
      __db.mysql.query(__constants.HW_MYSQL_MIS_NAME, queryProvider.addMessageHistoryDataInBulkInMis(), [msgInsertData])
      this.addBulkMessageStatusData(mongoBulkObject)
    }
    __logger.info('dbData: addMessageHistoryDataInBulk(' + (mongoBulkObject[0].campName ? mongoBulkObject[0].campName : '') + '): First Attempt Followed....')
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.addMessageHistoryDataInBulk(dataObj[0].date), [msgInsertData])
      .then(result => {
        if (result && result.affectedRows && result.affectedRows > 0) {
          messageHistoryDataAdded.resolve(dataObj)
        } else {
          messageHistoryDataAdded.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: {} })
        }
      })
      .catch(err => {
        __logger.error('dbData: addMessageHistoryDataInBulk(): catch:', err)
        if (err && err.message && typeof err.message === 'string' && err.message.slice(err.message.length - 13) === "doesn't exist") {
          this.retryByCreating(msgInsertData, dataObj, true, mongoBulkObject)
            .then(result => {
              messageHistoryDataAdded.resolve(result)
            })
            .catch(err => {
              __logger.error('dbData: addMessageHistoryDataInBulk(): retryByCreating(): catch 2:', err)
              messageHistoryDataAdded.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
            })
        } else {
          __logger.error('dbData: addMessageHistoryDataInBulk(): retryByCreating(): catch 1: if/else:', err)
          messageHistoryDataAdded.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
        }
      })
    return messageHistoryDataAdded.promise
  }

  getMessageCount (wabaPhoneNumber, startDate, endDate) {
    __logger.info('dbData: getMessageCount():', wabaPhoneNumber)
    const messageStatus = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_MIS_NAME, queryProvider.getMessageStatusCount(), [wabaPhoneNumber, startDate, endDate])
      .then(result => {
        __logger.info('dbData: getMessageCount(): Query Result:', result)
        if (result && result.length) {
          messageStatus.resolve(result)
        } else {
          __logger.error('dbData: getMessageCount(): Query Result: No data found.')
          messageStatus.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {} })
        }
      })
      .catch(err => {
        __logger.error('dbData: getMessageCount(): catch:', err)
        messageStatus.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return messageStatus.promise
  }

  getMessageStatusList (status, startDate, endDate, ItemsPerPage, offset, wabaPhoneNumber) {
    const messageStatus = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_MIS_NAME, queryProvider.getMessageStatusList(), [status, startDate, endDate, wabaPhoneNumber, startDate, endDate, wabaPhoneNumber, ItemsPerPage, offset, status, startDate, endDate, wabaPhoneNumber, startDate, endDate, wabaPhoneNumber])
      .then(result => {
        if (result && result.length > 0) {
          messageStatus.resolve(result)
        } else {
          __logger.info('dbData: getMessageStatusList(): Failed to get Data')
          messageStatus.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {} })
        }
      })
      .catch(err => {
        __logger.error('dbData: getMessageStatusList(): catch:', err)
        messageStatus.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return messageStatus.promise
  }

  getIncomingOutgoingMessageCount (userId, startDate, endDate, flag) {
    const messageStatus = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getIncomingOutgoingMessageCount(flag), [userId, startDate, endDate, userId, startDate, endDate])
      .then(result => {
        console.log('--------result----------', result)
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
          __logger.info('dbData: getIncomingOutgoingMessageCount(): ', result, dataCount)
          messageStatus.resolve(dataCount)
        } else {
          __logger.error('dbData: getIncomingOutgoingMessageCount(): Failed to get Data')
          messageStatus.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {} })
        }
      })
      .catch(err => {
        __logger.error('dbData: getIncomingOutgoingMessageCount(): catch: ', err)
        messageStatus.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return messageStatus.promise
  }

  getMessageTransactionList (userId, startDate, endDate, flag, ItemsPerPage, offset, sort, wabaPhoneNumber) {
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
          __logger.info('dbData: getMessageTransactionList(): Failed to get Data')
          messageStatus.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {} })
        }
      })
      .catch(err => {
        __logger.error('dbData: getMessageTransactionList(): catch: ', err)
        messageStatus.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return messageStatus.promise
  }

  getOutgoingTransactionListBySearchFilters (wabaPhoneNumber, startDate, endDate, ItemsPerPage, offset, endUserNumber) {
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
          __logger.info('dbData: getOutgoingTransactionListBySearchFilters(): ', result)
          messageStatus.resolve(result)
        } else {
          __logger.error('dbData: getOutgoingTransactionListBySearchFilters(): failed to get data')
          messageStatus.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {} })
        }
      })
      .catch(err => {
        __logger.error('dbData: getOutgoingTransactionListBySearchFilters(): catch:', err)
        messageStatus.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return messageStatus.promise
  }

  getVivaMsgIdByserviceProviderMsgId (rmqObject) {
    const messageId = q.defer()
    const msgIdDbCheck = rmqObject.messageId || null
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getVivaMsgIdByserviceProviderMsgId(), [msgIdDbCheck])
      .then(result => {
        if (result && result[0] && result[0].message_id) {
          messageId.resolve({ messageId: result[0].message_id })
        } else {
          __logger.error('dbData: getVivaMsgIdByserviceProviderMsgId(): DB Query: NO_RECORDS_FOUND..... ::: Reject :::')
          messageId.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {} })
        }
      })
      .catch(err => {
        __logger.error('dbData: getVivaMsgIdByserviceProviderMsgId(): catch:', err)
        messageId.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return messageId.promise
  }

  getWabaNameByWabaNumber (arrayofWabaNumber) {
    const promises = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getWabaNameByWabaNumber(), [arrayofWabaNumber])
      .then(result => {
        __logger.info('dbData: getWabaNameByWabaNumber():', result)
        if (result && result.length > 0) {
          promises.resolve(result)
        } else {
          __logger.info('dbData: getWabaNameByWabaNumber(): db call: NO_RECORDS_FOUND...')
          promises.resolve({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {} })
        }
      })
      .catch(err => {
        __logger.error('dbData: getWabaNameByWabaNumber(): db call:', err)
        promises.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return promises.promise
  }

  getMisRelatedData (startOfMonth, endOfMonth) {
    const promises = q.defer()
    __logger.info('dbData: getMisRelatedData(): ', startOfMonth, endOfMonth)
    __db.mysqlMis.query(__constants.HW_MYSQL_MIS_NAME, queryProvider.getMisRelatedData(), [startOfMonth + ' 00:00:00', endOfMonth + ' 23:59:59'])
      .then(result => {
        if (result && result.length > 0) {
          __logger.info('dbData: getMisRelatedData():', result)
          promises.resolve(result)
        } else {
          __logger.error('dbData: getMisRelatedData(): NO_RECORDS_FOUND')
          promises.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {} })
        }
      })
      .catch(err => {
        __logger.error('dbData: getMisRelatedData(): catch:', err)
        promises.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return promises.promise
  }

  getMisRelatedDataMonth (startOfMonth, endOfMonth) {
    const promises = q.defer()
    __logger.info('dbData: getMisRelatedDataMonth(): ', startOfMonth, endOfMonth)
    __db.mysqlMis.query(__constants.HW_MYSQL_MIS_NAME, queryProvider.getMisRelatedDataMonth(), [startOfMonth + ' 00:00:00', endOfMonth + ' 23:59:59'])
      .then(result => {
        if (result && result.length > 0) {
          __logger.info('dbData: getMisRelatedDataMonth(): data:', result)
          promises.resolve(result)
        } else {
          __logger.error('dbData: getMisRelatedDataMonth(): NO_RECORDS_FOUND')
          promises.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {} })
        }
      })
      .catch(err => {
        __logger.error('dbData: getMisRelatedDataMonth(): catch:', err)
        promises.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return promises.promise
  }

  addUpdateCounts (updateObject) {
    const addedUpdated = q.defer()
    __db.mongo.__updateWithInsert(__constants.DB_NAME, __constants.ENTITY_NAME.MESSAGE_STATUS, { wabaPhoneNumber: updateObject.wabaPhoneNumber, date: updateObject.date }, updateObject)
      .then(data => {
        __logger.info('dbData: addUpdateCounts(): Adding or Updating audience optin', updateObject)
        if (data && data.result && data.result.ok > 0) {
          addedUpdated.resolve(true)
        } else {
          __logger.error('dbData: addUpdateCounts(): No data found ')
          addedUpdated.reject({ type: __constants.RESPONSE_MESSAGES.FAILED, err: {} })
        }
      })
      .catch(err => {
        __logger.error('dbData: addUpdateCounts(): catch: ', err)
        addedUpdated.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return addedUpdated.promise
  }

  addUpdateCountsAgainst (updateObject) {
    const addedUpdated = q.defer()
    __db.mongo.__updateWithInsert(__constants.DB_NAME, __constants.ENTITY_NAME.TEMEPLATE_SUMMARY, { wabaPhoneNumber: updateObject.wabaPhoneNumber, summaryDate: updateObject.summaryDate, templateId: updateObject.templateId }, updateObject)
      .then(data => {
        if (data && data.result && data.result.ok > 0) {
          addedUpdated.resolve(true)
        } else {
          __logger.error('dbData: addUpdateCounts(): No data found')
          addedUpdated.reject({ type: __constants.RESPONSE_MESSAGES.FAILED, err: {} })
        }
      })
      .catch(err => {
        __logger.error('dbData: addUpdateCounts(): catch: ', err)
        addedUpdated.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return addedUpdated.promise
  }

  addStatusToMessage (statusData, messageId) {
    const addMessageStatusData = q.defer()
    __db.mongo.__update_addToSet_and_other_param(__constants.DB_NAME, __constants.ENTITY_NAME.MESSAGES, { messageId }, { status: statusData }, { currentStatus: statusData.eventType || '', currentStatusTime: new Date(), serviceProviderMessageId: statusData.serviceProviderMessageId || '' })
      .then(data => {
        __logger.info('dbData: addStatusToMessage(): response', data)
        if (data && data.value && data.value.messageId && data.lastErrorObject && data.lastErrorObject.n && data.lastErrorObject.n > 0) {
          addMessageStatusData.resolve(statusData)
        } else {
          __logger.error('dbData: addStatusToMessage(): No data found')
          addMessageStatusData.reject({ type: __constants.RESPONSE_MESSAGES.STATUS_ADD_FAILED, err: {} })
        }
      })
      .catch(err => {
        __logger.error('dbData: addStatusToMessage(): catch: ', err)
        addMessageStatusData.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return addMessageStatusData.promise
  }

  addBulkMessageStatusData (msgStatusData) {
    __logger.info('dbData: addBulkMessageStatusData ', msgStatusData)
    const addMessageData = q.defer()
    __db.mongo.__insertMany(__constants.DB_NAME, __constants.ENTITY_NAME.MESSAGES, msgStatusData)
      .then(data => {
        __logger.info('dbData: addBulkMessageStatusData(): ', data)
        if (data && data.insertedCount > 0) {
          addMessageData.resolve(true)
        } else {
          __logger.error('dbData: addBulkMessageStatusData(): No data found')
          addMessageData.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: {} })
        }
      })
      .catch(err => {
        __logger.error('dbData: addBulkMessageStatusData(): catch: ', err)
        addMessageData.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return addMessageData.promise
  }

  messageStatusCountByDate (startDate, endDate) {
    const messageTemplate = q.defer()
    __db.mongo.__find(__constants.DB_NAME, __constants.ENTITY_NAME.MESSAGE_STATUS, { date: { $gte: new Date(startDate), $lte: new Date(endDate) } })
      .then(data => {
        __logger.info('dbData: messageStatusCountByDate(): ', data)
        if (data && data.length > 0) {
          messageTemplate.resolve(data || null)
        } else {
          __logger.error('dbData: messageStatusCountByDate(): No data found')
          messageTemplate.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: [] })
        }
      })
      .catch(err => {
        __logger.error('dbData: messageStatusCountByDate(): catch: ', err)
        messageTemplate.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return messageTemplate.promise
  }

  getAllUserStatusCountPerDay (startDate, endDate) {
    const messageTemplate = q.defer()
    __db.mongo.__custom_aggregate(__constants.DB_NAME, __constants.ENTITY_NAME.MESSAGES, [
      {

        $match: {
          createdOn: { $gte: new Date(startDate + 'T00:00:00.000Z'), $lte: new Date(endDate + 'T23:59:59.999Z') }
        }
      },
      {
        $group: {
          _id: { currentStatus: '$currentStatus', wabaPhoneNumber: '$wabaPhoneNumber', day: { $substr: ['$createdOn', 0, 10] } },
          sc: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: { wabaPhoneNumber: '$_id.wabaPhoneNumber', day: '$_id.day' },
          total: { $sum: '$sc' },
          status: {
            $push: {
              name: '$_id.currentStatus',
              count: '$sc'
            }
          }
        }
      },
      { $sort: { total: -1 } }
    ])
      .then(data => {
        __logger.info('dbData: getAllUserStatusCountPerDay(): ', data)
        if (data && data.length > 0) {
          messageTemplate.resolve(data || null)
        } else {
          __logger.error('dbData: getAllUserStatusCountPerDay(): No data found')
          messageTemplate.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: [] })
        }
      })
      .catch(err => {
        __logger.error('dbData: getAllUserStatusCountPerDay(): catch: ', err)
        messageTemplate.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return messageTemplate.promise
  }

  billingDataCount (startDate, endDate, wabaPhoneNumber) {
    const billingConversation = q.defer()
    const billingDataObj = {
      startDate: startDate || null,
      endDate: endDate || null,
      wabaPhoneNumber: wabaPhoneNumber || null
    }
    const queryParam = []
    _.each(billingDataObj, (val) => queryParam.push(val))
    __db.mysqlMis.query(__constants.HW_MYSQL_MIS_NAME, queryProvider.getDataOnBasisOfWabaNumberFromBillingCoversation(), queryParam)
      .then(result => {
        if (result) {
          billingConversation.resolve(result)
        } else {
          __logger.error('dbData: billingDataCount(): No data found.')
          billingConversation.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {} })
        }
      })
      .catch(err => {
        __logger.error('dbData: billingDataCount(): catch:', err)
        billingConversation.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return billingConversation.promise
  }

  // getUserDetailsAgainstWabaNumber (uniquewabaNumber) {
  //   const getUserDetailsAgainstWabaNumber = q.defer()
  //   __db.mysql.query(__constants.HW_MYSQL_MIS_NAME, queryProvider.getUserDetailsAgainstWabaNumber(), uniquewabaNumber)
  //     .then(result => {
  //       if (result) {
  //         return getUserDetailsAgainstWabaNumber.resolve(result[0])
  //       } else {
  //         return getUserDetailsAgainstWabaNumber.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {} })
  //       }
  //     })
  //     .catch(err => {
  //       return getUserDetailsAgainstWabaNumber.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
  //     })
  //   return getUserDetailsAgainstWabaNumber.promise
  // }

  addDataToUserWiseSummray (allUserDetails) {
    const addDataToUserWiseSummray = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_MIS_NAME, queryProvider.addDataToUserWiseSummray(), allUserDetails)
      .then(result => {
        if (result) {
          return addDataToUserWiseSummray.resolve(result[0])
        } else {
          __logger.error('dbData: addDataToUserWiseSummray(): No data found.')
          return addDataToUserWiseSummray.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {} })
        }
      })
      .catch(err => {
        __logger.error('dbData: addDataToUserWiseSummray(): catch:', err)
        return addDataToUserWiseSummray.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return addDataToUserWiseSummray.promise
  }

  getActiveBusinessNumber () {
    const getActiveBusinessNumber = q.defer()
    // __db.mysql.query(__constants.HW_MYSQL_MIS_NAME, queryProvider.getActiveBusinessNumber())
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getActiveBusinessNumber())
      .then(result => {
        if (result) {
          return getActiveBusinessNumber.resolve(result[0])
        } else {
          __logger.error('dbData: getActiveBusinessNumber(): No data found.')
          return getActiveBusinessNumber.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {} })
        }
      })
      .catch(err => {
        __logger.error('dbData: getActiveBusinessNumber(): catch:', err)
        return getActiveBusinessNumber.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return getActiveBusinessNumber.promise
  }

  // getCountOfStatusOfWabaNumber (wabaNumber) {
  //   const getCountOfStatusOfWabaNumber = q.defer()
  //   // console.log('1111111111111111111111111111111111111111111111', allUserDetails)
  //   __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getCountOfStatusOfWabaNumber(), [wabaNumber])
  //     .then(result => {
  //       if (result) {
  //         return getCountOfStatusOfWabaNumber.resolve(result)
  //       } else {
  //         return getCountOfStatusOfWabaNumber.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {} })
  //       }
  //     })
  //     .catch(err => {
  //       return getCountOfStatusOfWabaNumber.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
  //     })
  //   return getCountOfStatusOfWabaNumber.promise
  // }

  // getNewStateDataAgainstAllUser (wabaNumber, currentDate) {
  //   const getCountOfStatusOfWabaNumber = q.defer()
  //   // console.log('1111111111111111111111111111111111111111111111', allUserDetails)
  //   __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getNewStateDataAgainstAllUser(currentDate), [wabaNumber])
  //     .then(result => {
  //       if (result) {
  //         return getCountOfStatusOfWabaNumber.resolve(result)
  //       } else {
  //         return getCountOfStatusOfWabaNumber.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {} })
  //       }
  //     })
  //     .catch(err => {
  //       return getCountOfStatusOfWabaNumber.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
  //     })
  //   return getCountOfStatusOfWabaNumber.promise
  // }

  // insertStatusAgainstWaba (data) {
  //   console.log('**************************************', data)
  //   const insertStatusAgainstWaba = q.defer()
  //   const wabaNumbers = Object.keys(data)
  //   const values = []
  //   for (let i = 0; i < wabaNumbers.length; i++) {
  //     const country = wabaNumbers[i]
  //     const summary = data[country]
  //     const wabaNumbers1 = Object.keys(summary)
  //     for (let j = 0; j < wabaNumbers1.length; j++) {
  //       const requiredJson = {}
  //       const arr = summary[wabaNumbers1[j]]
  //       for (let k = 0; k < arr.length; k++) {
  //         requiredJson[arr[k].state] = arr[k]['count(state)']
  //       }
  //       const wabaNumberData = requiredJson
  //       const totalSubmission = wabaNumberData['pre process'] || 0
  //       const totalMessageSent = wabaNumberData.forwarded || 0
  //       const totalMessageInProcess = wabaNumberData.Inprocess || 0
  //       const totalMessageResourceAllocated = wabaNumberData['resource allocated'] || 0
  //       const totalMessageForwarded = wabaNumberData.forwarded || 0
  //       const totalMessageDeleted = wabaNumberData.deleted || 0
  //       const totalMessageSeen = wabaNumberData.seen || 0
  //       const totalMessageDelivered = wabaNumberData.delivered || 0
  //       const totalMessageAccepted = wabaNumberData.accepted || 0
  //       const totalMessageFailed = wabaNumberData.failed || 0
  //       const totalMessagePending = wabaNumberData['waiting for pending delivery'] || 0
  //       const totalMessageRejected = wabaNumberData.rejected || 0
  //       const deliveryPercentage = Math.round((totalMessageDelivered + Number.EPSILON * 100) / 100).toFixed(2)
  //       values.push([wabaNumbers1[j], country, totalSubmission, totalMessageSent, totalMessageInProcess, totalMessageResourceAllocated, totalMessageForwarded, totalMessageDeleted,
  //         totalMessageSeen, totalMessageDelivered, totalMessageAccepted, totalMessageFailed, totalMessagePending, totalMessageRejected, deliveryPercentage])
  //     }
  //   }
  //   console.log('final11111111111111111111111111', values)
  //   __db.mysqlMis.query(__constants.HW_MYSQL_MIS_NAME, queryProvider.insertuserwiseDataAgainstWaba(), [values])
  //     .then(result => {
  //       if (result) {
  //         return insertStatusAgainstWaba.resolve(result)
  //       } else {
  //         return insertStatusAgainstWaba.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {} })
  //       }
  //     })
  //     .catch(err => {
  //       return insertStatusAgainstWaba.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
  //     })
  //   return insertStatusAgainstWaba.promise
  // }

  // checkTableExist (date) {
  //   const checkTableExist = q.defer()
  //   __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.checkTableExist(date))
  //     .then(result => {
  //       if (result) {
  //         return checkTableExist.resolve()
  //       } else {
  //         return checkTableExist.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: 'ER_NO_SUCH_TABLE' })
  //       }
  //     })
  //     .catch(err => {
  //       return checkTableExist.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
  //     })
  //   return checkTableExist.promise
  // }

  getNewTemplateDetailsAgainstAllUser (currentFromDate, currentEndDate) {
    const getNewTemplateDetailsAgainstAllUserPromise = q.defer()
    /// group by day chnages
    __db.mongo.__custom_aggregate(__constants.DB_NAME, __constants.ENTITY_NAME.MESSAGES, [{
      $match: {
        createdOn: { $gte: new Date(currentFromDate), $lte: new Date(currentEndDate) },
        templateId: { $exists: true, $ne: null }
      }
    },
    {
      $group: {
        _id: { currentStatus: '$currentStatus', wabaPhoneNumber: '$wabaPhoneNumber', templateId: '$templateId' },
        sc: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: { wabaPhoneNumber: '$_id.wabaPhoneNumber', templateId: '$_id.templateId' },
        total: { $sum: '$sc' },
        status: {
          $push: {
            name: '$_id.currentStatus',
            count: '$sc'
          }
        }
      }
    },
    { $sort: { total: -1 } }])
      // __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getNewTemplateDetailsAgainstAllUser(currentDate), [wabaNumber])
      .then(result => {
        if (result) {
          return getNewTemplateDetailsAgainstAllUserPromise.resolve(result)
        } else {
          __logger.error('dbData: getNewTemplateDetailsAgainstAllUserPromise(): No data found.')
          return getNewTemplateDetailsAgainstAllUserPromise.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {} })
        }
      })
      .catch(err => {
        __logger.error('dbData: getNewTemplateDetailsAgainstAllUserPromise(): catch:', err)
        return getNewTemplateDetailsAgainstAllUserPromise.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return getNewTemplateDetailsAgainstAllUserPromise.promise
  }

  // insertTemplateStatusAgainstWaba (data) {
  //   const insertTemplateStatusAgainstWaba = q.defer()
  //   const wabaNumbers = Object.keys(data)
  //   const values = []
  //   for (let i = 0; i < wabaNumbers.length; i++) {
  //     const wabaNumber = wabaNumbers[i]
  //     const summary = data[wabaNumber]
  //     const templateId = summary.templateId
  //     const templateName = summary.templateName
  //     const totalSubmission = summary['pre process'] || 0
  //     const totalMessageSent = summary.forwarded || 0
  //     const totalMessageInProcess = summary.Inprocess || 0
  //     const totalMessageResourceAllocated = summary['resource allocated'] || 0
  //     const totalMessageForwarded = summary.forwarded || 0
  //     const totalMessageDeleted = summary.deleted || 0
  //     const totalMessageSeen = summary.seen || 0
  //     const totalMessageDelivered = summary.delivered || 0
  //     const totalMessageAccepted = summary.accepted || 0
  //     const totalMessageFailed = summary.failed || 0
  //     const totalMessagePending = summary['waiting for pending delivery'] || 0
  //     const totalMessageRejected = summary.rejected || 0
  //     const deliveryPercentage = Math.round((totalMessageDelivered + Number.EPSILON * 100) / 100).toFixed(2)
  //     values.push([wabaNumber, templateId, templateName, totalSubmission, totalMessageSent, totalMessageInProcess, totalMessageResourceAllocated, totalMessageForwarded, totalMessageDeleted,
  //       totalMessageSeen, totalMessageDelivered, totalMessageAccepted, totalMessageFailed, totalMessagePending, totalMessageRejected, deliveryPercentage])
  //   }
  //   console.log('final values goes for insert or update', values)
  //   __db.mysqlMis.query(__constants.HW_MYSQL_MIS_NAME, queryProvider.insertTemplateStatusAgainstWaba(), values)
  //     .then(result => {
  //       if (result) {
  //         return insertTemplateStatusAgainstWaba.resolve(result)
  //       } else {
  //         return insertTemplateStatusAgainstWaba.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {} })
  //       }
  //     })
  //     .catch(err => {
  //       return insertTemplateStatusAgainstWaba.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
  //     })
  //   return insertTemplateStatusAgainstWaba.promise
  // }

  getTemplateNameAgainstId (templateId) {
    __logger.info('dbData: getTemplateNameAgainstId():', templateId)
    const getTemplateNameAgainstId = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getTemplateNameAgainstId(), [templateId])
      .then(result => {
        if (result && result.length) {
          return getTemplateNameAgainstId.resolve(result[0])
        } else {
          __logger.info('dbData: getTemplateNameAgainstId(): result: ', templateId)
          return getTemplateNameAgainstId.resolve(null)
        }
      })
      .catch(err => {
        __logger.error('dbData: getTemplateNameAgainstId(): catch:', err)
        return getTemplateNameAgainstId.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return getTemplateNameAgainstId.promise
  }

  getconversationDataBasedOnWabaNumberAllData (wabaNumber, previousDateWithTime, currentdateWithTime) {
    const getconversationDataBasedOnWabaNumberAllData = q.defer()
    __db.mysqlMis.query(__constants.HW_MYSQL_MIS_NAME, queryProvider.getConversationDataBasedOnWabaNumberAllData(), [wabaNumber, previousDateWithTime, currentdateWithTime])
      .then(result => {
        if (result) {
          return getconversationDataBasedOnWabaNumberAllData.resolve(result)
        } else {
          __logger.error('dbData: getconversationDataBasedOnWabaNumberAllData(): No data found')
          return getconversationDataBasedOnWabaNumberAllData.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {} })
        }
      })
      .catch(err => {
        __logger.error('dbData: getconversationDataBasedOnWabaNumberAllData(): catch:', err)
        return getconversationDataBasedOnWabaNumberAllData.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return getconversationDataBasedOnWabaNumberAllData.promise
  }

  insertConversationDataAgainstWaba (dataIncoming) {
    const insertConversationDataAgainstWaba = q.defer()
    const wabaNumbers = Object.keys(dataIncoming)
    const dataValue = []
    for (let i = 0; i < wabaNumbers.length; i++) {
      const wabanumber = wabaNumbers[i] || null
      const data = dataIncoming[wabanumber]
      const dataInsert = {
        userInitiated: 0,
        notApplicable: 0,
        businessInitiated: 0,
        referralConversion: 0,
        totalcount: 0
      }
      dataInsert.wabaPhoneNumber = data.wabaNumber
      dataInsert.userInitiated = data.ui || 0
      dataInsert.businessInitiated = data.bi || 0
      dataInsert.notApplicable = data.na || 0
      dataInsert.referralConversion = data.rc || 0
      dataInsert.countryName = data.countryName || null
      dataInsert.summaryDate = data.summaryDate
      dataInsert.totalcount = dataInsert.userInitiated + dataInsert.businessInitiated + dataInsert.notApplicable + dataInsert.referralConversion || 0
      dataInsert.createdOn = new Date()
      dataValue.push(dataInsert)
    }
    /*   const country = wabaNumbers[i]
      const summary = data[country]
      const wabaNumbers1 = Object.keys(summary)
      for (let j = 0; j < wabaNumbers1.length; j++) {
        const requiredJson = {}
        const arr = summary[wabaNumbers1[j]]
        for (let k = 0; k < arr.length; k++) {
          requiredJson[arr[k].conversationCategory] = arr[k].conversationCategoryCount
        }
        console.log('$#$%^&*&^%$#@', requiredJson)
        const wabaNumberData = requiredJson
        const totalUserInitiated = wabaNumberData.ui || 0
        const totalBusinessInitiated = wabaNumberData.bi || 0
        const totalReferralConversion = wabaNumberData.rc || 0
        const toatalNotApplicable = wabaNumberData.na || 0
        const totalCount = totalUserInitiated + totalBusinessInitiated + totalReferralConversion + toatalNotApplicable || 0
        values.push([wabaNumbers1[j], country, totalUserInitiated, totalBusinessInitiated, totalReferralConversion, toatalNotApplicable, totalCount])
      }
    }
    __updateWithInsert
    __constants.DB_NAME, __constants.ENTITY_NAME.DOWNLOAD_STATUS, { wabaPhoneNumber: wabaNumber, userId: userId, startDate, endDate }, { filename: fileName, path: path, DownloadStatus: __constants.DOWNLOAD_STATUS.completed */
    __db.mongo.__bulkinsertWithBulkUpdate(__constants.DB_NAME, __constants.ENTITY_NAME.CONVERSATION_SUMMARY, dataValue)
      .then(result => {
        if (result) {
          return insertConversationDataAgainstWaba.resolve(result)
        } else {
          __logger.error('dbData: insertConversationDataAgainstWaba(): if/else :: Error while bulk inserting :: Reject ::', result)
          return insertConversationDataAgainstWaba.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: {} })
        }
      })
      .catch(err => {
        __logger.error('dbData: insertConversationDataAgainstWaba(): catch:', err)
        return insertConversationDataAgainstWaba.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return insertConversationDataAgainstWaba.promise
  }

  getUserStatusCountPerDayAgainstWaba (startDate, endDate, wabaNumber, skipPage, lowLimit) {
    __logger.info('dbData: getUserStatusCountPerDayAgainstWaba(): ', startDate, endDate, wabaNumber)
    const getUserStatusCountPerDayAgainstWaba = q.defer()
    __db.mongo.__findSort(__constants.DB_NAME, __constants.ENTITY_NAME.MESSAGES, { createdOn: { $gte: new Date(startDate), $lt: new Date(endDate) }, wabaPhoneNumber: wabaNumber }, { messageId: 1, wabaPhoneNumber: 1, senderPhoneNumber: 1, currentStatus: 1, createdOn: 1, currentStatusTime: 1, templateId: 1, campName: 1, _id: 0 }, { createdOn: 1 }, skipPage, lowLimit)
      .then(data => {
        if (data && data.length > 0) {
          getUserStatusCountPerDayAgainstWaba.resolve(data || null)
        } else {
          __logger.info('dbData: getUserStatusCountPerDayAgainstWaba(): then : if/else :: Error while find :: Reject ::', data)
          getUserStatusCountPerDayAgainstWaba.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: ['no data present between this record'] })
        }
      })
      .catch(err => {
        __logger.error('dbData: getUserStatusCountPerDayAgainstWaba(): catch:', err)
        getUserStatusCountPerDayAgainstWaba.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return getUserStatusCountPerDayAgainstWaba.promise
  }

  countOfDataAgainstWabaAndUserId (startDate, endDate, wabaNumber) {
    const countOfDataAgainstWabaAndUserId = q.defer()
    __db.mongo.__count(__constants.DB_NAME, __constants.ENTITY_NAME.MESSAGES, { wabaPhoneNumber: wabaNumber, createdOn: { $gte: new Date(startDate), $lte: new Date(endDate) } })
      .then(data => {
        if (data > 0) {
          countOfDataAgainstWabaAndUserId.resolve({ data: data, count: true })
        } else {
          __logger.error('dbData: countOfDataAgainstWabaAndUserId(): Error while getting count :: Reject ::', data)
          countOfDataAgainstWabaAndUserId.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: [] })
        }
      })
      .catch(err => {
        __logger.error('dbData: countOfDataAgainstWabaAndUserId(): catch:', err)
        countOfDataAgainstWabaAndUserId.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return countOfDataAgainstWabaAndUserId.promise
  }

  updateDownloadFileAgainstWabaIdandUserId (validateData) {
    const updateDownloadFileAgainstWabaIdandUserId = q.defer()
    __db.mongo.__updateWithInsert(__constants.DB_NAME, __constants.ENTITY_NAME.DOWNLOAD_STATUS, { DownloadStatus: __constants.DOWNLOAD_STATUS.completed, startDate: validateData.startDate, endDate: validateData.endDate, userId: validateData.userId, wabaPhoneNumber: validateData.wabaPhoneNumber, isActive: '1' }, { DownloadStatus: __constants.DOWNLOAD_STATUS.inProcess, startDate: validateData.startDate, endDate: validateData.endDate, userId: validateData.userId, wabaPhoneNumber: validateData.wabaPhoneNumber, uniqueId: validateData.uniqueId, filename: validateData.filename, updateOn: new Date(), isActive: '1' })
      .then(data => {
        if (data) {
          updateDownloadFileAgainstWabaIdandUserId.resolve(data)
        } else {
          __logger.error('dbData: updateDownloadFileAgainstWabaIdandUserId(): Error while updateWithInsert :: Reject ::', data)
          updateDownloadFileAgainstWabaIdandUserId.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: [] })
        }
      })
      .catch(err => {
        __logger.error('dbData: updateDownloadFileAgainstWabaIdandUserId(): catch:', err)
        updateDownloadFileAgainstWabaIdandUserId.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return updateDownloadFileAgainstWabaIdandUserId.promise
  }

  updateStatusAgainstWabaAndUser (wabaPhoneNumber, fileName, path) {
    // messageData.wabaPhoneNumber, messageData.userId, messageData.startDate, messageData.endDate, fileName, pathName
    const updateStatusAgainstWabaAndUser = q.defer()
    __db.mongo.__updateWithInsert(__constants.DB_NAME, __constants.ENTITY_NAME.DOWNLOAD_STATUS, { wabaPhoneNumber: wabaPhoneNumber, filename: fileName, isActive: '1' }, { filename: fileName, path: path, DownloadStatus: __constants.DOWNLOAD_STATUS.completed })
      .then(data => {
        if (data) {
          updateStatusAgainstWabaAndUser.resolve(data)
        } else {
          __logger.error('dbData: updateStatusAgainstWabaAndUser(): Error while updateWithInsert :: Reject ::', data)
          updateStatusAgainstWabaAndUser.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: [] })
        }
      })
      .catch(err => {
        __logger.error('dbData: updateStatusAgainstWabaAndUser(): catch:', err)
        updateStatusAgainstWabaAndUser.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return updateStatusAgainstWabaAndUser.promise
  }

  getdownloadlist (userId, wabaPhoneNumber) {
    const getdownloadlist = q.defer()
    __db.mongo.__findSortField(__constants.DB_NAME, __constants.ENTITY_NAME.DOWNLOAD_STATUS, { wabaPhoneNumber: wabaPhoneNumber, userId: userId, isActive: '1' }, { startDate: 1, endDate: 1, DownloadStatus: 1, filename: 1, fileNameInServer: 1, path: 1 }, { updateOn: -1 })
      .then(result => {
        if (result && result.length > 0) {
          getdownloadlist.resolve(result)
        } else {
          __logger.error('dbData: getdownloadlist(): Error while findSort :: Reject ::', result)
          getdownloadlist.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, data: {}, err: [] })
        }
      })
      .catch(err => {
        __logger.error('dbData: getdownloadlist(): catch:', err)
        getdownloadlist.reject({ type: err.type || __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: err.err || err })
      })
    return getdownloadlist.promise
  }

  getTemplateIdandTemplateNameAgainstUser (userId) {
    const getTemplateIdandTemplateNameAgainstUser = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getTemplateIdandTemplateNameAgainstUser(), [userId])
      .then(result => {
        if (result) {
          return getTemplateIdandTemplateNameAgainstUser.resolve(result)
        } else {
          __logger.error('dbData: getTemplateIdandTemplateNameAgainstUser(): DB Query :: Reject ::', result)
          return getTemplateIdandTemplateNameAgainstUser.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {} })
        }
      })
      .catch(err => {
        __logger.error('dbData: getTemplateIdandTemplateNameAgainstUser(): Catch:', err)
        return getTemplateIdandTemplateNameAgainstUser.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return getTemplateIdandTemplateNameAgainstUser.promise
  }

  getconversationDataBasedOnWabaNumber (wabaNumber, previousDateWithTime, currentdateWithTime) {
    const getconversationDataBasedOnWabaNumber = q.defer()
    __db.mysqlMis.query(__constants.HW_MYSQL_MIS_NAME, queryProvider.getconversationDataBasedOnWabaNumber(), [wabaNumber, previousDateWithTime, currentdateWithTime])
      .then(result => {
        if (result) {
          return getconversationDataBasedOnWabaNumber.resolve(result)
        } else {
          __logger.error('dbData: getconversationDataBasedOnWabaNumber(): DB Query :: Reject ::', result)
          return getconversationDataBasedOnWabaNumber.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {} })
        }
      })
      .catch(err => {
        __logger.error('dbData: getconversationDataBasedOnWabaNumber(): catch:', err)
        return getconversationDataBasedOnWabaNumber.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return getconversationDataBasedOnWabaNumber.promise
  }

  groupByIssue () {
    const resolvedGroupBy = q.defer()
    __db.mysqlMis.query(__constants.HW_MYSQL_MIS_NAME, queryProvider.groupByIssue(), '')
      .then(result => {
        return resolvedGroupBy.resolve(result)
      })
      .catch(err => {
        __logger.error('dbData: groupByIssue(): catch:', err)
        return resolvedGroupBy.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return resolvedGroupBy.promise
  }

  interactionDump (instanceInsert) {
    __logger.info('dbData: interactionDump(): ', instanceInsert)
    const promises = q.defer()
    __db.mongo.__insertMany(__constants.DB_NAME, __constants.ENTITY_NAME.INTERACTIONS, [instanceInsert])
      .then(data => {
        __logger.info('dbData: interactionDump(): Interaction Count:', data)
        if (data && data.insertedCount > 0) {
          promises.resolve(true)
        } else {
          promises.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: {} })
        }
      })
      .catch(err => {
        __logger.error('dbData: interactionDump(): ', err)
        promises.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return promises.promise
  }

  getInteractions () {
    __logger.info('start ~function=getInteractions')
    const promises = q.defer()
    __db.mongo.__find(__constants.DB_NAME, __constants.ENTITY_NAME.INTERACTIONS, { }, { Question_1: 1, Question_2: 1, Question_3: 1, Question_4: 1, Question_5: 1, createdAt: 1, score: 1, audience: 1 })
      .then(data => {
        if (data && data.length > 0) {
          promises.resolve(data || null)
        } else {
          promises.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: [] })
        }
      })
      .catch(err => {
        __logger.error('error in get function=getInteractions function: ', err)
        promises.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return promises.promise
  }

  getWabaNameByPhoneNumber (arrayofWabaNumber) {
    const promises = q.defer()
    __logger.info('inside getWabaNameByPhoneNumber', arrayofWabaNumber)
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getWabaNameByPhoneNumber(), [arrayofWabaNumber])
      .then(result => {
        if (result && result.length > 0) {
          promises.resolve(result)
        } else {
          __logger.info('NO_RECORDS_FOUND >>>>>>>>> getWabaNameByPhoneNumber db call')
          promises.resolve({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {} })
        }
      })
      .catch(err => {
        __logger.error('error in getWabaNameByPhoneNumber db call:', err)
        promises.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return promises.promise
  }

  getMisRelatedIncomingData (startOfMonth, endOfMonth) {
    const promises = q.defer()
    __logger.info('dbData: getMisRelatedIncomingData(): ', startOfMonth, endOfMonth)
    __db.mysqlMis.query(__constants.HW_MYSQL_NAME, queryProvider.getMisRelatedIncomingData(), [startOfMonth + ' 00:00:00', endOfMonth + ' 23:59:59'])
      .then(result => {
        if (result && result.length > 0) {
          __logger.info('dbData: getMisRelatedIncomingData():', result)
          promises.resolve(result)
        } else {
          __logger.error('dbData: getMisRelatedIncomingData(): NO_RECORDS_FOUND')
          promises.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {} })
        }
      })
      .catch(err => {
        __logger.error('dbData: getMisRelatedIncomingData(): catch:', err)
        promises.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return promises.promise
  }
}

module.exports = MessgaeHistoryService
