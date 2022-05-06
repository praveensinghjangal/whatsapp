const __logger = require('../../lib/logger')
const __constants = require('../../config/constants')
const __db = require('../../lib/db')
const _ = require('lodash')
const q = require('q')
const HttpService = require('../../lib/http_service')
const __config = require('../../config')
const redisFunction = require('../../lib/commonFunction/redisFunction')
const integrationService = require('../../app_modules/integration')

const sendToWabaSetup10secQueue = (message, queueObj) => {
  const messageRouted = q.defer()
  queueObj.sendToQueue(__constants.MQ.wabaSetUpConsumer_queue_10_sec, JSON.stringify(message))
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
      getAccessInfo.resolve(data)
    })
    .catch(err => {
      getAccessInfo.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
    })
  return getAccessInfo.promise
}
class WabaSetupConsumer {
  startServer () {
    const queue = __constants.MQ.wabaSetUpConsumerQueue.q_name
    __db.init()
      .then(result => {
        const rmqObject = __db.rabbitmqHeloWhatsapp.fetchFromQueue()
        rmqObject.channel[queue].consume(queue, mqData => {
          try {
            const wabasetUpData = JSON.parse(mqData.content.toString())
            const { userId, providerId, inputToken, authTokenOfWhatsapp } = wabasetUpData
            console.log('11111111111111111111', userId, providerId, inputToken, authTokenOfWhatsapp)
            console.log('2222222222222222222222', authTokenOfWhatsapp)
            console.log('wabasetupConsumer-data 111111111111111111111111', wabasetUpData)
            let wabaIdOfClient, businessIdOfClient, businessName, phoneCode, phoneNumber, businessId, systemUserIdBSP, systemUserToken, creditLineIdBSP, embeddedSignupService, send
            const retryCount = wabasetUpData.retryCount || 0
            redisFunction.getMasterRedisDataStatusById(__constants.FACEBOOK_MASTERDATA_ID)
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
              .then(data => {
                console.log('subscribeAppToWaba', data)
                return accessInformation(wabaIdOfClient, businessName, phoneCode, phoneNumber, authTokenOfWhatsapp)
              })
              .then(data => {
                // after this worker now in which worker we have send data
                send.authTokenOfWhatsapp = authTokenOfWhatsapp
                send.providerId = providerId
                send.userId = userId
                send.businessIdOfClient = businessIdOfClient
                console.log('send>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', send)
                rmqObject.sendToQueue(__constants.MQ.bussinessDetailsConsumerQueue, JSON.stringify(send))
                rmqObject.channel[queue].ack(mqData)
              })
              .catch(err => {
                console.log('err', err)
                // if (err && err.type === __constants.RESPONSE_MESSAGES.NOT_REDIRECTED) {
                if (retryCount < 2) {
                  const oldObj = JSON.parse(mqData.content.toString())
                  oldObj.retryCount = retryCount + 1
                  // __logger.info('requeing --->', oldObj)
                  sendToWabaSetup10secQueue(oldObj, rmqObject)
                } else {
                  console.log('send to error queue')
                }
                // }
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

class Worker extends WabaSetupConsumer {
  start () {
    __logger.info((new Date()).toLocaleString() + '   >> Worker PID:', process.pid)
    super.startServer()
  }
}

module.exports.worker = new Worker()
