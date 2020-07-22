const __logger = require('../../../lib/logger')
const __constants = require('../../../config/constants')
const __util = require('../../../lib/util')
const AudienceService = require('../services/dbData')
const ValidatonService = require('../services/validation')
const __db = require('../../../lib/db')
const queryProvider = require('../queryProvider')
const _ = require('lodash')
const q = require('q')
const moment = require('moment')

const getAudienceRecordById = (req, res) => {
  __logger.info('Get Audience Info API Called', req.params)
  const audienceService = new AudienceService()
  const validate = new ValidatonService()
  validate.checkAudienceIdExistService(req.params)
    .then(data => audienceService.getAudienceTableDataWithId(req.params.audienceId))
    .then(result => {
      __logger.info('then 1')
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
  // __logger.info('Get Audience Record List API Called', req.query)

  const {
    channel, optin, optinSourceId, tempOptin,
    segmentId, firstMessageActivation, phoneNumber
  } = req.query

  const inputArray = [{ colName: 'aud.channel', value: channel },
    { colName: 'aud.optin_source_id', value: optinSourceId },
    { colName: 'aud.segment_id', value: segmentId },
    { colName: 'aud.first_message', value: firstMessageActivation },
    { colName: 'aud.phone_number', value: phoneNumber }]

  if (optin) {
    inputArray.push({ colName: 'aud.optin', value: optin === 'true' ? 1 : 0 })
  }

  if (tempOptin) {
    inputArray.push({ colName: '(last_message between now()- interval 24 HOUR and now())', value: tempOptin === 'true' ? 1 : 0 })
  }

  const columnArray = []
  const valArray = []

  _.each(inputArray, function (input) {
    if (input.value !== undefined && input.value !== null) {
      columnArray.push(input.colName)
      valArray.push(input.value)
    }
  })
  // console.log('Value arrrrrray??????????????????', typeof optin)
  // console.log('Value arrrrrray??????????????????', valArray)

  __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getAudienceRecordList(columnArray), valArray)
    .then(result => {
      if (result && result.length === 0) {
        return __util.send(res, { type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, data: {} })
      } else {
        _.each(result, singleObj => {
          singleObj.optin = singleObj.optin === 1
          singleObj.tempOptin = singleObj.tempOptin === 1
        })
        return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: result })
      }
    })
    .catch(err => {
      __logger.error('error in create user function: ', err)
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
    })
}

function getOptinStatusByPhoneNumber (phoneNumber) {
  const dataFetched = q.defer()

  __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getOptinByPhoneNumber(), [phoneNumber])
    .then(result => {
      if (result && result.length === 0) {
        dataFetched.resolve(null)
      } else {
        result[0].optin = result[0].optin === 1
        result[0].tempOptin = false
        // console.log('Hours>>>>>>>>>>>>>>>>>.....', moment().diff(moment(result[0].lastMessage), 'hours'))

        if (moment().diff(moment(result[0].lastMessage), 'hours') <= 24) {
          result[0].tempOptin = true
        }
        console.log('Result>>>>>>>>>>>>>>>>>.....', result[0])
        dataFetched.resolve(result[0])
      }
    })
    .catch(err => {
      __logger.error('error in get audience by phone number function: ', err)
      dataFetched.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
    })

  return dataFetched.promise
}

module.exports = {
  getAudienceRecordById,
  getAudienceRecordList
}
