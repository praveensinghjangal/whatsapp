const ValidatonService = require('../services/validation')
const TemplateService = require('../services/dbData')
const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const RedisService = require('../../../lib/redis_service/redisService')
const RuleEngine = require('../services/ruleEngine')
const StatusService = require('../services/status')
const rejectionHandler = require('../../../lib/util/rejectionHandler')

const addUpdateTemplates = (req, res) => {
  __logger.info('add update template API called', req.body)
  const validate = new ValidatonService()
  const templateService = new TemplateService()
  let wabaPhoneNumber = ''
  let messageTemplateId = ''
  let wabaInformationId = ''
  let oldStatus = ''
  let secondLangRequired = false
  const statusService = new StatusService()
  validate.addUpdateTemplate(req.body)
    .then(data => templateService.getTemplateTableDataByTemplateIdOrTemplateName(req.body.messageTemplateId, req.body.templateName, req.user.user_id))
    .then(wabaAndTemplateData => {
      __logger.info('add update template:: dbData then 2', { wabaAndTemplateData })
      wabaPhoneNumber = wabaAndTemplateData.wabaPhoneNumber
      if (req.body.messageTemplateId) {
        if (!wabaAndTemplateData || !wabaAndTemplateData.messageTemplateId) {
          return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.TEMPLATE_NOT_FOUND, data: {}, err: {} })
        }
        if (wabaAndTemplateData.messageTemplateId && !statusService.canUpdateStatus(__constants.TEMPLATE_STATUS.complete.statusCode, wabaAndTemplateData.messageTemplateStatusId)) {
          return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.TEMPLATE_CANNOT_BE_EDITED, data: {}, err: {} })
        }
        __logger.info('add update template:: will update')
        return templateService.updateTemplateData(req.body, wabaAndTemplateData, req.user.user_id)
      } else {
        if (req.body.templateName === wabaAndTemplateData.templateName) {
          return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.TEMPLATE_CANNOT_BE_ADDED, data: {}, err: {} })
        } else {
          __logger.info('add update template:: will insert')
          return templateService.addTemplateData(req.body, wabaAndTemplateData, req.user.user_id)
        }
      }
    })
    .then(data => {
      __logger.info('add update template:: insert or update done then 3', { data })
      const ruleEngine = new RuleEngine()
      messageTemplateId = data.messageTemplateId
      wabaInformationId = data.wabaInformationId
      oldStatus = data.messageTemplateStatusId
      secondLangRequired = data.secondLanguageRequired || false
      return ruleEngine.checkAddTemplateRulesByTemplateId(data.messageTemplateId, req.user.user_id)
    })
    .then(validationData => {
      __logger.info('add update template:: rule checked then 4', { validationData })
      if (!validationData.complete) return false
      return statusService.changeStatusToComplete(messageTemplateId, oldStatus, req.user.user_id, wabaInformationId, secondLangRequired)
    })
    .then(statusChanged => {
      __logger.info('add update template:: status marked as completed then 5', { statusChanged })
      const redisService = new RedisService()
      redisService.setTemplatesInRedisForWabaPhoneNumber(wabaPhoneNumber)
      __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: { mediaTemplateComplete: statusChanged } })
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

module.exports = { addUpdateTemplates }
