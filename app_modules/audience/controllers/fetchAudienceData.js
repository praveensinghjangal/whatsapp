const __logger = require('../../../lib/logger')
const __constants = require('../../../config/constants')
const __util = require('../../../lib/util')
const AudienceService = require('../services/dbData')
const ValidatonService = require('../services/validation')
const __db = require('../../../lib/db')
const queryProvider = require('../queryProvider')
const _ = require('lodash')

const getAudienceRecordById = (req, res) => {
  __logger.info('Get Audience Info API Called', req.params)
  const audienceService = new AudienceService()
  const validate = new ValidatonService()
  validate.checkAudienceIdExistService(req.params)
    .then(data => audienceService.getAudienceTableDataWithId(req.params.audienceId))
    .then(result => {
      __logger.info('then 1', result)
      if (result) {
        return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: result })
      } else {
        return __util.send(res, { type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, data: {} })
      }
    })
    .catch(err => {
      __logger.error('error in create user function: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

/*
Not much clarity on veiwALl filter
*/
const getAudienceRecordList = (req, res) => {
  __logger.info('Get Audience Record List API Called', req.query)

  const {
    channel, optin, optinSourceId, tempOptin,
    segmentId, firstMessageActivation, phoneNumber
  } = req.query

  const inputArray = [{ colName: 'aud.channel', value: channel }, { colName: 'aud.optin', value: optin },
    { colName: 'aud.optin_source_id', value: optinSourceId }, { colName: 'aud.tempOptin', value: tempOptin },
    { colName: 'aud.segment_id', value: segmentId },
    { colName: 'aud.first_message', value: firstMessageActivation },
    { colName: 'aud.phone_number', value: phoneNumber }]

  const columnArray = []
  const valArray = []

  _.each(inputArray, function (input) {
    if (input.value !== undefined && input.value !== null && input.value.trim() !== '') {
      columnArray.push(input.colName)
      valArray.push(input.value)
    }
  })

  console.log('columnArray', columnArray)
  console.log('valArray', valArray)
  __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getAudienceRecordList(columnArray), valArray)
    .then(result => {
      if (result && result.affectedRows && result.affectedRows === 0) {
        return __util.send(res, { type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, data: {} })
      } else {
        return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: result })
      }
    })
    .catch(err => {
      __logger.error('error in create user function: ', err)
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
    })
}

module.exports = {
  getAudienceRecordById,
  getAudienceRecordList
}
