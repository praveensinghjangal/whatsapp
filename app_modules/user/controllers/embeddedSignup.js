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
  http.Put(body, 'body', __config.base_url + __constants.INTERNAL_END_POINTS.sendBusinessForApproval, headers, true)
    .then(data => {
      sentForApproval.resolve(data)
    })
    .catch(err => {
      sentForApproval.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
    })
  return sentForApproval.promise
}

const setProfileStatus = (authTokenOfWhatsapp, userId, serviceProviderId, wabaProfileSetupStatusId) => {
  const sentForApproval = q.defer()
  const http = new HttpService(60000)
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: authTokenOfWhatsapp
  }
  const body = {
    userId: userId,
    wabaProfileSetupStatusId: wabaProfileSetupStatusId
  }
  // this.http.Put(profilePicBuffer, 'body', url, headers, false, data.serviceProviderId)
  http.Put(body, 'body', __config.base_url + __constants.INTERNAL_END_POINTS.setProfileStatus, headers, true)
    .then(data => {
      sentForApproval.resolve(data)
    })
    .catch(err => {
      sentForApproval.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
    })
  return sentForApproval.promise
}

const updateProfileConfigure = (authTokenOfWhatsapp, wabaIdOfClient, userId, serviceProviderId) => {
  const updateProfileconfigure = q.defer()
  const http = new HttpService(60000)
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: authTokenOfWhatsapp
  }
  const body = {
    apiKey: __constants.UPDATE_PROFILE_CONFIGURE_DATA.API_KEY,
    maxTpsToProvider: __constants.UPDATE_PROFILE_CONFIGURE_DATA.MAX_TPA_TO_PROVIDER,
    serviceProviderId: serviceProviderId,
    serviceProviderUserAccountId: wabaIdOfClient,
    templatesAllowed: __constants.UPDATE_PROFILE_CONFIGURE_DATA.TEMPLATESAllOWED,
    tps: __constants.UPDATE_PROFILE_CONFIGURE_DATA.TPS,
    userId: userId
  }
  http.Patch(body, __config.base_url + __constants.INTERNAL_END_POINTS.updateProfileConfigure, headers, 'body')
    .then(data => {
      updateProfileconfigure.resolve(data)
    })
    .catch(err => {
      updateProfileconfigure.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
    })
  return updateProfileconfigure.promise
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
  req.user.providerId = __config.serviceProviderIdFb
  // req.user = { providerId: 'a4f03720-3a33-4b94-b88a-e10453492183', userId: '1234' }
  const embeddedSignupService = new integrationService.EmbeddedSignup(req.user.providerId, req.user.user_id, __config.authorization)
  validate.embeddedSignup(req.body)
    .then(valResponse => {
      console.log('Step 1', valResponse)
      req.body.inputToken = 'EAAG0ZAQUaL3wBAL1vAm18cPc7XZBypvLP14ReQFIcgM0RKGgq1B0zODZBW2iUHyak7N5GiZA33006C6L9zLlG7dZCCtNJOOM3JTAOoI9aZCSnTg3ZCinpSWFR4jf8z8s2kPkgJcJZCx1509JetN68w7JxZBX1fkU3EOpMgOMMZAMe0QHhz0qnLCm0WmBPQkISUzQurbGcU5fsHa85J7DNz156ZC'
      // get the waba id of client's account using client's inputToken
      return embeddedSignupService.getWabaOfClient(req.body.inputToken, 'wabaNumber')
    })
    .then(debugData => {
      console.log('Step 2', debugData)
      const granularScopes = debugData.granular_scopes
      const whatsappBusinessManagement = _.find(granularScopes, { scope: 'whatsapp_business_management' })
      wabaIdOfClient = whatsappBusinessManagement.target_ids[0]
      const businessManagement = _.find(granularScopes, { scope: 'business_management' })
      businessIdOfClient = businessManagement.target_ids[0]
      // get waba information by waba id. This data will be used to call inhouse-whatsapp-api
      return embeddedSignupService.getWabaDetailsByWabaId(wabaIdOfClient, 'wabaNumber')
    })
    .then(wabaDetails => {
      console.log('Step 3', wabaDetails)
      businessName = wabaDetails.name
      // todo: get phone numbers linked to client's waba id
      return embeddedSignupService.getPhoneNumberOfWabaId(wabaIdOfClient, 'wabaNumber')
    })
    .then(data => {
      console.log('Step 4', data)
      // todo: make a db call to get the new onboarded number out of the list in "data". save the certificate
      const phoneNumbersOfGivenWabaId = []
      data.map((a, b) => {
        phoneNumbersOfGivenWabaId.push(a.display_phone_number)
      })
      return phoneNumberBasedOnWabaId(wabaIdOfClient, phoneNumbersOfGivenWabaId)
      // wabaNumberThatNeedsToBeLinked = ''
    })
    // .then(data => {
    //   console.log('dta of data of datatata', data)
    //   // .then(wabaDetails => {
    //   //   businessName = wabaDetails.name
    //   //   // todo: get phone numbers linked to client's waba id
    //   // })
    //   // .then(data => {
    //   //   // todo: make a db call to get the new onboarded number out of the list in "data". save the certificate
    //   //   wabaNumberThatNeedsToBeLinked = ''
    //   // })
    // })
    .then(data => {
      console.log('Step 5', data)
      // there will always be only 1 phone number that will not be present in the db. since that number has not been onboarded yet
      wabaNumberThatNeedsToBeLinked = data[0]
      wabaNumberThatNeedsToBeLinked = '917666004488'
      const obj = phoneCodeAndPhoneSeprator(wabaNumberThatNeedsToBeLinked)
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
      console.log('Step 6', data)
      // add system user to client's waba
      return embeddedSignupService.addSystemUserToWabaOfClient(systemUserIdBSP, wabaIdOfClient, 'wabaNumber')
    })
    .then(data => {
      console.log('Step 7', data)
      // todo: fetch assigned system users to waba
      return embeddedSignupService.fetchAssignedUsersOfWaba(wabaIdOfClient, 'wabaNumber')
    })
    // .then(data => {
    //   //! dont do this. Put the id in env
    //   // get id of business credit line of bsp

    //   return embeddedSignupService.getBussinessIdLineOfCredit()
    // })
    .then(data => {
      console.log('Step 8', data)
      // todo: attach business credit line id to client's waba
      return embeddedSignupService.attachCreditLineClientWaba(wabaIdOfClient)
    })
    .then(data => {
      console.log('Step 9', data)
      // todo: verify that the line of credit was shared correctly
      return embeddedSignupService.verifyLineOfCredit(data.allocation_config_id)
    })
    .then(data => {
      console.log('Step 10', data)
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
    // .then(data => {
    //   // todo: spawn new containers and call whatsapp apis to link container with client's waba. There can be many api calls here
    //   // todo: after spawning, we will get wabizusername, wabizpassword, wabizurl(fb containers are deployed on this), graphapikey
    // })
    // .then(data => {
    //   // todo: call in-house whatsapp api => required fields => business_id of client's waba (businessIdOfClient), business name (businessName), waba number of client (wabaNumberThatNeedsToBeLinked).
    //   // Save (whatsapp) => 1. /profile/accessInformation, 2. /profile/markManagerVerified
    //   // Send For Approval (whatsapp) => 1. PUT /profile/submit
    //   // Waba config (support) => 1. PUT /profile/status with pending for approval status
    //   // same as above => 1. PUT /profile/status with accepted status
    //   // Waba config => 1. PATCH /profile/configure
    // })
    .then(data => {
      console.log('9999999999999999999999999999999999999999999999999999', data)
      console.log(businessIdOfClient, businessName, wabaNumberThatNeedsToBeLinked)
      return accessInformation(wabaIdOfClient, businessName, phoneCode, phoneNumber, authTokenOfWhatsapp)
    })
    .then(data => {
      console.log('00000000000000000000000000000000000000000000000000000', data)
      return markManagerVerified(authTokenOfWhatsapp)
    })
    .then(data => {
      console.log('99999999999999999999999999999999999999999999999999999999', data)
      return sendBusinessForApproval(authTokenOfWhatsapp, req.user.providerId)
    })
    .then(data => {
      console.log('888888888888888888888888888888888888888888888888888888', data)
      // put status "pending for approval"
      return setProfileStatus(authTokenOfWhatsapp, req.user.user_id, req.user.providerId, __constants.WABA_PROFILE_STATUS.pendingForApproval.statusCode)
    })
    .then(data => {
      // todo: spawn new containers. We will get wabiz username, password, url, graphApiKey
    })
    .then(data => {
      // todo: call login admin api and set the password (wabizPassword) of the admin of the container
    })
    .then(data => {
      // todo: call "Request code Api" with the token received in above step. No need to verify OTP, since it was already done in popup
    })
    .then(data => {
      // todo: call "get settings api" to verify whether waba was attached to spawned container or not.
    })
    .then(data => {
      // todo: Now for verified tick mark, enable 2 step verification by setting the pin ( //! Pin will be hardcoded ? ) (to change container of old nummber => pin will be reqiuried in futuire)
    })
    .then(data => {
      console.log('5555555555555555555555555555555555555555555555555555555', data)
      // set wabiz username, password, url, graphApiKey in our db
      return updateWabizInformation('wabizusername', 'wabizpassword', 'wabizurl', __config.authorization, phoneNumber)
    })
    .then(data => {
      // put status "accepted"
      console.log('777777777777777777777777777777777777777777777777777', data)
      return setProfileStatus(authTokenOfWhatsapp, req.user.user_id, req.user.providerId, __constants.WABA_PROFILE_STATUS.accepted.statusCode)
    })
    .then(data => {
      console.log('66666666666666666666666666666666666666666666666666666', data)
      return updateProfileConfigure(authTokenOfWhatsapp, wabaIdOfClient, req.user.userId, __config.serviceProviderIdFb)
    })
    .then(data => {
      console.log('77777777777777777777777777777777777777777777777777777', data)
      console.log(businessIdOfClient, businessName, wabaNumberThatNeedsToBeLinked)
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
      }
      apiCall.resolve(data)
    })
    .catch((err) => {
      console.log('err', err)
      apiCall.reject({ type: err.type, err: err })
    })

  return apiCall.promise
}
const updateWabizInformation = (wabizusername, wabizpassword, wabizurl, graphapikey, phoneNumber) => {
  const apicall = q.defer()
  const userService = new UserService()
  userService.updateWabizInformation(wabizusername, wabizpassword, wabizurl, graphapikey, phoneNumber)
    .then((data) => {
      console.log('data from updateWabizInformation ', data)
    }).catch((err) => {
      console.log('err', err)
      apicall.reject({ type: err.type, err: err })
    })
}

module.exports = controller
