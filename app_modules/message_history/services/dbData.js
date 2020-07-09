const q = require('q')
const _ = require('lodash')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const __db = require('../../../lib/db')
const queryProvider = require('../queryProvider')

const UniqueId = require('../../../lib/util/uniqueIdGenerator')

class MessgaeHistoryService {
  constructor () {
    this.uniqueId = new UniqueId()
  }

  getMessageHistoryTableDataWithId (messageId) {
    __logger.info('inside get message history by id service', typeof messageId)
    const messageHistoryData = q.defer()
    __db.postgresql.__query(queryProvider.getMessageTableDataWithId(), [messageId])
      .then(result => {
        // console.log('Query Result', result)
        if (result && result.rows && result.rows.length === 0) {
          messageHistoryData.resolve(null)
        } else {
          messageHistoryData.resolve(result.rows)
          // messageHistoryData.resolve(result.rows[0])
        }
      })
      .catch(err => {
        __logger.error('error in get audience by id function: ', err)
        messageHistoryData.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return messageHistoryData.promise
  }

  addMessageHistoryDataService (insertData) {
    // __logger.info('Add message history service called', insertData, messageHistoryData)
    const messageHistoryDataAdded = q.defer()
    this.insertMessageHistoryData(insertData)
      .then(data => messageHistoryDataAdded.resolve(data))
      .catch(err => messageHistoryDataAdded.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err }))
    return messageHistoryDataAdded.promise
  }

  insertMessageHistoryData (newData) {
    // __logger.info('Inserting new AudienceData>>>>>>>>>>.', newData)
    const dataInserted = q.defer()
    const messageHistoryData = {
      messageId: newData.messageId,
      serviceProviderId: newData.serviceProviderId,
      deliveryChannel: newData.deliveryChannel ? newData.deliveryChannel : __constants.DELIVERY_CHANNEL.whatsapp,
      statusTime: newData.statusTime,
      state: newData.state,
      endConsumerNumber: newData.endConsumerNumber ? newData.endConsumerNumber : null,
      businessNumber: newData.businessNumber ? newData.businessNumber : null

    }
    const queryParam = []
    _.each(messageHistoryData, (val) => queryParam.push(val))
    // __logger.info('inserttttttttttttttttttttt->', messageHistoryData, queryParam)
    __db.postgresql.__query(queryProvider.addMessageHistoryData(), queryParam)
      .then(result => {
        // console.log('Add Result', result)
        if (result && result.rowCount && result.rowCount > 0) {
          dataInserted.resolve(messageHistoryData)
        } else {
          dataInserted.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
        }
      })
      .catch(err => {
        __logger.error('error: ', err)
        dataInserted.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return dataInserted.promise
  }
}

module.exports = MessgaeHistoryService
