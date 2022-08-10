const __logger = require('../../lib/logger')
const __constants = require('../../config/constants')
const __db = require('../../lib/db')
const q = require('q')
const integrationService = require('../../app_modules/integration')
const UserService = require('../../app_modules/user/services/dbData')

const sendTotwoFaConsumer10secQueue = (message, queueObj) => {
  const messageRouted = q.defer()
  queueObj.sendToQueue(__constants.MQ.twoFaConsumer_queue_10_sec, JSON.stringify(message))
    .then(queueResponse => messageRouted.resolve('done!'))
    .catch(err => messageRouted.reject(err))
  return messageRouted.promise
}
class twoFaConsumer {
  startServer () {
    const queue = __constants.MQ.twoFaConsumerQueue.q_name
    __db.init()
      .then(result => {
        const rmqObject = __db.rabbitmqHeloWhatsapp.fetchFromQueue()
        let embeddedSignupService
        rmqObject.channel[queue].consume(queue, mqData => {
          try {
            const twoFaConsumerData = JSON.parse(mqData.content.toString())
            const { userId, wabizurl, apiKey, providerId, systemUserToken, phoneCode, phoneNumber } = twoFaConsumerData
            let tfaPin = Math.floor(100000 + Math.random() * 900000)
            tfaPin = tfaPin.toString()
            const userService = new UserService()
            const retryCount = twoFaConsumerData.retryCount || 0
            console.log('retry count: ', retryCount)
            embeddedSignupService = new integrationService.EmbeddedSignup(providerId, userId, systemUserToken)
            embeddedSignupService.enableTwoStepVerification(wabizurl, apiKey, tfaPin)
              .then(response => {
                return userService.updateTfaPinInformation(phoneCode, phoneNumber, tfaPin)
              })
              .then(response => {
                rmqObject.channel[queue].ack(mqData)
              })
              .catch(err => {
                console.log('err', err)
                if (err) {
                  if (retryCount < 2) {
                    const oldObj = JSON.parse(mqData.content.toString())
                    oldObj.retryCount = retryCount + 1
                    // __logger.info('requeing --->', oldObj)
                    sendTotwoFaConsumer10secQueue(oldObj, rmqObject)
                  } else {
                    return userService.sendMessageToSupport(tfaPin, err)
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

class Worker extends twoFaConsumer {
  start () {
    __logger.info((new Date()).toLocaleString() + '   >> Worker PID:', process.pid)
    super.startServer()
  }
}

module.exports.worker = new Worker()

// link for to change /helowhatsapp/api/users/signup/embedded/continue?inputToken=EAAG0ZAQUaL3wBALroxy61bIJNddjWyaVwNJcSQNBmjtv2NMh6tJGnCUdAsaHkV9nEsdTGlIIZCuKCVbutfsYJNZAjCGIIimYbI5w6YCB2pO3kNyh7lHu8N0JLZAGmo5pKpAHmaAtqK8UP7OAQl2FyybVXx9AHmiZCa4SJjMl1v3VSvR4EmVDBvO0tczCyKlfIGucQIQhzJ3J9vcsFNgfZB&providerId=a4f03720-3a33-4b94-b88a-e10453492183&userId=a9c47ead-c556-4a4d-a916-8b42b9aa2f47&authTokenOfWhatsapp=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InVzZXJfaWQiOiJhOWM0N2VhZC1jNTU2LTRhNGQtYTkxNi04YjQyYjlhYTJmNDciLCJwcm92aWRlcklkIjoiIiwid2FiYVBob25lTnVtYmVyIjoiIiwibWF4VHBzVG9Qcm92aWRlciI6MTB9LCJpYXQiOjE2NTIzNDczMTEsImV4cCI6MTY1MjQzMzcxMX0.BKcD8QNsZ76N7vdlFSL4ApbWqyTk_tE6boVD03x5T7s&masterdDataId=cdbf2b4e-6655-4f83-9f24-89c8a075b05c&platFormName=facebook&businessId=237143287394373&systemUserId=155284020282729&systemUserToken=EAAG0ZAQUaL3wBAPxNeo1MDJeufavMePopf7pfxHdMYeN0NXmZCBQZBsPMZBZBpVH85J7HIptuRneelncDvxR7ZBzgpmuOW7ZCkarTQK0CQ4tkmw8NWLnzzOnOSdnZAJsYH7zEY8nAnv2BeLYClBJb9CL4BaZBh09oz8Bakq9IlgZBHMwqtn1kvWeBX&creditLineId=4178067182304065&wabaIdOfClient=111680211540295&phoneCode=91&phoneNumber=7666002277&phoneCertificate=CmQKIAi3rKbqye/nAxIGZW50OndhIgdIZXhUZWNoUO+n85MGGkBitt+EBFDTpQAinIzSEepRZVbPN9HXZ/CS4+l9Ue54CNDx/vmcp9TTmvLlKx2T0Tz0L6dZh5LJalxITV6FcrgOEi5tWQHQ0PK5KOBEh7OfqmsvlVrm51vC2PLhPxJOrTzC+FTZgVpI5xLVyT3oTYic&businessIdOfClient=740119983371790&wabizPassword=@D@J2fj1@O&privateIp=10.40.13.240&wabizurl=https://10.40.13.240:9093&isPasswordSet=true&retryCount=2&
// Error in code:- {"type":{"status_code":500,"code":5000,"message":"Something went wrong. Please try again later."},"err":[[{"code":1005,"title":"Access denied","details":"Please wait 2 minute(s) before trying again"}],"request code"],"data":{"inputToken":"EAAG0ZAQUaL3wBALroxy61bIJNddjWyaVwNJcSQNBmjtv2NMh6tJGnCUdAsaHkV9nEsdTGlIIZCuKCVbutfsYJNZAjCGIIimYbI5w6YCB2pO3kNyh7lHu8N0JLZAGmo5pKpAHmaAtqK8UP7OAQl2FyybVXx9AHmiZCa4SJjMl1v3VSvR4EmVDBvO0tczCyKlfIGucQIQhzJ3J9vcsFNgfZB","providerId":"a4f03720-3a33-4b94-b88a-e10453492183","userId":"a9c47ead-c556-4a4d-a916-8b42b9aa2f47","authTokenOfWhatsapp":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InVzZXJfaWQiOiJhOWM0N2VhZC1jNTU2LTRhNGQtYTkxNi04YjQyYjlhYTJmNDciLCJwcm92aWRlcklkIjoiIiwid2FiYVBob25lTnVtYmVyIjoiIiwibWF4VHBzVG9Qcm92aWRlciI6MTB9LCJpYXQiOjE2NTIzNDczMTEsImV4cCI6MTY1MjQzMzcxMX0.BKcD8QNsZ76N7vdlFSL4ApbWqyTk_tE6boVD03x5T7s","masterdDataId":"cdbf2b4e-6655-4f83-9f24-89c8a075b05c","platFormName":"facebook","businessId":"237143287394373","systemUserId":"155284020282729","systemUserToken":"EAAG0ZAQUaL3wBAPxNeo1MDJeufavMePopf7pfxHdMYeN0NXmZCBQZBsPMZBZBpVH85J7HIptuRneelncDvxR7ZBzgpmuOW7ZCkarTQK0CQ4tkmw8NWLnzzOnOSdnZAJsYH7zEY8nAnv2BeLYClBJb9CL4BaZBh09oz8Bakq9IlgZBHMwqtn1kvWeBX","creditLineId":"4178067182304065","wabaIdOfClient":"111680211540295","phoneCode":"91","phoneNumber":"7666002277","phoneCertificate":"CmQKIAi3rKbqye/nAxIGZW50OndhIgdIZXhUZWNoUO+n85MGGkBitt+EBFDTpQAinIzSEepRZVbPN9HXZ/CS4+l9Ue54CNDx/vmcp9TTmvLlKx2T0Tz0L6dZh5LJalxITV6FcrgOEi5tWQHQ0PK5KOBEh7OfqmsvlVrm51vC2PLhPxJOrTzC+FTZgVpI5xLVyT3oTYic","businessIdOfClient":"740119983371790","wabizPassword":"@D@J2fj1@O","privateIp":"10.40.13.240","wabizurl":"https://10.40.13.240:9093","isPasswordSet":true,"retryCount":2}}

// Hi Team.
// link for to change /helowhatsapp/api/users/signup/embedded/continue?inputToken=EAAG0ZAQUaL3wBALroxy61bIJNddjWyaVwNJcSQNBmjtv2NMh6tJGnCUdAsaHkV9nEsdTGlIIZCuKCVbutfsYJNZAjCGIIimYbI5w6YCB2pO3kNyh7lHu8N0JLZAGmo5pKpAHmaAtqK8UP7OAQl2FyybVXx9AHmiZCa4SJjMl1v3VSvR4EmVDBvO0tczCyKlfIGucQIQhzJ3J9vcsFNgfZB&providerId=a4f03720-3a33-4b94-b88a-e10453492183&userId=a9c47ead-c556-4a4d-a916-8b42b9aa2f47&authTokenOfWhatsapp=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InVzZXJfaWQiOiJhOWM0N2VhZC1jNTU2LTRhNGQtYTkxNi04YjQyYjlhYTJmNDciLCJwcm92aWRlcklkIjoiIiwid2FiYVBob25lTnVtYmVyIjoiIiwibWF4VHBzVG9Qcm92aWRlciI6MTB9LCJpYXQiOjE2NTIzNDczMTEsImV4cCI6MTY1MjQzMzcxMX0.BKcD8QNsZ76N7vdlFSL4ApbWqyTk_tE6boVD03x5T7s&masterdDataId=cdbf2b4e-6655-4f83-9f24-89c8a075b05c&platFormName=facebook&businessId=237143287394373&systemUserId=155284020282729&systemUserToken=EAAG0ZAQUaL3wBAPxNeo1MDJeufavMePopf7pfxHdMYeN0NXmZCBQZBsPMZBZBpVH85J7HIptuRneelncDvxR7ZBzgpmuOW7ZCkarTQK0CQ4tkmw8NWLnzzOnOSdnZAJsYH7zEY8nAnv2BeLYClBJb9CL4BaZBh09oz8Bakq9IlgZBHMwqtn1kvWeBX&creditLineId=4178067182304065&wabaIdOfClient=111680211540295&phoneCode=91&phoneNumber=7666002277&phoneCertificate=CmQKIAi3rKbqye/nAxIGZW50OndhIgdIZXhUZWNoUO n85MGGkBitt EBFDTpQAinIzSEepRZVbPN9HXZ/CS4 l9Ue54CNDx/vmcp9TTmvLlKx2T0Tz0L6dZh5LJalxITV6FcrgOEi5tWQHQ0PK5KOBEh7OfqmsvlVrm51vC2PLhPxJOrTzC FTZgVpI5xLVyT3oTYic&businessIdOfClient=740119983371790&wabizPassword=@D@J2fj1@O&privateIp=10.40.13.240&wabizurl=https://10.40.13.240:9093&isPasswordSet=true&startDate=undefined&endDate=undefined&retryCount=2&
// Error in code:- {"type":{"status_code":500,"code":5000,"message":"Something went wrong. Please try again later."},"err":[[{"code":1005,"title":"Access denied","details":"Param cert is invalid. Please download the correct cert from Business Manager and try again."}],"request code"],"data":{"inputToken":"EAAG0ZAQUaL3wBALroxy61bIJNddjWyaVwNJcSQNBmjtv2NMh6tJGnCUdAsaHkV9nEsdTGlIIZCuKCVbutfsYJNZAjCGIIimYbI5w6YCB2pO3kNyh7lHu8N0JLZAGmo5pKpAHmaAtqK8UP7OAQl2FyybVXx9AHmiZCa4SJjMl1v3VSvR4EmVDBvO0tczCyKlfIGucQIQhzJ3J9vcsFNgfZB","providerId":"a4f03720-3a33-4b94-b88a-e10453492183","userId":"a9c47ead-c556-4a4d-a916-8b42b9aa2f47","authTokenOfWhatsapp":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InVzZXJfaWQiOiJhOWM0N2VhZC1jNTU2LTRhNGQtYTkxNi04YjQyYjlhYTJmNDciLCJwcm92aWRlcklkIjoiIiwid2FiYVBob25lTnVtYmVyIjoiIiwibWF4VHBzVG9Qcm92aWRlciI6MTB9LCJpYXQiOjE2NTIzNDczMTEsImV4cCI6MTY1MjQzMzcxMX0.BKcD8QNsZ76N7vdlFSL4ApbWqyTk_tE6boVD03x5T7s","masterdDataId":"cdbf2b4e-6655-4f83-9f24-89c8a075b05c","platFormName":"facebook","businessId":"237143287394373","systemUserId":"155284020282729","systemUserToken":"EAAG0ZAQUaL3wBAPxNeo1MDJeufavMePopf7pfxHdMYeN0NXmZCBQZBsPMZBZBpVH85J7HIptuRneelncDvxR7ZBzgpmuOW7ZCkarTQK0CQ4tkmw8NWLnzzOnOSdnZAJsYH7zEY8nAnv2BeLYClBJb9CL4BaZBh09oz8Bakq9IlgZBHMwqtn1kvWeBX","creditLineId":"4178067182304065","wabaIdOfClient":"111680211540295","phoneCode":"91","phoneNumber":"7666002277","phoneCertificate":"CmQKIAi3rKbqye/nAxIGZW50OndhIgdIZXhUZWNoUO n85MGGkBitt EBFDTpQAinIzSEepRZVbPN9HXZ/CS4 l9Ue54CNDx/vmcp9TTmvLlKx2T0Tz0L6dZh5LJalxITV6FcrgOEi5tWQHQ0PK5KOBEh7OfqmsvlVrm51vC2PLhPxJOrTzC FTZgVpI5xLVyT3oTYic","businessIdOfClient":"740119983371790","wabizPassword":"@D@J2fj1@O","privateIp":"10.40.13.240","wabizurl":"https://10.40.13.240:9093","isPasswordSet":true,"startDate":"undefined","endDate":"undefined","retryCount":2}}

// /helowhatsapp/api/users/signup/embedded/continue?inputToken=EAAG0ZAQUaL3wBALroxy61bIJNddjWyaVwNJcSQNBmjtv2NMh6tJGnCUdAsaHkV9nEsdTGlIIZCuKCVbutfsYJNZAjCGIIimYbI5w6YCB2pO3kNyh7lHu8N0JLZAGmo5pKpAHmaAtqK8UP7OAQl2FyybVXx9AHmiZCa4SJjMl1v3VSvR4EmVDBvO0tczCyKlfIGucQIQhzJ3J9vcsFNgfZB&providerId=a4f03720-3a33-4b94-b88a-e10453492183&userId=a9c47ead-c556-4a4d-a916-8b42b9aa2f47&authTokenOfWhatsapp=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InVzZXJfaWQiOiJhOWM0N2VhZC1jNTU2LTRhNGQtYTkxNi04YjQyYjlhYTJmNDciLCJwcm92aWRlcklkIjoiIiwid2FiYVBob25lTnVtYmVyIjoiIiwibWF4VHBzVG9Qcm92aWRlciI6MTB9LCJpYXQiOjE2NTIzNDczMTEsImV4cCI6MTY1MjQzMzcxMX0.BKcD8QNsZ76N7vdlFSL4ApbWqyTk_tE6boVD03x5T7s&masterdDataId=cdbf2b4e-6655-4f83-9f24-89c8a075b05c&platFormName=facebook&businessId=237143287394373&systemUserId=155284020282729&systemUserToken=EAAG0ZAQUaL3wBAPxNeo1MDJeufavMePopf7pfxHdMYeN0NXmZCBQZBsPMZBZBpVH85J7HIptuRneelncDvxR7ZBzgpmuOW7ZCkarTQK0CQ4tkmw8NWLnzzOnOSdnZAJsYH7zEY8nAnv2BeLYClBJb9CL4BaZBh09oz8Bakq9IlgZBHMwqtn1kvWeBX&creditLineId=4178067182304065&wabaIdOfClient=111680211540295&phoneCode=91&phoneNumber=7666002277&phoneCertificate=CmQKIAiA0/mvxtf1AxIGZW50OndhIgdIZXhUZWNoUL2w85MGGkAs3IWSEXX2XNpUaIAsucpkSqosADCOKCHn6aCPtynbI+4EaWEKe2mS9hTGC7IWRH0ZyIqKQA2+/NCTCzJn4T4PEi5tWQHQ0PK5KOBEh7Ofqmsvl1jk5VvC2KD2PxJOrTzpgbLOg6UP9zLDYxkalkaz&businessIdOfClient=740119983371790&wabizPassword=@D@J2fj1@O&privateIp=10.40.13.240&wabizurl=https://10.40.13.240:9093&isPasswordSet=true&startDate=undefined&endDate=undefined
