const __logger = require('../../../lib/logger')
const __constants = require('../../../config/constants')
const __util = require('../../../lib/util')
const __db = require('../../../lib/db')
const integrationService = require('../../../app_modules/integration/')
const TemplateDbService = require('../services/dbData')

const deleteTemplate = (req, res) => {
  __logger.info('Delete Template API Called', req.params)
  const wabaPhoneNumber = req.user ? req.user.wabaPhoneNumber : ''
  if (req.user && req.user.providerId) {
    const templateService = new integrationService.Template(req.user.providerId)
    const templateDbService = new TemplateDbService()
    if (req.params && req.params.templateId) {
      templateDbService.deleteTemplate(req.params.templateId, req.user.user_id)
        .then(() => {
          __db.redis.key_delete(req.params.templateId + '___' + wabaPhoneNumber)
          return templateService.deleteTemplate(wabaPhoneNumber, req.params.templateId)
        })
        .then(() => {
          __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: {} })
        })
        .catch(err => {
          __logger.error('error in delete template: ', err)
          return __util.send(res, { type: err.type, err: err.err || err })
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
