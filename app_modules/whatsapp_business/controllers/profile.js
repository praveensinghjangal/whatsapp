const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const __db = require('../../../lib/db')
const q = require('q')
const queryProvider = require('../queryProvider')
const _ = require('lodash')
const rejectionHandler = require('../../../lib/util/rejectionHandler')

// Services
const UserService = require('../services/dbData')
const CheckInfoCompletionService = require('../services/checkCompleteIncomplete')

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

// Update Account Prfofile

// const updateBusinessProfileVerificationStatus = (req, res) => {
//   __logger.info('Inside updateBusinessProfileVerification', req.user.user_id)

//   // check user id exist
//   const userId = req.user && req.user.user_id ? req.user.user_id : '0'

//   const userService = new UserService()
//   userService.checkUserIdExistForBusiness(userId)

//   // if exist continue and check whether businessManagerVerified field is supplied or not

//   //  if supplied then update
//   // else throw error proper input not supplied

//   // else thow error unauthorized

//     .then(result => {
//       __logger.info('UserId exist check then 1', result.exists)
//       if (result.exists) {
//         accountProfileData = {
//           userId: req.user && req.user.user_id ? req.user.user_id : '0',
//           city: req.body.city ? req.body.city : result.rows[0].city,
//           state: req.body.state ? req.body.state : result.rows[0].state,
//           country: req.body.country ? req.body.country : result.rows[0].country,
//           addressLine1: req.body.addressLine1 ? req.body.addressLine1 : result.rows[0].addressLine1,
//           addressLine2: req.body.addressLine2 ? req.body.addressLine2 : result.rows[0].addressLine2,
//           contactNumber: req.body.contactNumber ? req.body.contactNumber : result.rows[0].contactNumber,
//           phoneCode: req.body.phoneCode ? req.body.phoneCode : result.rows[0].phoneCode,
//           postalCode: req.body.postalCode ? req.body.postalCode : result.rows[0].postalCode,
//           firstName: req.body.firstName ? req.body.firstName : result.rows[0].firstName,
//           lastName: req.body.lastName ? req.body.lastName : result.rows[0].lastName,
//           accountManagerName: req.body.accountManagerName ? req.body.accountManagerName : result.rows[0].accountManagerName,
//           accountTypeId: req.body.accountTypeId ? req.body.accountTypeId : __constants.ACCOUNT_PLAN_TYPE.Prepaid
//         }

//         return __db.postgresql.__query(queryProvider.updateUserAccountProfile(), [accountProfileData.city, accountProfileData.state, accountProfileData.country, accountProfileData.addressLine1, accountProfileData.addressLine2, accountProfileData.contactNumber, accountProfileData.phoneCode, accountProfileData.postalCode, accountProfileData.firstName, accountProfileData.lastName, accountProfileData.accountManagerName, accountProfileData.accountTypeId, accountProfileData.userId, accountProfileData.userId])
//       } else {
//         return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {}, data: {} })
//       }
//     })
//     .then(result => {
//       __logger.info('then 3', result)
//       queryResult = result.rows

//       if (result && result.rowCount && result.rowCount > 0) {
//         return checkAccountProfileCompletionStatus(accountProfileData)
//       } else {
//         return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.PROCESS_FAILED, err: {}, data: {} })
//       }
//     })
//     .then(data => {
//       queryResult.complete = data.complete
//       // queryResult.push(data)
//       __logger.info('queryResult', queryResult)
//       __logger.info('data', data)
//       return __util.send(res, {
//         type: __constants.RESPONSE_MESSAGES.SUCCESS,
//         data: { complete: queryResult.complete }
//       })
//     })
//     .catch(err => {
//       __logger.error('error: ', err)
//       return __util.send(res, { type: err.type, err: err.err })
//     })
// }

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

function getBusinessProfileInfo (userId) {
  return __db.postgresql.__query(queryProvider.getBusinessProfile(), [userId])
}

module.exports = {
  getBusinessProfile,
  checkBusinessProfileCompletionStatus,
  // updateBusinessProfileVerificationStatus,
  getBusinessProfileInfo
}
