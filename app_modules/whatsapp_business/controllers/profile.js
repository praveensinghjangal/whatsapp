const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const __db = require('../../../lib/db')
const q = require('q')
const queryProvider = require('../queryProvider')
const _ = require('lodash')
const UniqueId = require('../../../lib/util/uniqueIdGenerator')
const rejectionHandler = require('../../../lib/util/rejectionHandler')

// Services
const BusinessAccountService = require('../services/businesAccount')
const ValidatonService = require('../services/validation')
const CheckInfoCompletionService = require('../services/checkCompleteIncomplete')

//  Business Profile
const getBusinessProfile = (req, res) => {
  let queryResult = []
  const userId = req.user && req.user.user_id ? req.user.user_id : 0
  // __logger.info('Inside getBusinessProfile', userId)

  const businessAccountService = new BusinessAccountService()
  businessAccountService.getBusinessProfileInfo(userId)
    .then(results => {
      __logger.info('Then 1', results)
      queryResult = results.rows[0]
      if (results && results.rows.length > 0) {
        return checkBusinessProfileCompletionStatus(results.rows[0])
      } else {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {}, data: {} })
      }
    })
    .then(data => {
      __logger.info('then 2')
      if (data.err) {
        return computeBusinessAccessAndBusinessProfleCompleteStatus(data)
      } else {
        return { businessAccessProfileCompletionStatus: true, businessProfileCompletionStatus: true }
      }
    })
    .then(result => {
      __logger.info('Then 3')
      return formatFinalStatus(queryResult, result)
    })
    .then(result => {
      __logger.info('Final Result then 4 ', result)
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: result })
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

const addBusinessAccessInfo = (req, res) => {
  __logger.info('Inside addBusinessAccessInfo', req.user.user_id)
  const userId = req.user && req.user.user_id ? req.user.user_id : '0'
  let queryResult

  const validate = new ValidatonService()
  const businessAccountService = new BusinessAccountService()

  validate.checkCompleteBillingInfo(req.body)
    .then(data => {
      __logger.info(' then 1', data)

      return businessAccountService.checkUserIdExist(userId)
    })
    .then(result => {
      __logger.info(' then 2', result)

      /* If exists then updating else inserting */
      queryResult = result.record

      if (!result.exists) {
        queryResult = {
          canReceiveSms: req.body.canReceiveSms ? req.body.canReceiveSms : false,
          canReceiveVoiceCall: req.body.canReceiveVoiceCall ? req.body.canReceiveVoiceCall : false,
          associatedWithIvr: req.body.associatedWithIvr ? req.body.associatedWithIvr : false,
          businessVerificationCompletionStatus: req.body.businessManagerVerified ? req.body.businessManagerVerified : false
        }

        return businessAccountService.insertBusinessData(userId, req.body, {})
      }

      // else {
      //   return updateBusinessBilllingProfile(userId, result.record, req.body)
      // }
    })

    .then(result => {
      __logger.info(' then 3', result)

      return checkBusinessProfileCompletionStatus(result)
    })
    .then(data => {
      __logger.info('then 4', data)
      if (data.err) {
        return computeBusinessAccessAndBusinessProfleCompleteStatus(data)
      } else {
        return { businessAccessProfileCompletionStatus: true, businessProfileCompletionStatus: true }
      }
    })
    .then(result => {
      __logger.info('Then 5', result)
      return formatFinalStatus(queryResult, result.finalData)
    })
    .then(result => {
      __logger.info('Then 4', result)

      if (result) {
        // if (result && result.rowCount && result.rowCount > 0) {
        return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: queryResult })
      } else {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.PROCESS_FAILED, err: {}, data: {} })
      }
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
  const businessAccessProfileFields = ['facebookManagerId', 'phoneCode', 'phoneNumber', 'canReceiveSms', 'canReceiveVoiceCall', 'associatedWithIvr']
  const businessProfileFields = ['businessName', 'whatsappStatus', 'description', 'address', 'country', 'email', 'businessCategory', 'profilePhotoUrl']
  data.businessAccessProfileCompletionStatus = true
  data.businessProfileCompletionStatus = true
  for (let key = 0; key < errorFields.length; key++) {
    if (businessAccessProfileFields.includes(errorFields[key])) {
      data.businessAccessProfileCompletionStatus = false
    }
    if (businessProfileFields.includes(errorFields[key])) {
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

function formatFinalStatus (queryResult, result) {
  const finalResult = q.defer()

  __logger.info('Query Result formatFinalStatus', queryResult)
  __logger.info('Query result formatFinalStatus', result)
  __logger.info('Query result formatFinalStatus err', result.err)
  __logger.info('Query result  businessAccessProfileCompletionStatus', result.businessAccessProfileCompletionStatus)

  if (queryResult.canReceiveSms || (queryResult.canReceiveVoiceCall && queryResult.associatedWithIvr)) {
    queryResult.businessAccessProfileCompletionStatus = true
    // queryResult.businessAccessProfileCompletionStatus = result.businessAccessProfileCompletionStatus ? result.businessAccessProfileCompletionStatus : result.finalData.businessAccessProfileCompletionStatus
  } else {
    queryResult.businessAccessProfileCompletionStatus = false
  }
  // // Business Manager Check

  // if (queryResult.businessManagerVerified) {
  //   queryResult.businessVerificationCompletionStatus = true
  // } else {
  //   queryResult.businessVerificationCompletionStatus = false
  // }
  queryResult.businessProfileCompletionStatus = result.businessProfileCompletionStatus ? result.businessProfileCompletionStatus : result.finalData.businessProfileCompletionStatus
  delete queryResult.canReceiveSms
  delete queryResult.canReceiveVoiceCall
  delete queryResult.associatedWithIvr
  finalResult.resolve(queryResult)
  return finalResult.promise
}

module.exports = {
  getBusinessProfile,
  checkBusinessProfileCompletionStatus,
  addBusinessAccessInfo
}
