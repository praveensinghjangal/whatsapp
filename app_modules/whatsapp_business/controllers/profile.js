const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const q = require('q')
const rejectionHandler = require('../../../lib/util/rejectionHandler')
const saveHistoryData = require('../../../lib/util/saveDataHistory')
const multer = require('multer')
// Services
const BusinessAccountService = require('../services/businesAccount')
const ValidatonService = require('../services/validation')
const CheckInfoCompletionService = require('../services/checkCompleteIncomplete')
const placeIdService = require('../services/getPlacesId')
const integrationService = require('../../../app_modules/integration')
// Get Business Profile
const getBusinessProfile = (req, res) => {
  let queryResult = []
  const userId = req.user && req.user.user_id ? req.user.user_id : 0
  const businessAccountService = new BusinessAccountService()
  businessAccountService.getBusinessProfileInfo(userId)
    .then(results => {
      __logger.info('Then 1')
      queryResult = results[0]
      if (results && results.length > 0) {
        const idObj = placeIdService(results[0].country, results[0].state, results[0].city)
        results[0].countryId = idObj.countryId
        results[0].stateId = idObj.stateId
        results[0].cityId = idObj.cityId
        const checkCompleteStatus = new CheckInfoCompletionService()
        return checkCompleteStatus.validateBusinessProfile(results[0])
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
      __logger.info('Then 3', result)
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
  __logger.info('Inside addupdateBusinessAccountInfo', req.user.user_id)
  const userId = req.user && req.user.user_id ? req.user.user_id : '0'
  const validate = new ValidatonService()
  const businessAccountService = new BusinessAccountService()

  validate.businessAccessInfo(req.body)
    .then(data => {
      __logger.info(' then 1')
      return businessAccountService.checkUserIdExist(userId)
    })
    .then(result => {
      __logger.info(' then 2')
      if (!result.exists) {
        req.body.wabaProfileSetupStatusId = __constants.DEFAULT_WABA_SETUP_STATUS_ID
        return businessAccountService.insertBusinessData(userId, req.body, {})
      } else {
        return businessAccountService.updateBusinessData(req.body, result.record)
      }
    })
    .then(data => validate.isAddUpdateBusinessAccessInfoComplete(data))
    .then(data => {
      __logger.info('After inserting or updating', data)
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: { businessAccessProfileCompletionStatus: data } })
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

// todo : add check if category id exists in master
const addUpdateBusinessProfile = (req, res) => {
  __logger.info('API TO ADD/UPDATE BUSINESS PROFILE CALLED', req.user.user_id)
  const businessAccountService = new BusinessAccountService()
  const validate = new ValidatonService()
  const userId = req.user && req.user.user_id ? req.user.user_id : '0'
  validate.addUpdateBusinessInfo(req.body)
    .then(data => businessAccountService.checkUserIdExist(userId))
    .then(data => {
      __logger.info('exists ----------------->', data)
      if (!data.exists) {
        req.body.wabaProfileSetupStatusId = __constants.DEFAULT_WABA_SETUP_STATUS_ID
        return businessAccountService.insertBusinessData(userId, req.body, {})
      } else {
        __logger.info('time to update')
        return businessAccountService.updateBusinessData(req.body, data.record || {})
      }
    })
    .then(data => validate.isAddUpdateBusinessInfoComplete(data))
    .then(data => {
      __logger.info('After inserting or updating', data)
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: { businessProfileCompletionStatus: data } })
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

const markManagerVerified = (req, res) => {
  __logger.info('API TO MARK BUSINESS MANAGER VERIFIED', req.user.user_id)
  const businessAccountService = new BusinessAccountService()
  const validate = new ValidatonService()
  const userId = req.user && req.user.user_id ? req.user.user_id : '0'
  let record
  validate.markManagerVerified(req.body)
    .then(data => businessAccountService.checkUserIdExist(userId))
    .then(data => {
      __logger.info('exists ----------------->', data)
      if (!data.exists) {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {}, data: {} })
      } else {
        record = data.record
        __logger.info('time to update')
        // return
        return validate.isAddUpdateBusinessAccessInfoComplete(record)
      }
    })
    .then(data => {
      // console.log('datatatatata', data)
      if (data) {
        return validate.isAddUpdateBusinessInfoComplete(record)
      } else {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.BUSINESS_ACCESS_INFO_NOT_COMPLETE, err: {}, data: {} })
      }
    })
    .then(data => {
      if (data) {
        return businessAccountService.updateBusinessData(req.body, record || {})
      } else {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.BUSINESS_INFO_NOT_COMPLETE, err: {}, data: {} })
      }
    })
    .then(data => {
      __logger.info('After Marking Manager verified', data)
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: { businessVerificationCompletionStatus: true } })
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
  const businessProfileFields = ['businessName', 'whatsappStatus', 'description', 'address', 'country', 'email', 'businessCategory', 'profilePhotoUrl', 'city', 'postalCode']
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
  businessProfilePromise.resolve(data)
  return businessProfilePromise.promise
}

function formatFinalStatus (queryResult, result) {
  const finalResult = q.defer()
  queryResult.businessProfileCompletionStatus = result.businessProfileCompletionStatus ? result.businessProfileCompletionStatus : false
  queryResult.businessAccessProfileCompletionStatus = result.businessAccessProfileCompletionStatus ? result.businessAccessProfileCompletionStatus : false
  queryResult.canReceiveSms = queryResult.canReceiveSms === 1
  queryResult.canReceiveVoiceCall = queryResult.canReceiveVoiceCall === 1
  queryResult.associatedWithIvr = queryResult.associatedWithIvr === 1
  queryResult.businessManagerVerified = queryResult.businessManagerVerified === 1
  queryResult.phoneVerified = queryResult.phoneVerified === 1
  finalResult.resolve(queryResult)
  return finalResult.promise
}

const updateServiceProviderId = (req, res) => {
  __logger.info('Inside updateServiceProviderId')
  const userId = req.user && req.user.user_id ? req.user.user_id : 0
  const businessAccountService = new BusinessAccountService()
  const validationService = new ValidatonService()

  validationService.checkServiceProviderIdService(req.body)
    .then(data => businessAccountService.getBusinessProfileInfo(userId))
    .then(results => {
      __logger.info('Then 1')
      if (results && results.length > 0) {
        saveHistoryData(results[0], __constants.ENTITY_NAME.WABA_INFORMATION, results[0].wabaInformationId, userId)
        return businessAccountService.updateServiceProviderId(userId, req.body.serviceProviderId)
      } else {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {}, data: {} })
      }
    })
    .then(result => {
      __logger.info('Then 3')
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: result })
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

const updateWabaPhoneNumber = (req, res) => {
  __logger.info('Inside updateWabaPhoneNumber')
  const userId = req.user && req.user.user_id ? req.user.user_id : 0
  const businessAccountService = new BusinessAccountService()
  const validationService = new ValidatonService()

  validationService.checkPhoneCodeAndPhoneNumberService(req.body)
    .then(data => businessAccountService.checkWabaNumberAlreadyExist(req.body.phoneCode, req.body.phoneNumber, userId))
    .then(results => {
      __logger.info('Then 1')
      return businessAccountService.updateWabaNumberAndPhoneCode(userId, req.body.phoneCode, req.body.phoneNumber, req.body.wabaInformationId)
    })
    .then(result => {
      __logger.info('Then 3', result)
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: result })
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

const addUpdateOptinMessage = (req, res) => {
  __logger.info('API TO Add Update Optin Message', req.user.user_id)
  const businessAccountService = new BusinessAccountService()
  const validate = new ValidatonService()
  const userId = req.user && req.user.user_id ? req.user.user_id : '0'
  let record
  validate.addUpdateOptinMessage(req.body)
    .then(data => businessAccountService.checkUserIdExist(userId))
    .then(data => {
      __logger.info('exists ----------------->', data)
      if (!data.exists) {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {}, data: {} })
      } else {
        record = data.record
        __logger.info('time to update')
        // return
        return validate.isAddUpdateBusinessAccessInfoComplete(record)
      }
    })
    .then(data => {
      // console.log('datatatatata', data)
      if (data) {
        return validate.isAddUpdateBusinessInfoComplete(record)
      } else {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.BUSINESS_ACCESS_INFO_NOT_COMPLETE, err: {}, data: {} })
      }
    })
    .then(data => {
      if (data) {
        return businessAccountService.updateBusinessData(req.body, record || {})
      } else {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.BUSINESS_INFO_NOT_COMPLETE, err: {}, data: {} })
      }
    })
    .then(data => {
      __logger.info('After Adding Or Updating Optin Message', data)
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: { businessVerificationCompletionStatus: true } })
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

const filter = function (req, file, cb) {
  var filetypes = /(jpe?g|png)$/i
  let fileExt = file.originalname.split('.')
  fileExt = fileExt[fileExt.length - 1]
  var extname = filetypes.test(fileExt.toLowerCase())
  __logger.info('file mime type filter  -->', extname, fileExt)
  if (extname) {
    return cb(null, true)
  } else {
    const err = { type: __constants.RESPONSE_MESSAGES.INVALID_FILE_TYPE, err: 'File upload only supports the following filetypes - jpg, jpeg, png' }
    cb(err)
  }
}

const upload = multer({
  fileFilter: filter
}).array('profilePicture', 1)

const updateProfilePic = (req, res) => {
  const userId = req.user && req.user.user_id ? req.user.user_id : 0
  const businessAccountService = new BusinessAccountService()
  __logger.info('RTRT', req.user, req.user.user_id)
  upload(req, res, function (err, data) {
    __logger.info('Hello ----------->', data, err)
    if (err) return res.send(err)
    if (!req.files || (req.files && !req.files[0])) {
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.PROVIDE_FILE, data: {} })
    } else {
      __logger.info('filessssss', req.files)
      const wabaAccountService = new integrationService.WabaAccount(req.user.providerId)
      businessAccountService.checkUserIdExist(userId)
        .then(results => {
          __logger.info('got result', results.record)
          if (results && results.record !== '') {
            return wabaAccountService.updateProfilePic(req.user.wabaPhoneNumber, req.files[0].buffer)
          } else {
            return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {}, data: {} })
          }
        })
        .then(accountData => __util.send(res, accountData))
        .catch(err => {
          __logger.error('error: ', err)
          return __util.send(res, { type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || {} })
        })
    }
  })
}

module.exports = {
  getBusinessProfile,
  addUpdateBusinessProfile,
  addupdateBusinessAccountInfo,
  markManagerVerified,
  updateServiceProviderId,
  updateWabaPhoneNumber,
  addUpdateOptinMessage,
  updateProfilePic
}
