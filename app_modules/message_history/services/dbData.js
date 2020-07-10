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
    __db.mysql.__query(__constants.HW_MYSQL_NAME, queryProvider.getMessageTableDataWithId(), [messageId])
      .then(result => {
        // console.log('Query Result', result)
        if (result && result.affectedRows && result.affectedRows === 0) {
          messageHistoryData.resolve(null)
        } else {
          messageHistoryData.resolve(result)
        }
      })
      .catch(err => {
        __logger.error('error in get audience by id function: ', err)
        messageHistoryData.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return messageHistoryData.promise
  }

  addMessageHistoryDataService (newData) {
    // __logger.info('Add message history service called', insertData, messageHistoryData)
    const messageHistoryDataAdded = q.defer()
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
    __db.mysql.__query(__constants.HW_MYSQL_NAME, queryProvider.addMessageHistoryData(), queryParam)
      .then(result => {
        // console.log('Add Result', result)
        if (result && result.affectedRows && result.affectedRows > 0) {
          messageHistoryDataAdded.resolve(messageHistoryData)
        } else {
          messageHistoryDataAdded.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
        }
      })
      .catch(err => messageHistoryDataAdded.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err }))
    return messageHistoryDataAdded.promise
  }
}

module.exports = MessgaeHistoryService
