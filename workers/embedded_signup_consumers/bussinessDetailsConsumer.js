const __logger = require('../../lib/logger')
const __constants = require('../../config/constants')
const __db = require('../../lib/db')
const q = require('q')
const __config = require('../../config')
const HttpService = require('../../lib/http_service')
const sendToBusinessDetails10secQueue = (message, queueObj) => {
  const messageRouted = q.defer()
  queueObj.sendToQueue(__constants.MQ.bussinessDetailsConsumer_queue_10_sec, JSON.stringify(message))
    .then(queueResponse => messageRouted.resolve('done!'))
    .catch(err => messageRouted.reject(err))
  return messageRouted.promise
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
      if (data && data.body && data.body.data && Object.keys(data.body.data).length) {
        markedVerified.resolve(data)
      } else {
        markedVerified.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: [data.body.msg] })
      }
    })
    .catch(err => {
      __logger.error('businessDetailsConsumer: markManagerVerified(): catch:', err)
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
      if (data && data.data && Object.keys(data.data).length) {
        sentForApproval.resolve(data)
      } else {
        sentForApproval.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: [data.msg] })
      }
    })
    .catch(err => {
      __logger.error('businessDetailsConsumer: sendBusinessForApproval(): catch:', err)
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
      __logger.error('businessDetailsConsumer: setProfileStatus(): catch:', err)
      sentForApproval.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
    })
  return sentForApproval.promise
}

class BussinessDetailsConsumer {
  startServer () {
    const queue = __constants.MQ.bussinessDetailsConsumerQueue.q_name
    __db.init()
      .then(result => {
        const rmqObject = __db.rabbitmqHeloWhatsapp.fetchFromQueue()
        rmqObject.channel[queue].consume(queue, mqData => {
          try {
            const bussinessDetailsConsumerData = JSON.parse(mqData.content.toString())
            // userId, providerId, phoneCode, phoneNumber, phoneCertificate, systemUserToken, wabaIdOfClient, authTokenOfWhatsapp
            const { authTokenOfWhatsapp, providerId, userId } = bussinessDetailsConsumerData
            const retryCount = bussinessDetailsConsumerData.retryCount || 0
            markManagerVerified(authTokenOfWhatsapp)
              .then(data => {
                __logger.info('businessDetailsConsumer: markManagerVerified(): then 1:', data)
                return sendBusinessForApproval(authTokenOfWhatsapp, providerId)
              })
              .then(data => {
                __logger.info('businessDetailsConsumer: markManagerVerified(): then 2:', data)
                // put status "pending for approval"
                return setProfileStatus(authTokenOfWhatsapp, userId, providerId, __constants.WABA_PROFILE_STATUS.pendingForApproval.statusCode)
              })
              .then(response => {
                __logger.info('businessDetailsConsumer: markManagerVerified(): then 3:', response)
                // after this worker now in which worker we have send data
                rmqObject.sendToQueue(__constants.MQ.spawningContainerConsumerQueue, JSON.stringify(bussinessDetailsConsumerData))
                rmqObject.channel[queue].ack(mqData)
              })
              .catch(err => {
                __logger.error('businessDetailsConsumer: markManagerVerified(): catch:', err)
                if (err) {
                  if (retryCount < 2) {
                    const oldObj = JSON.parse(mqData.content.toString())
                    oldObj.retryCount = retryCount + 1
                    sendToBusinessDetails10secQueue(oldObj, rmqObject)
                  } else {
                    rmqObject.sendToQueue(__constants.MQ.embeddedSingupErrorConsumerQueue, JSON.stringify(err))
                  }
                }
                rmqObject.channel[queue].ack(mqData)
              })
          } catch (err) {
            __logger.error('businessDetailsConsumer: startServer(): try/catch:', err)
            rmqObject.channel[queue].ack(mqData)
          }
        }, { noAck: false })
      })
      .catch(err => {
        __logger.error('businessDetailsConsumer: startServer(): catch:', err)
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
class Worker extends BussinessDetailsConsumer {
  start () {
    __logger.info('businessDetailsConsumer: ' + (new Date()).toLocaleString() + '   >> Worker PID:', process.pid)
    super.startServer()
  }
}

module.exports.worker = new Worker()
