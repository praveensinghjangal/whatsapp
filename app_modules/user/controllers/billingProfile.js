// const __util = require('../../../lib/util')
// const __constants = require('../../../config/constants')
// const __logger = require('../../../lib/logger')
// const __db = require('../../../lib/db')
// const queryProvider = require('../queryProvider')
// const UniqueId = require('../../../lib/util/uniqueIdGenerator')
// const rejectionHandler = require('../../../lib/util/rejectionHandler')
// const saveHistoryData = require('../../../lib/util/saveDataHistory')
// // Services
// const UserService = require('../services/dbData')
// const ValidatonService = require('../services/validation')
// const CheckInfoCompletionService = require('../services/checkCompleteIncomplete')

// /**
//  * @namespace -Billing-Profile-Controller-
//  * @description In this controller, API related to User profile billing and their details are provided.
//  */

// /**
//  * @memberof -Billing-Profile-Controller-
//  * @name GetBusinessBilllingProfile
//  * @path {GET} /users/billing
//  * @description Bussiness Logic :- This API returns details regarding the billing of the particular profile with its GST number and Active plan.
//  * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
//  * @response {string} ContentType=application/json - Response content type.
//  * @response {string} metadata.msg=Success  - Response got successfully.
//  * @response {object} metadata.data - Returns the object with billing details and active plan.
//  * @code {200} if the msg is success than Returns billing info and its completion status.
//  * @author Arjun Bhole 15th May, 2020
//  * *** Last-Updated :- Arjun Bhole 23 October,2020 ***
//  */

// // Get Business Profile
// const getBusinessBilllingProfile = (req, res) => {
//   __logger.info('Inside getBusinessBilllingProfile', req.user.user_id)
//   const userId = req.user && req.user.user_id ? req.user.user_id : 0
//   let queryResult = {}
//   __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getBillingProfile(), [userId])
//     .then(results => {
//       __logger.info('Then 1', { results })
//       if (results && results.length > 0) {
//         queryResult = results[0]
//         return checkBusinessBillingProfileCompletionStatus(results[0])
//       } else {
//         return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {}, data: {} })
//       }
//     })
//     .then(data => {
//       __logger.info('then 2', { data })
//       queryResult.complete = data.complete
//       return __util.send(res, {
//         type: __constants.RESPONSE_MESSAGES.SUCCESS,
//         data: queryResult
//       })
//     })
//     .catch(err => {
//       __logger.error('error: ', err)
//       return __util.send(res, { type: err.type, err: err.err })
//     })
// }

// //  Update Business Profile
// function updateBusinessBilllingProfile (userId, oldBusinessData, businessDataToBeUpdated) {
//   // __logger.info('Inside updateBusinessBilllingProfile oldBusinessData', oldBusinessData)
//   // __logger.info('Inside updateBusinessBilllingProfile businessDataToBeUpdated', businessDataToBeUpdated)
//   // __logger.info('Inside updateBusinessBilllingProfile', userId)
//   let queryResult
//   saveHistoryData(oldBusinessData, __constants.ENTITY_NAME.BILLING_INFORMATION, oldBusinessData.billing_information_id, userId)
//   return new Promise((resolve, reject) => {
//     const businessDataObj = {
//       city: businessDataToBeUpdated.city ? businessDataToBeUpdated.city : oldBusinessData.city,
//       state: businessDataToBeUpdated.state ? businessDataToBeUpdated.state : oldBusinessData.state,
//       country: businessDataToBeUpdated.country ? businessDataToBeUpdated.country : oldBusinessData.country,
//       addressLine1: businessDataToBeUpdated.addressLine1 ? businessDataToBeUpdated.addressLine1 : oldBusinessData.addressLine1,
//       addressLine2: businessDataToBeUpdated.addressLine2 ? businessDataToBeUpdated.addressLine2 : null,
//       contactNumber: businessDataToBeUpdated.contactNumber ? businessDataToBeUpdated.contactNumber : oldBusinessData.contactNumber,
//       phoneCode: businessDataToBeUpdated.phoneCode ? businessDataToBeUpdated.phoneCode : oldBusinessData.phoneCode,
//       postalCode: businessDataToBeUpdated.postalCode ? businessDataToBeUpdated.postalCode : oldBusinessData.postalCode,
//       gstOrTaxNo: businessDataToBeUpdated.gstOrTaxNo ? businessDataToBeUpdated.gstOrTaxNo : oldBusinessData.gstOrTaxNo,
//       billingName: businessDataToBeUpdated.billingName ? businessDataToBeUpdated.billingName : oldBusinessData.billingName,
//       panCard: businessDataToBeUpdated.panCard ? businessDataToBeUpdated.panCard : oldBusinessData.panCard,
//       billingInformationId: oldBusinessData.billing_information_id
//     }
//     __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.updateBusinessBillingProfile(), [businessDataObj.city, businessDataObj.state, businessDataObj.country, businessDataObj.addressLine1, businessDataObj.addressLine2, businessDataObj.contactNumber, businessDataObj.phoneCode, businessDataObj.postalCode, businessDataObj.panCard, businessDataObj.gstOrTaxNo, businessDataObj.billingName, userId, userId])
//       .then(result => {
//         __logger.info('Then 2 update', { result })
//         queryResult = result
//         return checkBusinessBillingProfileCompletionStatus(businessDataObj)
//       })
//       .then(result => {
//         __logger.info('Then 3 update', result)
//         queryResult.complete = result.complete
//         if (queryResult && queryResult.affectedRows && queryResult.affectedRows > 0) {
//           return resolve({ affectedRows: queryResult.affectedRows, complete: queryResult.complete })
//         } else {
//           return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.PROCESS_FAILED, data: {} })
//         }
//       })
//       .catch(err => {
//         __logger.error('error: ', err)
//         return rejectionHandler({ type: err.type, err: err.err, data: {} })
//       })
//   })
// }

// /**
//  * @memberof -Billing-Profile-Controller-
//  * @name AddBusinessBillingProfile
//  * @path {POST} /users/billing
//  * @description Bussiness Logic :- This API add/update the data of the billing business profile entry.
//  * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
//    <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/businessBillingProfile/getBillingData|AddBusinessBillingProfile}
//  * @body {string}  city- Provide the valid name of city
//  * @body {string}  state - Provide the valid name of the state
//  * @body {string}  country- Provide the valid name of the country
//  * @body {string}  addressLine1 - Provide the valid addressLine1
//  * @body {string}  addressLine2 - Provide the valid second addressLine1
//  * @body {string}  phoneCode - Provide the valid phone code
//  * @body {string}  postalCode - Provide the valid postal code
//  * @body {string}  contactNumber - Provide the valid contact Number
//  * @body {string}  userId - Provide the valid user Id
//  * @body {string}  GstOrTaxNo - Provide the valid GST or Tax no
//  * @body {string}  businessName - Provide the valid Business name
//  * @body {string}  panCard - Provide the valid Pan card details
//  * @response {string} ContentType=application/json - Response content type.
//  * @response {string} metadata.msg=Success  - Response got successfully.
//  * @response {string} metadata.data.complete - Returns the completion status.
//  * @code {200} if the msg is success than Add/Update process is excuted and Returns completion status.
//  * @author Arjun Bhole 22nd May, 2020
//  * *** Last-Updated :- Arjun Bhole 23 October,2020 ***
//  */

// // Add Business Profile
// const addBusinessBilllingProfile = (req, res) => {
//   __logger.info('Inside getBusinessBilllingProfile', req.user.user_id)
//   const userId = req.user && req.user.user_id ? req.user.user_id : '0'
//   if (req && req.body && req.body.addressLine2 === null) req.body.addressLine2 = ''
//   const validate = new ValidatonService()
//   validate.businessProfile(req.body)
//     .then(data => {
//       __logger.info(' then 1')
//       const userService = new UserService()
//       return userService.checkUserIdExistForBusiness(userId)
//     })
//     .then(result => {
//       /* If exists then updating else inserting */
//       __logger.info('Inside Query execution function then 2', { result })
//       if (!result.exists) {
//         return insertBusinessBillingProfileInfo(userId, req.body, {})
//       } else {
//         return updateBusinessBilllingProfile(userId, result.record, req.body)
//       }
//     })
//     .then(result => {
//       __logger.info('Then 3', { result })
//       if (result && result.affectedRows && result.affectedRows > 0) {
//         return __util.send(res, {
//           type: __constants.RESPONSE_MESSAGES.SUCCESS,
//           data: { complete: result.complete }
//         })
//       } else {
//         return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.PROCESS_FAILED, err: {}, data: {} })
//       }
//     })
//     .catch(err => {
//       __logger.error('error: ', err)
//       return __util.send(res, { type: err.type, err: err.err })
//     })
// }

// // Function to insert data
// function insertBusinessBillingProfileInfo (userId, businessData, businessOldData) {
//   __logger.info('Inputs insertBusinessBillingProfileInfo userId', userId)
//   // __logger.info('Inputs businessData', businessData)
//   // __logger.info('Inputs businessOldData', businessOldData)
//   const uniqueId = new UniqueId()
//   let queryResult
//   const billingObj = {
//     city: businessData.city ? businessData.city : businessOldData.city,
//     state: businessData.state ? businessData.state : businessOldData.state,
//     country: businessData.country ? businessData.country : businessOldData.country,
//     addressLine1: businessData.addressLine1 ? businessData.addressLine1 : businessOldData.addressLine1,
//     addressLine2: businessData.addressLine2 ? businessData.addressLine2 : null,
//     contactNumber: businessData.contactNumber ? businessData.contactNumber : businessOldData.contactNumber,
//     phoneCode: businessData.phoneCode ? businessData.phoneCode : businessOldData.phoneCode,
//     postalCode: businessData.postalCode ? businessData.postalCode : businessOldData.postalCode,
//     gstOrTaxNo: businessData.gstOrTaxNo ? businessData.gstOrTaxNo : businessOldData.gstOrTaxNo,
//     billingName: businessData.billingName ? businessData.billingName : businessOldData.billingName,
//     panCard: businessData.panCard ? businessData.panCard : businessOldData.panCard,
//     billingInformationId: businessOldData.billingInformationId ? businessOldData.billingInformationId : uniqueId.uuid(),
//     planId: __constants.FREE_PLAN_ID

//   }
//   // __logger.info('Billing Obj', billingObj)
//   return new Promise((resolve, reject) => {
//     __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.createBusinessBillingProfile(), [userId, billingObj.billingName, billingObj.city, billingObj.state, billingObj.country, billingObj.addressLine1, billingObj.addressLine2, billingObj.contactNumber, billingObj.phoneCode, billingObj.postalCode, billingObj.panCard, billingObj.gstOrTaxNo, billingObj.billingInformationId, userId])
//       .then(result => {
//         __logger.info('result then 1', { result })
//         if (result && result.affectedRows && result.affectedRows > 0) {
//           queryResult = result
//           return checkBusinessBillingProfileCompletionStatus(billingObj)
//         } else {
//           return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: {} })
//         }
//       })
//       .then(data => {
//         __logger.info('then 2', { data })
//         // __logger.info('queryResult', queryResult)
//         // __logger.info('data', data)
//         return resolve({ affectedRows: queryResult.affectedRows, complete: data.complete })
//       })
//       .catch(err => {
//         __logger.error('error: ', err)
//         return reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err }) // eslint-disable-line
//       })
//   })
// }

// function checkBusinessBillingProfileCompletionStatus (data) {
//   __logger.info('checkBusinessBillingProfileCompletionStatus::>>>>>>>>>>>...........')
//   const checkCompleteStatus = new CheckInfoCompletionService()
//   return checkCompleteStatus.checkBusinessBillingProfileStatus(data)
// }

// module.exports = { addBusinessBilllingProfile, getBusinessBilllingProfile, updateBusinessBilllingProfile, insertBusinessBillingProfileInfo }
