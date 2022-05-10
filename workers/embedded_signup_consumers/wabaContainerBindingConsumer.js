const __logger = require('../../lib/logger')
const __constants = require('../../config/constants')
const __config = require('../../config')
const __db = require('../../lib/db')
const q = require('q')
const integrationService = require('../../app_modules/integration')
const { setProfileStatus } = require('../../lib/commonFunction/commonFunctions')
const rejectionHandler = require('../../lib/util/rejectionHandler')
const AuthInternalFunctionService = require('../../app_modules/integration/facebook/authService').InternalFunctions
const HttpService = require('../../lib/http_service')

const sendToWabaContainerBinding10secQueue = (message, queueObj) => {
  const messageRouted = q.defer()
  queueObj.sendToQueue(__constants.MQ.wabaContainerBindingConsumer_queue_10_sec, JSON.stringify(message))
    .then(queueResponse => messageRouted.resolve('done!'))
    .catch(err => messageRouted.reject(err))
  return messageRouted.promise
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
      // todo: check error will come if wrong input provided here
      updateProfileconfigure.resolve(data)
    })
    .catch(err => {
      updateProfileconfigure.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
    })
  return updateProfileconfigure.promise
}

class WabaContainerBindingConsumer {
  startServer () {
    const queue = __constants.MQ.wabaContainerBindingConsumerQueue.q_name
    __db.init()
      .then(result => {
        const rmqObject = __db.rabbitmqHeloWhatsapp.fetchFromQueue()
        rmqObject.channel[queue].consume(queue, mqData => {
          try {
            const wabaBindingData = JSON.parse(mqData.content.toString())
            console.log('messageData===========', wabaBindingData)
            const retryCount = wabaBindingData.retryCount || 0
            console.log('retry count: ', retryCount)
            const { userId, providerId, phoneCode, phoneNumber, phoneCertificate, systemUserToken, wabaIdOfClient, wabizPassword, wabizurl, authTokenOfWhatsapp, isPasswordSet, isProfileStatusAccepted } = wabaBindingData
            // required fields: userId, providerId, phoneCode, phoneNumber, phoneCertificate, systemUserToken, wabaIdOfClient, wabizPassword, wabizurl, authTokenOfWhatsapp
            // todo: call login admin api and set the password (wabizPassword) of the admin of the container
            const defaultPassword = isPasswordSet ? wabizPassword : __constants.WABIZ_DEFAULT_PASSWORD
            let apiKey
            const embeddedSignupService = new integrationService.EmbeddedSignup(providerId, userId, systemUserToken)
            const authInternalFunctionService = new AuthInternalFunctionService()
            authInternalFunctionService.WabaLoginApi(__constants.WABIZ_USERNAME, defaultPassword, wabizPassword, wabizurl, systemUserToken, wabaIdOfClient, phoneCode + phoneNumber, userId, true)
              .then(data => {
                wabaBindingData.isPasswordSet = true
                apiKey = data.apiKey
                // todo: if we are running this piece of code after 2tfa is set, we will need to pass 2tfa pin as well
                // todo: call "Request code Api" with the token received in above step. No need to verify OTP, since it was already done in popup
                return embeddedSignupService.requestCode(wabizurl, apiKey, phoneCode, phoneNumber, phoneCertificate)
              })
              .then(data => {
                // todo: call "get settings api" to verify whether waba was attached to spawned container or not.
                return embeddedSignupService.getSettings(wabizurl, apiKey)
              })
              .then(data => {
                if (data && data.application && data.application.wa_id) {
                  // waba number successfully linked to the container
                  // put status "accepted"
                  if (isProfileStatusAccepted) {
                    // since the status is already accepted
                    return data
                  } else {
                    return setProfileStatus(authTokenOfWhatsapp, userId, providerId, __constants.WABA_PROFILE_STATUS.accepted.statusCode)
                  }
                } else {
                  // waba number not linked to container. please try again
                  // todo: handle this in catch
                  return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: ['waba number not linked to container. please try again'], data: {} })
                }
                // return data
              })
              .then(data => {
                wabaBindingData.isProfileStatusAccepted = true
                return updateProfileconfigure(authTokenOfWhatsapp, wabaIdOfClient, userId, __config.service_provider_id.facebook, apiKey)
              })
              .then(response => {
                rmqObject.sendToQueue(__constants.MQ.twoFaConsumerQueue, JSON.stringify(response))
                rmqObject.channel[queue].ack(mqData)
              })
              .catch(err => {
                console.log('err', err)
                if (err && err.type === __constants.RESPONSE_MESSAGES.NOT_REDIRECTED) {
                  if (retryCount < 2) {
                    // const oldObj = JSON.parse(mqData.content.toString())
                    wabaBindingData.retryCount = retryCount + 1
                    // __logger.info('requeing --->', oldObj)
                    sendToWabaContainerBinding10secQueue(wabaBindingData, rmqObject)
                  } else {
                    rmqObject.sendToQueue(__constants.MQ.embeddedSingupErrorConsumerQueue, JSON.stringify(err))
                  }
                }
                rmqObject.channel[queue].ack(mqData)
              })
          } catch (err) {
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

// function getData () {
//   return new Promise((resolve, reject) => {
//     resolve(true)
//   })
// }

class Worker extends WabaContainerBindingConsumer {
  start () {
    __logger.info((new Date()).toLocaleString() + '   >> Worker PID:', process.pid)
    super.startServer()
  }
}

module.exports.worker = new Worker()
