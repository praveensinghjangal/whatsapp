const ValidatonService = require('../services/validation')
const TemplateService = require('../services/dbData')
const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const RedisService = require('../../../lib/redis_service/redisService')
const RuleEngine = require('../services/ruleEngine')
const StatusService = require('../services/status')
const rejectionHandler = require('../../../lib/util/rejectionHandler')

/**
 * @namespace -Template-Controller-
 * @description API’s related to whatsapp templates.
 *  * *** Last-Updated :- Danish Galiyara 8th December, 2020 ***
 */

/**
 * @memberof -Template-Controller-
 * @name AddUpdateTemplates
 * @path {POST} /templates
 * @description Bussiness Logic :- API to add or update template,To add template do not pass templateID to update template pass template ID along with parameters to update.
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
 <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/templates/Addupdatetemplate|AddUpdateTemplates}
 * @body {string} messageTemplateId=9bf57a21-a05c-47f4-82df-jki09v03deb9
 * @body {string} templateName=Welcome
 * @body {string} type=media_message_template
 * @body {string} messageTemplateCategoryId=b8203a31-e439-4ea4-a270-bd211317d3ff
 * @body {string} messageTemplateStatusId=c71a8387-80e0-468b-9ee3-abb5ec328176
 * @body {string} messageTemplateLanguageId=57aa7635-5717-4397-8eb6-4799ef3bec05
 * @body {string} bodyText=any-template-text
 * @body {string} headerText
 * @body {string} footerText=vivaconnect
 * @body {string} mediaType=image
 * @body {boolean} secondLanguageRequired=false
 * @body {string}  secondMessageTemplateLanguageId=cde192b7-c60f-4d2d-8573-dd5af7c9379b
 * @body {string} secondlanguageBodyText=any-template-text
 * @body {string} headerType=image
 * @body {string} buttonType=Quick-Reply
 * @body {object} buttonData=Object - Object is :- { "quickReply": [ "1", "2", "3" ], "phoneButtonText": "call us", "phoneNumber": "9876543210", "websiteButtontext": "oursite.com", "webAddress": "www.google.com" }
 * @response {string} ContentType=application/json - Response content type.
 * @response {boolean} metadata.data.mediaTemplateComplete - It will return true
 * @code {200} if the msg is success than it Returns Status of template info completion
 * @author Danish Galiyara 5th June, 2020
 * *** Last-Updated :- Danish Galiyara 3rd January, 2021 ***
 */
const addUpdateTemplates = (req, res) => {
  __logger.info('add update template API called', req.body)
  const validate = new ValidatonService()
  const templateService = new TemplateService()
  const userId = req.user && req.user.user_id ? req.user.user_id : ''
  let wabaPhoneNumber = ''
  let messageTemplateId = ''
  let wabaInformationId = ''
  let oldStatus = ''
  let secondLangRequired = false
  let ruleResponse = ''
  const statusService = new StatusService()
  validate.addUpdateTemplate(req.body)
    .then(data => {
      if (!req.body.messageTemplateId && req.body.templateName) {
        return templateService.getTemplateTableDataByTemplateName(req.body.templateName, userId)
      } else {
        return templateService.getTemplateTableDataByTemplateId(req.body.messageTemplateId, userId)
      }
    })
    .then(wabaAndTemplateData => {
      __logger.info('addUpdateTemplates: addUpdateTemplate(): then 2: ', wabaAndTemplateData)
      wabaPhoneNumber = wabaAndTemplateData.wabaPhoneNumber
      if (req.body.messageTemplateId) {
        if (!wabaAndTemplateData || !wabaAndTemplateData.messageTemplateId) {
          return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.TEMPLATE_NOT_FOUND, data: {}, err: {} })
        }
        const testing = statusService.canUpdateStatus(__constants.TEMPLATE_STATUS.complete.statusCode, wabaAndTemplateData.messageTemplateStatusId)
        __logger.info('addUpdateTemplates: addUpdateTemplate(): then 3: ', testing)
        if (wabaAndTemplateData.messageTemplateId && !statusService.canUpdateStatus(__constants.TEMPLATE_STATUS.complete.statusCode, wabaAndTemplateData.messageTemplateStatusId)) {
          return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.TEMPLATE_CANNOT_BE_EDITED, data: {}, err: {} })
        }
        return templateService.updateTemplateData(req.body, wabaAndTemplateData, userId)
      } else {
        if (req.body.templateName && wabaAndTemplateData && wabaAndTemplateData.templateName && req.body.templateName.toLowerCase() === wabaAndTemplateData.templateName.toLowerCase()) {
          return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.TEMPLATE_CANNOT_BE_ADDED, data: {}, err: {} })
        } else {
          return templateService.addTemplateData(req.body, wabaAndTemplateData, userId)
        }
      }
    })
    .then(data => {
      __logger.info('addUpdateTemplate: then 3:', { data })
      const ruleEngine = new RuleEngine()
      messageTemplateId = data.messageTemplateId
      wabaInformationId = data.wabaInformationId
      oldStatus = data.messageTemplateStatusId
      secondLangRequired = data.secondLanguageRequired || false
      return ruleEngine.checkAddTemplateRulesByTemplateId(data.messageTemplateId, userId)
    })
    .then(validationData => {
      __logger.info('addUpdateTemplate: then 4:', { validationData })
      ruleResponse = validationData
      if (!validationData.complete) {
        return statusService.changeStatusToIncomplete(messageTemplateId, oldStatus, userId, wabaInformationId, secondLangRequired)
      } else {
        return statusService.changeStatusToComplete(messageTemplateId, oldStatus, userId, wabaInformationId, secondLangRequired)
      }
    })
    .then(statusChanged => {
      __logger.info('addUpdateTemplate: then 5:', { statusChanged })
      const redisService = new RedisService()
      redisService.setTemplatesInRedisForWabaPhoneNumber(wabaPhoneNumber)
      // __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: { mediaTemplateComplete: statusChanged } })
      __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: { isTemplateValid: ruleResponse.complete, messageTemplateId, messageTemplateStatusId: statusChanged.statusCode, statusName: statusChanged.displayName, invalidRemark: ruleResponse.err && ruleResponse.err.err ? ruleResponse.err.err : null } })
    })
    .catch(err => {
      __logger.error('addUpdateTemplate: error: ', err.stack ? err.stack : err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

module.exports = { addUpdateTemplates }
