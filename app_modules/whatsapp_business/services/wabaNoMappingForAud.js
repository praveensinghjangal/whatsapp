const q = require('q')
const __db = require('../../../lib/db')
const queryProvider = require('../queryProvider')
const ValidatonService = require('./validation')
const saveHistoryData = require('../../../lib/util/saveDataHistory')
const UniqueId = require('../../../lib/util/uniqueIdGenerator')
const __logger = require('../../../lib/logger')
const __constants = require('../../../config/constants')

class WabaNoMappingForAudienceService {
  constructor () {
    this.validate = new ValidatonService()
    this.uniqueId = new UniqueId()
  }

  checkWabaIdExist (wabaInformationId) {
    __logger.info('checkWabaIdExist::>>>>>>>>>>...')
    const doesWabaIdExist = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getWabaIdFromAudWabaNoMapping(), [wabaInformationId])
      .then(result => {
        __logger.info('result then 2')
        if (result && result.length > 0) {
          doesWabaIdExist.resolve({ record: result[0], exists: true })
        } else {
          doesWabaIdExist.resolve({ record: result[0], exists: false })
        }
      })
      .catch(err => {
        __logger.error('error in checkWabaIdExist function: ', err)
        doesWabaIdExist.reject(false)
      })
    return doesWabaIdExist.promise
  }

  /**
 * @memberof -Whatsapp-Business-Account-(WABA)-Services-
 * @name addAudWabaNoMappingData
 * @description This service is used to check if record does not exists and then insert waba no mapping data .
 * @body {string} wabaInformationId
 * @body {string} userId
 * @body {object} wabaNoMappingData
 * @body {object} wabaNoMappingOldData
 * @response {object} wabaNoMappingObj  -  Object which is inserted in DB.
 * @author Arjun Bhole 3rd December, 2020
 *  * *** Last-Updated :- Arjun Bhole 3rd December, 2020 ***
 */
  addAudWabaNoMappingData (wabaInformationId, wabaNoMappingData, wabaNoMappingOldData, userId) {
    __logger.info('insertAudWabaNoMappingData::>>>>>>>>>>...', wabaNoMappingOldData)
    const dataInserted = q.defer()
    __logger.info('Inputs insertAudWabaNoMappingData userId', wabaInformationId)
    const wabaNoMappingObj = {
      wabaInformationId: wabaNoMappingData && wabaNoMappingData.wabaInformationId ? wabaNoMappingData.wabaInformationId : wabaNoMappingOldData.wabaInformationId,
      wabaPhoneNumber: wabaNoMappingData && wabaNoMappingData.wabaPhoneNumber ? wabaNoMappingData.wabaPhoneNumber : wabaNoMappingOldData.wabaPhoneNumber,
      audMappingId: wabaNoMappingOldData && wabaNoMappingOldData.audMappingId ? wabaNoMappingOldData.audMappingId : this.uniqueId.uuid()
    }
    saveHistoryData(wabaNoMappingOldData, __constants.ENTITY_NAME.AUD_WABA_NO_MAPPING, wabaNoMappingOldData.wabaInformationId, userId)
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.addAudWabaNoMappingData(), [wabaNoMappingObj.audMappingId, wabaNoMappingObj.wabaPhoneNumber, wabaNoMappingObj.wabaInformationId, userId])
      .then(result => {
        __logger.info('Insert Result', { result })
        if (result && result.affectedRows && result.affectedRows > 0) {
          dataInserted.resolve(wabaNoMappingObj)
        } else {
          dataInserted.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
        }
      })
      .catch(err => {
        __logger.error('error: ', err)
        dataInserted.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return dataInserted.promise
  }

  /**
 * @memberof -Whatsapp-Business-Account-(WABA)-Services-
 * @name updateAudWabaNoMappingData
 * @description This service is used to check if record exists and then update waba no mapping data .
 * @body {string} userId
 * @body {object} wabaNoMappingData
 * @body {object} wabaNoMappingOldData
 * @response {object} wabaNoMappingObj  -  Object which is updated in DB.
 * @author Arjun Bhole 2nd December, 2020
 *  * *** Last-Updated :- Arjun Bhole 3rd December, 2020 ***
 */
  updateAudWabaNoMappingData (userId, wabaNoMappingData, wabaNoMappingOldData) {
    const dataUpdated = q.defer()
    __logger.info('Inputs updateAudWabaNoMappingData userId', userId)
    saveHistoryData(wabaNoMappingOldData, __constants.ENTITY_NAME.AUD_WABA_NO_MAPPING, wabaNoMappingOldData.wabaInformationId, userId)
    const wabaNoMappingObj = {
      wabaInformationId: wabaNoMappingData && wabaNoMappingData.wabaInformationId ? wabaNoMappingData.wabaInformationId : wabaNoMappingOldData.wabaInformationId,
      wabaPhoneNumber: wabaNoMappingData && wabaNoMappingData.wabaPhoneNumber ? wabaNoMappingData.wabaPhoneNumber : wabaNoMappingOldData.wabaPhoneNumber
    }
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.updateAudWabaNoMappingData(), [wabaNoMappingObj.wabaPhoneNumber, userId, wabaNoMappingObj.wabaInformationId])
      .then(result => {
        if (result && result.affectedRows && result.affectedRows > 0) {
          dataUpdated.resolve(wabaNoMappingObj)
        } else {
          dataUpdated.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
        }
      })
      .catch(err => {
        __logger.error('error: ', err)
        dataUpdated.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return dataUpdated.promise
  }
}

module.exports = WabaNoMappingForAudienceService
