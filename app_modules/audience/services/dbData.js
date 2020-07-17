const q = require('q')
const _ = require('lodash')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const __db = require('../../../lib/db')
const queryProvider = require('../queryProvider')
const ValidatonService = require('../services/validation')
const UniqueId = require('../../../lib/util/uniqueIdGenerator')
const saveHistoryData = require('../../../lib/util/saveDataHistory')

class AudienceService {
  constructor () {
    this.uniqueId = new UniqueId()
  }

  getAudienceTableDataWithId (audienceId) {
    __logger.info('inside get audience by id service', typeof audienceId)
    const audienceData = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getAudienceTableDataWithId(), [audienceId])
      .then(result => {
        // console.log('Query Result', result)
        if (result && result.length === 0) {
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
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getAudienceTableDataByPhoneNumber(), [phoneNumber])
      .then(result => {
        // console.log('Query Result', result)
        if (result && result.length === 0) {
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
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.addAudienceData(), queryParam)
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
    saveHistoryData(oldData, __constants.ENTITY_NAME.AUDIENCE, oldData.audienceId, newData.userId)

    // console.log('i will updateeeee')
    // this.updateAudience(newData, oldData)
    const audienceData = {
      channel: newData.channel || oldData.channel,
      optin: typeof newData.optin === 'boolean' ? newData.optin : false,
      optinSourceId: newData.optinSourceId || oldData.optinSourceId,
      segmentId: newData.segmentId || oldData.segmentId,
      chatFlowId: newData.chatFlowId || oldData.chatFlowId,
      name: newData.name || oldData.name,
      email: newData.email || oldData.email,
      gender: newData.gender || oldData.gender,
      country: newData.country || oldData.country,
      updatedBy: newData.userId,
      audienceId: oldData.audienceId,
      phoneNumber: oldData.phoneNumber
    }
    const queryParam = []
    _.each(audienceData, (val) => queryParam.push(val))
    __logger.info('updateeeeee --->', audienceData, queryParam)
    const validate = new ValidatonService()
    validate.checkPhoneNumberExistService(audienceData)
      .then(data => __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.updateAudienceRecord(), queryParam))
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
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getTempOptinStatus(), [audienceId])
      .then(result => {
      // console.log('Query Result', result)
        if (result && result.length === 0) {
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

  // Optin Master

  getOptinDataById (optinSourceId) {
    // __logger.info('inside get segment data by id service', segmentId)
    const optinData = q.defer()

    if (optinSourceId) {
      __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getOptinDataById(), [optinSourceId])
        .then(result => {
          if (result && result.length > 0) {
            optinData.resolve(result[0])
          } else {
            optinData.resolve({})
          }
        })
        .catch(err => {
          __logger.error('error in get segment by id function: ', err)
          optinData.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
        })
    } else {
      optinData.resolve({})
    }
    return optinData.promise
  }

  addOptinData (newData, oldData) {
    // __logger.info('Add Segment service called', newData, oldData)
    const optinDataAdded = q.defer()
    const segmentData = {
      optinSourceId: this.uniqueId.uuid(),
      optinSource: newData.optinSource
    }
    const queryParam = []
    _.each(segmentData, (val) => queryParam.push(val))
    // __logger.info('inserttttttttttttttttttttt->', audienceData, queryParam)
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.addOptinData(), queryParam)
      .then(result => {
        if (result && result.affectedRows && result.affectedRows > 0) {
          optinDataAdded.resolve(segmentData)
        } else {
          optinDataAdded.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
        }
      })
      .catch(err => optinDataAdded.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err }))
    return optinDataAdded.promise
  }

  updateOptinData (newData, oldData) {
    const optinUpdated = q.defer()

    const optinntData = {
      optinSource: newData.optinSource || oldData.optinSource,
      optinSourceId: newData.optinSourceId || oldData.optinSourceId
    }
    const queryParam = []
    _.each(optinntData, (val) => queryParam.push(val))
    const validate = new ValidatonService()
    validate.checkUpdateOptinData(optinntData)
      .then(data => __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.updateOptinData(), queryParam))
      .then(result => {
        if (result && result.affectedRows && result.affectedRows > 0) {
          optinUpdated.resolve(optinntData)
        } else {
          optinUpdated.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
        }
      })
      .catch(err => optinUpdated.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err }))
    return optinUpdated.promise
  }
}

module.exports = AudienceService
