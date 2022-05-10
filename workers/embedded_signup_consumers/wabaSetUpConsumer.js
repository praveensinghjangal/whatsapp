const __logger = require('../../lib/logger')
const __constants = require('../../config/constants')
const __db = require('../../lib/db')
const _ = require('lodash')
const q = require('q')
const HttpService = require('../../lib/http_service')
const __config = require('../../config')
const redisFunction = require('../../lib/commonFunction/redisFunction')
const integrationService = require('../../app_modules/integration')
// const UserService = require('../../app_modules/user/services/dbData')
const phoneCodeAndPhoneSeprator = require('../../lib/util/phoneCodeAndPhoneSeprator')
const rejectionHandler = require('../../lib/util/rejectionHandler')

const sendToWabaSetup10secQueue = (message, queueObj) => {
  const messageRouted = q.defer()
  queueObj.sendToQueue(__constants.MQ.wabaSetUpConsumer_queue_10_sec, JSON.stringify(message))
    .then(queueResponse => messageRouted.resolve('done!'))
    .catch(err => messageRouted.reject(err))
  return messageRouted.promise
}
// const codeErrorRetryMechanism = (queue, queueObj) => {
//   const codeErrorRetryMechanism = q.defer()
//     .then(queueResponse => codeErrorRetryMechanism.resolve('done!'))
//     .catch(err => codeErrorRetryMechanism.reject(err))
//   return codeErrorRetryMechanism.promise
// }

const sendToWabaSetup15minQueue = (message, queueObj) => {
  const messageRouted = q.defer()
  queueObj.sendToQueue(__constants.MQ.wabaSetUpConsumer_queue_15_min, JSON.stringify(message))
    .then(queueResponse => messageRouted.resolve('done!'))
    .catch(err => messageRouted.reject(err))
  return messageRouted.promise
}
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
      if (data && data.body && data.body.data) {
        getAccessInfo.resolve(data.body)
      } else {
        getAccessInfo.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: data.body.error && Object.keys(data.body.error).length ? data.body.error : [data.body.msg] })
        // getAccessInfo.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: data.body.error })
      }
    })
    .catch(err => {
      console.log('1111111111111111111111111111111111111111111111', err)
      getAccessInfo.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
    })
  return getAccessInfo.promise
}
class WabaSetupConsumer {
  startServer () {
    const queue = __constants.MQ.wabaSetUpConsumerQueue.q_name
    __db.init()
      .then(result => {
        const retryCount = 0
        const rmqObject = __db.rabbitmqHeloWhatsapp.fetchFromQueue()
        rmqObject.channel[queue].consume(queue, mqData => {
          try {
            const wabasetUpData = JSON.parse(mqData.content.toString())
            const { userId, providerId, inputToken, authTokenOfWhatsapp } = wabasetUpData
            console.log('11111111111111111111', userId, providerId, inputToken, authTokenOfWhatsapp)
            console.log('2222222222222222222222', authTokenOfWhatsapp)
            console.log('wabasetupConsumer-data 111111111111111111111111', wabasetUpData)
            // const wabaIdOfClient = '1234'; let businessIdOfClient; const businessName = 'nameOfBusiness'; const phoneCode = '91'; const phoneNumber = '8097353703'; let phoneCertificate; let wabaNumberThatNeedsToBeLinked; let businessId; let systemUserIdBSP; let systemUserToken; let creditLineIdBSP; let embeddedSignupService; let send
            let wabaIdOfClient; let businessIdOfClient; let businessName; let phoneCode; let phoneNumber; let phoneCertificate; let wabaNumberThatNeedsToBeLinked; let businessId; let systemUserIdBSP; let systemUserToken; let creditLineIdBSP; let embeddedSignupService; const send = {}
            const retryCount = wabasetUpData.retryCount || 0
            redisFunction.getMasterRedisDataStatusById(__constants.FACEBOOK_MASTERDATA_ID)
            // /**
              .then(valResponse => {
                console.log('getMasterRedisDataStatusById-data', valResponse)
                businessId = valResponse.data.businessId
                systemUserIdBSP = valResponse.data.systemUserId
                systemUserToken = valResponse.data.systemUserToken
                creditLineIdBSP = valResponse.data.creditLineId
                embeddedSignupService = new integrationService.EmbeddedSignup(providerId, userId, systemUserToken)
                return embeddedSignupService.getWabaOfClient(inputToken, 'wabaNumber')
              })
              .then(debugData => {
                console.log('getWabaOfClient-data', debugData)
                const granularScopes = debugData.granular_scopes
                const whatsappBusinessManagement = _.find(granularScopes, { scope: 'whatsapp_business_management' })
                wabaIdOfClient = whatsappBusinessManagement.target_ids[0]
                const businessManagement = _.find(granularScopes, { scope: 'business_management' })
                if (businessManagement) {
                  businessIdOfClient = businessManagement.target_ids[0]
                }
                return embeddedSignupService.getWabaDetailsByWabaId(wabaIdOfClient, 'wabaNumber')
              })
              .then(wabaDetails => {
                console.log('getWabaDetailsByWabaId-data', wabaDetails)
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
                  // phoneNumber = obj.phoneNumber
                  phoneNumber = obj.phoneNumber
                  // phoneNumber = '7666004488'
                  phoneCertificate = phoneObj.certificate
                  // wabaNumberThatNeedsToBeLinked = '917666004488'
                  return wabaNumberThatNeedsToBeLinked
                } else {
                  return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: ['Phone number not reflected/ not verified. Please try again after some time.'] })
                }
              })
              .then(data => {
                console.log('getPhoneNumberOfWabaId-data', data)
                // add system user to client's waba
                return embeddedSignupService.addSystemUserToWabaOfClient(systemUserIdBSP, wabaIdOfClient, 'wabaNumber')
              })
              .then(data => {
                // todo: fetch assigned system users to waba
                console.log('addSystemUserToWabaOfClient-data', data)
                return embeddedSignupService.fetchAssignedUsersOfWaba(wabaIdOfClient, businessId, 'wabaNumber')
              })
              .then(data => {
                console.log('fetchAssignedUsersOfWaba-data', data)
                // attach business credit line id to client's waba
                return embeddedSignupService.attachCreditLineClientWaba(wabaIdOfClient, creditLineIdBSP)
              })
              .then(data => {
                console.log('attachCreditLineClientWaba-data', data)
                // verify that the line of credit was shared correctly
                return embeddedSignupService.verifyLineOfCredit(data.allocation_config_id)
              })
              .then(data => {
                console.log('verifyLineOfCredit', data)
                // subscribe app to client's waba
                return embeddedSignupService.subscribeAppToWaba(wabaIdOfClient, 'wabaNumber')
              })
              // */
              .then(data => {
                console.log('subscribeAppToWaba', data)
                return accessInformation(wabaIdOfClient, businessName, phoneCode, phoneNumber, authTokenOfWhatsapp)
              })
              .then(data => {
                console.log('lastttttttttttttttttttttttttttttt', data)
                // after this worker now in which worker we have send data
                send.authTokenOfWhatsapp = authTokenOfWhatsapp
                send.providerId = providerId
                send.userId = userId
                send.businessIdOfClient = businessIdOfClient
                send.phoneCertificate = phoneCertificate
                rmqObject.sendToQueue(__constants.MQ.bussinessDetailsConsumerQueue, JSON.stringify(send))
                rmqObject.channel[queue].ack(mqData)
              })
              .catch(err => {
                // console.log('errorerroreorororooeroreiiieeorturoeteoyyyoieryuytity', err)
                // console.log('88888888888888888888888888888888888888888888888888888', err.err.include('Phone number not reflected/ not verified. Please try again after some time'))
                // console.log('99999999999999999999999999999999999999999999999999999', err.err.err)
                // console.log('11111111111111111111111111111111111111111111111', err.err[0])
                // // console.log('11111111111111111111111111111111111111111111111', err.err[0].err.includes('Phone number not reflected/ not verified'))
                // console.log('errrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr', err.err[0].code)
                if (err) {
                  if (err.err[0].code === 190 && (err.err[0].message.includes('Error validating access token') || err.err[0].message.includes('The access token could not be decrypted') || err.err[0].message.includes('Malformed access token'))) {
                    rmqObject.sendToQueue(__constants.MQ.embeddedSingupErrorConsumerQueue, JSON.stringify(err))
                  } else if (err.err[0].code === 100 && (err.err[0].message.includes('Unsupported get request') ||
                  err.err[0].message.includes('Unsupported post request') ||
                   err.err[0].message.includes('(#100) Param user is not a valid app-scoped ID. Note:') ||
                   err.err[0].message.includes('(#100) Param business is not a valid') ||
                   err.err[0].message.includes('(#100) Param waba_id must be a valid WhatsApp Business Account id') ||
                   err.err[0].message.includes('(#100) Not a ISO 4217 currency code that is supported by Facebook Payments'))) {
                    rmqObject.sendToQueue(__constants.MQ.embeddedSingupErrorConsumerQueue, JSON.stringify(err))
                  } else if (err.err[0].code === 104 && (err.err[0].message.includes('An access token is required to request'))) {
                    rmqObject.sendToQueue(__constants.MQ.embeddedSingupErrorConsumerQueue, JSON.stringify(err))
                  } else if (err.err[0].code === 4 && (err.err[0].message.includes('(#4) Application request limit reached'))) {
                    const oldObj = JSON.parse(mqData.content.toString())
                    oldObj.retryCount = retryCount + 1
                    sendToWabaSetup15minQueue(oldObj, rmqObject)
                  } else if (retryCount < 2) {
                    // const oldObj = JSON.parse(mqData.content.toString())
                    wabasetUpData.retryCount = retryCount + 1
                    sendToWabaSetup10secQueue(wabasetUpData, rmqObject)
                  } else {
                    rmqObject.sendToQueue(__constants.MQ.embeddedSingupErrorConsumerQueue, JSON.stringify(err))
                  }
                }
                rmqObject.channel[queue].ack(mqData)
              })
          } catch (err) {
            if (err) {
              if (retryCount < 2) {
                const oldObj = JSON.parse(mqData.content.toString())
                oldObj.retryCount = retryCount + 1
                sendToWabaSetup10secQueue(oldObj, rmqObject)
              }
            }
            rmqObject.channel[queue].ack(mqData)
          }
        }, { noAck: false })
      })
      .catch(err => {
        __logger.error('facebook incoming message QueueConsumer::error: ', err)
        process.exit(1)
      })

    this.stop_gracefully = function () {
      __logger.info('stopping all resources gracefully')
      __db.close(function () {
        process.exit(0)
      })
    }
    process.on('SIGINT', this.stop_gracefully)
    process.on('SIGTERM', this.stop_gracefully)
  }
}

class Worker extends WabaSetupConsumer {
  start () {
    __logger.info((new Date()).toLocaleString() + '   >> Worker PID:', process.pid)
    super.startServer()
  }
}

module.exports.worker = new Worker()
