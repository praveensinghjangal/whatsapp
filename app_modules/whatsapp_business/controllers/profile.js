const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const q = require('q')
const rejectionHandler = require('../../../lib/util/rejectionHandler')

// Services
const BusinessAccountService = require('../services/businesAccount')
const ValidatonService = require('../services/validation')
const CheckInfoCompletionService = require('../services/checkCompleteIncomplete')

//  Business Profile

// Get Business Profile
const getBusinessProfile = (req, res) => {
  let queryResult = []
  const userId = req.user && req.user.user_id ? req.user.user_id : 0
  const businessAccountService = new BusinessAccountService()
  businessAccountService.getBusinessProfileInfo(userId)
    .then(results => {
      __logger.info('Then 1')
      queryResult = results.rows[0]
      if (results && results.rows.length > 0) {
        const checkCompleteStatus = new CheckInfoCompletionService()
        return checkCompleteStatus.validateBusinessProfile(results.rows[0])
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
      __logger.info('Final Result then 4')
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: result })
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

const addupdateBusinessAccountInfo = (req, res) => {
  __logger.info('Inside addBusinessAccessInfo', req.user.user_id)
  const userId = req.user && req.user.user_id ? req.user.user_id : '0'
  let queryResult

  const validate = new ValidatonService()
  const businessAccountService = new BusinessAccountService()

  validate.checkCompleteBillingInfo(req.body)
    .then(data => {
      __logger.info(' then 1')

      return businessAccountService.checkUserIdExist(userId)
    })
    .then(result => {
      __logger.info(' then 2')

      /* If exists then updating else inserting */
      queryResult = {
        canReceiveSms: req.body.canReceiveSms ? req.body.canReceiveSms : false,
        canReceiveVoiceCall: req.body.canReceiveVoiceCall ? req.body.canReceiveVoiceCall : false,
        associatedWithIvr: req.body.associatedWithIvr ? req.body.associatedWithIvr : false,
        businessVerificationCompletionStatus: req.body.businessManagerVerified ? req.body.businessManagerVerified : false
      }

      if (!result.exists) {
        return businessAccountService.insertBusinessData(userId, req.body, {})
      } else {
        return businessAccountService.updateBusinessData(req.body, result.record)
      }
    })
    .then(result => {
      __logger.info(' then 3')
      const checkCompleteStatus = new CheckInfoCompletionService()
      return checkCompleteStatus.validateBusinessProfile(result)
    })
    .then(data => {
      __logger.info('then 4')
      if (data.err) {
        return computeBusinessAccessAndBusinessProfleCompleteStatus(data)
      } else {
        return { businessAccessProfileCompletionStatus: true, businessProfileCompletionStatus: true }
      }
    })
    .then(result => {
      __logger.info('Then 5')
      return formatFinalStatus(queryResult, result.finalData)
    })
    .then(result => {
      __logger.info('Then 6', result)
      queryResult = result

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
  // __logger.info('Input Data ', data)
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
  // __logger.info('Result Data ', data)
  businessProfilePromise.resolve({ finalData: data })
  return businessProfilePromise.promise
}

function formatFinalStatus (queryResult, result) {
  const finalResult = q.defer()

  if (queryResult.canReceiveSms || (queryResult.canReceiveVoiceCall && queryResult.associatedWithIvr)) {
    queryResult.businessAccessProfileCompletionStatus = true
  } else {
    queryResult.businessAccessProfileCompletionStatus = false
  }

  queryResult.businessProfileCompletionStatus = result.businessProfileCompletionStatus ? result.businessProfileCompletionStatus : false
  delete queryResult.canReceiveSms
  delete queryResult.canReceiveVoiceCall
  delete queryResult.associatedWithIvr
  finalResult.resolve(queryResult)
  return finalResult.promise
}

module.exports = {
  getBusinessProfile,
  addupdateBusinessAccountInfo
}
