const q = require('q')
const __db = require('../../../lib/db')
const queryProvider = require('../queryProvider')
const ValidatonService = require('./validation')
const saveHistoryData = require('../../../lib/util/saveDataHistory')
const UniqueId = require('../../../lib/util/uniqueIdGenerator')
const __logger = require('../../../lib/logger')
const __constants = require('../../../config/constants')

class WabDataService {
  constructor () {
    this.validate = new ValidatonService()
    this.uniqueId = new UniqueId()
  }

  checkWabaIdExist (wabaInformationId) {
    __logger.info('wabaDataService: checkWabaIdExist(): ', wabaInformationId)
    const doesWabaIdExist = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getWabaIdFromWabaNoMapping(), [wabaInformationId])
      .then(result => {
        __logger.info('wabaDataService: checkWabaIdExist(): then 1:', result)
        if (result && result.length > 0) {
          doesWabaIdExist.resolve({ record: result[0], exists: true })
        } else {
          doesWabaIdExist.resolve({ record: result[0], exists: false })
        }
      })
      .catch(err => {
        __logger.error('wabaDataService: checkWabaIdExist(): catch:', err)
        doesWabaIdExist.reject(false)
      })
    return doesWabaIdExist.promise
  }

  /* Service to add the waba mapping data  */
  addWabaNoMappingData (wabaInformationId, wabaNoMappingData, wabaNoMappingOldData, userId) {
    __logger.info('wabaDataService: addWabaNoMappingData(): ', wabaNoMappingOldData)
    const dataInserted = q.defer()
    const wabaNoMappingObj = {
      wabaInformationId: wabaNoMappingData && wabaNoMappingData.wabaInformationId ? wabaNoMappingData.wabaInformationId : wabaNoMappingOldData.wabaInformationId,
      wabaPhoneNumber: wabaNoMappingData && wabaNoMappingData.wabaPhoneNumber ? wabaNoMappingData.wabaPhoneNumber : wabaNoMappingOldData.wabaPhoneNumber,
      audMappingId: wabaNoMappingOldData && wabaNoMappingOldData.audMappingId ? wabaNoMappingOldData.audMappingId : this.uniqueId.uuid()
    }
    saveHistoryData(wabaNoMappingOldData, __constants.ENTITY_NAME.AUD_WABA_NO_MAPPING, wabaNoMappingOldData.wabaInformationId, userId)
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.addWabaNoMappingData(), [wabaNoMappingObj.audMappingId, wabaNoMappingObj.wabaPhoneNumber, wabaNoMappingObj.wabaInformationId, userId])
      .then(result => {
        __logger.info('wabaDataService: addWabaNoMappingData(): then 1:', result)
        if (result && result.affectedRows && result.affectedRows > 0) {
          dataInserted.resolve(wabaNoMappingObj)
        } else {
          dataInserted.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
        }
      })
      .catch(err => {
        __logger.error('wabaDataService: addWabaNoMappingData(): catch:', err)
        dataInserted.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return dataInserted.promise
  }

  /* Service to update the waba mapping data  */
  updateWabaNoMappingData (userId, wabaNoMappingData, wabaNoMappingOldData) {
    const dataUpdated = q.defer()
    __logger.info('wabaDataService: updateWabaNoMappingData():', userId, wabaNoMappingData, wabaNoMappingOldData)
    saveHistoryData(wabaNoMappingOldData, __constants.ENTITY_NAME.AUD_WABA_NO_MAPPING, wabaNoMappingOldData.wabaInformationId, userId)
    const wabaNoMappingObj = {
      wabaInformationId: wabaNoMappingData && wabaNoMappingData.wabaInformationId ? wabaNoMappingData.wabaInformationId : wabaNoMappingOldData.wabaInformationId,
      wabaPhoneNumber: wabaNoMappingData && wabaNoMappingData.wabaPhoneNumber ? wabaNoMappingData.wabaPhoneNumber : wabaNoMappingOldData.wabaPhoneNumber
    }
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.updateWabaNoMappingData(), [wabaNoMappingObj.wabaPhoneNumber, userId, wabaNoMappingObj.wabaInformationId])
      .then(result => {
        if (result && result.affectedRows && result.affectedRows > 0) {
          dataUpdated.resolve(wabaNoMappingObj)
        } else {
          dataUpdated.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
        }
      })
      .catch(err => {
        __logger.error('wabaDataService: updateWabaNoMappingData(): catch:', err)
        dataUpdated.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return dataUpdated.promise
  }
}

module.exports = WabDataService
