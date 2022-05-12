const __logger = require('../../lib/logger')
const __constants = require('../../config/constants')
const __config = require('../../config')
const __db = require('../../lib/db')
const UserService = require('../../app_modules/user/services/dbData')
const q = require('q')
const shell = require('shelljs')
const fs = require('fs')
const { setProfileStatus } = require('../../lib/commonFunction/commonFunctions')
const passwordGenerator = require('../../lib/util/passwordGenerator')

const sendToSpawningContainer10secQueue = (message, queueObj) => {
  const messageRouted = q.defer()
  queueObj.sendToQueue(__constants.MQ.spawningContainerConsumer_queue_10_sec, JSON.stringify(message))
    .then(queueResponse => messageRouted.resolve('done!'))
    .catch(err => messageRouted.reject(err))
  return messageRouted.promise
}

const runScriptToSpawnContainersAndGetTheIP = (userId, wabaNumber, privateIp) => {
  const getIp = q.defer()

  if (privateIp) {
    // this will work when container is spawned but updateWabizInformation failed
    getIp.resolve({ privateIp: privateIp })
    return getIp.promise
  }

  const version = '2.37.2'
  // const command = 'bash shell_scripts/launch_server/launch.bash 2.37.2 917666004488 helo_test_917666004488'
  const command = `bash shell_scripts/launch_server/launch_customer.bash ${version} ${wabaNumber} ${userId}_${wabaNumber}`
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

const updateWabizInformation = (wabizusername, wabizpassword, wabizurl, graphapikey, phoneCode, phoneNumber, privateIp) => {
  const apicall = q.defer()
  const userService = new UserService()
  userService.updateWabizInformation(wabizusername, wabizpassword, wabizurl, graphapikey, phoneCode, phoneNumber)
    .then((data) => {
      console.log('data from updateWabizInformation ', data)
    }).catch((err) => {
      // todo: if this fails, retry it for 3 times. If still fails, send to queue with privateIp
      console.log('err', err)
      apicall.reject({ type: err.type, err: err })
    })
}

class SpawningContainerConsumer {
  startServer () {
    const queue = __constants.MQ.spawningContainerConsumerQueue.q_name
    __db.init()
      .then(result => {
        // {
        //   "userId": "5d28169c-767c-44ee-bfcf-8e9955adb9ce",
        //   "providerId": "a4f03720-3a33-4b94-b88a-e10453492183",
        //   "phoneCode": "91",
        //   "phoneNumber": "8097353703",
        //   "authTokenOfWhatsapp": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InVzZXJfaWQiOiI1ZDI4MTY5Yy03NjdjLTQ0ZWUtYmZjZi04ZTk5NTVhZGI5Y2UiLCJwcm92aWRlcklkIjoiYTRmMDM3MjAtM2EzMy00Yjk0LWI4OGEtZTEwNDUzNDkyMTgzIiwid2FiYVBob25lTnVtYmVyIjoiOTE4MTY5OTc5MzAyIiwibWF4VHBzVG9Qcm92aWRlciI6MTV9LCJpYXQiOjE2NTE4MTcyNDksImV4cCI6MTY1MTkwMzY0OX0.KbTCqGu4rxfY5pdPmswoxBOcrpa4ouVCW9Je-59AV2M"
        // }
        const rmqObject = __db.rabbitmqHeloWhatsapp.fetchFromQueue()
        rmqObject.channel[queue].consume(queue, mqData => {
          try {
            let wabizurl
            const wabasetUpData = JSON.parse(mqData.content.toString())
            // userId, providerId, phoneCode, phoneNumber, phoneCertificate, systemUserToken, wabaIdOfClient, wabizPassword, wabizurl, authTokenOfWhatsapp
            const { userId, providerId, phoneCode, phoneNumber, systemUserToken, privateIp, authTokenOfWhatsapp } = wabasetUpData
            const wabizPassword = wabasetUpData.wabizPassword || passwordGenerator(__constants.WABIZ_CUSTOM_PASSWORD_LENGTH)
            wabasetUpData.wabizPassword = wabizPassword
            // required fields: userId, providerId, phoneCode, phoneNumber, systemUserToken, authTokenOfWhatsapp
            console.log('messageData===========', wabasetUpData)
            const retryCount = wabasetUpData.retryCount || 0
            console.log('retry count: ', retryCount)
            // todo: spawn new containers. We will get wabiz username, password, url, graphApiKey. We will get wabizurl after running the bash script
            runScriptToSpawnContainersAndGetTheIP(userId, phoneCode + phoneNumber, privateIp)
              .then(data => {
                console.log('spawned container response: ', data)
                wabasetUpData.privateIp = data.privateIp
                wabizurl = 'https://' + data.privateIp + `:${__config.wabizPort}`
                wabasetUpData.wabizurl = wabizurl
                console.log('wabizurl', wabizurl)
                console.log('wabizPassword', wabizPassword)
                // wabizusername will be "admin", wabizpassword => hardcoded,
                // todo: generate & set 2fa pin as well in db.
                // set wabiz username, password, url, graphApiKey in our db
                return updateWabizInformation(__constants.WABIZ_USERNAME, wabizPassword, wabizurl, systemUserToken, phoneCode, phoneNumber, data.privateIp)
              })
              .then(data => {
                // set status to container spawned
                return setProfileStatus(authTokenOfWhatsapp, userId, providerId, __constants.WABA_PROFILE_STATUS.containerSpawned.statusCode)
              })
              .then(response => {
                // after this worker now in which worker we have send data
                rmqObject.sendToQueue(__constants.MQ.wabaContainerBindingConsumerQueue, JSON.stringify(wabasetUpData))
                rmqObject.channel[queue].ack(mqData)
              })
              .catch(err => {
                console.log('err', err)
                if (err) {
                  err.data = wabasetUpData
                  // todo: check for expiry of authTokenOfWhatsapp
                  if (retryCount < 2) {
                    // const oldObj = JSON.parse(mqData.content.toString())
                    wabasetUpData.retryCount = retryCount + 1
                    // oldObj.retryCount = retryCount + 1
                    sendToSpawningContainer10secQueue(wabasetUpData, rmqObject)
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

class Worker extends SpawningContainerConsumer {
  start () {
    __logger.info((new Date()).toLocaleString() + '   >> Worker PID:', process.pid)
    super.startServer()
  }
}

module.exports.worker = new Worker()
