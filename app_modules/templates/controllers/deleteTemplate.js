const __logger = require('../../../lib/logger')
const __constants = require('../../../config/constants')
const __util = require('../../../lib/util')
const __db = require('../../../lib/db')
const integrationService = require('../../../app_modules/integration/')
const TemplateDbService = require('../services/dbData')

/**
 * @memberof -Template-Controller-
 * @name DeleteTemplate
 * @path {DELETE} /templates/{templateId}
 * @description Bussiness Logic :- Use this API to delete a template.
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
  <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/templates/deleteTemplate|DeleteTemplate}
 * @param {string} templateId - Id of Template.
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=success - Template is deleted.
 * @code {200} if the msg is success thanTemplate is deleted.
 * @author Arjun Bhole 10th October, 2020
 * *** Last-Updated :- Arjun Bhole 10th December, 2020 ***
 */

const deleteTemplate = (req, res) => {
  __logger.info('Delete Template API Called', req.params)
  const wabaPhoneNumber = req.user ? req.user.wabaPhoneNumber : ''
  const userId = req.user ? req.user.user_id : ''
  if (req.user && req.user.providerId) {
    const templateService = new integrationService.Template(req.user.providerId, req.user.maxTpsToProvider, req.user.user_id)
    const templateDbService = new TemplateDbService()
    if (req.params && req.params.templateId) {
      templateDbService.deleteTemplate(req.params.templateId, userId)
        .then(data => {
          __db.redis.key_delete(req.params.templateId + '___' + wabaPhoneNumber)
          return templateService.deleteTemplate(wabaPhoneNumber, req.params.templateId)
        })
        .then(data => {
          __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: {} })
        })
        .catch(err => {
          __logger.error('deleteTemplateerror in delete template: ', err)
          return __util.send(res, { type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
        })
    } else {
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: ['templateId and template status is required'] })
    }
  } else {
    __util.send(res, { type: __constants.RESPONSE_MESSAGES.SERVICE_PROVIDER_NOT_PRESENT, data: {} })
  }
}

module.exports = {
  deleteTemplate
}
