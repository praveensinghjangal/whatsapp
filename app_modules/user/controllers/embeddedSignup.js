const q = require('q')
const _ = require('lodash')
const ValidatonService = require('../services/validation')
const __util = require('../../../lib/util')
const __logger = require('../../../lib/logger')
const __constants = require('../../../config/constants')
const __config = require('../../../config')
const UserService = require('../services/dbData')
const integrationService = require('../../../app_modules/integration')
const HttpService = require('../../../lib/http_service')
const phoneCodeAndPhoneSeprator = require('../../../lib/util/phoneCodeAndPhoneSeprator')

/**
 * @namespace -Embedded-SignUp-Controller-
 * @description Embedded SignUp API.
 */

const accessInformation = (wabaIdOfClient, businessName, phoneCode, phoneNumber, authTokenOfWhatsapp) => {
  const getAccessInfo = q.defer()
  const http = new HttpService(60000)
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: authTokenOfWhatsapp
  }
  const body = {
    associatedWithIvr: false,
    businessName: businessName,
    canReceiveSms: true,
    canReceiveVoiceCall: true,
    facebookManagerId: wabaIdOfClient,
    phoneCode: phoneCode,
    phoneNumber: phoneNumber
  }
  http.Post(body, 'body', __config.base_url + __constants.INTERNAL_END_POINTS.accessInformation, headers)
    .then(data => {
      getAccessInfo.resolve(data)
    })
    .catch(err => {
      getAccessInfo.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
    })
  return getAccessInfo.promise
}

const markManagerVerified = (authTokenOfWhatsapp) => {
  const markedVerified = q.defer()
  const http = new HttpService(60000)
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: authTokenOfWhatsapp
  }
  const body = {
    businessManagerVerified: true
  }
  http.Post(body, 'body', __config.base_url + __constants.INTERNAL_END_POINTS.markManagerVerified, headers)
    .then(data => {
      markedVerified.resolve(data)
    })
    .catch(err => {
      markedVerified.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
    })
  return markedVerified.promise
}

const sendBusinessForApproval = (authTokenOfWhatsapp, serviceProviderId) => {
  const sentForApproval = q.defer()
  const http = new HttpService(60000)
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: authTokenOfWhatsapp
  }
  const body = {
    businessManagerVerified: true
  }
  // this.http.Put(profilePicBuffer, 'body', url, headers, false, data.serviceProviderId)
  http.Put(body, 'body', __config.base_url + __constants.INTERNAL_END_POINTS.sendBusinessForApproval, headers, false, serviceProviderId)
    .then(data => {
      sentForApproval.resolve(data)
    })
    .catch(err => {
      sentForApproval.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
    })
  return sentForApproval.promise
}

const setPendingForApprovalStatus = (authTokenOfWhatsapp, userId, serviceProviderId) => {
  const sentForApproval = q.defer()
  const http = new HttpService(60000)
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: authTokenOfWhatsapp
  }
  const body = {
    userId: userId,
    wabaProfileSetupStatusId: __constants.WABA_PROFILE_STATUS.pendingForApproval.statusCode
  }
  // this.http.Put(profilePicBuffer, 'body', url, headers, false, data.serviceProviderId)
  http.Put(body, 'body', __config.base_url + __constants.INTERNAL_END_POINTS.setProfileStatus, headers, false, serviceProviderId)
    .then(data => {
      sentForApproval.resolve(data)
    })
    .catch(err => {
      sentForApproval.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
    })
  return sentForApproval.promise
}

/**
 * @memberof -Embedded-SignUp-Controller-
 * @name Embedded-SignUp
 * @path {POST} /users/embedded/signup
 * @description Bussiness Logic :- Embedded Signup api should be called after the Fb login flow in viva connect helo-whatsapp. This api is used to link client's waba with our waba
 <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/users/embedded/signup|EmbeddedSignUp}
 * @body {string}  email - Provide the valid email for login.
 * @body {string}  password - Provide the correct password for login.
 * @body {boolean}  tncAccepted=true - Read terms and condition
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=Success  - Response got successfully.
 * @response {string} metadata.data.userId - Is the user is created, it will return userId in string.
 * @code {200} if the msg is success, Returns userId if user is created or if the user exist in database than it will return as User Already Exists.
 * @author Vivek Thakkar 11th May, 2020
 * *** Last-Updated :- Vivek Thakkar 23 October,2020 ***
 */

const controller = (req, res) => {
  __logger.info('Inside Sign up')
  const validate = new ValidatonService()
  const systemUserIdBSP = __config.systemUserIdBSP
  let wabaIdOfClient, businessIdOfClient, businessName, wabaNumberThatNeedsToBeLinked, phoneCode, phoneNumber
  const authTokenOfWhatsapp = req.headers.authorization
  //   const userService = new UserService()
  req.user = { providerId: 'a4f03720-3a33-4b94-b88a-e10453492183', userId: '1234' }
  const embeddedSignupService = new integrationService.EmbeddedSignup(req.user.providerId, req.user.userId, __config.authorization)
  validate.embeddedSignup(req.body)
    .then(valResponse => {
      req.body.inputToken = 'EAAG0ZAQUaL3wBAGZCqa7ZAkseCciRMxLNGJhmcDT39ZATA7J0FJiLutz1EXOcERJAEGnDnTXuxbOdSDIy19o8ru3sd3ID6z4r5jV2OkOgBrAeoSYQgJFlyO5eJpEXMoXLkEUD8ocldRQXjz5haeo1PacxlSkxkVDAwYyOnUFxtoQRllXKouHjjoDqVNUvnmZB9CxwB4ZBkywu1yrZChkFhu'
      // get the waba id of client's account using client's inputToken
      return embeddedSignupService.getWabaOfClient(req.body.inputToken, 'wabaNumber')
    })
    .then(debugData => {
      console.log('1111111111111111111111111111111111111111111111111111111', debugData)
      const granularScopes = debugData.granular_scopes
      const whatsappBusinessManagement = _.find(granularScopes, { scope: 'whatsapp_business_management' })
      wabaIdOfClient = whatsappBusinessManagement.target_ids[0]
      const businessManagement = _.find(granularScopes, { scope: 'business_management' })
      businessIdOfClient = businessManagement.target_ids[0]
      // get waba information by waba id. This data will be used to call inhouse-whatsapp-api
      return embeddedSignupService.getWabaDetailsByWabaId(wabaIdOfClient, 'wabaNumber')
    })
    .then(wabaDetails => {
      businessName = wabaDetails.name
      // todo: get phone numbers linked to client's waba id
      return embeddedSignupService.getPhoneNumberOfWabaId(wabaIdOfClient, 'wabaNumber')
    })
    .then(data => {
      // todo: make a db call to get the new onboarded number out of the list in "data". save the certificate
      const phoneNumbersOfGivenWabaId = []
      data.map((a, b) => {
        phoneNumbersOfGivenWabaId.push(a.display_phone_number)
      })
      return phoneNumberBasedOnWabaId(wabaIdOfClient, phoneNumbersOfGivenWabaId)
    })
    .then(data => {
      console.log('dta of data of datatata', data)
      // there will always be only 1 phone number that will not be present in the db. since that number has not been onboarded yet
      wabaNumberThatNeedsToBeLinked = data[0]
      const obj = phoneCodeAndPhoneSeprator[wabaNumberThatNeedsToBeLinked]
      phoneCode = obj.phoneCode
      phoneNumber = obj.phoneNumber
      // .then(wabaDetails => {
      //   businessName = wabaDetails.name
      //   // todo: get phone numbers linked to client's waba id
      // })
      // .then(data => {
      //   // todo: make a db call to get the new onboarded number out of the list in "data". save the certificate
      //   wabaNumberThatNeedsToBeLinked = ''
      // })
    })
    .then(data => {
      console.log('222222222222222222222222222222222222222222222222222222222', data)
      // add system user to client's waba
      return embeddedSignupService.addSystemUserToWabaOfClient(systemUserIdBSP, wabaIdOfClient, 'wabaNumber')
    })
    .then(data => {
      console.log('333333333333333333333333333333333333333333333333333333333', data)
      // todo: fetch assigned system users to waba
      return embeddedSignupService.fetchAssignedUsersOfWaba(wabaIdOfClient, 'wabaNumber')
    })
    // .then(data => {
    //   //! dont do this. Put the id in env
    //   // get id of business credit line of bsp

    //   return embeddedSignupService.getBussinessIdLineOfCredit()
    // })
    .then(data => {
      console.log('444444444444444444444444444444444444444444444444', data)
      // todo: attach business credit line id to client's waba
      return embeddedSignupService.attachCreditLineClientWaba(wabaIdOfClient)
    })
    .then(data => {
      console.log('55555555555555555555555555555555555555555555555', data)
      // todo: verify that the line of credit was shared correctly
      return embeddedSignupService.verifyLineOfCredit(data.allocation_config_id)
    })
    .then(data => {
      console.log('666666666666666666666666666666666666666666666666', data)
      // todo: subscribe app to client's waba
      return embeddedSignupService.subscribeAppToWaba(wabaIdOfClient, 'wabaNumber')
    })
    // .then(data => {
    //   // todo: spawn new containers and call whatsapp apis to link container with client's waba. There can be many api calls here
    // })
    // .then(data => {
    //   // todo: call in-house whatsapp api => required fields => business_id of client's waba (businessIdOfClient), business name (businessName), waba number of client (wabaNumberThatNeedsToBeLinked).
    //   console.log(businessIdOfClient, businessName, wabaNumberThatNeedsToBeLinked)
    // })
    .then(data => {
      // todo: spawn new containers and call whatsapp apis to link container with client's waba. There can be many api calls here
      // todo: after spawning, we will get wabizusername, wabizpassword, wabizurl(fb containers are deployed on this), graphapikey
    })
    .then(data => {
      // todo: call in-house whatsapp api => required fields => business_id of client's waba (businessIdOfClient), business name (businessName), waba number of client (wabaNumberThatNeedsToBeLinked).
      console.log(businessIdOfClient, businessName, wabaNumberThatNeedsToBeLinked)
      // Save (whatsapp) => 1. /profile/accessInformation, 2. /profile/markManagerVerified
      // Send For Approval (whatsapp) => 1. PUT /profile/submit
      // Waba config (support) => 1. PUT /profile/status with pending for approval status
      // same as above => 1. PUT /profile/status with accepted status
      // Waba config => 1. PATCH /profile/configure
    })
    .then(data => {
      return accessInformation(wabaIdOfClient, businessName, phoneCode, phoneNumber, authTokenOfWhatsapp)
    })
    .then(data => {
      return markManagerVerified(authTokenOfWhatsapp)
    })
    .then(data => {
      return sendBusinessForApproval(authTokenOfWhatsapp, req.user.providerId)
    })
    .then(data => {
      // put status "pending for approval"
      return setPendingForApprovalStatus(authTokenOfWhatsapp, req.user.userId, req.user.providerId)
    })
    .then(data => {
      console.log('77777777777777777777777777777777777777777777777777777', data)
      console.log(businessIdOfClient, businessName, wabaNumberThatNeedsToBeLinked)

      __logger.info('Then 3', { data })
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: data })
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

const phoneNumberBasedOnWabaId = (wabaIdOfClient, phoneNumbersOfGivenWabaIds) => {
  const apiCall = q.defer()
  const userService = new UserService()
  const phoneNumbers = []
  phoneNumbersOfGivenWabaIds.map((a) => {
    if (a.charAt(0) === '+') {
      phoneNumbers.push(a.split(' ').join('').split('-').join('').substring(1))
    } else {
      phoneNumbers.push(a.split(' ').join('').split('-').join(''))
    }
  })
  userService.getPhoneNumbersFromWabaId(wabaIdOfClient)
    .then((data) => {
      if (phoneNumbers.length > 0) {
        data = phoneNumbers.filter(val => !data.includes(val))
        apiCall.resolve(data)
      }
      apiCall.resolve([])
    })
    .catch((err) => {
      console.log('err', err)
      apiCall.reject({ type: err.type, err: err })
    })

  return apiCall.promise
}

module.exports = controller
