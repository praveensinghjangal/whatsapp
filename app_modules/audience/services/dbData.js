const q = require('q')
const _ = require('lodash')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const __db = require('../../../lib/db')
const queryProvider = require('../queryProvider')
const ValidatonService = require('../services/validation')
const UniqueId = require('../../../lib/util/uniqueIdGenerator')
const saveHistoryData = require('../../../lib/util/saveDataHistory')
const moment = require('moment')

class AudienceService {
  constructor () {
    this.uniqueId = new UniqueId()
  }

  getAudienceTableDataWithId (userId, audienceId) {
    __logger.info('inside get audience by id service', typeof audienceId)
    const audienceData = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getAudienceTableDataWithId(), [audienceId])
      .then(result => {
        __logger.info('Query Result', { result })
        if (result && result.length === 0) {
          audienceData.resolve(null)
        } else {
          result[0].optin = result[0].optin === 1
          const currentTime = moment().utc().format('YYYY-MM-DD HH:mm:ss')
          const expireyTime = moment(result[0].lastMessage).utc().add(24, 'hours').format('YYYY-MM-DD HH:mm:ss')
          result[0].tempOptin = moment(currentTime).isBefore(expireyTime)
          // add moment for temp optin
          delete result[0].wabaPhoneNumber
          audienceData.resolve(result[0])
        }
      })
      .catch(err => {
        __logger.error('error in get audience by id function: ', err)
        audienceData.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return audienceData.promise
  }

  // waba
  getAudienceTableDataByPhoneNumber (phoneNumbers, userId, wabaPhoneNumber) {
    __logger.info('inside getAudienceTableDataByPhoneNumber', phoneNumbers)
    const audienceData = q.defer()
    const queryFilter = wabaPhoneNumber || userId
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getAudienceTableDataByPhoneNumber(wabaPhoneNumber), [queryFilter, phoneNumbers])
      .then(result => {
        __logger.info('getAudienceTableDataByPhoneNumber query Result', { result })
        if (result && result.length === 0) {
          audienceData.resolve([])
        } else {
          audienceData.resolve(result)
        }
      })
      .catch(err => {
        __logger.error('error in getAudienceTableDataByPhoneNumber: ', err)
        audienceData.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return audienceData.promise
  }

  // waba
  addAudienceDataService (newData, oldData) {
    __logger.info('Add audience service called', newData, oldData)
    const audienceDataAdded = q.defer()
    var audienceData = {
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
      country: newData.country || oldData.country,
      createdBy: newData.userId,
      isFacebookVerified: typeof newData.isFacebookVerified === 'boolean' ? newData.isFacebookVerified : (oldData.isFacebookVerified ? oldData.isFacebookVerified : false),
      countryCode: newData.countryCode ? newData.countryCode : (oldData.countryCode ? oldData.countryCode : __constants.DEFAULT_COUNTRY_CODE)
    }
    this.checkAndReturnWabaNumber(newData.wabaPhoneNumber, newData.userId)
      .then(data => {
        __logger.info('checkAndReturnWabaNumber::>>>>>>>>>>>>>>...', data)
        return this.getWabaPhoneNumber(data)
      })
      .then(data => {
        __logger.info('WabaNum>>>>>>>>>>>>>>>>>>>>>>>> then 1', { data })
        if (data && data.audMappingId) {
          audienceData.wabaPhoneNumber = data.audMappingId
        }
        if (newData.isIncomingMessage) {
          audienceData.firstMessageValue = this.formatToTimeStamp()
          audienceData.lastMessageValue = this.formatToTimeStamp()
        } else {
          audienceData.firstMessageValue = oldData.firstMessage ? this.formatToTimeStamp(oldData.firstMessage) : null
          audienceData.lastMessageValue = oldData.lastMessage ? this.formatToTimeStamp(oldData.lastMessage) : null
        }
        // __logger.info('audienceData', audienceData)
      })
      .then(() => {
        __logger.info('Then 2')
        const queryParam = []
        _.each(audienceData, (val) => queryParam.push(val))
        return __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.addAudienceData(), queryParam)
      })
      .then(result => {
        __logger.info('Add Result then 3', { result })
        if (result && result.affectedRows && result.affectedRows > 0) {
          delete audienceData.createdBy
          delete audienceData.wabaPhoneNumber
          delete audienceData.firstMessageValue
          delete audienceData.lastMessageValue
          audienceDataAdded.resolve(audienceData)
        } else {
          audienceDataAdded.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
        }
      })
      .catch(err => audienceDataAdded.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err }))
    return audienceDataAdded.promise
  }

  // waba
  updateAudienceDataService (newData, oldData) {
    __logger.info('update audience service called', newData)
    const audienceUpdated = q.defer()
    saveHistoryData(oldData, __constants.ENTITY_NAME.AUDIENCE, oldData.audienceId, newData.userId)
    // this.updateAudience(newData, oldData)
    var audienceData = {
      channel: newData.channel || oldData.channel,
      optin: typeof newData.optin === 'boolean' ? newData.optin : oldData.optin,
      optinSourceId: newData.optinSourceId || oldData.optinSourceId,
      segmentId: newData.segmentId || oldData.segmentId,
      chatFlowId: newData.chatFlowId || oldData.chatFlowId,
      name: newData.name || oldData.name,
      email: newData.email || oldData.email,
      gender: newData.gender || oldData.gender,
      country: newData.country || oldData.country,
      updatedBy: newData.userId,
      wabaPhoneNumber: newData.wabaPhoneNumber || oldData.wabaPhoneNumber,
      firstMessageValue: null,
      lastMessageValue: null,
      isFacebookVerified: typeof newData.isFacebookVerified === 'boolean' ? newData.isFacebookVerified : oldData.isFacebookVerified,
      countryCode: newData.countryCode ? newData.countryCode : (oldData.countryCode ? oldData.countryCode : __constants.DEFAULT_COUNTRY_CODE),
      audienceId: oldData.audienceId,
      phoneNumber: oldData.phoneNumber
    }

    const queryParam = []

    this.checkAndReturnWabaNumber(newData.wabaPhoneNumber, newData.userId)
      .then(data => {
        __logger.info('checkAndReturnWabaNumber::>>>>>>>>>>>>>>...', data)
        return this.getWabaPhoneNumber(data)
      })
      .then(data => {
        __logger.info('data then 1', { data })
        if (data && data.audMappingId) {
          audienceData.wabaPhoneNumber = data.audMappingId
        }
        if (newData.isIncomingMessage) {
          audienceData.firstMessageValue = oldData.firstMessage ? this.formatToTimeStamp(oldData.firstMessage) : this.formatToTimeStamp()
          audienceData.lastMessageValue = this.formatToTimeStamp()
        } else {
          audienceData.firstMessageValue = oldData.firstMessage ? this.formatToTimeStamp(oldData.firstMessage) : null
          audienceData.lastMessageValue = oldData.lastMessage ? this.formatToTimeStamp(oldData.lastMessage) : null
        }
      })
      .then(() => {
        __logger.info('Then 2')
        _.each(audienceData, (val) => queryParam.push(val))
        __logger.info('updateeeeee --->', audienceData, queryParam)
        const validate = new ValidatonService()
        validate.checkPhoneNumberExistService(audienceData)
      })
      .then(data => __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.updateAudienceRecord(), queryParam))
      .then(result => {
        __logger.info('result Then 4', { result })
        if (result && result.affectedRows && result.affectedRows > 0) {
          delete audienceData.wabaPhoneNumber
          delete audienceData.firstMessageValue
          delete audienceData.lastMessageValue
          delete audienceData.updatedBy
          audienceUpdated.resolve(audienceData)
        } else {
          audienceUpdated.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
        }
      })
      .catch(err => audienceUpdated.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err }))
    return audienceUpdated.promise
  }

  formatToTimeStamp (input) {
    if (input) {
      return moment(input).utc().format('YYYY-MM-DD HH:mm:ss').toString()
    } else {
      return moment().utc().format('YYYY-MM-DD HH:mm:ss').toString()
    }
  }

  checkAndReturnWabaNumber (wabaNumber, userId) {
    __logger.info('WabaNumber', wabaNumber)
    const wabaNumberData = q.defer()
    // if present in redis use it

    // else fetch data from db using user Id
    if (wabaNumber) {
      __db.redis.get(wabaNumber)
        .then(data => {
          if (data) {
            data = JSON.parse(data)
            return data
          } else {
            return __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getWabaNumberFromDb(), [userId])
          }
        })
        .then(data => wabaNumberData.resolve(data.id || data[0].wabaPhoneNumber))
        .catch((err) => {
          __logger.info('Error ', err)
          // finalData = null
          // return finalData
          wabaNumberData.resolve(null)
        })
    } else {
      __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getWabaNumberFromDb(), [userId])
        .then(data => {
          if (data.length > 0) {
            wabaNumberData.resolve(data[0].wabaPhoneNumber)
          } else {
            wabaNumberData.reject({ type: __constants.RESPONSE_MESSAGES.WABA_ACCOUNT_NOT_EXISTS, err: {} })
          }
        })
        .catch((err) => {
          __logger.info('Error ', err)
          wabaNumberData.resolve(null)
        })
    }
    return wabaNumberData.promise
  }

  // segment
  getSegmentDataById (segmentId) {
    // __logger.info('inside get segment data by id service', segmentId)
    const segmentData = q.defer()

    if (segmentId) {
      __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getSegmentDataById(), [segmentId])
        .then(result => {
          if (result && result.length > 0) {
            segmentData.resolve(result[0])
          } else {
            segmentData.resolve({})
          }
        })
        .catch(err => {
          __logger.error('error in get segment by id function: ', err)
          segmentData.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
        })
    } else {
      segmentData.resolve({})
    }
    return segmentData.promise
  }

  addSegmentData (newData, oldData, userId) {
    // __logger.info('Add Segment service called', newData, oldData)
    const segmenteDataAdded = q.defer()
    const segmentData = {
      segmentId: this.uniqueId.uuid(),
      segmentName: newData.segmentName
    }
    const queryParam = []
    _.each(segmentData, (val) => queryParam.push(val))
    // __logger.info('inserttttttttttttttttttttt->', audienceData, queryParam)
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.addSegmentData(), queryParam)
      .then(result => {
        if (result && result.affectedRows && result.affectedRows > 0) {
          segmenteDataAdded.resolve(segmentData)
        } else {
          segmenteDataAdded.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
        }
      })
      .catch(err => segmenteDataAdded.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err }))
    return segmenteDataAdded.promise
  }

  updateSegmentData (newData, oldData, userId) {
    const segmentUpdated = q.defer()
    saveHistoryData(oldData, __constants.ENTITY_NAME.SEGMENT, oldData.segmentId, userId)
    const segmentData = {
      segmentName: newData.segmentName || oldData.segmentName,
      segmentId: newData.segmentId || oldData.segmentId
    }
    const queryParam = []
    _.each(segmentData, (val) => queryParam.push(val))
    const validate = new ValidatonService()
    validate.checkUpdateSegmentData(segmentData)
      .then(data => __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.updateSegmentData(), queryParam))
      .then(result => {
        __logger.info('result then 2', { result })
        if (result && result.affectedRows && result.affectedRows > 0) {
          segmentUpdated.resolve(segmentData)
        } else {
          segmentUpdated.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
        }
      })
      .catch(err => segmentUpdated.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err }))
    return segmentUpdated.promise
  }
  // Optin Master

  getOptinSourceDataById (optinSourceId) {
    // __logger.info('inside get segment data by id service', segmentId)
    const optinData = q.defer()

    if (optinSourceId) {
      __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getOptinSourceDataById(), [optinSourceId])
        .then(result => {
          __logger.info('result then 1', { result })
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

  addOptinSourceData (newData, oldData) {
    // __logger.info('Add Segment service called', newData, oldData)
    const optinDataAdded = q.defer()
    const segmentData = {
      optinSourceId: this.uniqueId.uuid(),
      optinSource: newData.optinSource
    }
    const queryParam = []
    _.each(segmentData, (val) => queryParam.push(val))
    // __logger.info('inserttttttttttttttttttttt->', audienceData, queryParam)
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.addOptinSourceData(), queryParam)
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

  updateOptinSourceData (newData, oldData, userId) {
    const optinUpdated = q.defer()
    saveHistoryData(oldData, __constants.ENTITY_NAME.OPTION_SOURCE, oldData.optinSourceId, userId)
    const optinntData = {
      optinSource: newData.optinSource || oldData.optinSource,
      optinSourceId: newData.optinSourceId || oldData.optinSourceId
    }
    const queryParam = []
    _.each(optinntData, (val) => queryParam.push(val))
    const validate = new ValidatonService()
    validate.checkUpdateOptinSourceData(optinntData)
      .then(data => __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.updateOptinSourceData(), queryParam))
      .then(result => {
        __logger.info('result then 2', { result })
        if (result && result.affectedRows && result.affectedRows > 0) {
          optinUpdated.resolve(optinntData)
        } else {
          optinUpdated.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
        }
      })
      .catch(err => optinUpdated.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err }))
    return optinUpdated.promise
  }

  getWabaPhoneNumber (data) {
    const wabaPhoneNumber = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getWabaPhoneNumber(), data)
      .then(data => {
        if (data && data.length > 0) {
          wabaPhoneNumber.resolve({ audMappingId: data[0].audMappingId })
        } else {
          wabaPhoneNumber.reject({ type: __constants.RESPONSE_MESSAGES.WABA_ACCOUNT_NOT_EXISTS, err: {} })
        }
      })
      .catch(err => {
        wabaPhoneNumber.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return wabaPhoneNumber.promise
  }

  getAllOptOutUser (startDate, endDate) {
    const audienceData = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getAllOptOutUser(), [startDate + ' 00:00:00', endDate + ' 23:59:59'])
      .then(result => {
        if (result && result.length === 0) {
          audienceData.resolve([])
        } else {
          audienceData.resolve(result)
        }
      })
      .catch(err => {
        audienceData.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return audienceData.promise
  }

  getAudienceVerified (audienceNumber, wabaNumber) {
    console.log('getAudienceVerified (audienceNumber, wabaNumber) ---', audienceNumber, wabaNumber)
    const promises = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getFacebookVerifiedUser(), [audienceNumber, wabaNumber])
      .then(data => {
        console.log('db response -----', data)
        if (data && data.length > 0) {
          promises.resolve(data)
        } else {
          promises.resolve(data)
        }
      })
      .catch(err => {
        promises.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return promises.promise
  }

  updateAsFaceBookVerified (wabaPhoneNumberId, phoneNumber, userId) {
    const isVefifiedUpdate = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.updateAsFaceBookVerified(), [userId, wabaPhoneNumberId, phoneNumber])
      .then(result => {
        __logger.info('updateAsFaceBookVerified result then 2', { result })
        if (result && result.affectedRows && result.affectedRows > 0) {
          isVefifiedUpdate.resolve(true)
        } else {
          isVefifiedUpdate.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
        }
      })
      .catch(err => isVefifiedUpdate.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err }))
    return isVefifiedUpdate.promise
  }

  addAudineceToDb (payload, audMappingId, userId) {
    __logger.info('Add audience service called ~ payload, audMappingId', payload, audMappingId)
    const audienceDataAdded = q.defer()
    const audienceData = {
      audienceId: this.uniqueId.uuid(),
      phoneNumber: payload.to,
      channel: __constants.DELIVERY_CHANNEL.whatsapp,
      createdBy: userId,
      isFacebookVerified: 1,
      countryCode: __constants.DEFAULT_COUNTRY_CODE,
      wabaPhoneNumber: audMappingId
    }
    __logger.info('Then add into audience', audienceData)
    const queryParam = []
    _.each(audienceData, (val) => queryParam.push(val))
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.addAudienceDataToDb(), queryParam)
      .then(result => {
        __logger.info('added result>>>>>>>>>>>>>>>>>>>>>>>> then 1', { result })
        if (result && result.affectedRows && result.affectedRows > 0) {
          audienceDataAdded.resolve(true)
        } else {
          audienceDataAdded.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
        }
      })
      .catch(err => audienceDataAdded.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err }))
    return audienceDataAdded.promise
  }
}

module.exports = AudienceService
