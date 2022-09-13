const __logger = require('../../lib/logger')
const __constants = require('../../config/constants')
const __db = require('../../lib/db')
const UserService = require('../../app_modules/user/services/dbData')
const q = require('q')
const UniqueId = require('../../lib/util/uniqueIdGenerator')

// const urlGeneration = (uuid) => {
//   const messageRouted = q.defer()
//   // const informationData = Object.keys(embeddedSingupErrorConsumerData)
//   console.log('informationDatainformationDatainformationData')
//   const url = `${__constants.INTERNAL_END_POINTS.embeddedSignupSupportApi}` + `/:${uuid}`
//   // informationData.forEach((key) => {
//   //   url = url + `${key}=${embeddedSingupErrorConsumerData[key]}` + '&'
//   // })
//   // url = url.slice(0, -1)
//   console.log('final........url', url)
//   messageRouted.resolve(url)
//   return messageRouted.promise
// }

const embeddedSingupFacebookData = {
  userId: 'user_id',
  inputToken: 'input_token',
  providerId: 'provider_id',
  authTokenOfWhatsapp: 'auth_token_of_whatsapp',
  masterdDataId: 'master_data_id',
  platFormName: 'platform_name',
  businessId: 'business_id',
  systemUserId: 'system_user_id',
  systemUserToken: 'system_user_token',
  creditLineId: 'credit_line_id',
  wabaIdOfClient: 'waba_id_of_client',
  phoneCode: 'phone_code',
  phoneNumber: 'phone_number',
  phoneCertificate: 'phone_certificate',
  businessIdOfClient: 'business_id_of_client',
  wabizPassword: 'wabiz_password',
  privateIp: 'private_ip',
  wabizurl: 'wabizurl',
  isPasswordSet: 'is_password_set',
  createdBy: 'created_by',
  isProfileStatusAccepted: 'is_profile_status_accepted',
  apiKey: 'api_key',
  systemUserIdBSP: 'system_user_id_bsp',
  wabaNumberThatNeedsToBeLinked: 'waba_number_that_needs_To_Be_Linked',
  businessName: 'business_name'
}

const getDynamicQuery = (data, paramsArray) => {
  console.log('getDynamicQuerygetDynamicQuerygetDynamicQuery11111111', data, paramsArray)
  console.log('getDynamicQuerygetDynamicQuerygetDynamicQuery222222222', paramsArray)
  const messageRouted = q.defer()
  delete data.retryCount
  const keys = Object.keys(data)
  // const uniqueId = new UniqueId()
  let query = 'INSERT INTO facebook_embedded_singup_data '
  let fields = '( embedded_singup_id, '
  let values = '( ?, '
  // paramsArray.push(uniqueId)
  keys.forEach(key => {
    fields += `${embeddedSingupFacebookData[key]}, `
    values += '?, '
    paramsArray.push(data[key])
  })
  // fields.length = fields.length - 1
  // values.length = values.length - 1
  fields = fields.slice(0, -2)
  values = values.slice(0, -2)
  fields += ' )'
  values += ' )'
  query = query + fields + ' VALUES ' + values
  console.log('????????????????????????????????', query)
  console.log('{{{{{{}{}{}{}{}{}{}{}{}{}{}{', paramsArray)
  messageRouted.resolve({ query, paramsArray })
  return messageRouted.promise
}

const InsertEmbbeddedSingupErrorData = (data, paramsArray) => {
  console.log('InsertEmbbeddedSingupErrorData>>>>>>>>>>>>>>>>>>11111111', data)
  console.log('InsertEmbbeddedSingupErrorData>>>>>>>>>>>>>>>>>>22222222', data)
  const InsertEmbbeddedSingupErrorData = q.defer()
  const userService = new UserService()
  getDynamicQuery(data, paramsArray)
    .then(result => {
      console.log('result form the get dynamic query ', result)
      return userService.addEmbbeddedSingupErrorData(result.query, result.paramsArray)
    })
    .then(data => {
      InsertEmbbeddedSingupErrorData.resolve(data)
    })
    .catch((err) => {
      InsertEmbbeddedSingupErrorData.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: [err] })
    })
  return InsertEmbbeddedSingupErrorData.promise
}

class embeddedSingupErrorConsumer {
  constructor () {
    this.uniqueId = new UniqueId()
  }

  startServer () {
    const queue = __constants.MQ.embeddedSingupErrorConsumerQueue.q_name
    __db.init()
      .then(result => {
        const rmqObject = __db.rabbitmqHeloWhatsapp.fetchFromQueue()
        const userService = new UserService()
        const uniqueId = this.uniqueId.uuid()
        rmqObject.channel[queue].consume(queue, mqData => {
          let embeddedSingupErrorConsumerDataData
          let responseData
          try {
            const embeddedSingupErrorConsumerData = JSON.parse(mqData.content.toString())
            console.log('erorororororororororororororororororororor', embeddedSingupErrorConsumerData)
            InsertEmbbeddedSingupErrorData(embeddedSingupErrorConsumerData.data, [uniqueId])
              .then(response => {
                console.log('response-----------', response)
                responseData = response
                console.log('embeddedSingupErrorConsumerData', embeddedSingupErrorConsumerData)
                embeddedSingupErrorConsumerDataData = embeddedSingupErrorConsumerData
                console.log('response response response response rseponse ', response)
                const url = `${__constants.INTERNAL_END_POINTS.embeddedSignupSupportApi}` + `/${uniqueId}`
                console.log('uuuuuuuuuuuuuuuuuuurrrrrrrrrrrrrrrlllllllllllllllllllllll', url)
                userService.sendMessageToSupport(url, embeddedSingupErrorConsumerData.err)
                rmqObject.channel[queue].ack(mqData)
              })
              .catch(err => {
                console.log('err', err)
                if (err) {
                  err.data = {
                    response: responseData,
                    embeddedSingupErrorConsumerData: embeddedSingupErrorConsumerDataData
                  }
                  rmqObject.sendToQueue(__constants.MQ.embeddedSingupErrorConsumerQueue2, JSON.stringify(err))
                  // if (retryCount < 2) {
                  //   const oldObj = JSON.parse(mqData.content.toString())
                  //   oldObj.retryCount = retryCount + 1
                  // // __logger.info('requeing --->', oldObj)
                  // // sendToDemo10secQueue(oldObj, rmqObject)
                  // } else {
                  //   console.log('send to error queue')
                  // }
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

class Worker extends embeddedSingupErrorConsumer {
  start () {
    __logger.info((new Date()).toLocaleString() + '   >> Worker PID:', process.pid)
    super.startServer()
  }
}

module.exports.worker = new Worker()
