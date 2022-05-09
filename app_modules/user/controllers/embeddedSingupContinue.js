const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const ValidatonService = require('../services/validation')
const __config = require('../../../config')
const UserService = require('../services/dbData')
const rabbitmqHeloWhatsapp = require('../../../lib/db').rabbitmqHeloWhatsapp
const controller = (req, res) => {
  const userService = new UserService()
  const validate = new ValidatonService()
  let queueObject
  req.user.providerId = __config.service_provider_id.facebook
  // todo: only support can call this api
  if (!req.query.userId) {
    return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: ['Please provide userId in the body'] })
  }
  // db call to get the status. Based on status put the validation of the required body
  userService.getWabaProfileSetupStatusFromUserId(req.query.userId)
    .then(data => {
      let wabaProfileSetupStatusId
      if (data && data[0] && data[0].wabaProfileSetupStatusId) {
        wabaProfileSetupStatusId = data[0].wabaProfileSetupStatusId
      }
      if (!wabaProfileSetupStatusId) {
        // there was an error in the first worker (wabaSetUpConsumer)
        queueObject = __constants.MQ.wabaSetUpConsumerQueue
        return validate.wabaSetUpConsumerValidator(req.query)
      } else {
        if (wabaProfileSetupStatusId === __constants.WABA_PROFILE_STATUS.profileIncomplete.statusCode) {
          // it means that first worker (wabaSetUpConsumer) was done. There was an error in 2nd worker (bussinessDetailsConsumer)
          queueObject = __constants.MQ.bussinessDetailsConsumerQueue
          return validate.bussinessDetailsConsumerValidator(req.query)
        } else if ([__constants.WABA_PROFILE_STATUS.pendingForSubmission.statusCode, __constants.WABA_PROFILE_STATUS.submitted.statusCode, __constants.WABA_PROFILE_STATUS.pendingForApproval.statusCode].includes(wabaProfileSetupStatusId)) {
          // it means that 2nd worker (bussinessDetailsConsumer) was done. There was an error in 3rd worker (spawningContainerConsumer)
          queueObject = __constants.MQ.spawningContainerConsumerQueue
          return validate.spawningContainerConsumerValidator(req.query)
        } else if (wabaProfileSetupStatusId === __constants.WABA_PROFILE_STATUS.containerSpawned.statusCode || wabaProfileSetupStatusId === __constants.WABA_PROFILE_STATUS.accepted.statusCode) {
          // it means that 3rd worker (spawningContainerConsumer) was done. There was an error in 4th worker (wabaContainerBindingConsumer)
          queueObject = __constants.MQ.wabaContainerBindingConsumerQueue
          return validate.wabaContainerBindingConsumerValidator(req.query)
        }
      }
    })
    .then(validateData => {
      console.log('reeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', req.query)
      return rabbitmqHeloWhatsapp.sendToQueue(queueObject, JSON.stringify(req.query))
    })
    .then(data => {
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: `Data sent to queue ${queueObject.q_name}` })
    })
    .catch(err => {
      return __util.send(res, { type: err.type, err: err.err })
    })
}
module.exports = controller
