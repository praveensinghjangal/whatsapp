const moment = require('moment')
const __logger = require('../../lib/logger')
const __constants = require('../../config/constants')
const __config = require('../../config')
const __db = require('../../lib/db')
const q = require('q')
const MessageHistoryService = require('../../app_modules/message/services/dbData')
const RedirectService = require('../../app_modules/integration/service/redirectService')
const AudienceService = require('../../app_modules/audience/services/dbData')
const integrationService = require('../../app_modules/integration')
const errorToTelegram = require('../../lib/errorHandlingMechanism/sendToTelegram')
const UniqueId = require('../../lib/util/uniqueIdGenerator')
const rejectionHandler = require('../../lib/util/rejectionHandler')
const _ = require('lodash')
const qalllib = require('qalllib')
const phoneCodeAndPhoneSeprator = require('../../lib/util/phoneCodeAndPhoneSeprator')
/// only for single or for multiple ???????
const saveAndSendMessageStatus = (payload, serviceProviderId, isSyncstatus, statusName = null) => {
  const statusSent = q.defer()
  const messageHistoryService = new MessageHistoryService()
  const redirectService = new RedirectService()
  const statusData = {
    messageId: payload.messageId,
    serviceProviderId: serviceProviderId,
    deliveryChannel: __constants.DELIVERY_CHANNEL.whatsapp,
    statusTime: moment.utc().format('YYYY-MM-DDTHH:mm:ss'),
    state: __constants.MESSAGE_STATUS.inProcess,
    endConsumerNumber: payload.to,
    countryName: phoneCodeAndPhoneSeprator(payload.to).countryName,
    businessNumber: payload.whatsapp.from,
    customOne: payload.whatsapp.customOne || null,
    customTwo: payload.whatsapp.customTwo || null,
    customThree: payload.whatsapp.customThree || null,
    customFour: payload.whatsapp.customFour || null,
    date: payload.date
  }
  messageHistoryService.addMessageHistoryDataService(statusData)
    .then(statusDataAdded => {
      statusData.to = statusData.businessNumber
      statusData.from = statusData.endConsumerNumber
      delete statusData.serviceProviderId
      delete statusData.businessNumber
      delete statusData.endConsumerNumber
      return redirectService.webhookPost(statusData.to, statusData)
    })
    .then(data => statusSent.resolve(data))
    .catch(err => statusSent.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err }))
  return statusSent.promise
}

const sendToQueue = (data, config, currentQueueName) => {
  const messageSent = q.defer()
  const queueData = {
    config: config,
    payload: data
  }
  let queueObj = __constants.MQ.process_message_general
  if (currentQueueName.includes('chatbot')) {
    queueObj = __constants.MQ.process_message_chatbot
  } else if (currentQueueName.includes('otp')) {
    queueObj = __constants.MQ.process_message_category_otp
  } else if (currentQueueName.includes('transactional')) {
    queueObj = __constants.MQ.process_message_category_transactional
  } else if (currentQueueName.includes('promotional')) {
    queueObj = __constants.MQ.process_message_category_promotional
  } else if (currentQueueName.includes('general')) {
    queueObj = __constants.MQ.process_message_general
  } else if (currentQueueName.includes('campaign')) {
    queueObj = require('../../lib/util/rabbitmqHelper')('process_message_campaign', config.userId, data.whatsapp.from)
    // queueObj = __constants.MQ.process_message_campaign
  }
  const planPriority = data && data.redisData && data.redisData.planPriority ? data.redisData.planPriority : null
  __db.rabbitmqHeloWhatsapp.sendToQueue(queueObj, JSON.stringify(queueData), planPriority)
    .then(queueResponse => saveAndSendMessageStatus(data))
    .then(messagStatusResponse => messageSent.resolve({ messageId: data.messageId, to: data.to, acceptedAt: new Date(), apiReqId: data.vivaReqId, customOne: data.whatsapp.customOne, customTwo: data.whatsapp.customTwo, customThree: data.whatsapp.customThree, customFour: data.whatsapp.customFour }))
    .catch(err => {
      const telegramErrorMessage = 'sendMessageToQueue ~ sendToQueue function ~ error in sendToQueue and saveAndSendMessageStatus '
      errorToTelegram.send(err, telegramErrorMessage)
      messageSent.reject(err)
    })
  return messageSent.promise
}

const sendToQueueBulk = (data, config, currentQueueName) => { // function to push to queue in bulk
  const sendSingleMessage = q.defer()
  qalllib.qASyncWithBatch(sendToQueue, data, __constants.BATCH_SIZE_FOR_SEND_TO_QUEUE, config, currentQueueName)
    .then(data => sendSingleMessage.resolve([...data.resolve, ...data.reject]))
    .catch(function (error) {
      const telegramErrorMessage = 'sendMessageToQueue ~ sendToQueueBulk function ~ error in sendToQueueBulk'
      errorToTelegram.send(error, telegramErrorMessage)
      return sendSingleMessage.reject(error)
    })
    .done()
  return sendSingleMessage.promise
}
// insert not veridfied with rejetced status
const checkIsVerifiedAudiencesTrueOrFalse = (messageData, fromNumber, toNumbersThatNeedsToBeChecked) => {
  const messageStatus = q.defer()
  const audienceService = new AudienceService()
  const notVerifiedAudiencesPhoneNumbersInDB = {} // without "+"
  const notVerifiedAudiencesPhoneNumbersNotInDb = {} // without "+"
  const updateAudiencesBody = []
  const addAudiencesBody = []
  let verifiedNumbers = []
  let audMappingId
  const notVerifiedPhoneNumber = []
  let audienceData
  if (!toNumbersThatNeedsToBeChecked.length) {
    messageStatus.resolve({ verifiedNumbers: toNumbersThatNeedsToBeChecked, notVerifiedAudeienceNumbers: notVerifiedPhoneNumber })
    return messageStatus.promise
  }
  audienceService.getWabaPhoneNumber(fromNumber)
    .then(data => {
      if (data && data.audMappingId) {
        audMappingId = data.audMappingId
        return audienceService.getAudiencesVerified(toNumbersThatNeedsToBeChecked, fromNumber)
      } else {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: ['Invalid waba phone number'] })
      }
    })
    .then(data => {
      // notVerifiedAudiences = (audiences not present in payloadsToBeCheckedForVerified + audiences not verified in data)
      const alreadyVerifiedAudiencesPhoneNumbersInDB = [] // without "+"
      const phoneNumbersPresentInDB = []
      const phoneNumbersToBeCheckedWithFb = []
      for (let i = 0; i < data.length; i++) {
        phoneNumbersPresentInDB.push(data[i].phoneNumber)
        if (!data[i].isFacebookVerified) {
          notVerifiedAudiencesPhoneNumbersInDB[data[i].phoneNumber] = 1
          phoneNumbersToBeCheckedWithFb.push(`+${data[i].phoneNumber}`)
        } else {
          alreadyVerifiedAudiencesPhoneNumbersInDB.push(data[i].phoneNumber)
        }
      }
      verifiedNumbers = [...verifiedNumbers, ...alreadyVerifiedAudiencesPhoneNumbersInDB]

      // get all the audiences not present in db's audiences table
      for (let i = 0; i < toNumbersThatNeedsToBeChecked.length; i++) {
        const toNumber = toNumbersThatNeedsToBeChecked[i]
        if (!phoneNumbersPresentInDB.includes(toNumber)) {
          phoneNumbersToBeCheckedWithFb.push(`+${toNumber}`)
          notVerifiedAudiencesPhoneNumbersNotInDb[toNumber] = 1
        }
      }
      // notVerifiedAudiencesPhoneNumbersInDB = [...notVerifiedAudiencesPhoneNumbersInDB, ...notVerifiedAudiencesPhoneNumbersNotInDb]
      // changes  write now
      const audienceService = new integrationService.Audience(messageData.config.servicProviderId, messageData.config.maxTpsToProvider, messageData.config.userId)
      return audienceService.saveOptin(fromNumber, phoneNumbersToBeCheckedWithFb)
      // todo: call facebook api to get the status of all the "not verified numbers". Check if status is valid or not

      // todo: get the list of all the verified numbers (this list & alreadyVerifiedAudiencesPhoneNumbersInDB will be returned by this function, so that only these numbers will be passed further in the next step) and segregate them based on => present in db & not present in db

      // todo: for numbers already present in db =>  make their status isFacebookVerified to true in our db
      // todo: for numbers not present in db => create new entries in audiences table
    })
    .then((optinData) => {
      // optinData = [
      //   {
      //     input: '+919082271870',
      //     status: 'invalid',
      //     wa_id: '919082271870'
      //   }]
      // optinData = [
      //   {
      //     input: '+917666220077',
      //     status: 'valid',
      //     wa_id: '917666220077'
      //   },
      //   {
      //     input: '+918097353703',
      //     status: 'valid',
      //     wa_id: '918097353703'
      //   }
      // ]
      const uniqueId = new UniqueId()
      for (let i = 0; i < optinData.length; i++) {
        const contactNumber = optinData[i].wa_id // without "+"
        if (contactNumber in notVerifiedAudiencesPhoneNumbersInDB) {
          if (optinData[i].status === __constants.FACEBOOK_RESPONSES.valid.displayName) {
            updateAudiencesBody.push(contactNumber)
            verifiedNumbers.push(contactNumber)
          } else {
            notVerifiedPhoneNumber.push(contactNumber)
          }
        } else if (contactNumber in notVerifiedAudiencesPhoneNumbersNotInDb) {
          audienceData = {
            audienceId: uniqueId.uuid(),
            phoneNumber: contactNumber,
            channel: __constants.DELIVERY_CHANNEL.whatsapp,
            createdBy: messageData.config.userId,
            isFacebookVerified: 1,
            countryCode: __constants.DEFAULT_COUNTRY_CODE,
            wabaPhoneNumber: audMappingId
          }
          if (optinData[i].status === __constants.FACEBOOK_RESPONSES.valid.displayName) {
            audienceData.isFacebookVerified = 1
            verifiedNumbers.push(contactNumber)
          } else {
            audienceData.isFacebookVerified = 0
          }
          const queryParam = []
          _.each(audienceData, (val) => queryParam.push(val))
          addAudiencesBody.push(queryParam)
        }
      }
      if (updateAudiencesBody && updateAudiencesBody.length) {
        return audienceService.updateAudiencesAsFaceBookVerified(audMappingId, updateAudiencesBody, messageData.config.userId)
      }
      return true
    })
    .then(data => {
      // add new audiences
      if (addAudiencesBody && addAudiencesBody.length) {
        return audienceService.addAudineceToDbInBulk(addAudiencesBody, audMappingId)
      }
      return true
    })
    .then(data => {
      return messageStatus.resolve({ verifiedNumbers: verifiedNumbers, notVerifiedAudeienceNumbers: notVerifiedPhoneNumber })
    })
    .catch(err => {
      console.log('11111111111111111111111111111111111111111111111111', err)
      const telegramErrorMessage = 'ProcessMessageConsumer ~ checkIsVerifiedTrueOrFalse function ~ error while checkIsVerifiedTrueOrFalse functionality'
      errorToTelegram.send(err, telegramErrorMessage)
      __logger.error('checkIsVerifiedTrueOrFalse sendToRespectiveProviderQueue ::error: ', err)
      messageStatus.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
    })
  return messageStatus.promise
}

const setStatusToRejectedForNonVerifiedNumbers = (notVerifiedPayloadArr, serviceProviderId) => {
  const setStatusToRejected = q.defer()
  qalllib.qASyncWithBatch(saveAndSendMessageStatusForNotVerfiedNumber, notVerifiedPayloadArr, __constants.BATCH_SIZE_FOR_SEND_TO_QUEUE, serviceProviderId)
    .then(data => {
      setStatusToRejected.resolve([...data.resolve, ...data.reject])
    })
    .catch(function (error) {
      const telegramErrorMessage = 'preProcessMessage ~ setStatusToRejectedForNonVerifiedNumbers function ~ error in setStatusToRejectedForNonVerifiedNumbers'
      errorToTelegram.send(error, telegramErrorMessage)
      console.log('errror', error)
      return setStatusToRejected.reject(error)
    })
    .done()
  return setStatusToRejected.promise
}

const saveAndSendMessageStatusForNotVerfiedNumber = (payload, serviceProviderId) => {
  const saveAndSendMessageStatusForNotVerfiedNumber = q.defer()
  const messageHistoryService = new MessageHistoryService()
  const redirectService = new RedirectService()
  console.log('111111111111111111111111111111111111111111111111111', payload)
  const statusData = {
    messageId: payload.messageId,
    serviceProviderId: serviceProviderId,
    deliveryChannel: __constants.DELIVERY_CHANNEL.whatsapp,
    statusTime: moment.utc().format('YYYY-MM-DDTHH:mm:ss'),
    state: __constants.MESSAGE_STATUS.rejected,
    endConsumerNumber: payload.to,
    countryName: phoneCodeAndPhoneSeprator(payload.to).countryName,
    businessNumber: payload.whatsapp.from,
    customOne: payload.whatsapp.customOne || null,
    customTwo: payload.whatsapp.customTwo || null,
    customThree: payload.whatsapp.customThree || null,
    customFour: payload.whatsapp.customFour || null,
    date: payload.date
  }
  console.log('&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&', statusData)
  messageHistoryService.addMessageHistoryDataService(statusData)
    .then(statusDataAdded => {
      statusData.to = statusData.businessNumber
      statusData.from = statusData.endConsumerNumber
      delete statusData.serviceProviderId
      delete statusData.businessNumber
      delete statusData.endConsumerNumber
      // return true
      return redirectService.webhookPost(statusData.to, statusData)
    })
    .then(data => saveAndSendMessageStatusForNotVerfiedNumber.resolve(data))
    .catch(err => saveAndSendMessageStatusForNotVerfiedNumber.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err }))
  return saveAndSendMessageStatusForNotVerfiedNumber.promise
}

class PreProcessQueueConsumer {
  startServer () {
    // if (queueObj && queueObj.q_name) {
    __db.init()
      .then(result => {
        // check the queue name
        const queueObj = __constants.MQ[__config.mqObjectKey]
        const rmqObject = __db.rabbitmqHeloWhatsapp.fetchFromQueue()
        const queue = queueObj.q_name
        __logger.info('preProcessQueueConsumer::Waiting for message...')
        rmqObject.channel[queue].consume(queue, mqData => {
          try {
            // console.log(__config.mqObjectKey)
            const messageData = JSON.parse(mqData.content.toString())
            let payloadsToBeCheckedForVerified = []
            const payloadsToBeNotCheckedForVerified = []
            const toNumbersThatNeedsToBeChecked = []
            // const payload = messageData.payload
            // check for audiences only if we pass "isOptin" flag, bcoz we need to add them in audiences if they are not in audiences.
            // if isOptin is false, then we need to check the optin of audiences (audiences needs to be present, so no need to call save optin)
            const config = messageData.config
            const payloadArr = messageData.payload
            const fromNumber = payloadArr[0].whatsapp.from
            let finalPayloadArr = []
            let notVerifiedPayloadArr = []
            let notVerifiedNumbers
            for (let i = 0; i < payloadArr.length; i++) {
              const payload = payloadArr[i]
              if (payload.isOptin) {
                toNumbersThatNeedsToBeChecked.push(payload.to)
                payloadsToBeCheckedForVerified.push(payload)
              } else {
                payloadsToBeNotCheckedForVerified.push(payload)
              }
            }
            checkIsVerifiedAudiencesTrueOrFalse(messageData, fromNumber, toNumbersThatNeedsToBeChecked)
              .then(data => {
                const verifiedNumbers = data.verifiedNumbers
                notVerifiedNumbers = data.notVerifiedAudeienceNumbers
                notVerifiedPayloadArr = payloadsToBeCheckedForVerified.filter(payload => {
                  if (notVerifiedNumbers.includes(payload.to)) {
                    return true
                  } else {
                    return false
                  }
                })
                payloadsToBeCheckedForVerified = payloadsToBeCheckedForVerified.filter(payload => {
                  if (verifiedNumbers.includes(payload.to)) {
                    return true
                  } else {
                    return false
                  }
                })

                finalPayloadArr = [...payloadsToBeCheckedForVerified, ...payloadsToBeNotCheckedForVerified]
                return finalPayloadArr
                // console.log('finalPayloadArr', finalPayloadArr)
              })
              .then((sendToQueueRes) => {
                __logger.info('sendMessageToQueue :: message sentt to queue then 3', { sendToQueueRes })
                if (notVerifiedNumbers && notVerifiedNumbers.length) {
                  return setStatusToRejectedForNonVerifiedNumbers(notVerifiedPayloadArr, config.servicProviderId)
                  // return saveAndSendMessageStatusForNotVerfiedNumber(notVerifiedPayloadArr, config.servicProviderId)
                } else {
                  return true
                }
              })
              .then(() => {
                console.log('-------------------finalPayloadArr', finalPayloadArr)
                if (finalPayloadArr && finalPayloadArr.length) {
                  return sendToQueueBulk(finalPayloadArr, config, __config.mqObjectKey)
                } else {
                  return true
                }
              })
              .then((data) => {
                console.log('=================== final final LAst final', { data })
                __logger.info('sendMessageToQueue :: message sentt to queue then 3', { data })
                rmqObject.channel[queue].ack(mqData)
                // if ((!sendToQueueRes || sendToQueueRes.length === 0)) {
                //   __util.send(res, { type: __constants.RESPONSE_MESSAGES.FAILED, data: [] })
                // } else {
                //   __util.send(res, { type: __constants.RESPONSE_MESSAGES.ACCEPTED, data: [...sendToQueueRes] })
                // }
              })
              .catch(err => {
                console.log('send message ctrl error : ', err)
                const telegramErrorMessage = 'sendMessageToQueue ~ controller function ~ error in main function'
                errorToTelegram.send(err, telegramErrorMessage)
                // if (err && err.type && err.type.code && err.type.code === 3021) {
                //   delete err.type.status_code
                //   __util.send(res, { type: __constants.RESPONSE_MESSAGES.FAILED, data: [err.type] })
                // } else {
                //   __util.send(res, { type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
                // }
                rmqObject.channel[queue].ack(mqData)
              })
            // todo:
            // above function will return all the numbers that are verified . get the data of only these verified numbers out of payloadsToBeCheckedForVerified
            // concat both arrays => above one + payloadsToBeNotCheckedForVerified
            // sendToRespectiveProviderQueue => send to processMessageQueue
            // saveAndSendMessageStatus (in bulk)
          } catch (err) {
            const telegramErrorMessage = 'ProcessMessageConsumer ~ startServer function ~ preProcessQueueConsumer::error while parsing:'
            errorToTelegram.send(err, telegramErrorMessage)

            __logger.error('preProcessQueueConsumer::error while parsing: ', err)
            rmqObject.channel[queue].ack(mqData)
          }
        }, {
          noAck: false
        })
      })
      .catch(err => {
        const telegramErrorMessage = 'ProcessMessageConsumer ~ startServer function ~'
        errorToTelegram.send(err, telegramErrorMessage)
        __logger.error('preProcessQueueConsumer::error: ', err)
        process.exit(1)
      })
    // } else {
    //   errorToTelegram.send({}, 'ProcessMessageConsumer error: no such queue object exists with name')
    //   __logger.error('preProcessQueueConsumer::error: no such queue object exists with name', __config.mqObjectKey)
    //   process.exit(1)
    // }

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

class Worker extends PreProcessQueueConsumer {
  start () {
    __logger.info((new Date()).toLocaleString() + '   >> Worker PID:', process.pid)
    super.startServer()
  }
}

module.exports.worker = new Worker()
