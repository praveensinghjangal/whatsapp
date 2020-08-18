const q = require('q')
const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const RedisService = require('../../../lib/redis_service/redisService')
const redisService = new RedisService()
const __logger = require('../../../lib/logger')
const ValidatonService = require('../services/validation')

const addUpdateFlow = (req, res) => {
  __logger.info('Flow Manager API called', req.body)
  const validate = new ValidatonService()
  let wabaNumber = ''
  validate.addUpdateFlow(req.body)
    .then(data => redisService.getWabaNumberByUserId(req.user.user_id))
    .then(redisData => {
      wabaNumber = redisData.wabaPhoneNumber
      if (req.body.auotMessageFlowId) {
        return updateFlow(req.body)
      } else {
        return insertFlow(req.body)
      }
    })

    // .then(data => templateService.getTemplateTableDataAndWabaId(req.body.messageTemplateId, req.user.user_id))
    // .then(wabaAndTemplateData => {
    //   wabaPhoneNumber = wabaAndTemplateData.wabaPhoneNumber
    //   if (wabaAndTemplateData.messageTemplateId) {
    //     return templateService.updateTemplateData(req.body, wabaAndTemplateData, req.user.user_id)
    //   } else {
    //     return templateService.addTemplateData(req.body, wabaAndTemplateData, req.user.user_id)
    //   }
    // })
    .then(data => {
      __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data })
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

module.exports = addUpdateFlow
