const q = require('q')
const _ = require('lodash')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const __db = require('../../../lib/db')
const queryProvider = require('../queryProvider')
const ValidatonService = require('../services/validation')
const UniqueId = require('../../../lib/util/uniqueIdGenerator')

class AudienceService {
  constructor () {
    this.uniqueId = new UniqueId()
  }

  getAudienceTableDataWithId (audienceId) {
    __logger.info('inside get audience by id service', typeof audienceId)
    const audienceData = q.defer()
    __db.mysql.__query(__constants.HW_MYSQL_NAME, queryProvider.getAudienceTableDataWithId(), [audienceId])
      .then(result => {
        // console.log('Query Result', result)
        if (result && result.affectedRows && result.affectedRows === 0) {
          audienceData.resolve(null)
        } else {
          audienceData.resolve(result[0])
        }
      })
      .catch(err => {
        __logger.error('error in get audience by id function: ', err)
        audienceData.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return audienceData.promise
  }

  getAudienceTableDataByPhoneNumber (phoneNumber) {
    __logger.info('inside get audience by id service', typeof phoneNumber)
    const audienceData = q.defer()
    __db.mysql.__query(__constants.HW_MYSQL_NAME, queryProvider.getAudienceTableDataByPhoneNumber(), [phoneNumber])
      .then(result => {
        // console.log('Query Result', result)
        if (result && result.affectedRows && result.affectedRows === 0) {
          audienceData.resolve({ })
        } else {
          audienceData.resolve(result[0])
        }
      })
      .catch(err => {
        __logger.error('error in get audience by id function: ', err)
        audienceData.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return audienceData.promise
  }

  addAudienceDataService (newData, oldData) {
    // __logger.info('Add audience service called', insertData, audienceData)
    const audienceDataAdded = q.defer()
    const audienceData = {
      audienceId: newData.audienceId || this.uniqueId.uuid(),
      phoneNumber: newData.phoneNumber || oldData.phoneNumber,
      channel: newData.channel || oldData.channel,
      optin: typeof newData.optin === 'boolean' ? newData.optin : false,
      optinSourceId: newData.optinSourceId || oldData.optinSourceId,
      segmentId: newData.segmentId || oldData.segmentId,
      chatFlowId: newData.chatFlowId || oldData.chatFlowId,
      name: newData.name || oldData.name,
      email: newData.email || oldData.email,
      gender: newData.gender || oldData.gender,
      country: newData.country || oldData.country

    }
    const queryParam = []
    _.each(audienceData, (val) => queryParam.push(val))
    // __logger.info('inserttttttttttttttttttttt->', audienceData, queryParam)
    __db.mysql.__query(__constants.HW_MYSQL_NAME, queryProvider.addAudienceData(), queryParam)
      .then(result => {
        // console.log('Add Result', result)
        if (result && result.affectedRows && result.affectedRows > 0) {
          audienceDataAdded.resolve(audienceData)
        } else {
          audienceDataAdded.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
        }
      })
      .catch(err => audienceDataAdded.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err }))
    return audienceDataAdded.promise
  }

  updateAudienceDataService (newData, oldData) {
    // __logger.info('update audience service called', newData, oldData)
    const audienceUpdated = q.defer()
    // console.log('i will updateeeee')
    // this.updateAudience(newData, oldData)
    const audienceData = {
      audienceId: oldData.audienceId,
      phoneNumber: oldData.phoneNumber,
      channel: newData.channel || oldData.channel,
      optin: typeof newData.optin === 'boolean' ? newData.optin : false,
      optinSourceId: newData.optinSourceId || oldData.optinSourceId,
      segmentId: newData.segmentId || oldData.segmentId,
      chatFlowId: newData.chatFlowId || oldData.chatFlowId,
      name: newData.name || oldData.name,
      email: newData.email || oldData.email,
      gender: newData.gender || oldData.gender,
      country: newData.country || oldData.country,
      updatedBy: newData.user_id
    }
    const queryParam = []
    _.each(audienceData, (val) => queryParam.push(val))
    __logger.info('updateeeeee --->', audienceData, queryParam)
    const validate = new ValidatonService()
    validate.checkPhoneNumberExistService(audienceData)
      .then(data => __db.mysql.__query(__constants.HW_MYSQL_NAME, queryProvider.updateAudienceRecord(), queryParam))
      .then(result => {
        if (result && result.affectedRows && result.affectedRows > 0) {
          audienceUpdated.resolve(audienceData)
        } else {
          audienceUpdated.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
        }
      })
      .catch(err => audienceUpdated.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err }))
    return audienceUpdated.promise
  }

  getTempOptinStatus (audienceId) {
    const datafetcted = q.defer()
    __db.mysql.__query(__constants.HW_MYSQL_NAME, queryProvider.getTempOptinStatus(), [audienceId])
      .then(result => {
      // console.log('Query Result', result)
        if (result && result.affectedRows && result.affectedRows === 0) {
          datafetcted.resolve(null)
        } else {
          datafetcted.resolve(result[0])
        }
      })
      .catch(err => {
        __logger.error('error in get audience by id function: ', err)
        datafetcted.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return datafetcted.promise
  }
}

module.exports = AudienceService
