const __util = require('../../../lib/util')
const constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const __db = require('../../../lib/db')
const q = require('q')
const queryProvider = require('../queryProvider')
const _ = require('lodash')

const CheckInfoCompletionService = require('../services/checkCompleteIncomplete')

const rejectionHandler = require('../../../lib/util/rejectionHandler')

// Get Business Profile
const getBusinessProfile = (req, res) => {
  __logger.info('Inside getBusinessProfile')
  let queryResult = []
  const userId = req.user && req.user.user_id ? req.user.user_id : 0

  __db.postgresql.__query(queryProvider.getBusinessProfile(), [userId])
    .then(results => {
      __logger.info('Then 1', results)
      queryResult = results.rows[0]

      if (results && results.rows.length > 0) {
        return checkBusinessProfileCompletionStatus(results.rows[0])
      } else {
        return rejectionHandler({ type: constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {}, data: {} })
      }
    })
    .then(data => {
      __logger.info('then 2')

      const businessProfilePromise = q.defer()

      if (data.err) {
        return computeBusinessAccessAndBusinessProfleCompleteStatus(data)
      } else {
        businessProfilePromise.resolve({ businessAccessProfileCompletionStatus: true, businessProfileCompletionStatus: true })
        return businessProfilePromise.promise
      }
    })
    .then(result => {
      __logger.info('then 3', result)
      // const error = result.finalData ? result.finalData.err : {}

      // Check the capabilities and set the status of completeness of access profile
      if (queryResult.canReceiveSms || (queryResult.canReceiveVoiceCall && queryResult.associatedWithIvr)) {
        queryResult.businessAccessProfileCompletionStatus = result.businessAccessProfileCompletionStatus ? result.businessAccessProfileCompletionStatus : result.finalData.businessAccessProfileCompletionStatus
      } else {
        queryResult.businessAccessProfileCompletionStatus = false
      }

      // Business Manager Check
      if (queryResult.businessManagerVerified) {
        queryResult.businessVerificationCompletionStatus = true
      } else {
        queryResult.businessVerificationCompletionStatus = false
      }

      queryResult.businessProfileCompletionStatus = result.businessProfileCompletionStatus ? result.businessProfileCompletionStatus : result.finalData.businessProfileCompletionStatus
      return __util.send(res, {
        type: constants.RESPONSE_MESSAGES.SUCCESS,
        data: queryResult
        // err: error
      })
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

function computeBusinessAccessAndBusinessProfleCompleteStatus (data) {
  __logger.info('Input Data ', data)
  const businessProfilePromise = q.defer()
  const errorFields = data.fieldErr

  __logger.info('Field Exist', errorFields.lastIndexOf('whatsappStatus'))

  const businessAccessProfileFields = ['facebookManagerId', 'phoneCode', 'phoneNumber', 'canReceiveSms', 'canReceiveVoiceCall', 'associatedWithIvr']

  const businessProfileFields = ['businessName', 'whatsappStatus', 'description', 'address', 'country', 'email', 'businessCategory', 'profilePhotoUrl']

  data.businessAccessProfileCompletionStatus = true
  data.businessProfileCompletionStatus = true

  for (let key = 0; key < errorFields.length; key++) {
    __logger.info('element extist', errorFields[key])

    if (businessAccessProfileFields.includes(errorFields[key])) {
      __logger.info('keys extist access', errorFields[key])
      data.businessAccessProfileCompletionStatus = false
    }
    if (businessProfileFields.includes(errorFields[key])) {
      __logger.info('keys extist profile', errorFields[key])
      data.businessProfileCompletionStatus = false
    }
  }

  delete data.fieldErr
  delete data.complete

  __logger.info('Result Data ', data)
  businessProfilePromise.resolve({ finalData: data })
  return businessProfilePromise.promise
}

function checkBusinessProfileCompletionStatus (data) {
  const checkCompleteStatus = new CheckInfoCompletionService()

  return checkCompleteStatus.validateBusinessProfile(data)
}

module.exports = { getBusinessProfile, checkBusinessProfileCompletionStatus }
