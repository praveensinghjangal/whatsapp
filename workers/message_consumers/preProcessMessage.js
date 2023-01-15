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
/// only for single or for multiple message ???????
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
    date: payload.date,
    campName: payload.whatsapp.campName || null
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
    .catch(err => {
      __logger.error('preProcessMessage: saveAndSendMessageStatus(): addMessageHistoryDataService():', err)
      statusSent.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
    })
  return statusSent.promise
}

const sendToQueue = (data, config, currentQueueName) => {
  const messageSent = q.defer()
  const queueData = {
    config: config,
    payload: data
  }
  const userId = data && data.redisData && data.redisData.userId ? data.redisData.userId : config.userId
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
    queueObj = require('../../lib/util/rabbitmqHelper')('process_message_campaign', userId, data.whatsapp.from)
    // queueObj = __constants.MQ.process_message_campaign
  }
  const planPriority = data && data.redisData && data.redisData.planPriority ? data.redisData.planPriority : null
  __db.rabbitmqHeloWhatsapp.sendToQueue(queueObj, JSON.stringify(queueData), planPriority)
    .then(queueResponse => saveAndSendMessageStatus(data))
    .then(messagStatusResponse => messageSent.resolve({ messageId: data.messageId, to: data.to, acceptedAt: new Date(), apiReqId: data.vivaReqId, customOne: data.whatsapp.customOne, customTwo: data.whatsapp.customTwo, customThree: data.whatsapp.customThree, customFour: data.whatsapp.customFour }))
    .catch(err => {
      __logger.error('preProcessMessage: sendToQueue(): sendToQueue():', err, queueObj)
      const telegramErrorMessage = 'sendMessageToQueue: sendToQueue(): error in sendToQueue and saveAndSendMessageStatus '
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
      __logger.error('preProcessMessage: sendToQueueBulk(): qASyncWithBatch(): Error while sending in bulk')
      const telegramErrorMessage = 'sendMessageToQueue: sendToQueueBulk(): error in sendToQueueBulk'
      errorToTelegram.send(error, telegramErrorMessage)
      return sendSingleMessage.reject(error)
    })
    .done()
  return sendSingleMessage.promise
}
// insert not veridfied with rejetced status
/* const checkIsVerifiedAudiencesTrueOrFalse = (messageData, fromNumber, toNumbersThatNeedsToBeChecked) => {
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
      const numbersFromDataBase = []
      for (let i = 0; i < data.length; i++) {
        phoneNumbersPresentInDB.push(data[i].phoneNumber)
        if (!data[i].isFacebookVerified) {
          notVerifiedAudiencesPhoneNumbersInDB[data[i].phoneNumber] = 1
          phoneNumbersToBeCheckedWithFb.push(`+${data[i].phoneNumber}`)
        } else {
          alreadyVerifiedAudiencesPhoneNumbersInDB.push(data[i].phoneNumber)
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
      }
      // remove dublicate from array
      const afterRemoveDublicate = [...new Set(toNumbersThatNeedsToBeChecked)]
      if (data.length !== afterRemoveDublicate.length) {
        for (let i = 0; i < data.length; i++) {
          if (data[i].phoneNumber) {
            numbersFromDataBase.push(data[i].phoneNumber)
          }
        }
        const notVerifiedAudiencesNumbers = _.differenceBy(toNumbersThatNeedsToBeChecked, numbersFromDataBase)
        if (notVerifiedAudiencesNumbers.length && notVerifiedAudiencesNumbers) {
          notVerifiedPhoneNumber.push(...notVerifiedAudiencesNumbers)
        }
        // console.log('data.length is not equal to', data)
        // for(let i = 0; )
        // for (let i = 0; i < toNumbersThatNeedsToBeChecked.length; i++) {
        //   console.log('inside for loop', toNumbersThatNeedsToBeChecked[i])
        //   if (!data.includes(toNumbersThatNeedsToBeChecked[i])) {
        //     console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@', toNumbersThatNeedsToBeChecked[i])
        //     notVerifiedPhoneNumber.push(toNumbersThatNeedsToBeChecked[i])
        //     console.log('notVerifiedPhoneNumber 1111111111111111111111', notVerifiedPhoneNumber)
        //   }
        // }
        // const numberNotInAudience = _.differenceBy(toNumbersThatNeedsToBeChecked, data)
        // console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!', numberNotInAudience)
        // notVerifiedPhoneNumber.push(numberNotInAudience)
      }
      // verifiedNumbers = [...verifiedNumbers, ...alreadyVerifiedAudiencesPhoneNumbersInDB]
      // console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@', phoneNumbersToBeCheckedWithFb)
      // // get all the audiences not present in db's audiences table
      // for (let i = 0; i < toNumbersThatNeedsToBeChecked.length; i++) {
      //   const toNumber = toNumbersThatNeedsToBeChecked[i]
      //   if (!phoneNumbersPresentInDB.includes(toNumber)) {
      //     phoneNumbersToBeCheckedWithFb.push(`+${toNumber}`)
      //     notVerifiedAudiencesPhoneNumbersNotInDb[toNumber] = 1
      //   }
      // }
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
      //     input: '+918551834297',
      //     status: 'valid',
      //     wa_id: '918551834297'
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
      console.log('00000000000000000000000000000000000000000000000000000000000000000000000000000', notVerifiedPhoneNumber)
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
} */

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
    messageStatus.resolve({ verifiedNumbers: toNumbersThatNeedsToBeChecked, notVerifiedPhoneNumber: notVerifiedPhoneNumber })
    return messageStatus.promise
  }
  audienceService.getWabaPhoneNumber(fromNumber)
    .then(data => {
      if (data && data.audMappingId) {
        audMappingId = data.audMappingId
        return audienceService.getAudiencesVerified(toNumbersThatNeedsToBeChecked, fromNumber)
      } else {
        __logger.error('preProcessMessage: checkIsVerifiedAudiencesTrueOrFalse(): getWabaPhoneNumber(' + fromNumber + '): Waba phone number not found....')
        rejectionHandler({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: ['Invalid waba phone number'] })
      }
    })
    .then(data => {
      // notVerifiedAudiences = (audiences not present in payloadsToBeCheckedForVerified + audiences not verified in data)
      const alreadyVerifiedAudiencesPhoneNumbersInDB = [] // without "+"
      const phoneNumbersPresentInDB = []
      const phoneNumbersToBeCheckedWithFb = []
      for (let i = 0; i < data.length; i++) {
        // number present in dbatabse agains waba
        phoneNumbersPresentInDB.push(data[i].phoneNumber)
        if (!data[i].isFacebookVerified) {
          // present in db but not facebook verified
          notVerifiedAudiencesPhoneNumbersInDB[data[i].phoneNumber] = 1
          /// phone number check from facebook
          phoneNumbersToBeCheckedWithFb.push(`+${data[i].phoneNumber}`)
        } else {
          // else verified and facebook verified true and also present in database
          alreadyVerifiedAudiencesPhoneNumbersInDB.push(data[i].phoneNumber)
        }
      }
      verifiedNumbers = [...verifiedNumbers, ...alreadyVerifiedAudiencesPhoneNumbersInDB]
      // get all the audiences not present in db's audiences table
      // doubt
      for (let i = 0; i < toNumbersThatNeedsToBeChecked.length; i++) {
        const toNumber = toNumbersThatNeedsToBeChecked[i]
        if (!phoneNumbersPresentInDB.includes(toNumber)) {
          phoneNumbersToBeCheckedWithFb.push(`+${toNumber}`)
          /// number not present in database
          // o of n
          notVerifiedAudiencesPhoneNumbersNotInDb[toNumber] = 1
        }
      }
      // console.log('phoneNumbersToBeCheckedWithFb', phoneNumbersToBeCheckedWithFb)
      // notVerifiedAudiencesPhoneNumbersInDB = [...notVerifiedAudiencesPhoneNumbersInDB, ...notVerifiedAudiencesPhoneNumbersNotInDb]
      const audienceService = new integrationService.Audience(messageData.config.servicProviderId, messageData.config.maxTpsToProvider, messageData.config.userId)
      return audienceService.saveOptin(fromNumber, phoneNumbersToBeCheckedWithFb)
      // todo: call facebook api to get the status of all the "not verified numbers". Check if status is valid or not

      // todo: get the list of all the verified numbers (this list & alreadyVerifiedAudiencesPhoneNumbersInDB will be returned by this function, so that only these numbers will be passed further in the next step) and segregate them based on => present in db & not present in db

      // todo: for numbers already present in db =>  make their status isFacebookVerified to true in our db
      // todo: for numbers not present in db => create new entries in audiences table
    })
    .then((optinData) => {
      /* optinData = [
        {
          input: '+910000000001',
          status: 'valid',
          wa_id: '910000000001'
        },
        {
          input: '+910000000002',
          status: 'valid',
          wa_id: '910000000002'
        },
        {
          input: '+910000000003',
          status: 'invalid',
          wa_id: '910000000003'
        },
        {
          input: '+910000000004',
          status: 'valid',
          wa_id: '910000000004'
        },
        {
          input: '+910000000005',
          status: 'invalid',
          wa_id: '910000000005'
        },
        {
          input: '+910000000006',
          status: 'valid',
          wa_id: '910000000006'
        },
        {
          input: '+910000000007',
          status: 'invalid',
          wa_id: '910000000007'
        }
      ] */

      const uniqueId = new UniqueId()
      for (let i = 0; i < optinData.length; i++) {
        // const contactNumber = optinData[i].wa_id // without "+"
        let contactNumber = optinData[i].input // without "+"
        contactNumber = contactNumber.slice(1)
        // if phone number present in database and facebook not verified then update audience body
        // changed :- not valid number from facebook does not come from optinData[i].wa_id
        if (contactNumber in notVerifiedAudiencesPhoneNumbersInDB) {
          if (optinData[i].status === __constants.FACEBOOK_RESPONSES.valid.displayName) {
            updateAudiencesBody.push(contactNumber)
            verifiedNumbers.push(contactNumber)
          } else {
            notVerifiedPhoneNumber.push(contactNumber)
          }
        } else if (contactNumber in notVerifiedAudiencesPhoneNumbersNotInDb) {
          // check facebook verified and not in database also
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
            // changes
            notVerifiedPhoneNumber.push(contactNumber)
          }
          const queryParam = []
          _.each(audienceData, (val) => queryParam.push(val))
          addAudiencesBody.push(queryParam)
        }
      }
      if (updateAudiencesBody && updateAudiencesBody.length) {
        // console.log('updateAudiencesBody', updateAudiencesBody)
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
      return messageStatus.resolve({ verifiedNumbers: verifiedNumbers, notVerifiedNumbers: notVerifiedPhoneNumber })
    })
    .catch(err => {
      const telegramErrorMessage = 'preProcessMessage: checkIsVerifiedTrueOrFalse(): sendToRespectiveProviderQueue() catch: '
      errorToTelegram.send(err, telegramErrorMessage)
      __logger.error('preProcessMessage: checkIsVerifiedTrueOrFalse(): sendToRespectiveProviderQueue() catch: ', err)
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
      __logger.error('preProcessMessage: setStatusToRejectedForNonVerifiedNumbers(): catcch:', error)
      const telegramErrorMessage = 'preProcessMessage ~ setStatusToRejectedForNonVerifiedNumbers function ~ error in setStatusToRejectedForNonVerifiedNumbers'
      errorToTelegram.send(error, telegramErrorMessage)
      return setStatusToRejected.reject(error)
    })
    .done()
  return setStatusToRejected.promise
}

const saveAndSendMessageStatusForNotVerfiedNumber = (payload, serviceProviderId) => {
  const saveAndSendMessageStatusForNotVerfiedNumber = q.defer()
  const messageHistoryService = new MessageHistoryService()
  const redirectService = new RedirectService()
  const statusData = {
    messageId: payload.messageId,
    serviceProviderId: serviceProviderId,
    deliveryChannel: __constants.DELIVERY_CHANNEL.whatsapp,
    statusTime: moment.utc().format('YYYY-MM-DDTHH:mm:ss'),
    state: __constants.MESSAGE_STATUS.rejected,
    endConsumerNumber: payload.to,
    countryName: phoneCodeAndPhoneSeprator(payload.to).countryName,
    businessNumber: payload.whatsapp.from,
    errors: ['not verified from facebook'],
    customOne: payload.whatsapp.customOne || null,
    customTwo: payload.whatsapp.customTwo || null,
    customThree: payload.whatsapp.customThree || null,
    customFour: payload.whatsapp.customFour || null,
    date: payload.date,
    campName: payload.whatsapp.campName || null
  }
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
            let payloadsToBeNotCheckedForNotVerified = []
            // const payload = messageData.payload
            // check for audiences only if we pass "isOptin" flag, bcoz we need to add them in audiences if they are not in audiences.
            // if isOptin is false, then we need to check the optin of audiences (audiences needs to be present, so no need to call save optin)
            const config = messageData.config
            const payloadsToBeCheckedForNotVerified = []
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
                payloadsToBeNotCheckedForNotVerified.push(payload)
              } else {
                payloadsToBeNotCheckedForVerified.push(payload)
                payloadsToBeNotCheckedForNotVerified.push(payload)
              }
            }
            // console.log('payloadsToBeCheckedForVerified', payloadsToBeCheckedForVerified)
            // console.log('payloadsToBeNotCheckedForVerified', payloadsToBeNotCheckedForVerified)
            // start
            checkIsVerifiedAudiencesTrueOrFalse(messageData, fromNumber, toNumbersThatNeedsToBeChecked)
              .then(data => {
                notVerifiedNumbers = data.notVerifiedNumbers || []
                const verifiedNumbers = data.verifiedNumbers
                // console.log('verifiedNumbers', verifiedNumbers)
                // console.log('notVerifiedNumbers', notVerifiedNumbers)
                payloadsToBeCheckedForVerified = payloadsToBeCheckedForVerified.filter(payload => {
                  if (verifiedNumbers && verifiedNumbers.includes(payload.to)) {
                    return true
                  } else {
                    return false
                  }
                })
                // console.log('notVerifiedNumbers', notVerifiedNumbers)
                payloadsToBeNotCheckedForNotVerified = payloadsToBeNotCheckedForNotVerified.filter(payload => {
                  if (notVerifiedNumbers && notVerifiedNumbers.includes(payload.to)) {
                    return true
                  } else {
                    return false
                  }
                })
                // console.log('payloadsToBeNotCheckedForNotVerified', payloadsToBeNotCheckedForNotVerified)
                finalPayloadArr = [...payloadsToBeCheckedForVerified, ...payloadsToBeNotCheckedForVerified]
                notVerifiedPayloadArr = [...payloadsToBeNotCheckedForNotVerified, ...payloadsToBeCheckedForNotVerified]
                // console.log('@@@@@@@@@@@@@@ notVerifiedPayloadArr', notVerifiedPayloadArr)
                return { finalPayloadArr, notVerifiedPayloadArr }
                // console.log('finalPayloadArr', finalPayloadArr)
              })
              .then((sendToQueueRes) => {
                __logger.info('preProcessMessage: checkIsVerifiedAudiencesTrueOrFalse(): then 2:', { sendToQueueRes })
                // console.warn('------------ notVerifiedNumbers :: ', notVerifiedNumbers)
                if (notVerifiedNumbers && notVerifiedNumbers.length) {
                  // console.warn('------------------ in if condition')
                  // console.log('notVerifiedPayloadArr ------------------', notVerifiedPayloadArr)
                  return setStatusToRejectedForNonVerifiedNumbers(notVerifiedPayloadArr, config.servicProviderId)
                  // return saveAndSendMessageStatusForNotVerfiedNumber(notVerifiedPayloadArr, config.servicProviderId)
                } else {
                  // console.warn('---------------- in else condition')
                  return true
                }
              })
              .then(() => {
                if (finalPayloadArr && finalPayloadArr.length) {
                  return sendToQueueBulk(finalPayloadArr, config, __config.mqObjectKey)
                } else {
                  return true
                }
              })
              .then((data) => {
                __logger.info('preProcessMessage: checkIsVerifiedAudiencesTrueOrFalse(): then 4', { data })
                rmqObject.channel[queue].ack(mqData)
                // if ((!sendToQueueRes || sendToQueueRes.length === 0)) {
                //   __util.send(res, { type: __constants.RESPONSE_MESSAGES.FAILED, data: [] })
                // } else {
                //   __util.send(res, { type: __constants.RESPONSE_MESSAGES.ACCEPTED, data: [...sendToQueueRes] })
                // }
              })
              .catch(err => {
                __logger.error('preProcessMessage: checkIsVerifiedAudiencesTrueOrFalse(): main catch:', err)
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

            __logger.error('preProcessMessage: error while parsing: try/catch:', err)
            rmqObject.channel[queue].ack(mqData)
          }
        }, {
          noAck: false
        })
      })
      .catch(err => {
        __logger.error('preProcessMessage: db.init(): catch:', err)
        const telegramErrorMessage = 'preProcessMessage: db.init(): catch:'
        errorToTelegram.send(err, telegramErrorMessage)
        process.exit(1)
      })
    // } else {
    //   errorToTelegram.send({}, 'ProcessMessageConsumer error: no such queue object exists with name')
    //   __logger.error('preProcessMessage: error: no such queue object exists with name', __config.mqObjectKey)
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
    __logger.info('preProcessMessage: ' + (new Date()).toLocaleString() + '   >> Worker PID:', process.pid)
    super.startServer()
  }
}

module.exports.worker = new Worker()
