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
const shell = require('shelljs')
const fs = require('fs')
const rejectionHandler = require('../../../lib/util/rejectionHandler')
const AuthInternalFunctionService = require('../../integration/facebook/authService').InternalFunctions
const passwordGenerator = require('../../../lib/util/passwordGenerator')
const redisFunction = require('../../../lib/commonFunction/redisFunction')

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

const updateProfileconfigure = (authTokenOfWhatsapp, wabaIdOfClient, userId, serviceProviderId, apiKey) => {
  const updateProfileconfigure = q.defer()
  const http = new HttpService(60000)
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: authTokenOfWhatsapp
  }
  const body = {
    apiKey: apiKey,
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

const runScriptToSpawnContainersAndGetTheIP = (userId, wabaNumber) => {
  const getIp = q.defer()
  const version = '2.37.2'
  // const command = 'bash shell_scripts/launch_server/launch.bash 2.37.2 917666004488 helo_test_917666004488'
  const command = `bash shell_scripts/launch_server/launch.bash ${version} ${wabaNumber} ${userId}_${wabaNumber}`
  // return new Promise((resolve, reject) => {
  shell.exec(command, async (code, stdout, stderr) => {
    if (!code) {
      const filePath = `shell_scripts/launch_server/output/${userId}_${wabaNumber}.txt`
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          console.log('error while reading', err)
          return getIp.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: [err] })
        }
        console.log('success while reading')
        let text = data.replace(/ /g, '') // removes white spaces from string
        text = text.replace(/(\r\n|\n|\r)/gm, '') // removes all line breaks (new lines) from string
        text = text.split('=')[1]
        getIp.resolve({ privateIp: text })
      })
    } else {
      getIp.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: [stderr] })
    }
  })
  // })
  return getIp.promise
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
  let wabaIdOfClient, businessIdOfClient, businessName, wabaNumberThatNeedsToBeLinked, phoneCode, phoneNumber, wabizurl, phoneCertificate, businessId, systemUserIdBSP, systemUserToken, creditLineIdBSP
  const wabizPassword = passwordGenerator(__constants.WABIZ_CUSTOM_PASSWORD_LENGTH)
  let tfaPin = Math.floor(100000 + Math.random() * 900000) // this generates a random 6 digit number
  tfaPin = tfaPin.toString()
  const authTokenOfWhatsapp = req.headers.authorization
  let apiKey = ''
  req.user.providerId = __config.service_provider_id.facebook
  let embeddedSignupService
  validate.embeddedSignup(req.body)
    .then(validateData => {
      console.log('11111111111111111111111111111111111111111111111111111111', validateData)
      return redisFunction.getMasterRedisDataStatusById(__constants.FACEBOOK_MASTERDATA_ID)
    })
    .then(valResponse => {
      console.log('22222222222222222222222222222222222222222222222222222222', valResponse)
      businessId = valResponse.data.businessId
      systemUserIdBSP = valResponse.data.systemUserId
      systemUserToken = valResponse.data.systemUserToken
      creditLineIdBSP = valResponse.data.creditLineId
      embeddedSignupService = new integrationService.EmbeddedSignup(req.user.providerId, req.user.user_id, systemUserToken)
      return embeddedSignupService.getWabaOfClient(req.body.inputToken, 'wabaNumber')
    })
    .then(debugData => {
      console.log('33333333333333333333333333333333333333333333333333333333', debugData)
      const granularScopes = debugData.granular_scopes
      // todo: check if there's no issue in getting the 0th element of business ids and whatsapp business ids
      const whatsappBusinessManagement = _.find(granularScopes, { scope: 'whatsapp_business_management' })
      wabaIdOfClient = whatsappBusinessManagement.target_ids[0]
      const businessManagement = _.find(granularScopes, { scope: 'business_management' })
      if (businessManagement) {
        businessIdOfClient = businessManagement.target_ids[0]
      }
      // get waba information by waba id. This data will be used to call inhouse-whatsapp-api
      return embeddedSignupService.getWabaDetailsByWabaId(wabaIdOfClient, 'wabaNumber')
    })
    .then(wabaDetails => {
      console.log('44444444444444444444444444444444444444444444444444444444', wabaDetails)
      businessName = wabaDetails.name
      // get phone numbers linked to client's waba id
      return embeddedSignupService.getPhoneNumberOfWabaId(wabaIdOfClient, 'wabaNumber')
    })
    .then(data => {
      console.log('55555555555555555555555555555555555555555555555555555555', data)
      if (data && data.length && data[0].certificate) {
        const phoneObj = data[0]
        wabaNumberThatNeedsToBeLinked = phoneObj.display_phone_number
        wabaNumberThatNeedsToBeLinked = wabaNumberThatNeedsToBeLinked.replace(/ /g, '') // removes white spaces from string
        if (wabaNumberThatNeedsToBeLinked.charAt(0) === '+') {
          wabaNumberThatNeedsToBeLinked = wabaNumberThatNeedsToBeLinked.split(' ').join('').split('-').join('').substring(1)
        } else {
          wabaNumberThatNeedsToBeLinked = wabaNumberThatNeedsToBeLinked.split(' ').join('').split('-').join('')
        }
        const obj = phoneCodeAndPhoneSeprator(wabaNumberThatNeedsToBeLinked)
        phoneCode = obj.phoneCode
        // phoneCode = '91'
        phoneNumber = obj.phoneNumber
        // phoneNumber = '7666004488'
        phoneCertificate = phoneObj.certificate
        // wabaNumberThatNeedsToBeLinked = '917666004488'
        return wabaNumberThatNeedsToBeLinked
      } else {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: ['Phone number not reflected/ not verified. Please try again after some time.'] })
      }
    })
    // .then(data => {
    //   console.log('Step 4', data)
    //   // todo: make a db call to get the new onboarded number out of the list in "data". save the certificate
    //   const phoneNumbersOfGivenWabaId = []
    //   data.map((a, b) => {
    //     phoneNumbersOfGivenWabaId.push(a.display_phone_number)
    //   })
    //   return phoneNumberBasedOnWabaId(wabaIdOfClient, phoneNumbersOfGivenWabaId)
    //   // wabaNumberThatNeedsToBeLinked = ''
    // })
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
    // .then(data => {
    //   console.log('Step 5', data)
    //   // there will always be only 1 phone number that will not be present in the db. since that number has not been onboarded yet
    //   wabaNumberThatNeedsToBeLinked = data[0]
    //   wabaNumberThatNeedsToBeLinked = '917666004488'
    //   const obj = phoneCodeAndPhoneSeprator(wabaNumberThatNeedsToBeLinked)
    //   phoneCode = obj.phoneCode
    //   phoneNumber = obj.phoneNumber
    // })
    .then(data => {
      console.log('66666666666666666666666666666666666666666666666666666666666', data)
      // add system user to client's waba
      return embeddedSignupService.addSystemUserToWabaOfClient(systemUserIdBSP, wabaIdOfClient, 'wabaNumber')
    })
    .then(data => {
      console.log('77777777777777777777777777777777777777777777777777777777777', data)
      // todo: fetch assigned system users to waba
      return embeddedSignupService.fetchAssignedUsersOfWaba(wabaIdOfClient, businessId, 'wabaNumber')
    })
    // .then(data => {
    //   //! dont do this. Put the id in env
    //   // get id of business credit line of bsp

    //   return embeddedSignupService.getBussinessIdLineOfCredit()
    // })
    .then(data => {
      console.log('888888888888888888888888888888888888888888888888888888888888', data)
      // attach business credit line id to client's waba
      return embeddedSignupService.attachCreditLineClientWaba(wabaIdOfClient, creditLineIdBSP)
    })
    .then(data => {
      console.log('999999999999999999999999999999999999999999999999999999999999', data)
      // verify that the line of credit was shared correctly
      return embeddedSignupService.verifyLineOfCredit(data.allocation_config_id)
    })
    .then(data => {
      console.log('101010101010101010101010101010101010101010101010101010101010', data)
      // subscribe app to client's waba
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
      console.log('11111111111111111111111111111111111111111111111111111', data)
      console.log(businessIdOfClient, businessName, wabaNumberThatNeedsToBeLinked)
      return accessInformation(wabaIdOfClient, businessName, phoneCode, phoneNumber, authTokenOfWhatsapp)
    })
    .then(data => {
      console.log('121212121212121212121212121212121212121212121212121212', data)
      return markManagerVerified(authTokenOfWhatsapp)
    })
    .then(data => {
      console.log('13131313131313131313131313131313131313131313131313131313', data)
      return sendBusinessForApproval(authTokenOfWhatsapp, req.user.providerId)
    })
    .then(data => {
      console.log('1414141414141414141414141414141414141414141414141414141414', data)
      // put status "pending for approval"
      return setProfileStatus(authTokenOfWhatsapp, req.user.user_id, req.user.providerId, __constants.WABA_PROFILE_STATUS.pendingForApproval.statusCode)
    })
    .then(data => {
      console.log('15151515151515151515151515151515151515151515151515151515115', data)
      // todo: spawn new containers. We will get wabiz username, password, url, graphApiKey. We will get wabizurl after running the bash script
      return runScriptToSpawnContainersAndGetTheIP(req.user.user_id, phoneCode + phoneNumber)
    })
    .then(data => {
      console.log('1616161616161616161616161616161616161616161616161616161616161616', data)
      wabizurl = 'https://' + data.privateIp + `:${__config.wabizPort}`
      console.log('wabizurl', wabizurl)
      console.log('wabizPassword', wabizPassword)
      // wabizusername will be "admin", wabizpassword => hardcoded,
      // todo: generate & set 2fa pin as well in db.
      // set wabiz username, password, url, graphApiKey in our db
      return updateWabizInformation(__constants.WABIZ_USERNAME, wabizPassword, wabizurl, systemUserToken, phoneCode, phoneNumber, tfaPin)
    })
    .then(data => {
      console.log('171717171717171717171717171717171717171717171717171717171717', data)
      // todo: call login admin api and set the password (wabizPassword) of the admin of the container
      const authInternalFunctionService = new AuthInternalFunctionService()
      return authInternalFunctionService.WabaLoginApi(__constants.WABIZ_USERNAME, __constants.WABIZ_DEFAULT_PASSWORD, wabizPassword, wabizurl, systemUserToken, wabaIdOfClient, phoneCode + phoneNumber, req.user.user_id, true)
    })
    .then(data => {
      console.log('18181818181818181818181818181818181818181818181818181818118', data)
      apiKey = data.apiKey
      // todo: if we are running this piece of code after 2tfa is set, we will need to pass 2tfa pin as well
      // todo: call "Request code Api" with the token received in above step. No need to verify OTP, since it was already done in popup
      return embeddedSignupService.requestCode(wabizurl, data.apiKey, phoneCode, phoneNumber, phoneCertificate)
    })
    .then(data => {
      console.log('19191919191919191919191919191919191919191919191919191919', data)
      // todo: call "get settings api" to verify whether waba was attached to spawned container or not.
      return embeddedSignupService.getSettings(wabizurl, apiKey)
    })
    .then(data => {
      console.log('202020202020202020202020202020202020202020202020202020', data)
      if (data && data.application && data.application.wa_id) {
        // waba number successfully linked to the container
        // put status "accepted"
        return setProfileStatus(authTokenOfWhatsapp, req.user.user_id, req.user.providerId, __constants.WABA_PROFILE_STATUS.accepted.statusCode)
      } else {
        // waba number not linked to container. please try again
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: ['waba number not linked to container. please try again'], data: {} })
      }
      // return data
    })
    // /**
    // .then(data => {
    //   console.log('step 21')
    //   console.log('777777777777777777777777777777777777777777777777777', data)
    // })
    .then(data => {
      console.log('212121212121212121212121212121212121212121212121212121212121', data)
      return updateProfileconfigure(authTokenOfWhatsapp, wabaIdOfClient, req.user.user_id, __config.service_provider_id.facebook, apiKey)
    })
    .then(data => {
      console.log('222222222222222222222222222222222222222222222222222222222222', data)
      // todo: do this after some time
      // todo: Now for verified tick mark, enable 2 step verification by setting the pin ( //! Pin will be hardcoded ? ) (to change container of old nummber => pin will be reqiuried in futuire)
      return embeddedSignupService.enableTwoStepVerification(wabizurl, apiKey, tfaPin)
    })
    //  */
    .then(data => {
      console.log('232323232323232323232323232323232323232323232323232323232323', data)
      console.log(businessIdOfClient, businessName, wabaNumberThatNeedsToBeLinked)
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: data })
    })
    .then(data => {
      console.log('2424242424242424242424242424242424242424242424242424242424')
      return redisFunction.deleteMasterDataInRedis(wabaNumberThatNeedsToBeLinked)
    })
    .then(data => {
      console.log('2525252525252525252525252525252525252525252525252525', data)
      return redisFunction.deletetokenkeyMasterDataInRedis(wabaNumberThatNeedsToBeLinked)
    })
    .then(data => {
      console.log('2626262626262626262626262626262626262626262626262626', data)
      return redisFunction.deletetokenkeyMasterDataInRedis(wabaNumberThatNeedsToBeLinked)
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

// const phoneNumberBasedOnWabaId = (wabaIdOfClient, phoneNumbersOfGivenWabaIds) => {
//   const apiCall = q.defer()
//   const userService = new UserService()
//   const phoneNumbers = []
//   phoneNumbersOfGivenWabaIds.map((a) => {
//     if (a.charAt(0) === '+') {
//       phoneNumbers.push(a.split(' ').join('').split('-').join('').substring(1))
//     } else {
//       phoneNumbers.push(a.split(' ').join('').split('-').join(''))
//     }
//   })
//   userService.getPhoneNumbersFromWabaId(wabaIdOfClient)
//     .then((data) => {
//       if (phoneNumbers.length > 0) {
//         data = phoneNumbers.filter(val => !data.includes(val))
//       }
//       apiCall.resolve(data)
//     })
//     .catch((err) => {
//       console.log('err', err)
//       apiCall.reject({ type: err.type, err: err })
//     })

//   return apiCall.promise
// }
const updateWabizInformation = (wabizusername, wabizpassword, wabizurl, graphapikey, phoneCode, phoneNumber, tfaPin) => {
  const apicall = q.defer()
  const userService = new UserService()
  userService.updateWabizInformation(wabizusername, wabizpassword, wabizurl, graphapikey, phoneCode, phoneNumber, tfaPin)
    .then((data) => {
      console.log('data from updateWabizInformation ', data)
    }).catch((err) => {
      console.log('err', err)
      apicall.reject({ type: err.type, err: err })
    })
}

module.exports = controller
