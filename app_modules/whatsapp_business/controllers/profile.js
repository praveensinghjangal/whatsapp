const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const q = require('q')
const rejectionHandler = require('../../../lib/util/rejectionHandler')
const saveHistoryData = require('../../../lib/util/saveDataHistory')
const multer = require('multer')
const fs = require('fs')
const url = require('../../../lib/util/url')
const { FileStream } = require('../../../lib/util/fileStream')
const { FileDownload } = require('../../../lib/util/fileDownload')
const __config = require('../../../config')
// Services
const BusinessAccountService = require('../services/businesAccount')
const ValidatonService = require('../services/validation')
const CheckInfoCompletionService = require('../services/checkCompleteIncomplete')
const integrationService = require('../../../app_modules/integration')
const HttpService = require('../../../lib/http_service')
// const apiResponse = require('../../../config/apiResponse')
// Get Business Profile
const getBusinessProfile = (req, res) => {
  __logger.info('getBusinessProfile:>>>>>>>>>>>>>')
  let queryResult = []
  const userId = req.user && req.user.user_id ? req.user.user_id : 0
  const businessAccountService = new BusinessAccountService()
  businessAccountService.getBusinessProfileInfo(userId)
    .then(results => {
      __logger.info('Then 1')
      queryResult = results[0]
      if (results && results.length > 0) {
        results[0].canReceiveSms = results[0].canReceiveSms === 1
        results[0].canReceiveVoiceCall = results[0].canReceiveVoiceCall === 1
        results[0].associatedWithIvr = results[0].associatedWithIvr === 1
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
        return { businessAccessProfileCompletionStatus: data ? data.complete : true, businessProfileCompletionStatus: true }
      }
    })
    .then(result => {
      __logger.info('Then 3', { result })
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
  if (req && req.body) {
    req.body.associatedWithIvr = req.body.associatedWithIvr ? req.body.associatedWithIvr : false
  }
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
  __logger.info('addUpdateBusinessProfile::API TO ADD/UPDATE BUSINESS PROFILE CALLED', req.user.user_id)
  __logger.info('addUpdateBusinessProfile::PROVID===-', req.user.providerId, req.user.wabaPhoneNumber)
  const businessAccountService = new BusinessAccountService()
  const validate = new ValidatonService()
  this.http = new HttpService(60000)
  const userId = req.user && req.user.user_id ? req.user.user_id : '0'
  let wabaProfileData = {}
  let profileData = {}
  let websiteLimitByProvider = ''
  validate.addUpdateBusinessInfo(req.body)
    .then(data => businessAccountService.checkUserIdExist(userId))
    .then(data => {
      profileData = data
      return businessAccountService.getWebsiteLimitByProviderId(req.user.providerId)
    })
    .then(data => {
      websiteLimitByProvider = data
      __logger.info('addUpdateBusinessProfile::profile pic url-----', req.body.profilePhotoUrl, profileData.record.profilePhotoUrl)
      if (profileData.record && profileData.record.wabaProfileSetupStatusId === __constants.WABA_PROFILE_STATUS.accepted.statusCode) {
        if (req.body.profilePhotoUrl && req.body.profilePhotoUrl !== '' && req.body.profilePhotoUrl !== profileData.record.profilePhotoUrl) {
          __logger.info('addUpdateBusinessProfile::Api called to update profile pic')
          const url = __config.base_url + __constants.INTERNAL_END_POINTS.businessProfileLogoByUrl
          const headers = {
            Authorization: req.headers.authorization
          }
          return this.http.Put({ profilePic: req.body.profilePhotoUrl }, 'body', url, headers, true)
        } else {
          return data
        }
      } else {
        return data
      }
    })
    .then(apiResponse => {
      __logger.info('addUpdateBusinessProfile::apiREsponse', apiResponse)
      __logger.info('addUpdateBusinessProfile::exists ----------------->', profileData)
      if (apiResponse && apiResponse.code === 4032) {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.INVALID_URL, err: 'Invalid url for profilePhotoUrl', data: {} })
      }
      if (apiResponse && apiResponse.code === 4031) {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.INVALID_FILE_TYPE, err: 'Profile pic only supports the following filetypes - jpg, jpeg, png' })
      }
      if (apiResponse && apiResponse.code === 4033) {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.INVALID_FILE_SIZE, err: 'Add image with large size', data: {} })
      }
      if (req.body.websites && req.body.websites !== [] && req.body.websites.length > websiteLimitByProvider[0].maxWebsiteAllowed) {
        __logger.info('addUpdateBusinessProfile::maxWebsiteAllowed', websiteLimitByProvider[0].maxWebsiteAllowed)
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Maximum website allowed by provider is: ' + websiteLimitByProvider[0].maxWebsiteAllowed, data: {} })
      }
      if (!profileData.exists) {
        req.body.wabaProfileSetupStatusId = __constants.DEFAULT_WABA_SETUP_STATUS_ID
        return businessAccountService.insertBusinessData(userId, req.body, {})
      } else {
        __logger.info('addUpdateBusinessProfile::time to update')
        return businessAccountService.updateBusinessData(req.body, profileData.record || {})
      }
    })
    // call integration here in .then
    .then(data => {
      wabaProfileData = data
      __logger.info('addUpdateBusinessProfile::ddddd----', data)
      if (wabaProfileData && wabaProfileData.wabaProfileSetupStatusId === __constants.WABA_PROFILE_STATUS.accepted.statusCode) {
        __logger.info('addUpdateBusinessProfile::called tyntec api to update profile data---')
        const wabaAccountService = new integrationService.WabaAccount(req.user.providerId)
        return wabaAccountService.updateProfile(req.user.wabaPhoneNumber, wabaProfileData)
      } else {
        __logger.info('addUpdateBusinessProfile::status not accepted')
        return data
      }
    })
    .then(apiResponse => {
      if (apiResponse && apiResponse.status_code === 400) {
        return __util.send(res, { type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Website URL must be valid and start with http or https', data: {} })
      } else if (apiResponse && apiResponse.status_code === 404) {
        return __util.send(res, { type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, data: {} })
      }
    })
    .then(data => validate.isAddUpdateBusinessInfoComplete(wabaProfileData))
    .then(data => {
      __logger.info('addUpdateBusinessProfile::After inserting or updating', data)
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: { businessProfileCompletionStatus: data } })
    })
    .catch(err => {
      __logger.error('addUpdateBusinessProfile::error: ', err)
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
      __logger.info('exists -----------------> then 2', data)
      if (!data.exists) {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {}, data: {} })
      } else {
        record = data.record
        __logger.info('time to update')
        return validate.isAddUpdateBusinessAccessInfoComplete(record)
      }
    })
    .then(data => {
      __logger.info('datatatatata then 4', data)
      if (data) {
        return businessAccountService.updateBusinessData(req.body, record || {})
      } else {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.BUSINESS_INFO_NOT_COMPLETE, err: {}, data: {} })
      }
    })
    .then(data => {
      __logger.info('After Marking Manager verified then 5', data)
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: { businessVerificationCompletionStatus: true } })
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

function computeBusinessAccessAndBusinessProfleCompleteStatus (data) {
  __logger.info('AcomputeBusinessAccessAndBusinessProfleCompleteStatus >>')
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
  if (data && data.canReceiveSms && data.canReceiveVoiceCall && data.businessAccessProfileCompletionStatus) {
    data.businessAccessProfileCompletionStatus = true
  }
  if (data && (!data.canReceiveSms || !data.canReceiveVoiceCall || data.associatedWithIvr)) {
    data.businessAccessProfileCompletionStatus = false
  }
  businessProfilePromise.resolve(data)
  return businessProfilePromise.promise
}

function formatFinalStatus (queryResult, result) {
  const finalResult = q.defer()
  queryResult.businessProfileCompletionStatus = result.businessProfileCompletionStatus ? result.businessProfileCompletionStatus : false
  queryResult.businessAccessProfileCompletionStatus = result.businessAccessProfileCompletionStatus ? result.businessAccessProfileCompletionStatus : false
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
      __logger.info('Then 2')
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
      __logger.info('Then 2')
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
      __logger.info('exists -----------------> then 2', { data })
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
      __logger.info('datatatatata then 3', { data })
      if (data) {
        return validate.isAddUpdateBusinessInfoComplete(record)
      } else {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.BUSINESS_ACCESS_INFO_NOT_COMPLETE, err: {}, data: {} })
      }
    })
    .then(data => {
      __logger.info('data then 4 >>')
      if (data) {
        return businessAccountService.updateBusinessData(req.body, record || {})
      } else {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.BUSINESS_INFO_NOT_COMPLETE, err: {}, data: {} })
      }
    })
    .then(data => {
      __logger.info('After Adding Or Updating Optin Message then 5', data)
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: { businessVerificationCompletionStatus: true } })
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

const filter = function (req, file, cb) {
  __logger.info('filter')
  var filetypes = /(jpe?g|png)$/i
  let fileExt = file.originalname.split('.')
  fileExt = fileExt[fileExt.length - 1]
  var extname = filetypes.test(fileExt.toLowerCase())
  __logger.info('file mime type filter  -->', extname, fileExt)
  if (extname) {
    return cb(null, true)
  } else {
    const err = { ...__constants.RESPONSE_MESSAGES.INVALID_FILE_TYPE, err: 'File upload only supports the following filetypes - jpg, jpeg, png' }
    cb(err)
  }
}

const upload = multer({
  fileFilter: filter
}).array('profilePicture', 1)

const updateProfilePic = (req, res) => {
  __logger.info('updateProfilePic>>>>>>>>>>>>>>>...........')
  const userId = req.user && req.user.user_id ? req.user.user_id : 0
  const businessAccountService = new BusinessAccountService()
  __logger.info('RTRT', req.user, req.user.user_id)
  upload(req, res, function (err, data) {
    __logger.info('Hello ----------->', data, err)
    if (err) return res.send(err)
    if (!req.files || (req.files && !req.files[0])) {
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.PROVIDE_FILE, data: {} })
    } else {
      const imageData = req.files && req.files[0].buffer
      const wabaAccountService = new integrationService.WabaAccount(req.user.providerId)
      businessAccountService.checkUserIdExist(userId)
        .then(results => {
          __logger.info('got result', results.record)
          if (results && results.record !== '') {
            const reqBody = {
              imageData: imageData,
              userId,
              phoneCode: results.record.phoneCode,
              phoneNumber: results.record.phoneNumber
            }
            results.record.userId = userId
            businessAccountService.updateBusinessData(reqBody, results.record)
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

const updateProfilePicByUrl = (req, res) => {
  __logger.info('updateProfilePicByUrl::url', req.body.profilePic)
  const userId = req.user && req.user.user_id ? req.user.user_id : 0
  const businessAccountService = new BusinessAccountService()
  const wabaAccountService = new integrationService.WabaAccount(req.user.providerId)
  const fileStream = new FileStream()
  const fileDownload = new FileDownload()
  __logger.info('updateProfilePicByUrl::userId', req.user, req.user.user_id)
  if (!req.body.profilePic || req.body.profilePic === '') {
    return __util.send(res, { type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Enter url to update', data: {} })
  }
  if (!url.isValid(req.body.profilePic)) {
    return __util.send(res, { type: __constants.RESPONSE_MESSAGES.INVALID_URL, err: {}, data: {} })
  }
  let fileName = req.body.profilePic.split('/')
  fileName = fileName[fileName.length - 1]
  if (fileName.split('.')[1] === undefined) {
    return __util.send(res, { type: __constants.RESPONSE_MESSAGES.INVALID_FILE_TYPE, err: 'Profile pic needs to be one among the following filetypes - jpg, jpeg, png', data: {} })
  }
  const fileExt = fileName.split('.')[1]
  let fileRes = ''
  let resultRecord = ''
  var filetypes = __constants.VALIDATOR.fileExtType
  var extname = filetypes.test(fileExt.toLowerCase())
  if (!extname) {
    return __util.send(res, { type: __constants.RESPONSE_MESSAGES.INVALID_FILE_TYPE, err: 'Profile pic only supports the following filetypes - jpg, jpeg, png', data: {} })
  }
  __logger.info('updateProfilePicByUrl::file ext validation', extname)
  // download(req.body.profilePic, fileName, function () {
  fileDownload.downloadFile(req.body.profilePic, fileName, function () {
    __logger.info('updateProfilePicByUrl::file downloaded', fileName)
    businessAccountService.checkUserIdExist(userId)
      .then(result => {
        __logger.info('updateProfilePicByUrl:: user exists ? ---------->', { result })
        if (result && result.record !== '') {
          resultRecord = result.record
          const data = fs.readFileSync(__constants.PUBLIC_FOLDER_PATH + '/downloads/' + fileName)
          return wabaAccountService.updateProfilePic(req.user.wabaPhoneNumber, data)
        } else {
          return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {}, data: {} })
        }
      })
      .then(apiResponse => {
        __logger.info('updateProfilePicByUrl::', { apiResponse, status_code: apiResponse.type.status_code })
        if (apiResponse && apiResponse.type.status_code === 200) {
          return businessAccountService.updateProfilePicUrl(req.body.profilePic, req.user.user_id)
        } else if (apiResponse && apiResponse.type.status_code === 400) {
          // async function call
          fileRes = fileStream.deleteFile(__constants.PUBLIC_FOLDER_PATH + '/downloads/' + fileName, fileName)
          __logger.info('updateProfilePicByUrl', { fileRes })
          return __util.send(res, { type: __constants.RESPONSE_MESSAGES.INVALID_FILE_SIZE, err: 'Add image with large size', data: {} })
        }
      })
      .then(result => {
        if (result && result.affectedRows > 0) {
          __logger.info('updateProfilePicByUrl:: updated pic in db', { result })
          saveHistoryData(resultRecord, __constants.ENTITY_NAME.WABA_INFORMATION, resultRecord.wabaInformationId, userId)
          fileStream.deleteFile(__constants.PUBLIC_FOLDER_PATH + '/downloads/' + fileName, fileName)
          return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: {} })
        }
      })
      .catch(err => {
        __logger.error('error: ', err)
        return __util.send(res, { type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || {} })
      })
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
  updateProfilePic,
  updateProfilePicByUrl
}
